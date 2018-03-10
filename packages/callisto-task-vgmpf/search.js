/**
 * Callisto - callisto-task-vgmpf <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import slugify from 'slugify'
import { requestAsBrowser } from 'callisto-util-request'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { id } from './index'

const VGMPF_BASE = 'http://www.vgmpf.com'

export const runVGMPFSearch = async (url) => {
  const html = await requestAsBrowser(url)
  const $html = cheerio.load(html)

  const items = findReleases($html)
  if (items.length === 0) return []

  const newItems = await removeCached(id, items)

  // Add the remaining items to the database.
  cacheItems(id, newItems)

  // Now we can send these results to the channel.
  return newItems
}

const findReleases = ($) => {
  // We can't directly select the div containing the releases.
  // Select its header, then its sibling.
  const soundtracksHeader = $('table div')
    .filter((n, div) => $(div).text().trim().toLowerCase() === 'latest soundtracks')
  const soundtracksContainer = $(soundtracksHeader).next()
  const soundtracks = $('> div', soundtracksContainer)
  return soundtracks.map((n, soundtrack) => {
    const $soundtrack = $(soundtrack)
    const image = `${VGMPF_BASE}${$('table p a img', $soundtrack).attr('src').trim()}`
    const titleLink = $('a', $('table p', $soundtrack)[1])
    const title = titleLink.text().trim()
    const link = `${VGMPF_BASE}${titleLink.attr('href').trim()}`
    const id = slugify(link)
    return {
      title,
      image,
      id,
      link
    }
  }).get()
}

const getArray = ($, $item) => $item.map((n, item) => $(item).text().trim()).get()
