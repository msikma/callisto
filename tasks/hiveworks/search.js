/**
 * Calypso - calypso-task-hiveworks <https://github.com/msikma/calypso>
 * © MIT license
 */

import cheerio from 'cheerio'

import { getTaskLogger } from 'calypso-core/src/logging'
import { requestURL } from 'calypso-request'
import { cacheItems, removeCached, filterCachedIDs } from 'calypso-cache'
import { wait, getIntegerTimestamp } from 'calypso-misc'
import { separateDateTitle, getMarkdownFromHTML, urlComic, urlArchive, getYear, COMIC_PREFIX } from './util'
import { id } from './index'

// Two types of archive pages we may encounter.
const ARCHIVE_UL = Symbol('ARCHIVE_UL')
const SELECT_COMIC = Symbol('SELECT_COMIC')

// Two types of detail pages.
const CC_COMIC = Symbol('CC_COMIC')
const COMIC_IMG = Symbol('COMIC_IMG')

/**
 * Runs a search for a single comic. Finds its latest chapter and its information,
 * then checks against the database to see if it's been cached already.
 * If not, it returns it to be posted to Discord.
 */
export const runComicSearch = async (urlBase, slug) => {
  const taskLogger = getTaskLogger(id)
  const comicID = `${id}$${slug}`

  // Find latest chapter. Check if it exists in the database yet.
  const latest = await getLatestChapters(urlBase, slug, taskLogger)
  const ids = latest.map(i => i.id)
  const exists = (await filterCachedIDs(comicID, ids)).map(i => i.id)

  // Now retrieve extended information for all new items.
  // We'll give each item a 10 second timeout. If it takes longer than that, just do it next time.
  // Also, only take the latest 10 items if there are more. We'll get those next round.
  const newItems = latest.filter(i => exists.indexOf(i.id) === -1).slice(-10)
  if (!newItems.length) {
    return []
  }
  const newItemsData = (await Promise.all(newItems.map(async (i, n) => {
    // Stagger requests, 5 seconds delay each.
    await wait(n * 5000)
    // 10 second timeout.
    return await Promise.race([getComicInfo(i, i.link), wait(10000)])
  }))).filter(i => !!i)

  // Sort by 'date' value.
  const newItemsSorted = sortByDate(newItemsData)

  // Cache items and return them.
  cacheItems(comicID, newItemsSorted)
  return newItemsData
}

// Sorts the items by date.
const sortByDate = (items) => (
  items.sort((a, b) => {
    const aTs = +new Date(a.date)
    const bTs = +new Date(b.date)
    return aTs < bTs ? 1 : 0
  })
)

/**
 * Requests the HTML for a comic's detail page and then returns the extended
 * information from that page, e.g. its full size image and publishing date.
 */
const getComicInfo = async (item, link) => {
  const html = await requestURL(link)
  const $html = cheerio.load(html)
  const data = { ...item, ...findComicInfo($html, item) }
  return data
}

/**
 * Returns full information about a comic by scraping its detail page.
 * Again there are actually two types of pages. We're scraping both in one function here.
 */
const findComicInfo = ($, item) => {
  const type = $('#cc-comic').length > 0 ? CC_COMIC : COMIC_IMG
  let data = {}
  const needsDate = !item.date

  // The CC_COMIC type contains an optional publication time and description.
  if (type === CC_COMIC) {
    const image = $('#cc-comic').attr('src')
    const pubTimeRaw = $('.cc-newsarea .cc-publishtime').text().trim()
    const pubTime = new Date(pubTimeRaw.replace('Posted', '').trim().split(' at ').join(' '))
    const description = getMarkdownFromHTML($('.cc-newsbody').html())
    data = {
      image,
      pubTime,
      description
    }
  }

  // The COMIC_IMG type has nothing except the image.
  if (type === COMIC_IMG) {
    const image = $('#comic img').attr('src')
    data = {
      image
    }
  }

  // If a date is needed, see if we can get it from the og:title.
  if (needsDate) {
    // e.g. '[Camp Comic] Saturday, November 11, 2017 - Words of Discouragement'
    const title = $('meta[property="og:title"]').attr('content')
    const dateMatches = title.match(/((January|February|March|April|May|June|July|August|September|October|November|December)(.+?)) - /i)
    const date = dateMatches && dateMatches[1] ? dateMatches[1] : 0
    return {
      ...data,
      date
    }
  }
  else {
    return data
  }
}

/**
 * Requests the comic's archive page HTML and returns its latest chapters.
 */
const getLatestChapters = async (urlBase, slug, taskLogger) => {
  const html = await requestURL(urlArchive(urlBase))
  const $html = cheerio.load(html)
  return findLatestChapters($html, urlBase, slug, taskLogger)
}

/**
 * There are two types of archive pages used by Hiveworks comic websites.
 *
 * Either it has an archive with every comic URL in it, or it has an archive
 * with just the months in it. We have to determine which of the two it is,
 * then run customized scraping code to get the latest item.
 */
const findLatestChapters = ($, urlBase, slug, taskLogger) => {
  // Determine which type of layout this comic archive uses.
  const type = $('.archive > ul > li').length > 0 ? ARCHIVE_UL : SELECT_COMIC

  switch (type) {
    case ARCHIVE_UL: return findLatestChaptersArchiveUl($, urlBase)
    case SELECT_COMIC: return findLatestChaptersSelectComic($, urlBase)
    default:
      taskLogger.error(`${slug}: Neither ARCHIVE_UL nor SELECT_COMIC type archive found.`)
      return {}
  }
}

// Scraping code for the ARCHIVE_UL type.
// Example: http://campcomic.com/comic/archive/
const findLatestChaptersArchiveUl = ($, urlBase) => {
  const chapters = $('.archive > ul > li').get()
  const items = chapters.map(c => {
    const $chapter = $(c)
    const $link = $('a', $chapter)
    const title = $link.attr('title')
    const link = $link.attr('href')
    const slug = link.replace(urlComic(urlBase), '')
    const thumbnail = $('a img', $chapter).attr('src')

    return {
      id: slug,
      slug,
      link,
      thumbnail,
      title,
      type: ARCHIVE_UL
    }
  })
  return items
}

// Scraping code for the SELECT_COMIC type, which has every comic's link in a <select>.
// Example: http://www.cuttimecomic.com/comic/archive/
const findLatestChaptersSelectComic = ($, urlBase) => {
  const items = $('select[name="comic"] option').get().map(o => {
    const $o = $(o)
    const { date, title } = separateDateTitle($o.text().trim())
    const value = $o.attr('value')
    // Some comics, like Devil's Candy, include a relative link to the comic page.
    // E.g. 'comic/slug'. Remove it to get a clean slug.
    const slug = value.replace(COMIC_PREFIX, '')
    return {
      id: slug,
      slug,
      link: urlComic(urlBase, slug),
      date,
      title,
      type: SELECT_COMIC
    }
  })
  return items
}
