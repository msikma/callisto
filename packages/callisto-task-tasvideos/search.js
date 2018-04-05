/**
 * Callisto - callisto-task-tasvideos <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { get } from 'lodash'
import cheerio from 'cheerio'

import { cacheItems, removeCached } from 'callisto-util-cache'
import { rssParse } from 'callisto-util-misc'
import { id } from './index'

const titleRe = new RegExp('\\[([0-9]+)\\] (.+?) (.+?) by (.+?) in (.+?) (.+?)$')

const searchURL = (type) => (
  `http://tasvideos.org/${type}.rss`
)

export const findNewTASes = async (type) => {
  const url = searchURL(type)
  const searchCacheID = `${id}$${type}`

  const items = (await rssParse(url)).map(sanitizeData)
  if (items.length === 0) return []
  const newItems = await removeCached(searchCacheID, items)
  cacheItems(searchCacheID, newItems)
  return newItems
}

const getTitleInfo = (title) => {
  const info = title.match(titleRe)
  if (!info) return null
  return {
    id: info[1],
    console: info[2],
    game: info[3],
    author: info[4],
    duration: info[5],
    publisher: info[6]
  }
}

const removeGenres = (categories) => (
  categories.filter(c => !c.startsWith('Genre:'))
)

const filterDescription = (html) => (
  cheerio.load(html).text()
)

const sanitizeData = (item) => {
  const youtubeLink = get(item, 'media:group.media:player.@.url')
  const titleInfo = getTitleInfo(item.title)
  return {
    id: item.guid,
    titleOriginal: item.title,
    title: `${titleInfo.console} ${titleInfo.game} by ${titleInfo.author} in ${titleInfo.duration}`,
    image: item.image.url,
    comments: item.comments,
    date: item.date,
    description: filterDescription(item.description),
    categories: item.categories,
    categoriesWithoutGenre: removeGenres(item.categories),
    youtubeLink,
    link: item.link
  }
}
