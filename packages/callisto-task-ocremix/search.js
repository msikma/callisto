/**
 * Callisto - callisto-task-reddit <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'

import { cacheItems, removeCached } from 'callisto-util-cache'
import { requestURL } from 'callisto-util-request'
import { slugify } from 'callisto-util-misc'
import { id } from './index'

const URL = 'https://ocremix.org'
const dateTitle = new RegExp('^(.+?) \\((.+?)\\)')

export const findNewItems = async () => {
  const html = await requestURL(URL)
  const $html = cheerio.load(html)
  const rawTracks = findNewTracks($html)
  const rawAlbums = findNewAlbums($html)

  // Caching IDs for tracks and albums.
  const cacheTracks = `${id}$track`
  const cacheAlbums = `${id}$album`
  const tracks = await removeCached(cacheTracks, rawTracks)
  const albums = await removeCached(cacheAlbums, rawAlbums)

  // Add the remaining items to the database.
  cacheItems(cacheTracks, tracks)
  cacheItems(cacheAlbums, albums)

  return { tracks, albums }
}

const findNewAlbums = ($) => {
  const widgets = $('.widget').get()
  const albumWidgets = widgets.filter(el => $('.widget-title', el).text().trim().toLowerCase() === 'latest albums')
  if (!albumWidgets.length) return []
  const albumWidget = albumWidgets[0]
  const items = $('.widget-content a', albumWidget).map((n, el) => {
    const link = `${URL}${fixSlashes($(el).attr('href'))}`
    const $img = $('img', el)
    const image = `${URL}${fixSlashes(enlargeImage($img.attr('src')))}`
    const fullTitle = $img.attr('title')
    const { title, date } = getDate(fullTitle)

    return {
      title,
      id: slugify(title),
      pubDate: date,
      image,
      link
    }
  }).get()

  return items
}

const getDate = (fullTitle) => {
  const match = fullTitle.match(dateTitle)
  if (match && match[0] && match[1]) {
    return { date: new Date(match[2]), title: match[1] }
  }
  return { date: null, title: null }
}

const enlargeImage = (imageURL) => (
  imageURL.replace('/thumbs/250', '/thumbs/500')
)

const enlargeGameThumb = (imageURL) => (
  imageURL.replace('/thumbs/150', '/thumbs/500')
)

const fixSlashes = (url) => {
  const lead = url[0] === '/' ? '/' : ''
  const trail = url[url.length - 1] === '/' ? '/' : ''
  const singled = url.split('/').filter(n => n !== '').join('/')

  return `${lead}${singled}${trail}`
}

const findNewTracks = ($) => (
  $('.jukebox-items > li').map((n, el) => {
    const $dateDiv = $('> div:nth-child(1)', el)
    const year = $('.featured', $dateDiv).text().trim()
    $('.featured', $dateDiv).remove()
    const day = $dateDiv.text().trim()
    const pubDate = new Date(`${day} ${year}`)

    const $remixNode = $('a.jukebox-link.remix', el)
    const image = `${URL}${fixSlashes(enlargeGameThumb($('img', $remixNode).attr('src')))}`
    const href = $remixNode.attr('href')
    const link = `${URL}${fixSlashes(href)}`

    const $gameNode = $('.color-bodytext.single-line-item a', el)
    const gameName = $gameNode.text().trim()
    const gameLink = `${URL}${$gameNode.attr('href')}`

    const title = $('.featured.single-line-item a', el).text().trim()

    const $artistNode = $('.color-additional.single-line-item a', el)
    const artistName = $artistNode.text().trim()
    const artistLink = `${URL}${$artistNode.attr('href')}`

    return {
      title,
      id: slugify(href),
      image,
      link,
      pubDate,
      game: {
        gameName,
        gameLink
      },
      artist: {
        artistName,
        artistLink
      }
    }
  }).get()
)
