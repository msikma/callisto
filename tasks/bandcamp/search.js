/**
 * Calypso - calypso-task-bandcamp <https://github.com/msikma/calypso>
 * © MIT license
 */

import { fetchPage, fetchAlbumExtendedInfo } from 'bandcampscr'
import { cacheItems, removeCached } from 'calypso-cache'
import { getTaskLogger } from 'calypso-core/logging'
import { wait, getIntegerTimestamp } from 'calypso-misc'
import { id } from './index'

export const runBandcampSearch = async (details) => {
  const taskLogger = getTaskLogger(id)
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
  let item, detailedInfo
  for (let a = 0; a < newItems.length; ++a) {
    await wait(5000)

    item = newItems[a]
    taskLogger.debug(details.search, `Retrieving detailed information for item: ${item.page_url}`)
    detailedInfo = await fetchAlbumExtendedInfo(item)
    newItems[a] = {
      ...newItems[a],
      detailedInfo
    }
  }

  // Add the remaining items to the database.
  cacheItems(id, newItems)

  // Now we can send these results to the channel.
  return { newItems: newItems, search }
}
