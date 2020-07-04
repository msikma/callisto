// Callisto - callisto-task-mandarake <https://github.com/msikma/callisto>
// © MIT license

const { searchMain, searchAuctions } = require('mdrscr')

/**
 * Searches Mandarake shop products.
 */
const runShopSearch = async (details, language) => {
  const results = await searchMain(details, language)
  const items = results.entries.map(e => ({ ...e, id: e.itemNo.join('_') }))
  return {
    success: true,
    items,
    meta: {
      details: results.searchDetails,
      language: results.lang,
      url: results.url
    }
  }
}

/**
 * Searches Mandarake auctions.
 */
const runAuctionSearch = async (details) => {
  const results = await searchAuctions(details)
  const items = results.entries.map(e => ({ ...e, id: e.itemNo }))
  return {
    success: true,
    items,
    meta: {
      details: results.searchDetails,
      language: results.lang,
      url: results.url
    }
  }
}

module.exports = {
  runShopSearch,
  runAuctionSearch
}
