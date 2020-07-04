// Callisto - callisto-task-feed <https://github.com/msikma/callisto>
// © MIT license

const { addDefaults } = require('callisto-core/util/misc')
const { filterOutCachedItems, cacheItems } = require('callisto-core/lib/cache')
const { slugify } = require('callisto-core/util/slug')

const { getFeedUpdates } = require('./syndicate')
const { formatMessage } = require('./format')

/**
 * Checks an RSS/Atom feed.
 * 
 * Task data example:
 * 
 *   { feedURL: 'http://example.com/feed.rss',
 *     feedName: 'Example feed',
 *     baseURL: 'http://example.com',
 *     target: [[SERVER, CHANNEL]],
 *     color: 0x000000,
 *     thumbnail: 'http://example.com/feed-icon.png' }
 */
const runFeedsTask = async (taskDataRaw, { taskConfig, logger, postMessage }) => {
  const taskData = addDefaults(taskDataRaw, taskConfig)
  const { feedURL, feedName, target, color, thumbnail, baseURL } = taskData
  const feedSlug = slugify(feedName)

  const searchResult = await getFeedUpdates({ feedURL, feedName, feedSlug, baseURL })
  const newItems = await filterOutCachedItems(`feed$${feedSlug}`, searchResult.items)
  await cacheItems(`feed$${feedSlug}`, newItems)
  
  for (const item of newItems) {
    postMessage(formatMessage(item, { feedName, feedURL, color, thumbnail }), target)
  }
  logger.logDebug(['Checked an RSS/Atom feed', null, { feedURL, feedName, results: searchResult.items.length, newItems: newItems.length }])
}

module.exports = {
  runFeedsTask
}
