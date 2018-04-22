/**
 * Callisto - callisto-task-mandarake <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import mandarakeSearch, { mandarakeAuctionSearch } from 'mdrscr'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { id } from './index'

/**
 * Complete scraping script for Mandarake. This downloads the page, runs the scraping code,
 * then removes known items and adds the remainder to our cache.
 * The remainder is then sent back so it can be shown to the user.
 */
export const runMandarakeSearch = async (details, lang) => {
  const search = await mandarakeSearch(details, lang)

  if (search.entryCount === 0) return []

  // Add an 'id' string to the entries we've found so we can store them in the database.
  const allItems = search.entries.map(entry => ({ ...entry, id: entry.itemNo.join('$') }))
  const newItems = await removeCached(id, allItems)

  // Add the remaining items to the database.
  cacheItems(id, newItems)

  // Now we can send these results to the channel.
  return newItems
}

/**
 * Runs the scraping code for an auction search.
 */
export const runMandarakeAuctionSearch = async (details) => {
  const search = await mandarakeAuctionSearch(details)

  if (search.entryCount === 0) return []

  const allItems = search.entries.map(entry => ({ ...entry, id: entry.itemNo }))
  const newItems = await removeCached(id, allItems)

  // Add the remaining items to the database.
  cacheItems(id, newItems)

  // Now we can send these results to the channel.
  return newItems
}
