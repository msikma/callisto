// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const { basename } = require('path')
const { taskLogger } = require('callisto-logging')
const { isTempError } = require('callisto-request')
const { postRichItems } = require('callisto-core')
const { addDefaults, wrapStack } = require('callisto-util')

const { findSubVideos, findSearchVideos } = require('./search')
const { readSubFile } = require('./util')
const { taskInfo } = require('../index')

const log = taskLogger(taskInfo)

/*
TODO: MOVE TO CORE

const postRichItems = (items, formatter) => {
  items.forEach(item => item.target.forEach(target => postRichEmbed(target[0], target[1], null, formatter(item))))
}
*/

/** Runs a search query on Youtube and reports on new videos. */
const runSearchTask = async (taskData, taskConfig) => {
  const { slug, searchParameters, searchQuery, target } = addDefaults(taskData, taskConfig)
  // TODO
  findSearchVideos
}

/** Checks a list of accounts from a subscriptions file for new videos. */
const runSubTask = async (taskData, taskConfig) => {
  // Extract data from subscriptions.
  const { slug, subscriptions, target } = addDefaults(taskData, taskConfig)
  const subList = await readSubFile(subscriptions, slug)
  const subBase = basename(subscriptions)
  log.debug(`${slug}`, `Iterating through ${subList.length} subscription${subList.length === 1 ? '' : 's'}`)

  const updates = []

  for (const sub of subList) {
    const { title, xmlUrl } = sub
    try {
      const results = await findSubVideos(xmlUrl, slug)
      if (results.length) {
        log.silly(`${subBase} - Channel: ${title}`, `Found ${results.length} new result${results.length === 1 ? '' : 's'}`)
        updates.push({ target, results, subscriptions })
      }
    }
    catch (err) {
      if (isTempError(err)) continue
      log.error('An error occurred while scraping subscription videos', wrapStack(err.stack), [['File', subBase], ['Channel', title]])
    }
  }

  // Post all updates we've gathered.
  if (updates.length) {
    log.debug(`${slug}`, `Posting ${results.length} new item${results.length === 1 ? '' : 's'}`)
    postRichItems(updates, formatMessage)
    updates.forEach(update =>
      update.target.forEach(t => reportResults(t[0], t[1], update.results, update.subscriptionsFile))
    )
  }
}

module.exports = {
  runSearchTask,
  runSubTask
}
