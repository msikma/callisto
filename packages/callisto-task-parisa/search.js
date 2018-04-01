/**
 * Callisto - callisto-task-parisa <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import slugify from 'slugify'

import { requestAsBrowser } from 'callisto-util-request'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { id } from './index'

const parseDate = new RegExp('post/([0-9]+)$')
const parseChapterNumber = new RegExp('#([0-9]+) ')

export const runSearch = async (url) => {
  const html = await requestAsBrowser(url)
  const $html = cheerio.load(html)

  const items = findChapters($html)
  if (items.length === 0) return []

  const newItems = await removeCached(id, items)

  // Add the remaining items to the database.
  cacheItems(id, newItems)

  // Now we can send these results to the channel.
  return newItems
}

const findChapterNumber = (tagsString) => {
  const nMatch = tagsString.match(parseChapterNumber)
  return nMatch && parseInt(nMatch[1], 10)
}

const findChapters = ($) => {
  const info = $('.wrapper main article.post.photo').map((n, node) => {
    const pubTime = new Date($('.post-meta .timestamp', node).text())
    const notes = parseInt($('.post-meta .notecount', node).text().trim(), 10)
    const chapterNumber = findChapterNumber(`${$('.metadata .tags').text()} `)
    const image = $('.photo-hires-item img', node).attr('src')
    const link = $('.post-meta .timestamp a').attr('href')
    const idMatch = link.match(parseDate)
    const id = idMatch && idMatch[1]

    return {
      id,
      image,
      chapterNumber,
      link,
      pubTime
    };
  }).get()

  return info
}
