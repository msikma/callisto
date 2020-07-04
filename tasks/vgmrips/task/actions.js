// Callisto - callisto-task-vgmrips <https://github.com/msikma/callisto>
// © MIT license

const { filterOutCachedItems, cacheItems } = require('callisto-core/lib/cache')

const { formatMessage } = require('./format')
const { reqLatestAdditions } = require('./search')

/**
 * Finds the latest releases on VGMRips and posts about them.
 */
const findLatestAdditions = async (taskConfig, { logger, postMessage }) => {
  const { target } = taskConfig

  const searchResult = await reqLatestAdditions(logger)
  const newItems = await filterOutCachedItems('vgmrips', searchResult.items)
  await cacheItems('vgmrips', newItems)

  for (const item of newItems) {
    postMessage(formatMessage(item), target)
  }
  logger.logDebug(['Fetched VGMRips latest additions', null, { results: searchResult.items.length, newItems: newItems.length }])
}

module.exports = {
  findLatestAdditions
}
