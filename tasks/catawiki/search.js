/**
 * Calypso - calypso-task-catawiki <https://github.com/msikma/calypso>
 * © MIT license
 */

import { listingSearch } from 'catawiki-js'
import { cacheItems, removeCached, addTaskID } from 'calypso-cache'
import { id } from './index'

export const runCatawikiSearch = async ({ keyword, category, countryCode }) => {
  const search = await listingSearch({ query: keyword, categoryID: String(category), countryCode })
  const meta = { url: search.reqURL, params: search.reqParams, itemCount: search.data.length }
  const items = addTaskID(id, search.data)

  const itemsNew = await removeCached(id, items)
  cacheItems(id, itemsNew)

  return { items: itemsNew, meta }
}
