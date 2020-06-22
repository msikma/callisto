// Callisto - callisto-task-ocremix <https://github.com/msikma/callisto>
// © MIT license

const cheerio = require('cheerio')
const { request } = require('callisto-core/lib/request')
const { slugify } = require('callisto-core/util/slug')
const { getDate, enlargeImage, enlargeGameThumb, fixSlashes } = require('./util')

/** Home page containing recent tracks and albums. */
const baseURL = url => `https://ocremix.org${url || ''}`

/**
 * Runs scraping operation and parses results either as tracks or albums.
 */
const runScrapeOperation = async (type, url = baseURL()) => {
  const res = await request(url)
  const $html = cheerio.load(res.body)
  const items = type === 'tracks'
    ? findNewTracks($html)
    : findNewAlbums($html)
  
  return {
    success: true,
    items,
    meta: {
      url,
      type
    }
  }
}

// Checks the "latest albums" widget on the homepage for new albums.
const findNewAlbums = ($) => {
  const widgets = $('.widget').get()
  const albumWidget = widgets.find(el => $('.widget-title', el).text().trim().toLowerCase() === 'latest albums')
  if (!albumWidget) return []

  const items = $('.widget-content a', albumWidget).map((_, el) => {
    const link = baseURL(`${fixSlashes($(el).attr('href'))}`)
    const $img = $('img', el)
    const image = baseURL(`${fixSlashes(enlargeImage($img.attr('src')))}`)
    const fullTitle = $img.attr('title')
    const { title, date } = getDate(fullTitle)

    return {
      title,
      id: slugify(title),
      published: date,
      image,
      link
    }
  }).get()

  return items
}

// Checks the jukebox on the homepage for new tracks.
const findNewTracks = ($) => (
  $('.jukebox-items > li').map((n, el) => {
    const $dateDiv = $('> div:nth-child(1)', el)
    const year = $('.featured', $dateDiv).text().trim()
    $('.featured', $dateDiv).remove()
    const day = $dateDiv.text().trim()
    const published = new Date(`${day} ${year}`)

    const $remixNode = $('a.jukebox-link.remix', el)
    const image = baseURL(`${fixSlashes(enlargeGameThumb($('img', $remixNode).attr('src')))}`)
    const href = $remixNode.attr('href')
    const link = baseURL(`${fixSlashes(href)}`)

    const $gameNode = $('.color-bodytext.single-line-item a', el)
    const gameName = $gameNode.text().trim()
    const gameLink = baseURL(`${$gameNode.attr('href')}`)

    const title = $('.featured.single-line-item a', el).text().trim()

    const $artistNodes = $('.color-additional.single-line-item a', el)
    const artists = $artistNodes.get().map(n => $(n).text().trim())

    return {
      title,
      id: slugify(href),
      image,
      link,
      published,
      game: {
        name: gameName,
        link: gameLink
      },
      artists
    }
  }).get()
)

module.exports = {
  runScrapeOperation
}
