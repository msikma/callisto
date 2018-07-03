/**
 * Callisto - callisto-task-bandcamp <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { fetchPage, fetchAlbumExtendedInfo } from 'bandcampscr'
import { cacheItems, removeCached } from 'callisto-util-cache'
import logger from 'callisto-util-logging'
import { wait, getIntegerTimestamp } from 'callisto-util-misc'
import { id } from './index'

export const runBandcampSearch = async (details) => {
  const search = await fetchPage(details.search)
  if (search.albums.length === 0) return { newItems: [], search }

  const allItems = search.albums
    // Make entries ready for easy consumption.
    .map(album => ({
      ...album,
      type: 'album',
      band: search.band,
      baseURL: search.url,
      id: String(album.id),
      timestamp: getIntegerTimestamp(album.release_date)
    }))
    // Sort so the oldest entries go first.
    .sort((a, b) => a.timestamp >= b.timestamp ? 1 : -1)

  // Remove entries we already posted.
  const newItems = await removeCached(id, allItems)

  // Retrieve additional information for the items we have.
  const newItemsWithInfo = await Promise.all(newItems.map(async (item, n) => {
    await wait(n * 5000)
    logger.debug(`bandcamp: Retrieving detailed information for item: ${item.page_url} (wait: ${n * 5000})`)
    const detailedInfo = await fetchAlbumExtendedInfo(item)
    return {
      ...item,
      detailedInfo
    }
  }))

  // Add the remaining items to the database.
  cacheItems(id, newItemsWithInfo)

  // Now we can send these results to the channel.
  return { newItems: newItemsWithInfo, search }
}
