// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const cheerio = require('cheerio')
const { get, isPlainObject } = require('lodash')
const { basename } = require('path')
const { loadXMLFile } = require('dada-cli-tools/util/xml')
const { request } = require('callisto-core/lib/request')
const { parseFeedURL } = require('callisto-core/util/feeds')
const { findTagContent } = require('callisto-core/util/html')
const { extractScriptResult } = require('callisto-core/util/vm')
const { formatPubDateDuration, getAbsoluteFromRelative, getParseableTimestamp, getTimeAgo } = require('callisto-core/util/time')

/** Youtube base URL. */
const baseURL = url => `https://www.youtube.com${url}`

/** Youtube search URL. */
const searchURL = (query, sp) => baseURL(`/results?search_query=${encodeURIComponent(query)}&sp=${encodeURIComponent(sp)}`)

/** Youtube single video URL. */
const videoURL = id => baseURL(`/watch?v=${id}`)

/** Returns a globally unique ID for the database. */
const uniqueID = (id, type, slug = '(none)') => `youtube:${type}$${slug}$${id}`

/** Returns the largest thumbnail from a list of thumbnails given by Youtube. */
const getLargestThumbnail = thumbnailsList => {
  const sortedThumbnails = thumbnailsList.sort((a, b) => Number(a.width) * Number(a.height) < Number(b.width) * Number(b.height) ? 1 : -1)
  return sortedThumbnails[0]
}

/** Returns the .text value of a title/description run, with Markdown styling if needed. */
const wrapRunInMarkdown = run => {
  if (run.bold) return `**${run.text}**`
  return `${run.text}`
}

/**
 * Returns the author's channel URL.
 * 
 * It can be in one of two places, depending on whether the channel has a name or not.
 */
const getAuthorURL = authorRun => (
  get(authorRun, 'navigationEndpoint.browseEndpoint.canonicalBaseUrl',
  get(authorRun, 'navigationEndpoint.commandMetadata.webCommandMetadata.url', null))
)

/**
 * Converts Youtube's native ytInitialData format into a more usable one.
 * 
 * Returns an array of video objects that look like this:
 * 
 *   { videoID: 'yx8FDoIaTDg',
 *     title: 'video title **optionally with markdown**',
 *     description: 'video description **optionally with markdown**',
 *     url: 'https://www.youtube.com/watch?v=yx8FDoIaTDg',
 *     meta:
 *      { published: '1 week ago',
 *        publishedExact: '2018-05-23 01:09:21+0200',
 *        isPublished: true,
 *        isScheduled: false,
 *        length: '1:27:58',
 *        views: '1,350 views' },
 *     image:
 *      { url: 'https://i.ytimg.com/vi/filename',
 *        width: 168,
 *        height: 94 },
 *     author:
 *      { name: 'username',
 *        url: 'https://www.youtube.com/user/username',
 *        image:
 *         { url: 'https://i.ytimg.com/vi/filename',
 *           width: 168,
 *           height: 94 } } }
 * 
 * If 'upcomingEventData' is defined, the video has not premiered yet and is set to
 * go live at a specific time. In this case 'publishedTimeText' will be null, and the
 * 'published' and 'publishedExact' fields will contain the time the video is set
 * to go live.
 */
const normalizeVideoData = videoData => {
  const videos = []
  for (const videoItem of videoData) {
    // Skip the current item if it's invalid. We can only render items that have a 'videoRenderer' object.
    // Other items are playlistRenderer, channelRenderer, shelfRenderer and searchPyvRenderer (promoted video/ad).
    if (!videoItem || !videoItem.videoRenderer) {
      continue
    }
    const base = videoItem.videoRenderer
    const videoID = base.videoId
    const image = getLargestThumbnail(base.thumbnail.thumbnails)
    const title = base.title.runs.map(wrapRunInMarkdown).join('')
    const description = base.descriptionSnippet.runs.map(wrapRunInMarkdown).join('')
    const isScheduled = base.upcomingEventData != null
    const isPublished = !isScheduled
    const published = isPublished ? base.publishedTimeText.simpleText : getTimeAgo(new Date(base.upcomingEventData.startTime * 1000))
    const publishedExact = isPublished ? getAbsoluteFromRelative(published) : getParseableTimestamp(new Date(base.upcomingEventData.startTime * 1000))
    const length = base.lengthText.simpleText
    const views = base.viewCountText ? base.viewCountText.simpleText : '0 views'
    const url = videoURL(videoID)
    const channelThumbnail = getLargestThumbnail(base.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails)
    const authorData = base.ownerText.runs[0]
    const author = {
      name: authorData.text,
      url: baseURL(getAuthorURL(authorData)),
      image: channelThumbnail
    }
    videos.push({
      videoID,
      title,
      description,
      url,
      meta: {
        publishedExact,
        published,
        isScheduled,
        isPublished,
        length,
        views
      },
      image,
      author
    })
  }
  return videos
}

/**
 * Returns video objects like normalizeVideoData(), using Youtube's Atom feed data.
 * 
 * The returned data is in the same format as normalizeVideoData() except that we don't have
 * a description, an author image, or the video's length. Both these values are null.
 */
const normalizeVideoDataFeed = feedItems => {
  const videos = []
  for (const item of feedItems) {
    const { title, description } = item
    const publishedExact = item.pubDate
    const published = formatPubDateDuration(publishedExact)
    const length = null
    const views = `${item['media:group']['media:community']['media:statistics']['@'].views} views`
    const image = item['media:group']['media:thumbnail']['@']
    const videoID = item['yt:videoid']['#']
    const url = item.link
    const author = {
      name: item.author,
      url: item['atom:author']['uri']['#'],
      image: null
    }

    videos.push({
      videoID,
      title,
      description,
      url,
      meta: {
        publishedExact,
        published,
        length,
        views
      },
      image,
      author
    })
  }
  return videos
}

/**
 * Runs a search for new videos from a subscriptions RSS file.
 */
const findSubscriptionVideos = async (subFile) => {
  const subs = await loadXMLFile(subFile)

  let allVideoResults = []
  let outline

  try {
    outline = subs.opml.body.outline.outline
    outline = isPlainObject(outline) ? [outline] : outline
  }
  catch (err) {
    return { success: false, errorType: 'Could not find `subs.opml.outline.outline`', error: err, meta: { url: null } }
  }
  
  for (const sub of outline) {
    const items = await parseFeedURL(sub.$xmlUrl)
    const videoResults = normalizeVideoDataFeed(items)
      .map(i => ({ ...i, id: uniqueID(i.videoID, 'subscription', basename(subFile)) }))
    allVideoResults = [...allVideoResults, ...videoResults]
  }

  // Sort oldest items first.
  allVideoResults = allVideoResults.sort((a, b) => a.meta.publishedExact > b.meta.publishedExact ? 1 : -1)

  return {
    success: true,
    errorType: null,
    error: null,
    items: allVideoResults,
    meta: {
      subFile
    }
  }
}

/**
 * Searches Youtube using a specified search query and returns whatever videos it finds.
 *
 * The search parameters should be encoded in the way that Youtube itself does it,
 * so you can only get the parameters by running the search in Youtube and copying the URL string.
 * E.g. searching for 'test', sorted by upload date, produces ?search_query=test&sp=CAI%253D.
 * Make sure the URI components are decoded.
 * 
 * For example, let's search for "前面展望" and set the parameters as follows:
 * 
 *   * Type: Video
 *   * Duration: Long (> 20 minutes)
 *   * Features: 4K, HD
 *   * Sort by: Upload date
 * 
 * This produces the following URI:
 * 
 *   https://www.youtube.com/results?search_query=%E5%89%8D%E9%9D%A2%E5%B1%95%E6%9C%9B&sp=CAISBBABGAI%253D
 * 
 * This decodes to the following:
 * 
 *   https://www.youtube.com/results?search_query=前面展望&sp=CAISBhABGAJwAQ%3D%3D
 * 
 * In this case, we'll save "前面展望" as the searchQuery, and "CAISBhABGAJwAQ%3D%3D" as the searchParameters.
 * Space characters will be encoded into + characters.
 */
const findSearchVideos = async (slug, searchQuery, searchParameters) => {
  const url = searchURL(searchQuery, searchParameters)
  const html = await request(url)
  const $ = cheerio.load(html.body)
  const initialDataScript = findTagContent($, 'script', `window["ytInitialData"]`)

  let initialData
  let estimatedResults
  let videoData

  try {
    initialData = extractScriptResult(initialDataScript).context.window.ytInitialData
  }
  catch (err) {
    return { success: false, errorType: 'Could not extract `initialData`', error: err, meta: { url } }
  }

  try {
    estimatedResults = initialData.estimatedResults
    videoData = initialData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents
  }
  catch (err) {
    return { success: false, errorType: 'Could not find video data', error: err, meta: { url } }
  }

  // Add a unique ID for the database. Sort oldest items first.
  const videoResults = normalizeVideoData(videoData)
    .map(i => ({ ...i, id: uniqueID(i.videoID, 'search', slug) }))
    .sort((a, b) => a.meta.publishedExact > b.meta.publishedExact ? 1 : -1)
  
  return {
    success: true,
    errorType: null,
    error: null,
    items: videoResults,
    meta: {
      url,
      estimatedResults
    }
  }
}

module.exports = {
  findSubscriptionVideos,
  findSearchVideos
}
