// Callisto - callisto-task-horriblesubs <https://github.com/msikma/callisto>
// © MIT license

const cheerio = require('cheerio')
const { get, isPlainObject } = require('lodash')
const { request } = require('callisto-core/lib/request')
const { findTagContent } = require('callisto-core/util/html')
const { extractScriptResult } = require('callisto-core/util/vm')

/** HorribleSubs base URL. */
const baseURL = url => `https://horriblesubs.info${url}`

/** Show URL containing description and torrent links for a show. */
const showURL = show => baseURL(`/shows/${show}/`)

/** Returns a URL for getting a list of show torrents. */
const torrentListURL = (showid) =>
  baseURL(`/api.php?method=getshows&type=show&mode=filter&showid=${showid}`)

/**
 * Returns a URL to the community wiki's page for this episode.
 */
const communityWikiURL = (mwDomain, episodeName) =>
  `${mwDomain}/wiki/${encodeURIComponent(episodeName)}`

/**
 * Returns a URL for retrieving data from a MediaWiki install used by a show's community.
 * 
 * This is used to get a title, image and description of an episode.
 */
const episodeInfoURL = (mwDomain, searchTerm) =>
  `${mwDomain}/api.php?format=json&action=query&redirects=1&titles=${encodeURIComponent(searchTerm)}&prop=info|revisions|images|categories|pageprops`

/** Returns a globally unique ID for the database. */
const uniqueID = (id) => `horriblesubs:${id}`

/**
 * Returns the show ID for a specific show slug.
 * 
 * Each show page contains a <script> tag containing an ID, like this:
 * 
 *   <script type="text/javascript">var hs_showid = 347;</script>
 * 
 * This ID is needed to use the API.
 */
const findShowID = $ => {
  const showScript = findTagContent($, 'script', 'hs_showid')
  const result = extractScriptResult(showScript).context.hs_showid
  return result
}

/**
 * Function for searching inside the data returned by an infobox API call.
 */
const _traverseObject = (search, object) => {
  let value
  let dataItem

  if (Array.isArray(object)) {
    for (const member of object) {
      value = _traverseObject(search, member)
      if (value != null) return value
    }
  }

  dataItem = get(object, 'data')
  if (isPlainObject(dataItem)) {
    dataItem = get(dataItem, 'value')
  }

  if (Array.isArray(dataItem)) {
    for (const member of dataItem) {
      value = _traverseObject(search, member)
      if (value != null) return value
    }
  }

  const searchItems = search.map(searchItem => get(object, searchItem[0]) === searchItem[1]).filter(n => n)
  if (searchItems.length === search.length) {
    return object
  }
}

/**
 * Function for finding specific data inside of an infobox object.
 */
const _traverseObjectOuter = (search, take, object) => {
  const value = _traverseObject(search, object)
  if (value != null) {
    return take.map(t => get(value, t))
  }
}

/**
 * Retrieves the show's title from its infoboxes.
 */
const findShowTitle = infoboxes => {
  let obj
  obj = _traverseObjectOuter([['type', 'header']], ['data.value'], get(infoboxes, '0.data.1', {}))
  if (obj) return obj
  obj = _traverseObjectOuter([['type', 'title']], ['data.value'], infoboxes)
  if (obj) return obj
  return [null]
}

/**
 * Retrieves the show's image from its infoboxes.
 */
const findShowImage = infoboxes => {
  let obj
  obj = _traverseObjectOuter([['type', 'image'], ['data.0.source', 'image'], ['data.0.caption', 'Episode']], ['data.0.url', 'data.0.key'], infoboxes)
  if (obj) return obj
  obj = _traverseObjectOuter([['type', 'image'], ['data.0.source', 'image']], ['data.0.url', 'data.0.key'], infoboxes)
  if (obj) return obj
  return [null, null]
}

/**
 * Adds community wiki information to new items.
 */
const addDetailedInformation = async (items, { showName, showCommunityWiki }, logger) => {
  const newItems = []
  for (const item of items) {
    try {
      // TODO: search for the title and image properly.
      const wikiURL = communityWikiURL(showCommunityWiki, item.episodeTitle)
      const infoURL = episodeInfoURL(showCommunityWiki, item.episodeTitle)
      const infoReq = await request(infoURL)
      const infoData = Object.values(JSON.parse(infoReq.body).query.pages)[0]
      infoData.pageprops.infoboxes = JSON.parse(infoData.pageprops.infoboxes)

      const infoboxes = infoData.pageprops.infoboxes

      // Remove images that are the standard "no picture available" placeholder.
      const images = infoData.images.filter(image => !~image.title.toLowerCase().indexOf('nopicavailable'))
      // Attempt to find the episode image by searching for 'Episode xx.png'.
      // Note: unneeded but can be used if findShowImage() doesn't work for some series.
      //const episodeImage = images.filter(i => ~i.title.indexOf(`${item.episodeTitle}.`))

      // Check whether we have at least one image and one infobox.
      const hasCommunityInfo = images.length > 0 && infoboxes.length > 0

      // Find title and image.
      const title = findShowTitle(infoboxes)
      const image = findShowImage(infoboxes)

      newItems.push({
        ...item,
        episodeTitle: title[0],
        episodeImage: {
          url: image[0],
          name: image[1]
        },
        communityWikiURL: wikiURL,
        hasCommunityInfo,
        needsCommunityInfo: true
      })
    }
    catch (err) {
      logger.logDebug(['Did not find detailed information', 'Probably a temporary error, if the episode is very recent', { showName, item, error: err }])
    }
  }
  return newItems
}

/**
 * Returns a list of torrents from a HorribleSubs torrents API table.
 * 
 * This always returns the largest available resolution.
 */
const getTorrentItems = ($, urlShowPage) => {
  const torrents = $('.rls-info-container').get().map(item => {
    const $item = $(item)
    $('.rls-label span', $item).remove()
    const $label = $('.rls-label', $item)
    const title = $label.text().trim()
    const episodeNumber = Number($('strong', $label).html().trim())
    $('.rls-label strong', $item).remove()
    const showTitle = $label.text().trim()
    const links = $('.rls-links-container .rls-link', $item).get().map(link => {
      const $link = $(link)
      const resolution = Number($('.rls-link-label', $link).text().trim().match(/([0-9]+)/)[1])
      const magnetLink = $('.hs-magnet-link a', $link).attr('href')
      const torrentLink = $('.hs-torrent-link a', $link).attr('href')
      return {
        resolution,
        magnetLink,
        torrentLink
      }
    })
    const largestResolution = links.sort((a, b) => a.resolution < b.resolution ? 1 : -1)[0]
    return {
      title,
      showTitle,
      showURL: urlShowPage,
      episodeNumber,
      episodeTitle: `Episode ${episodeNumber}`,
      ...largestResolution
    }
  })
  return torrents
}

/**
 * Runs a search for new torrents.
 */
const findSearchTorrents = async ({ showName, showCommunityWiki }) => {
  // First request the show page, to get the show ID and request its torrents.
  const urlShowPage = showURL(showName)
  const htmlShowPage = await request(urlShowPage)
  const $showPage = cheerio.load(htmlShowPage.body)
  const showID = findShowID($showPage)

  // Request a list of torrents and sort them oldest to newest.
  const urlTorrentsList = torrentListURL(showID)
  const htmlTorrentsList = await request(urlTorrentsList)
  const $torrentsList = cheerio.load(htmlTorrentsList.body)
  const results = getTorrentItems($torrentsList, urlShowPage)
    .sort((a, b) => a.episodeNumber > b.episodeNumber ? 1 : -1)
    .map(n => ({ ...n, id: uniqueID(`${showName}$${n.episodeNumber}`) }))

  return {
    success: true,
    items: results,
    meta: {
      urlShowPage,
      urlTorrentsList,
      showName,
      showCommunityWiki
    }
  }
}

module.exports = {
  findSearchTorrents,
  addDetailedInformation
}
