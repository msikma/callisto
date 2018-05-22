/**
 * Callisto - callisto-task-youtube <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import moment from 'moment'
import { get } from 'lodash'
import momentDurationFormatSetup from 'moment-duration-format'

import logger from 'callisto-util-logging'
import { requestAsBrowser } from 'callisto-util-request'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { rssParse } from 'callisto-util-misc'
import { videoURL, getVideoExtendedInfo, getPageInitialData, getBestThumbnail } from './util'
import { id } from './index'

// Produces a search URL for a given query.
const searchURL = (params, query) => (
  `https://www.youtube.com/results?sp=${params}&search_query=${encodeURIComponent(query)}`
)

// Extend Moment to be able to format durations.
// See <https://github.com/jsmreese/moment-duration-format>.
momentDurationFormatSetup(moment)

/**
 * Runs a search for new videos from a subscriptions RSS file.
 */
export const findNewSubscriptionVideos = async (url, slug) => {
  const items = await rssParse(url)
  if (items.length === 0) return []

  // Caching ID specific to this account.
  const accountCacheID = `${id}$${slug}$subscription`

  // Copy 'guid' to 'id' for caching.
  const allItems = items.map(entry => ({ ...entry, id: entry.guid })).slice(0, 1)
  const newItems = await removeCached(accountCacheID, allItems)
  const extendedInfoItems = newItems.length ? await addExtendedInfo(newItems) : []

  // Add the remaining items to the database.
  cacheItems(accountCacheID, extendedInfoItems)

  // Now we can send these results to the channel.
  return extendedInfoItems
}

// Adds extended information to a list of items.
// This is done to get e.g. the description of a video for RSS entries,
// which normally do not have this information.
const addExtendedInfo = (rssItems) => (
  Promise.all(rssItems.map(entry => new Promise(async (resolve) => {
    const data = await getVideoExtendedInfo(entry.link)

    // If something went wrong, resolve with our basic info instead.
    if (!data) return resolve({ ...entry })
    const info = data.videoDetails
    const description = info.shortDescription
    const thumbnails = info.thumbnail.thumbnails
    const { keywords, lengthSeconds, viewCount } = info

    resolve({
      ...entry,
      imageURL: entry.image.url,
      duration: moment.duration({ seconds: lengthSeconds }).format(),
      description,
      thumbnails,
      keywords,
      lengthSeconds,
      views: viewCount
    });
  })))
)

/**
 * Searches Youtube using a specified search query and returns whatever videos it finds.
 *
 * The search parameters should be encoded in the way that Youtube itself does it,
 * so you can only get the parameters by running the search in Youtube and copying the URL string.
 * E.g. searching for 'test', sorted by upload date, produces ?search_query=test&sp=CAI%253D.
 * The 'sp' (search parameters) string should be URL decoded, making it 'CAI%3D' in this example.
 */
export const findNewSearchVideos = async (params, query, slug) => {
  const url = searchURL(params, query)
  const searchCacheID = `${id}$${slug}$search`

  const html = await requestAsBrowser(url)
  const $html = cheerio.load(html)
  // Get content of the right <script> tag
  const items = findVideos(getPageInitialData($html).ytInitialData)
  if (items.length === 0) return []
  const newItems = await removeCached(searchCacheID, items)
  cacheItems(searchCacheID, newItems)
  return newItems
}

// Returns videos found in a search page's initial data.
const findVideos = (initialData) => {
  // The actual video data is hidden deep within the data structure.
  if (!initialData) return []
  const videos = initialData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents
  // Extract all useful information from each video.
  return videos.map(video => {
    const data = video.videoRenderer
    if (!data) return false
    const id = data.videoId
    const link = videoURL(id)
    if (!data.title) {
      logger.warn(data)
    }
    const title = data.title.simpleText
    const author = data.ownerText ? data.ownerText.runs[0].text : '(unknown)'

    if (!data.viewCountText) {
      logger.warn(data)
    }
    const views = get(data, 'viewCountText.simpleText', '0')
    const uploadTime = get(data, 'publishedTimeText.simpleText', '(unknown)')
    const description = data.descriptionSnippet ? data.descriptionSnippet.runs[0].text : ''
    const duration = get(data, 'lengthText.simpleText', '(unknown)')
    const durationAria = get(data, 'lengthText.accessibility.accessibilityData.label', '(unknown)')
    const imageURL = getBestThumbnail(get(data, 'thumbnail.thumbnails', []))
    const badges = data.badges.map(badge => badge.metadataBadgeRenderer.label)
    const is4K = badges.indexOf('4K') !== -1

    return {
      // Mimic the ID form used by the Youtube subscriptions.
      id: `yt:video-search:${id}`,
      link,
      title,
      author,
      views,
      uploadTime,
      description,
      imageURL,
      duration,
      durationAria,
      is4K
    }
  }).filter(v => v !== false)
}
