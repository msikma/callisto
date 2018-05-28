/**
 * Callisto - callisto-task-reddit <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import findTopics from 'reddit-rss-scrape'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { id } from './index'

export const findNewTopics = async (sub, type) => {
  const results = await findTopics(sub, type)
  // Throw error if we received one.
  if (results.error) throw results.error
  if (results.items.length === 0) return results

  // Caching ID specific to this subreddit.
  const accountCacheID = `${id}$${sub}`
  const newItems = await removeCached(accountCacheID, results.items)

  // Add the remaining items to the database.
  cacheItems(accountCacheID, newItems)

  // Now we can send these results to the channel.
  return { ...results, items: newItems }
}
