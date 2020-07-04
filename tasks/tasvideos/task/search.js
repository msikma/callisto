// Callisto - callisto-task-tasvideos <https://github.com/msikma/callisto>
// © MIT license

const cheerio = require('cheerio')
const { get } = require('lodash')

const { parseFeedURL } = require('callisto-core/util/feeds')
const { wait } = require('callisto-core/util/promises')
const { formatPubDateDuration } = require('callisto-core/util/time')
const { htmlToMarkdown } = require('callisto-core/util/html')
const { request } = require('callisto-core/lib/request')

/** TASVideos base URL. NOTE: https is currently broken. */
const baseURL = url => `http://tasvideos.org${url}`

/** Regex for matching data from the title. */
const reTitle = new RegExp('\\[([0-9]+)\\] (.+?) (.+?) by (.+?) in (.+?) (.+?)$')

/**
 * Retrieves all latest new publications.
 */
const reqLatestPublications = async () => {
  const url = baseURL('/publications.rss')
  const feed = await parseFeedURL(url)
  const results = normalizeFeedItems(feed)
    .sort((a, b) => a.meta.publishedExact > b.meta.publishedExact ? 1 : -1)

  return {
    success: true,
    errorType: null,
    error: null,
    items: results,
    meta: {
      url
    }
  }
}

/**
 * This adds the submission link to each publication found by reqLatestPublications().
 * 
 * The submission link is not included in the RSS feed, so we need to retrieve the
 * publication page itself and extract it.
 */
const addSubmissionLinks = async items => {
  const newItems = []
  for (const item of items) {
    const { link } = item
    if (link.submission) {
      newItems.push(item)
      continue
    }
    const res = await request(link.publication)
    const $ = cheerio.load(res.body)
    const submissionLink = findSubmissionLink($)
    newItems.push({
      ...item,
      link: { ...item.link, submission: submissionLink }
    })
    await wait(1000)
  }
  return newItems
}

/**
 * Retrieves information from the title.
 */
const getTitleInfo = (title) => {
  const info = title.match(reTitle)
  if (!info) return null
  return {
    id: info[1],
    console: info[2],
    game: info[3],
    author: info[4],
    duration: info[5],
    publisher: info[6].replace(/\((.+?)\)/, '$1')
  }
}

/** Checks if the current publication got a star. */
const hasStar = publisherString => !!~publisherString.indexOf('to Stars')
/** Checks if the current publication got a moon. */
const hasMoon = publisherString => !!~publisherString.indexOf('to Moons')

/**
 * Removes genres from a movie's categories list.
 */
const removeGenres = (categories) => (
  categories.filter(c => !c.startsWith('Genre:'))
)

/**
 * Filters the description HTML, removes unneeded elements.
 */
const filterDescription = (html) => {
  const md = htmlToMarkdown(html, { removeScript: true, removeStyle: true, removeHr: true, removeImages: true })
  // Fix links that don't include http. Sometimes they're used.
  return md.split('(//tasvideos.org').join('(http://tasvideos.org')
}

/**
 * Returns a link to the submission page (containing the author's comments)
 * for a Cheerio object of a publication page.
 */
const findSubmissionLink = $ => {
  const links = $('#page table.item a').get()
    .filter(a => !!$(a).text().match(/submission\s#(.+?)$/i))
    .map(a => $(a).attr('href'))
  
  // There should be just one: [ '/6679S.html' ].
  if (!links.length) return null
  return baseURL(links[0])
}

/**
 * Converts RSS feed data into a more accessible format.
 * 
 * Returns an array of new publication objects.
 */
const normalizeFeedItems = (feed) => {
  const torrents = []
  for (const item of feed) {
    const { title, description, pubDate, comments, date, image, guid, categories, author } = item
    const youtube = get(item, 'media:group.media:player.@.url')
    const titleInfo = getTitleInfo(title)
    const titleFormatted = `${titleInfo.console} ${titleInfo.game} by ${titleInfo.author} in ${titleInfo.duration}`
    const descFormatted = filterDescription(description)
    const id = `${titleInfo.id}M`

    torrents.push({
      id,
      title: titleFormatted,
      description: descFormatted,
      author,
      image: image.url,
      categories: removeGenres(categories),
      hasStar: hasStar(titleInfo.publisher),
      hasMoon: hasMoon(titleInfo.publisher),
      link: {
        publication: guid,
        comments,
        youtube
      },
      meta: {
        title: titleInfo,
        date,
        published: formatPubDateDuration(pubDate),
        publishedExact: pubDate
      }
    })
  }
  return torrents
}

module.exports = {
  reqLatestPublications,
  addSubmissionLinks
}
