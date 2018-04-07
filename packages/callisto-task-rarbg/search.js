/**
 * Callisto - callisto-task-rarbg <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import slugify from 'slugify'

import { requestAsBrowser } from 'callisto-util-request'
import { cacheItems, removeCached, filterCachedIDs } from 'callisto-util-cache'
import logger from 'callisto-util-logging'
import { id } from './index'

const episodeID = new RegExp('^episode_(.+?)$', 'i')

/**
 * Report a problem with the request. This occurs when we've been flagged for suspicious activity.
 */
const reportError = (html) => {
  logger.error('rarbg: request resulted in error (HTML follows)')
  logger.debug(`----\n${html}\n---`)
  return null
}

/**
 * Retrieves the latest episode from a show's overview URL.
 * We check to see if we have already posted this URL. If so, null is returned.
 */
export const findNewEpisode = async (url, show) => {
  const html = await requestAsBrowser(url)
  const showInfo = getLatestShowInfo(cheerio.load(html))
  // If we didn't get an ID, it means we couldn't load any HTML properly.
  if (showInfo.id === '') return reportError(html)
  const inCache = await filterCachedIDs(id, [showInfo.id])
  if (inCache.length > 0) {
    // No new item.
    return null
  }

  // We have a new item to scrape and display.
  return showInfo
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
  const html = await requestAsBrowser(url, { 'Referer': referrer })
  const torrentInfo = getTorrentInfo(cheerio.load(html))
  if (false) return reportError(html)
  return torrentInfo
}

/**
 * Requests Rarbg's 'tv.php' to get a list of links to the detail page of an episode.
 * We usually get multiple links. We'll return whichever has the biggest filesize.
 */
export const getEpisodeInfo = async (url, referrer) => {
  const html = await requestAsBrowser(url, { 'Referer': referrer, 'X-Requested-With': 'XMLHttpRequest' })
  const bestEpisodeInfo = getBestEpisodeInfo(cheerio.load(html))
  if (false) return reportError(html)
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
 * Returns information about the latest show from a show's overview listing.
 */
const getLatestShowInfo = ($) => {
  // Get latest season name and list of episodes.
  const seasonHeaders = $('.content-rounded h1.black')
  const seasonNumber = seasonHeaders.length && $(seasonHeaders[0]).text().trim()
  const tvContentLists = $('.content-rounded .tvcontent')
  const latestContentList = tvContentLists.length && $(tvContentLists[0])
  const latestEpisode = $('> div', latestContentList).get().reduce((acc, episode) => {
    if (acc != null) return acc
    const $episode = $(episode)
    const id = $episode.attr('id')
    if (!id) return acc
    const epMatch = $episode.attr('id').match(episodeID)
    const validEpisode = epMatch && epMatch[1]
    if (validEpisode) return validEpisode
  }, null)

  const latestEpisodeNode = $(`div#episode_${latestEpisode} .tvshowClick`, latestContentList)
  const episodeNumber = $('.tvshowEpNum', latestEpisodeNode).text().trim()
  const releaseDate = $('.tvshowRelDate', latestEpisodeNode).text().trim()
  latestEpisodeNode.find('.tvshowEpNum, .tvshowRelDate').remove()
  const title = latestEpisodeNode.text().trim()

  return {
    title,
    id: slugify(title),
    releaseDate,
    episodeID: latestEpisode,
    episodeNumber,
    seasonNumber
  }
}
