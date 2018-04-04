/**
 * Callisto - callisto-task-youtube <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'

import { requestAsBrowser } from 'callisto-util-request'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { rssParse, findScriptData } from 'callisto-util-misc'
import { id } from './index'

const videoID = new RegExp('watch\\?v=(.+?)$')

const searchURL = (params, query) => (
  `https://www.youtube.com/results?sp=${params}&search_query=${encodeURIComponent(query)}`
)

const videoURL = (watch, prefix = '/watch?v=') => (
  `https://www.youtube.com${prefix}${watch}`
)

const getVideoID = (url) => {
  const idMatch = url.match(videoID)
  return videoID && videoID[1].trim()
}

// Turns e.g. '1.6K views' into '1.6K'.
const viewsPlain = (views) => {
  return views.split(' ')[0]
}

export const findNewSubscriptionVideos = async (url, slug) => {
  const items = await rssParse(url)
  if (items.length === 0) return []

  // Caching ID specific to this account.
  const accountCacheID = `${id}$${slug}$subscription`

  // Copy 'guid' to 'id' for caching.
  const allItems = items.map(entry => ({ ...entry, id: entry.guid }))
  const newItems = await removeCached(accountCacheID, allItems)

  // Add the remaining items to the database.
  cacheItems(accountCacheID, newItems)

  // Now we can send these results to the channel.
  return newItems
}

/**
 * Finds the <script> tag containing the 'ytInitialData' object.
 */
const findDataContent = ($) => (
  $('script')
    .filter((n, el) => $(el).html().indexOf('window["ytInitialData"]') !== -1)
    .map((n, el) => $(el).html())
    .get()[0]
)

export const findNewSearchVideos = async (params, query, slug) => {
  const url = searchURL(params, query)
  const searchCacheID = `${id}$${slug}$search`

  const html = await requestAsBrowser(url)
  const $html = cheerio.load(html)
  // Get content of the right <script> tag
  const pageDataString = findDataContent($html)
  const pageData = findScriptData(pageDataString)
  const items = findVideos(pageData.sandbox.window.ytInitialData)
  if (items.length === 0) return []
  const newItems = await removeCached(searchCacheID, items)
  //cacheItems(searchCacheID, newItems)
  return newItems
}

const findVideos = (initialData) => {
  // The actual video data is hidden deep within the data structure.
  if (!initialData) return []
  const videos = initialData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents
  // Extract all useful information from each video.
  return videos.map(video => {
    const data = video.videoRenderer
    const id = data.videoId
    const link = videoURL(id)
    const title = data.title.simpleText
    const author = data.ownerText ? data.ownerText.runs[0].text : '(unknown)'
    const views = data.viewCountText.simpleText
    const uploadTime = data.publishedTimeText.simpleText
    const description = data.descriptionSnippet ? data.descriptionSnippet.runs[0].text : ''
    const duration = data.lengthText.simpleText
    const durationAria = data.lengthText.accessibility.accessibilityData.label
    const image = data.thumbnail.thumbnails[0].url
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
      image,
      duration,
      durationAria,
      is4K
    }
  })
}

/**
 * Retrieves videos from HTML.
 * Currently unused because Youtube doesn't render the HTML right away.
 */
const findVideosHTML = ($) => {
  return $('#contents .ytd-item-section-renderer').map((n, el) => {
    const $el = $(el)
    const image = $('.ytd-thumbnail img', el).attr('src')
    const durationNode = $('.ytd-thumbnail-overlay-time-status-renderer', el)
    const duration = durationNode.text().trim()
    const durationAria = durationNode.attr('aria-label').trim()
    const title = $('.text-wrapper h3 #video-title', el).text().trim()
    const author = $('#metadata > #byline-container #byline-inner-container', el).text().trim()
    const viewsRaw = $('#metadata > #metadata-line > .ytd-video-meta-block:nth-child(1)', el).text().trim()
    const views = plainViews(viewsRaw)
    const uploadTime = $('#metadata > #metadata-line > .ytd-video-meta-block:nth-child(2)', el).text().trim()
    const description = $('#description-text', el).text().trim()
    const badges = $('#badges span.ytd-badge-supported-renderer', el)
      .map((m, badgeEl) => badgeEl.text().trim()).get()
    const is4K = badges.indexOf('4K') !== -1
    const link = videoURL($('#video-title', el).attr('href'), '')
    const id = getVideoID(link)

    return {
      id,
      link,
      title,
      author,
      views,
      uploadTime,
      description,
      image,
      duration,
      durationAria,
      is4K
    }
  }).get()
}
