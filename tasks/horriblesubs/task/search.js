// Callisto - callisto-task-horriblesubs <https://github.com/msikma/callisto>
// © MIT license

const cheerio = require('cheerio')
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
 * Adds community wiki information to new items.
 */
const addDetailedInformation = async (items, { showName, showCommunityWiki }) => {
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

      // Check whether we have at least one image and one infobox.
      const hasCommunityInfo = images.length > 0 && infoboxes.length > 0

      // All relevant data should always be in the first infobox.
      const firstInfobox = infoboxes[0]

      // Find title and image.
      const title = firstInfobox.data.find(item => item.type === 'title').data.value
      const image = firstInfobox.data.find(item => item.type === 'image').data[0]

      newItems.push({
        ...item,
        episodeTitle: title,
        episodeImage: {
          url: image.url,
          name: image.key
        },
        communityWikiURL: wikiURL,
        hasCommunityInfo,
        needsCommunityInfo: true
      })
    }
    catch (err) {
      console.log(err)
      newItems.push({
        ...item,
        hasCommunityInfo: false,
        needsCommunityInfo: true
      })
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
      const magnetLink = $('.hs-magnet-link a').attr('href')
      const torrentLink = $('.hs-torrent-link a').attr('href')
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
