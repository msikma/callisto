/**
 * Callisto - callisto-task-cut-time <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import slugify from 'slugify'
import TurndownService from 'turndown'

import { requestAsBrowser } from 'callisto-util-request'
import { cacheItems, removeCached, filterCachedIDs } from 'callisto-util-cache'
import { id } from './index'

const BASE_URL = 'http://www.cuttimecomic.com/'
const COMIC_URL = `${BASE_URL}comic/`
const ARCHIVE_URL = `${COMIC_URL}archive`

const turndownService = new TurndownService()

export const runSearch = async () => {
  const html = await requestAsBrowser(ARCHIVE_URL)
  const $html = cheerio.load(html)

  const latest = findLatestChapter($html)
  const exists = (await filterCachedIDs(id, [latest.id])).length > 0

  // If we haven't seen this chapter yet, fetch more data and cache it.
  if (!exists) {
    const htmlComic = await requestAsBrowser(latest.link)
    const $htmlComic = cheerio.load(htmlComic)
    const extraInfo = getComicInfo($htmlComic)

    cacheItems(id, [latest])

    return [{ ...latest, ...extraInfo }]
  }
  return []
}

const getComicInfo = ($) => {
  const image = $('#cc-comic').attr('src')
  const pubTimeRaw = $('.cc-newsarea .cc-publishtime').text().trim()
  const pubTime = new Date(pubTimeRaw.replace('Posted', '').trim().split(' at ').join(' '))
  const description = turndownService.turndown($('.cc-newsbody').html())
  return {
    image,
    pubTime,
    description
  }
}

const separateDateTitle = (dateTitle) => {
  const bits = dateTitle.split(' - ')
  return { date: bits[0], title: bits.slice(1).join(' - ') }
}

const findLatestChapter = ($) => {
  const $latestItem = $('select[name="comic"] option:last-child')
  const slug = $latestItem.attr('value')
  const { date, title } = separateDateTitle($latestItem.text().trim())

  return {
    id: slug,
    slug,
    link: `${COMIC_URL}${slug}`,
    date,
    title
  }
}
