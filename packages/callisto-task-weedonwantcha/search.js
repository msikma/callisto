/**
 * Callisto - callisto-task-weedonwantcha <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import slugify from 'slugify'

import { requestAsBrowser } from 'callisto-util-request'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { id } from './index'

// Retrieves the date from the og:title of a comic page.
const dateRe = new RegExp('\\[Camp Comic\\] (.+?) -')

/**
 * Run a search for the homepage. We'll find the latest post URL there.
 * Then we'll request that page too, just so we can get the post date.
 */
export const runSearch = async (url) => {
  const htmlHome = await requestAsBrowser(url)
  const basicInfo = findLatestComic(cheerio.load(htmlHome))
  if (!basicInfo) return []

  const htmlComic = await requestAsBrowser(basicInfo.link)
  const pubTimeInfo = findComicPubTime(cheerio.load(htmlComic))

  const items = [{ ...basicInfo, ...pubTimeInfo }]

  const newItems = await removeCached(id, items)

  // Add the remaining items to the database.
  cacheItems(id, newItems)

  // Now we can send these results to the channel.
  return newItems
}

/**
 * Returns the latest comic from the homepage.
 */
const findLatestComic = ($) => {
  const latestComic = $('#latestComic a')
  const link = latestComic.attr('href')
  const imageNode = $('img', latestComic)
  const image = imageNode.attr('src')
  const title = imageNode.attr('alt').trim()
  const id = slugify(title)

  return {
    id,
    title,
    link,
    image
  }
}

/**
 * Gets the comic date from the title of a page.
 */
const findComicPubTime = ($) => {
  const ogTitle = $('meta[property="og:title"]').attr('content').trim()
  const dateMatch = ogTitle.match(dateRe)
  return {
    pubTime: dateMatch && dateMatch[1]
  }
}
