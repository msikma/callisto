// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { isPlainObject } = require('lodash')
const runtime = require('../../state')

/**
 * Returns a channel integer from a Discord API error path,
 * e.g. '/api/v7/channels/454275744751812608/'.
 */
const getChannelFromPath = path => {
  if (!path) return null
  const matches = path.match(/\/api\/v[0-9]+\/channels\/([0-9]+)\//i)
  if (matches && matches[1]) {
    return matches[1]
  }
}

/**
 * Returns information about the configuration file by a channel.
 */
const findChannelPath = channel => {
  const tasks = runtime.config.taskConfig

  // Iterate through every task and see if it contains a reference to the given channel.
  for (let [task, taskConfig] of Object.entries(tasks)) {
    const path = findChannel([task], taskConfig, channel)
    // If found, return it; otherwise continue.
    if (path) {
      return path
    }
  }
}

/**
 * Recursively digs through an object to find a specific channel ID.
 */
const findChannel = (path, obj, channel) => {
  let result
  if (isPlainObject(obj)) {
    for (let [key, value] of Object.entries(obj)) {
      result = findChannel([...path, key], value, channel)
    }
    if (result) return result
  }
  if (Array.isArray(obj)) {
    for (let a = 0; a < obj.length; ++a) {
      result = findChannel([...path, a], obj[a], channel)
    }
    if (result) return result
  }
  if (obj === channel) {
    return path
  }
}

module.exports = {
  getChannelFromPath,
  findChannelPath
}
