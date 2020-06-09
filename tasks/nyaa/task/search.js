// Callisto - callisto-task-nyaa <https://github.com/msikma/callisto>
// © MIT license

const cheerio = require('cheerio')

const { titleFromFilename, separateMarkdownImages, removeEmptyLines, removeEmptyQuotesMd } = require('callisto-core/util/text')
const { request } = require('callisto-core/lib/request')
const { parseFeedURL } = require('callisto-core/util/feeds')
const { formatPubDateDuration } = require('callisto-core/util/time')

/** Nyaa base URL. */
const baseURL = url => `https://nyaa.si${url}`

/** Returns an RSS feed URL for Nyaa.si. */
const searchURL = (searchQuery = '', searchCategory = '', searchFilter = '') =>
  baseURL(`/?page=rss&q=${encodeURIComponent(searchQuery)}&c=${encodeURIComponent(searchCategory)}&f=${encodeURIComponent(searchFilter)}`)

/** Returns a globally unique ID for the database. */
const uniqueID = (id) => `nyaa:${id}`

/**
 * Returns true if the description is Nyaa's generic "no description."
 * If so, we should not display it in the rich embed.
 */
const isNoDescription = description => description.trim() === '#### No description.'

/**
 * Returns normalized items from a Nyaa RSS feed.
 * 
 *   { title: '[AkihitoSubs] Pocket Monsters (Pokemon 2019) - 022 Farewell Raboot! [1080p][HEVC][10Bit][EAC3]',
 *     torrentURL: 'https://nyaa.si/download/1239986.torrent',
 *     url: 'https://nyaa.si/view/1239986',
 *     seeders: '24',
 *     leechers: '0',
 *     downloads: '794',
 *     infohash: '106dfe5c1f19145926977687f9011eb5efc438eb',
 *     categoryID: '1_2',
 *     category: 'Anime - English-translated',
 *     size: '282.7 MiB',
 *     comments: '0',
 *     trusted: 'No',
 *     remake: 'Yes',
 *     meta:
 *      { published: '2 months ago',
 *        publishedExact: 2020-04-20T03:17:11.000Z } }
 */
const normalizeFeedItems = (feed) => {
  const torrents = []
  for (const item of feed) {
    const title = titleFromFilename(item.title)
    const { link, guid, pubDate } = item
    const idMatch = link.match(/\/([0-9]+)\.torrent/)
    const id = uniqueID(idMatch[1])
    const seeders = item['nyaa:seeders']['#']
    const leechers = item['nyaa:leechers']['#']
    const downloads = item['nyaa:downloads']['#']
    const infohash = item['nyaa:infohash']['#']
    const categoryID = item['nyaa:categoryid']['#']
    const category = item['nyaa:category']['#']
    const size = item['nyaa:size']['#']
    const comments = item['nyaa:comments']['#']
    const trusted = item['nyaa:trusted']['#']
    const remake = item['nyaa:remake']['#']

    torrents.push({
      title,
      id,
      torrentURL: link,
      url: guid,
      seeders,
      leechers,
      downloads,
      infohash,
      categoryID,
      category,
      size,
      comments,
      trusted,
      remake,
      meta: {
        published: formatPubDateDuration(pubDate),
        publishedExact: pubDate
      }
    })
  }
  return torrents
}

/**
 * Cleans up the description Markdown a little.
 */
const processDescription = md => {
  return removeEmptyLines(removeEmptyQuotesMd(md))
}

/**
 * Adds additional information (mainly the description and images) to new items.
 * 
 * This is done after we've filtered out items we've already cached, to ensure
 * a minimum of additional network calls.
 */
const addDetailedInformation = async (items) => {
  const extended = []
  for (const item of items) {
    const html = await request(item.url)
    const $ = cheerio.load(html.body, { decodeEntities: false })

    // The HTML contains raw Markdown, which is then converted to HTML using Javascript.
    // Thus we can just steal it verbatim.
    const mdDescription = $('#torrent-description').html()
    // However, we can't display images, so we'll have to take those out.
    const mdTextImages = separateMarkdownImages(mdDescription)

    extended.push({
      ...item,
      images: mdTextImages.images,
      description: isNoDescription(mdDescription) ? null : processDescription(mdTextImages.text)
    })
  }
  return extended
}

/**
 * Runs a search for new torrents.
 */
const findSearchTorrents = async ({ searchQuery, searchCategory }) => {
  const feedURL = searchURL(searchQuery, searchCategory)
  const feed = await parseFeedURL(feedURL)
  let results = normalizeFeedItems(feed)

  // Sort oldest items first.
  results = results.sort((a, b) => a.meta.publishedExact > b.meta.publishedExact ? 1 : -1)

  return {
    success: true,
    items: results,
    meta: {
      url: feedURL,
      searchQuery,
      searchCategory
    }
  }
}

module.exports = {
  findSearchTorrents,
  addDetailedInformation
}
