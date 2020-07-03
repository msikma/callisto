// Callisto - callisto-task-marktplaats <https://github.com/msikma/callisto>
// © MIT license

const { addDefaults } = require('callisto-core/util/misc')
const { filterOutCachedItems, cacheItems } = require('callisto-core/lib/cache')
const { wait } = require('callisto-core/util/promises')
const { combineArrays } = require('callisto-core/util/misc')

const { formatMessage } = require('./format')
const { runMarktplaatsSearch } = require('./search')

/** Whether to post 'topadvertentie' items. */
const POST_TOPADVERTENTIE = true

/**
 * Searches Marktplaats for new sales.
 */
const findSales = async (searchConfig, { taskConfig, logger, postMessage }) => {
  const searchData = addDefaults(searchConfig, taskConfig)
  const { details, target } = searchData
  const { keywords, categories } = details

  const allItems = []
  const searches = combineArrays(keywords, categories)
  for (const [keyword, category] of searches) {
    const searchResult = await runMarktplaatsSearch(keyword, category)
    const newItems = await filterOutCachedItems('marktplaats', searchResult.items)
    await cacheItems('marktplaats', newItems)
    await wait(1000)
    allItems.push(...newItems.map(data => ({ data, meta: searchResult.meta })))
    logger.logDebug(['Searched Marktplaats', null, { keyword, category, results: searchResult.items.length, newItems: newItems.length }])
  }

  let skippedItems = 0
  for (const item of allItems) {
    // Skip 'topadvertentie' items if we don't want them.
    if (item.data.priorityProduct === 'TOPADVERTENTIE' && !POST_TOPADVERTENTIE) {
      skippedItems += 1
      continue
    }
    postMessage(formatMessage(item.data, item.meta), target)
  }
  logger.logDebug([`Skipped ${skippedItems} ${skippedItems === 1 ? 'item' : 'items'}`])
}

module.exports = {
  findSales
}
