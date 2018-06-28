/**
 * Callisto - callisto-task-mangafox <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'

import { requestURL } from 'callisto-util-request'
import { cacheItems, removeCached, filterCachedIDs } from 'callisto-util-cache'
import { slugify, wait } from 'callisto-util-misc'
import { id } from './index'

const MANGAFOX_BASE = 'https://manga-fox.com'
const mangaFoxURL = slug => `${MANGAFOX_BASE}/${slug}`

export const runMangaSearch = async (slug) => {
  const mangaID = `${id}$${slug}`

  const latest = await getLatestChapter(slug)
  const ids = latest.map(i => i.id)
  const exists = (await filterCachedIDs(mangaID, ids)).map(i => i.id)
  
  const newItems = latest.filter(i => exists.indexOf(i.id) === -1).slice(-10)
  if (!newItems.length) {
    return []
  }
  
  const newItemsData = (await Promise.all(newItems.map(async (i, n) => {
    // Stagger requests, 5 seconds delay each.
    await wait(n * 5000)
    // 10 second timeout.
    return await Promise.race([getFirstImage(i, i.url), wait(10000)])
  }))).filter(i => !!i)

  // Cache items and return them.
  cacheItems(mangaID, newItemsData)
  return newItemsData
}

/**
 * Retrieves HTML from the MangaFox manga index page and parses it to find the latest chapters.
 */
const getLatestChapter = async (slug) => {
  const url = mangaFoxURL(slug)
  const html = await requestURL(url)
  const $html = cheerio.load(html)
  return findLatestChapters($html)
}

/**
 * Retrieves latest chapter data. Returns an array, but actually always contains only one item.
 */
const findLatestChapters = ($) => {
  const $latestChapter = $('.chapter-list .row:first-child a')
  return [{
    title: $latestChapter.attr('title'),
    id: slugify($latestChapter.attr('title')),
    url: `${MANGAFOX_BASE}${$latestChapter.attr('href')}`
  }]
}

/**
 * Returns the first image of a manga page.
 */
const getFirstImage = async (data, url) => {
  const html = await requestURL(url)
  const $ = cheerio.load(html)
  const $topImage = $('#list_chapter .content-area > img:first-of-type')
  return {
    ...data,
    image: $topImage.length ? $topImage.attr('src') : null
  }
}