// Callisto - callisto-task-horriblesubs <https://github.com/msikma/callisto>
// © MIT license

const { addDefaults } = require('callisto-core/util/misc')
const { filterOutCachedItems, cacheItems } = require('callisto-core/lib/cache')

const { formatMessage } = require('./format')
const { findSearchTorrents, addDetailedInformation } = require('./search')

/**
 * Runs a search query on HorribleSubs and reports on new torrents.
 * 
 * Task data example:
 * 
 *   { showName: 'one-piece',
 *     showCommunityWiki: 'https://onepiece.fandom.com',
 *     showLogo: 'https://i.imgur.com/nmSSWwF.png',
 *     target: [[SERVER, CHANNEL]] }
 */
const runSearchTask = async (taskDataRaw, { taskConfig, logger, postMessage }) => {
  const taskData = addDefaults(taskDataRaw, taskConfig)
  const { showName, showCommunityWiki, showLogo, target } = taskData

  const searchResult = await findSearchTorrents({ showName, showCommunityWiki })
  let newItems = await filterOutCachedItems('horriblesubs', searchResult.items)
  newItems = await addDetailedInformation(newItems, { showCommunityWiki })
  //await cacheItems('nyaa', newItems)
  
  for (const item of newItems) {
    const newMessage = formatMessage(item, { showName, showCommunityWiki, showLogo })
    postMessage(newMessage, target)
    break
  }

  logger.logDebug(['Ran HorribleSubs search', null, { showName, showCommunityWiki, results: searchResult.items.length, newItems: newItems.length }])
}

module.exports = {
  runSearchTask
}
