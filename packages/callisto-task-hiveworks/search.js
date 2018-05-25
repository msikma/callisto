/**
 * Callisto - callisto-task-hiveworks <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'

import logger from 'callisto-util-logging'
import { requestURL } from 'callisto-util-request'
import { cacheItems, removeCached, filterCachedIDs } from 'callisto-util-cache'
import { separateDateTitle, getMarkdownFromHTML, urlComic, urlArchive, getYear } from './util'
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
  const comicID = `${id}$${slug}`

  // Find latest chapter. Check if it exists in the database yet.
  const latest = await getLatestChapter(urlBase, slug)
  const exists = (await filterCachedIDs(comicID, [latest.id])).length > 0
  if (exists) return []

  // If we haven't seen these chapters yet, cache it,
  // fetch more data, then return it to be posted.
  cacheItems(comicID, [latest])
  return [await getComicInfo(latest, latest.link)]
}

/**
 * Requests the HTML for a comic's detail page and then returns the extended
 * information from that page, e.g. its full size image and publishing date.
 */
const getComicInfo = async (item, link) => {
  const html = await requestURL(link)
  const $html = cheerio.load(html)
  return { ...item, ...findComicInfo($html) }
}

/**
 * Returns full information about a comic by scraping its detail page.
 * Again there are actually two types of pages. We're scraping both in one function here.
 */
const findComicInfo = ($) => {
  const type = $('#cc-comic').length > 0 ? CC_COMIC : COMIC_IMG

  // The CC_COMIC type contains an optional publication time and description.
  if (type === CC_COMIC) {
    const image = $('#cc-comic').attr('src')
    const pubTimeRaw = $('.cc-newsarea .cc-publishtime').text().trim()
    const pubTime = new Date(pubTimeRaw.replace('Posted', '').trim().split(' at ').join(' '))
    const description = getMarkdownFromHTML($('.cc-newsbody').html())
    return {
      image,
      pubTime,
      description
    }
  }

  // The COMIC_IMG type has nothing except the image.
  if (type === COMIC_IMG) {
    const image = $('#comic img').attr('src')
    return {
      image
    }
  }
}

/**
 * Requests the comic's archive page HTML and returns its latest chapters.
 */
const getLatestChapter = async (urlBase, slug) => {
  const html = await requestURL(urlArchive(urlBase))
  const $html = cheerio.load(html)
  return findLatestChapter($html, urlBase, slug)
}

/**
 * There are two types of archive pages used by Hiveworks comic websites.
 *
 * Either it has an archive with every comic URL in it, or it has an archive
 * with just the months in it. We have to determine which of the two it is,
 * then run customized scraping code to get the latest item.
 */
const findLatestChapter = ($, urlBase, slug) => {
  // Determine which type of layout this comic archive uses.
  const type = $('.archive > ul > li').length > 0 ? ARCHIVE_UL : SELECT_COMIC

  switch (type) {
    case ARCHIVE_UL: return findLatestChapterArchiveUl($, urlBase)
    case SELECT_COMIC: return findLatestChapterSelectComic($, urlBase)
    default:
      logger.error(`hiveworks: ${slug}: Neither ARCHIVE_UL nor SELECT_COMIC type archive found.`)
      return {}
  }
}

// Scraping code for the ARCHIVE_UL type.
const findLatestChapterArchiveUl = ($, urlBase) => {
  const $months = $('#month option[value]')
  const firstMonth = $($months[0]).text()
  const lastMonth = $($months[$months.length - 1]).text()
  const isFirstLatest = new Date(firstMonth) > new Date(lastMonth)
  const latestYear = isFirstLatest ? getYear(firstMonth) : getYear(lastMonth)

  const $chapter = $('.archive > ul > li:first-child')
  const $link = $('a', $chapter)
  const title = $link.attr('title')
  const link = $link.attr('href')
  const slug = link.replace(urlComic(urlBase), '')
  const thumbnail = $('a img', $chapter).attr('src')
  const date = `${$('.date', $chapter).text().trim()} ${latestYear}`

  return {
    id: slug,
    slug,
    link,
    thumbnail,
    date,
    title,
    type: ARCHIVE_UL
  }
}

// Scraping code for the SELECT_COMIC type, which has every comic's link in a <select>.
const findLatestChapterSelectComic = ($, urlBase) => {
  const $latestItem = $('select[name="comic"] option:last-child')
  const slug = $latestItem.attr('value')
  const { date, title } = separateDateTitle($latestItem.text().trim())

  return {
    id: slug,
    slug,
    link: urlComic(urlBase, slug),
    date,
    title,
    type: SELECT_COMIC
  }
}
