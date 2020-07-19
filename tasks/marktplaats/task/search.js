// Callisto - callisto-task-marktplaats <https://github.com/msikma/callisto>
// © MIT license

const { listingSearch } = require('marktplaats-js')

/**
 * Searches Marktplaats sales.
 */
const runMarktplaatsSearch = async (keyword, category) => {
  const search = await listingSearch({ query: keyword, categoryID: String(category) })
  const items = search.data ? search.data.listings.map(item => ({ ...item, id: `marktplaats$${item.itemId}`})) : []
  return {
    success: true,
    items,
    meta: {
      params: search.reqParams,
      url: search.reqURL
    }
  }
}

module.exports = {
  runMarktplaatsSearch
}
