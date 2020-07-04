// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const { addDefaults } = require('callisto-core/util/misc')
const { filterOutCachedItems, cacheItems } = require('callisto-core/lib/cache')

const { formatMessage } = require('./format')
const { findSearchVideos, findSubscriptionVideos } = require('./search')

/**
 * Runs a search query on Youtube and reports on new videos.
 * 
 * Task data example:
 * 
 *   { slug: '1stpersontrains',
 *     searchParameters: 'CAISCBABGAIgAXAB',
 *     searchQuery: '前面展望',
 *     target: [[SERVER, CHANNEL]] }
 */
const runSearchTask = async (taskDataRaw, { taskConfig, logger, postMessage }) => {
  const taskData = addDefaults(taskDataRaw, taskConfig)
  const { slug, searchQuery, searchParameters, target } = taskData
  const searchResult = await findSearchVideos(slug, searchQuery, searchParameters)

  if (!searchResult.success) {
    logger.logErrorObj({ title: searchResult.errorType, details: { slug, searchQuery, searchParameters, url: searchResult.meta.url }, error: searchResult.error })
    return
  }
  
  const newItems = await filterOutCachedItems('youtube', searchResult.items)
  await cacheItems('youtube', newItems)
  for (const item of newItems) {
    const newMessage = formatMessage(item, { searchQuery, slug })
    postMessage(newMessage, target)
  }
  logger.logDebug(['Ran Youtube search', null, { slug, results: searchResult.items.length, newItems: newItems.length }])
}

/**
 * Checks a list of accounts from a subscriptions file for new videos.
 * 
 * Task data example:
 * 
 *   { subscriptions: '/Users/username/.config/callisto/youtube.xml',
 *     target: [[SERVER, CHANNEL]] }
 */
const runSubscriptionTask = async (taskDataRaw, { taskConfig, logger, postMessage }) => {
  const taskData = addDefaults(taskDataRaw, taskConfig)
  const { subscriptions, target } = taskData
  const subResult = await findSubscriptionVideos(subscriptions)

  if (!subResult.success) {
    logger.logErrorObj({ title: subResult.errorType, details: { subscriptions, subFile: subResult.meta.subFile }, error: subResult.error })
    return
  }

  const newItems = await filterOutCachedItems('youtube', subResult.items)
  await cacheItems('youtube', newItems)
  for (const item of newItems) {
    const newMessage = formatMessage(item, { subFile: subResult.meta.subFile })
    postMessage(newMessage, target)
  }
  logger.logDebug(['Checked Youtube subscription', null, { subFile: subResult.meta.subFile, results: subResult.items.length, newItems: newItems.length }])
}

module.exports = {
  runSearchTask,
  runSubscriptionTask
}
