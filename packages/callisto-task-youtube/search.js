/**
 * Callisto - callisto-task-youtube <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { cacheItems, removeCached } from 'callisto-util-cache'
import { rssParse } from 'callisto-util-misc'
import { id } from './index'

export const findNewVideos = async (url, slug) => {
  const items = await rssParse(url)
  if (items.length === 0) return []

  // Caching ID specific to this account.
  const accountCacheID = `${id}$${slug}`

  // Copy 'guid' to 'id' for caching.
  const allItems = items.map(entry => ({ ...entry, id: entry.guid }))
  const newItems = await removeCached(accountCacheID, allItems)

  // Add the remaining items to the database.
  cacheItems(accountCacheID, newItems)

  // Now we can send these results to the channel.
  return newItems
}
