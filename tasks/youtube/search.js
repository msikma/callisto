/**
 * Calypso - calypso-task-youtube <https://github.com/msikma/calypso>
 * © MIT license
 */

import cheerio from 'cheerio'
import { get } from 'lodash'

import { getTaskLogger } from 'calypso-core/logging'
import { requestURL } from 'calypso-request'
import { cacheItems, removeCached } from 'calypso-cache'
import { rssParse, getExactDuration, wrapInJSCode, objectInspect } from 'calypso-misc'
import { videoURL, getVideoExtendedInfo, getPageInitialData, getBestThumbnail } from './util'
import { id } from './index'

// Produces a search URL for a given query.
const searchURL = (params, query) => (
  `https://www.youtube.com/results?sp=${params}&search_query=${encodeURIComponent(query)}`
)

/**
 * Runs a search for new videos from a subscriptions RSS file.
 */
export const findNewSubscriptionVideos = async (url, slug) => {
  // Parse RSS - on error, this resolves with an empty array.
  const items = await rssParse(url, true)
  if (items.length === 0) return []

  // Caching ID specific to this account.
  const accountCacheID = `${id}$${slug}$subscription`

  // Copy 'guid' to 'id' for caching.
  const allItems = items.map(entry => ({ ...entry, id: entry.guid }))
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
    const info = get(data, 'videoDetails', {})

    if (!data.videoDetails) {
      // If we don't have videoDetails for some reason...
      getTaskLogger(id).warning(
        'Could not add extended info to video',
        'The video item\'s `videoDetails` key was not found',
        [
          ['Link', `${entry.link}`],
          ['`entry`', wrapInJSCode(objectInspect(data))],
          ['`data`', wrapInJSCode(objectInspect(data))]
        ]
      )
    }

    const description = get(info, 'shortDescription', '')
    // If we don't have a shortDescription for some reason...
    const thumbnails = get(info, 'thumbnail.thumbnails', [])
    const { keywords, lengthSeconds, viewCount } = info

    resolve({
      ...entry,
      imageURL: entry.image.url,
      duration: getExactDuration(lengthSeconds),
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

  const html = await requestURL(url)
  const $html = cheerio.load(html)
  // Get content of the right <script> tag
  const items = findVideos(getPageInitialData($html).ytInitialData, query, params, slug)
  if (items.length === 0) return []
  const newItems = await removeCached(searchCacheID, items)
  cacheItems(searchCacheID, newItems)
  return newItems
}

// Returns videos found in a search page's initial data.
const findVideos = (initialData, query, params, slug) => {
  // The actual video data is hidden deep within the data structure.
  if (!initialData) return []
  const videos = get(initialData, 'contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents', [])
  if (videos.length === 0) {
    getTaskLogger(id).warning('Search with zero results', `Found zero videos for search: ${slug}\nQuery: ${query}, params: ${params}`)
  }
  // Extract all useful information from each video.
  return videos.map(video => {
    const data = video.videoRenderer
    if (!data) return false
    const id = data.videoId
    const link = videoURL(id)
    const title = get(data, 'title.runs.0.text', get(data, 'title.simpleText', '(unknown)'))
    const author = get(data, 'ownerText.runs[0].text', get(data, 'longBylineText.runs[0].text', get(data, 'shortBylineText.runs[0].text', '(unknown)')))
    const views = get(data, 'viewCountText.simpleText', '0')
    const uploadTime = get(data, 'publishedTimeText.simpleText', '(unknown)')
    const description = get(data, 'descriptionSnippet.runs[0].text', get(data, 'descriptionSnippet.simpleText', ''))
    const duration = get(data, 'lengthText.simpleText', '(unknown)')
    const durationAria = get(data, 'lengthText.accessibility.accessibilityData.label', '(unknown)')
    const channelThumbnail = get(data, 'channelThumbnail.thumbnails[0].url', null)
    const movingThumbnail = get(data, 'richThumbnail.movingThumbnailRenderer.movingThumbnailDetails.thumbnails[0].url', null)
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
      movingThumbnail,
      channelThumbnail,
      is4K
    }
  }).filter(v => v !== false)
}
