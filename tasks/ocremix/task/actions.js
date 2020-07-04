// Callisto - callisto-task-ocremix <https://github.com/msikma/callisto>
// © MIT license

const { filterOutCachedItems, cacheItems } = require('callisto-core/lib/cache')

const { formatMessage } = require('./format')
const { runScrapeOperation } = require('./search')

const findLatestItems = async (type, taskConfig, { logger, postMessage }) => {
  const { target } = taskConfig[type]

  const searchResult = await runScrapeOperation(type)
  const newItems = await filterOutCachedItems(`ocremix$${type}`, searchResult.items)
  await cacheItems(`ocremix$${type}`, newItems)
  for (const item of newItems) {
    postMessage(formatMessage(item, type), target)
  }
  logger.logDebug([`Fetched latest ${type} from OCReMix`, null, { results: searchResult.items.length, newItems: newItems.length }])
}

/**
 * Finds the latest soundtrack releases on VGMPF and posts them.
 */
const findLatestTracks = async (taskConfig, taskServices) => {
  return findLatestItems('tracks', taskConfig, taskServices)
}

/**
 * Finds the latest soundtrack releases on VGMPF and posts them.
 */
const findLatestAlbums = async (taskConfig, taskServices) => {
  return findLatestItems('albums', taskConfig, taskServices)
}

module.exports = {
  findLatestTracks,
  findLatestAlbums
}
