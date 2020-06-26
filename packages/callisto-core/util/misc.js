// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { isNil, omit, omitBy, merge } = require('lodash')

/**
 * Merges in the defaults if they exist.
 */
const addDefaults = (itemData, taskConfig) => {
  if (taskConfig.defaults) {
    return merge(taskConfig.defaults, itemData)
  }
  return itemData
}

/**
 * Removes null and undefined from objects.
 * Useful for cleaning up objects before printing/inspecting them.
 */
const removeNil = (obj) => (
  omitBy(obj, isNil)
)

/**
 * Ensure that an object is wrapped in an array.
 * Returns the object verbatim if it's an array, or returns the object inside a 1-length array.
 */
const wrapArray = obj => (
  Array.isArray(obj) ? obj : [obj]
)

/**
 * Remove the values from an object that are the same in another object.
 * Useful for removing the default values from a configuration object that extended the defaults.
 */
const removeDefaults = (details, defaults) => (
  omit(details, Object.keys(details).filter(n => details[n] === defaults[n]))
)

module.exports = {
  addDefaults,
  removeNil,
  wrapArray,
  removeDefaults
}
