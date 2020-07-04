// Callisto - callisto-task-tasvideos <https://github.com/msikma/callisto>
// © MIT license

const { filterOutCachedItems, cacheItems } = require('callisto-core/lib/cache')

const { formatMessage } = require('./format')
const { reqLatestPublications, addSubmissionLinks } = require('./search')

/**
 * Finds the latest published movies on TASVideos.
 */
const findLatestPublications = async (taskConfig, { logger, postMessage }) => {
  const { target } = taskConfig

  const searchResult = await reqLatestPublications(logger)
  let newItems = await filterOutCachedItems('tasvideos', searchResult.items)
  newItems = await addSubmissionLinks(newItems)
  await cacheItems('tasvideos', newItems)

  for (const item of newItems) {
    postMessage(formatMessage(item), target)
  }
  logger.logDebug(['Fetched latest publications from TASVideos', null, { results: searchResult.items.length, newItems: newItems.length }])
}

module.exports = {
  findLatestPublications
}
