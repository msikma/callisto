// Callisto - callisto-task-buyee <https://github.com/msikma/callisto>
// © MIT license

const { addDefaults } = require('callisto-core/util/misc')
const { filterOutCachedItems, cacheItems } = require('callisto-core/lib/cache')

const { formatMessage } = require('./format')
const { runProductSearch } = require('./search')

/**
 * Searches Buyee for new products for sale.
 */
const findProducts = async (searchConfig, { taskConfig, logger, postMessage, postTextMessage }) => {
  const searchData = addDefaults(searchConfig, taskConfig)
  const { details, target, alert } = searchData

  const searchResult = await runProductSearch(details)
  const newItems = await filterOutCachedItems('buyee$products', searchResult.items)
  await cacheItems('buyee$products', newItems)

  for (const item of newItems) {
    postMessage(formatMessage(item, searchResult.meta.details), target)
    if (alert) {
      postTextMessage('@here', target)
    }
  }
  logger.logDebug(['Searched Buyee for new products', null, {
    keyword: details.keyword,
    category: details.category,
    newItems: newItems.length
  }])
}

module.exports = {
  findProducts
}
