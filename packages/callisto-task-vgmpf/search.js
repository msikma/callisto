/**
 * Callisto - callisto-task-vgmpf <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'

import { requestURL } from 'callisto-util-request'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { slugify } from 'callisto-util-misc'
import { id } from './index'

const VGMPF_BASE = 'http://www.vgmpf.com'
const VGMPF_URL = 'http://www.vgmpf.com/Wiki/index.php?title=Main_Page'

export const runVGMPFSearch = async () => {
  const html = await requestURL(VGMPF_URL)
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
    let title = titleLink.text().trim()
    // Filter out the e.g. (C64) from the title.
    let platform = title.match(/\((.+?)\)$/)
    if (platform) {
      title = title.split(platform[0]).join('').trim()
      platform = platform[1]
    }
    const link = `${VGMPF_BASE}${titleLink.attr('href').trim()}`
    const id = slugify(link)
    return {
      title,
      platform,
      image,
      id,
      link
    }
  }).get()
}

const getArray = ($, $item) => $item.map((n, item) => $(item).text().trim()).get()
