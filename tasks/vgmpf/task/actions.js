// Callisto - callisto-task-vgmpf <https://github.com/msikma/callisto>
// © MIT license

const { filterOutCachedItems, cacheItems } = require('callisto-core/lib/cache')

const { formatMessage } = require('./format')
const { reqLatestSoundtracks, addAdditionalData } = require('./search')

/**
 * Finds the latest soundtrack releases on VGMPF and posts them.
 */
const findLatestSoundtracks = async (taskConfig, { logger, postMessage }) => {
  const { target } = taskConfig

  const searchResult = await reqLatestSoundtracks(logger)
  let newItems = await filterOutCachedItems('vgmpf', searchResult.items)
  newItems = await addAdditionalData(newItems)
  await cacheItems('vgmpf', newItems)

  for (const item of newItems) {
    postMessage(formatMessage(item), target)
  }
  logger.logDebug(['Fetched latest soundtracks from VGMPF', null, { results: searchResult.items.length, newItems: newItems.length }])
}

module.exports = {
  findLatestSoundtracks
}
