/**
 * Callisto - callisto-task-horriblesubs <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { cacheItems, removeCached } from 'callisto-util-cache'
import { rssParse } from 'callisto-util-misc'
import { id } from './index'

export const runHorribleSubsSearch = async (url, searchDetails) => {
  const items = await rssParse(url)
  const queryRe = new RegExp(searchDetails.query, 'i')

  if (items.length === 0) return []

  // Since the RSS feed contains everything on the site, we have to manually filter for our search query.
  const matchingItems = items.filter(item => queryRe.test(item.title))

  // Copy 'guid' to 'id' for caching.
  const allItems = matchingItems.map(entry => ({ ...entry, id: entry.guid }))
  const newItems = await removeCached(id, allItems)

  // Add the remaining items to the database.
  cacheItems(id, newItems)

  // Now we can send these results to the channel.
  return newItems
}
