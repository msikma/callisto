// Callisto - callisto-task-buyee <https://github.com/msikma/callisto>
// © MIT license

const { YahooAuction } = require('buyee-js')

/**
 * Searches Buyee shop products.
 */
const runProductSearch = async (details) => {
  const ya = new YahooAuction()
  const results = await ya.search({ query: details.keyword, category: details.category })
  return {
    success: true,
    items: results,
    meta: {
      details
    }
  }
}

module.exports = {
  runProductSearch
}
