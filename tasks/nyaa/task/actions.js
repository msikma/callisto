// Callisto - callisto-task-nyaa <https://github.com/msikma/callisto>
// © MIT license

const { addDefaults } = require('callisto-core/util/misc')
const { filterOutCachedItems, cacheItems } = require('callisto-core/lib/cache')

const { formatMessage } = require('./format')
const { findSearchTorrents, addDetailedInformation } = require('./search')

/**
 * Runs a search query on Nyaa.si and reports on new torrents.
 * 
 * Task data example:
 * 
 *   { searchCategory: 'CAISCBABGAIgAXAB',
 *     searchQuery: '前面展望',
 *     thumbnail: 'url',
 *     target: [[SERVER, CHANNEL]] }
 */
const runSearchTask = async (taskDataRaw, { taskConfig, logger, postMessage }) => {
  const taskData = addDefaults(taskDataRaw, taskConfig)
  const { searchQuery, searchCategory, thumbnail, target } = taskData

  const searchResult = await findSearchTorrents({ searchQuery, searchCategory })
  let newItems = await filterOutCachedItems('nyaa', searchResult.items)
  newItems = await addDetailedInformation(newItems)
  await cacheItems('nyaa', newItems)

  for (const item of newItems) {
    const newMessage = formatMessage(item, { searchQuery, searchCategory, thumbnail })
    postMessage(newMessage, target)
  }
  logger.logDebug(['Ran Nyaa.si search', null, { searchQuery, searchCategory, results: searchResult.items.length, newItems: newItems.length }])
}

module.exports = {
  runSearchTask
}
