/**
 * Callisto - callisto-task-reddit <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { rssParse } from 'callisto-util-misc'
import { id } from './index'

export const findNewTopics = async (url, sub) => {
  const items = await rssParse(url)
  if (items.length === 0) return []

  // Caching ID specific to this subreddit.
  const accountCacheID = `${id}$${sub}`

  // Copy 'guid' to 'id' for caching, and add a non-HTML description limited to 350 characters.
  const allItems = items.map(entry => ({ ...entry, id: entry.guid, descriptionText: removeHTML(entry.description, 350) }))
  const newItems = await removeCached(accountCacheID, allItems)

  // Add the remaining items to the database.
  cacheItems(accountCacheID, newItems)

  // Now we can send these results to the channel.
  return newItems
}

const removeHTML = (str, limit=350) => {
  const $ = cheerio.load(str)
  const text = $('.md').text().trim()
  if (limit && text.length > limit) {
    return `${text.slice(0, limit)} [...]`
  }
  return text
}
