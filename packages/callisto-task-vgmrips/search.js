/**
 * Callisto - callisto-task-vgmrips <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'

import { slugify } from 'callisto-util-misc'
import { requestURL } from 'callisto-util-request'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { id } from './index'

const VGMRIPS_URL = 'http://vgmrips.net/packs/latest'

export const runVGMRipsSearch = async () => {
  const html = await requestURL(VGMRIPS_URL)
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
  const packs = $('#recent > .result.row')
  return packs.map((n, pack) => {
    const $pack = $(pack)
    const image = $('.image img', $pack).attr('src')
    const title = $('.image img', $pack).attr('alt')
    const link = $('.title a:nth-child(2)', $pack).attr('href')
    const chips = getArray($, $('.info .chips a', $pack))
    const developers = getArray($, $('.info .developers a', $pack))
    const publishers = getArray($, $('.info .publishers a', $pack))
    const systems = getArray($, $('.info .systems a', $pack))
    const composers = getArray($, $('.info .composers a', $pack))
    const packAuthors = getArray($, $('.info .authors a', $pack))
    const downloadLink = $('.title a.download', $pack).attr('href')
    const id = slugify(link)
    const size = $('.title a.download > small', $pack).text().split('•').pop().trim()
    return {
      title,
      image,
      id,
      link,
      download: {
        link: downloadLink,
        size
      },
      chips,
      developers,
      publishers,
      systems,
      composers,
      packAuthors
    }
  }).get()
}

const getArray = ($, $item) => $item.map((n, item) => $(item).text().trim()).get()
