/**
 * Callisto - callisto-task-rarbg <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'

import logger from 'callisto-util-logging'
import { slugify, isValidDate } from 'callisto-util-misc'
import { requestURL } from 'callisto-util-request'
import { cacheItems, removeCached, filterCachedIDs } from 'callisto-util-cache'
import { getTaskLogger } from 'callisto-discord-interface/src/logging'
import { id } from './index'

const episodeIDRe = new RegExp('^episode_(.+?)$', 'i')

/**
 * Report a problem with the request. This occurs when we've been flagged for suspicious activity.
 */
const reportError = (html) => {
  const taskLogger = getTaskLogger(id)
  if (html.indexOf('to verify your browser') > -1) {
    // Known suspicious activity page.
    taskLogger.error('Bot was flagged for suspicious activity', 'visit rarbg.to to solve the captcha and unblock our IP')
  }
  else {
    // Something else.
    taskLogger.error('Request resulted in an unknown error', 'HTML can be found in the text log (debug level)')
    logger.debug(`rarbg: HTML output:\n----\n${html}\n----`)
  }
  return null
}

/**
 * Retrieves the latest episode from a show's overview URL.
 * We check to see if we have already posted this URL. If so, null is returned.
 */
export const findNewEpisodes = async (url, show) => {
  const html = await requestURL(url)
  const showInfo = getLatestEpisodesInfo(cheerio.load(html))
  // If we didn't get any results, it means we couldn't load any HTML properly.
  if (showInfo.length === 0) return reportError(html)
  // Construct IDs using 'rarbg', the show's slug (e.g. tt3061046) and the episode slugified title.
  const showInfoWithIDs = showInfo.map(s => ({ ...s, id: `${id}$${show.slug}$${s.slug}` }))
  const showIDs = showInfoWithIDs.map(s => s.id)
  const inCache = (await filterCachedIDs(id, showIDs)).map(c => c.id)
  const newItems = showInfoWithIDs.filter(s => inCache.indexOf(s.id) === -1)
  if (newItems.length === 0) {
    return null
  }

  // We have new items to scrape and display.
  return newItems
}

/**
 * Adds one episode to the cache.
 */
export const cacheEpisode = async (episode) => (
  cacheItems(id, [episode])
)

/**
 * Final step in the proces. Returns the preview image and torrent URL from the torrent detail page, if any.
 * If no image can be found, null is returned instead.
 */
export const getTorrentDetails = async (url, referrer) => {
  const html = await requestURL(url, { 'Referer': referrer })
  const torrentInfo = getTorrentInfo(cheerio.load(html))
  return torrentInfo
}

/**
 * Requests Rarbg's 'tv.php' to get a list of links to the detail page of an episode.
 * We usually get multiple links. We'll return whichever has the biggest filesize.
 */
export const getEpisodeInfo = async (url, referrer) => {
  // Normally the browser also sends XMLHttpRequest for these.
  const html = await requestURL(url, { 'Referer': referrer, 'X-Requested-With': 'XMLHttpRequest' })
  const bestEpisodeInfo = getBestEpisodeInfo(cheerio.load(html))
  return bestEpisodeInfo
}

/**
 * Returns the description image and torrent URL from the torrent detail page, or null if it's not there.
 */
const getTorrentInfo = ($) => {
  const imageNode = $('#description img')
  const torrentURLNode = $('a[onmouseover*="Click here to download torrent"]')
  return {
    image: imageNode ? imageNode.attr('src') : null,
    torrentURL: torrentURLNode ? torrentURLNode.attr('href') : null
  }
}

/**
 * Returns information about the best episode from a 'tv.php' response.
 */
const getBestEpisodeInfo = ($) => {
  // Go through every torrent listed in the response.
  const items = $('.lista2').map((n, el) => {
    const linkNode = $('.lista:nth-child(2) a:nth-child(1)', el)
    const link = linkNode.attr('href')
    const filename = linkNode.text().trim()
    const pubTime = $('.lista:nth-child(3)', el).text().trim()
    const filesize = $('.lista:nth-child(4)', el).text().trim()
    return {
      link,
      filename,
      pubTime,
      filesize,
      code: link.split('/').pop(),
      filesizeInt: parseInt(filesize, 10)
    }
  }).get()

  // Return the item with the biggest filesize.
  return items.reduce((acc, curr) => curr.filesizeInt > acc.filesizeInt ? curr : acc, { filesizeInt: 0 })
}

/**
 * Returns information about the latest episodes from a show's overview listing.
 */
const getLatestEpisodesInfo = ($) => {
  // Get latest season name and list of episodes.
  const seasonHeaders = $('.content-rounded h1.black')
  const seasonNumber = seasonHeaders.length && $(seasonHeaders[0]).text().trim()
  const tvContentLists = $('.content-rounded .tvcontent')
  // 'Latest content list' will contain episodes from the latest season.
  const latestContentList = tvContentLists.length && $(tvContentLists[0])

  // Gather information about all listed episodes.
  return $('> div[id*="episode"]', latestContentList).get().map(ep => {
    const episodeNumber = $('.tvshowEpNum', ep).text().trim()
    const episodeIDBits = $(ep).attr('id').match(episodeIDRe)
    const episodeID = episodeIDBits.length > 0 ? episodeIDBits[1] : null
    // Note: .tvshowRelDate can also be '--', e.g. in case of a multi episode pack.
    const releaseDate = $('.tvshowRelDate', ep).text().trim()
    const episodeNode = $('.tvshowClick', ep)
    episodeNode.find('.tvshowEpNum, .tvshowRelDate').remove()
    const title = episodeNode.text().trim()
    return {
      title,
      slug: slugify(title),
      releaseDate: isValidDate(releaseDate) ? releaseDate : null,
      episodeID,
      episodeNumber,
      seasonNumber
    }
  })
}
