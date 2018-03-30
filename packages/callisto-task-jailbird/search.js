/**
 * Callisto - callisto-task-jailbird <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import slugify from 'slugify'

import { requestAsBrowser } from 'callisto-util-request'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { id } from './index'

const parseDate = new RegExp('^Posted(.+?)at(.+?)$', 'i')

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

/**
 * Creates a Javascript date object from a string.
 * The format we expect here is 'Posted June 11, 2012 at 02:01 pm'.
 * If we can't figure out what the date is, null is returned.
 */
const makeDate = (timeStr) => {
  const bits = timeStr.trim().match(parseDate)
  if (bits && bits[1]) {
    return new Date(`${bits[1]} ${bits[2]} GMT`.trim())
  }
  return null
}

const singleSpaces = (str) => (
  str.replace(/\s\s+/g, ' ')
)

const findChapters = ($) => {
  const images = $($('#cc-comicbody')[0])
    .map((n, div) => $($('> img', div)[0]).attr('src'))
    .get()

  const info = $($('.cc-newsarea')[0]).map((n, div) => {
    const header = $('.cc-newsheader', div).text()
    const link = $('.cc-newsheader > a:first-of-type', div).attr('href')
    const pubTime = makeDate($('.cc-publishtime', div).text())
    const descriptionNode = $('.cc-newsbody', div)
    const description = descriptionNode.html()

    // Replace <br> with spaces to ensure this looks good in plain text.
    $('br', descriptionNode).replaceWith(' ')
    const descriptionText = singleSpaces(descriptionNode.text())

    return {
      id: slugify(header),
      image: images[n],
      link,
      header,
      pubTime,
      description,
      descriptionText
    };
  }).get()

  return info
}
