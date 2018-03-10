/**
 * Callisto - callisto-task-nyaa <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { cacheItems, removeCached } from 'callisto-util-cache'
import { rssParse } from 'callisto-util-misc'
import { id } from './index'

export const runNyaaSearch = async (url) => {
  const items = await rssParse(url)

  if (items.length === 0) return []

  // Copy 'guid' to 'id' for caching.
  const allItems = items.map(entry => ({ ...entry, id: entry.guid }))
  const newItems = await removeCached(id, allItems)

  // Add the remaining items to the database.
  cacheItems(id, newItems)

  // Now we can send these results to the channel.
  return newItems
}
