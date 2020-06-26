// Callisto - callisto-task-mandarake <https://github.com/msikma/callisto>
// © MIT license

const { addDefaults } = require('callisto-core/util/misc')
const { filterOutCachedItems, cacheItems } = require('callisto-core/lib/cache')

const { formatMessageMain, formatMessageAuction } = require('./format')
const { runShopSearch, runAuctionSearch } = require('./search')

/**
 * Finds the latest soundtrack releases on VGMPF and posts them.
 */
const findProducts = async (searchConfig, { taskConfig, logger, postMessage }) => {
  const searchData = addDefaults(searchConfig, taskConfig.main)
  const { details, target, language } = searchData

  const searchResult = await runShopSearch(details, language)
  const newItems = await filterOutCachedItems('mandarake$products', searchResult.items)
  await cacheItems('mandarake$products', newItems)
  for (const item of newItems) {
    postMessage(formatMessageMain(item, searchResult.meta.details), target)
  }
  logger.logDebug(['Searched Mandarake for new products', null, {
    keyword: searchResult.meta.details.keyword,
    results: searchResult.items.length,
    newItems: newItems.length
  }])
}

const findAuctions = async (searchConfig, { taskConfig, logger, postMessage }) => {
  const searchData = addDefaults(searchConfig, taskConfig.main)
  const { details, target } = searchData

  const searchResult = await runAuctionSearch(details)
  const newItems = await filterOutCachedItems('mandarake$auctions', searchResult.items)
  await cacheItems('mandarake$auctions', newItems)
  for (const item of newItems) {
    postMessage(formatMessageAuction(item, searchResult.meta.details), target)
  }
  logger.logDebug(['Searched Mandarake for new auctions', null, {
    keyword: searchResult.meta.details.keyword,
    results: searchResult.items.length,
    newItems: newItems.length
  }])
}

module.exports = {
  findProducts,
  findAuctions
}
