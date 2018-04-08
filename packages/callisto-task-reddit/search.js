/**
 * Callisto - callisto-task-reddit <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import findTopics from 'reddit-rss-scrape'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { rssParse } from 'callisto-util-misc'
import { id } from './index'

export const findNewTopics = async (sub) => {
  const items = await findTopics(sub)
  if (items.length === 0) return []

  // Caching ID specific to this subreddit.
  const accountCacheID = `${id}$${sub}`
  const newItems = await removeCached(accountCacheID, items)

  // Add the remaining items to the database.
  cacheItems(accountCacheID, newItems)

  // Now we can send these results to the channel.
  return newItems
}
