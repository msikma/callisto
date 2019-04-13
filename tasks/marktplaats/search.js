/**
 * Calypso - calypso-task-mandarake <https://github.com/msikma/calypso>
 * © MIT license
 */

import { listingDetail, listingSearch } from 'marktplaats-js'
import { cacheItems, removeCached } from 'calypso-cache'
import { id } from './index'

export const runMarktplaatsSearch = async ({ keyword, category }) => {
  const search = await listingSearch({ query: keyword, categoryID: String(category) })
  const meta = { url: search.reqURL, entryCount: search.data.length }
  if (meta.entryCount === 0) return { newItems: [], search: meta }

  const results = search.data
    .map(e => ({ ...e, id: `${id}$${e.id}`}));
  const newItems = await removeCached(id, results)

  // Add the remaining items to the database.
  cacheItems(id, newItems)

  // Now we can send these results to the channel.
  return { newItems, search: meta }
}
