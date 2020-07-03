// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { isNil, omit, omitBy, merge, cloneDeep } = require('lodash')

/**
 * Merges in the defaults if they exist. Returns a new object with final task data.
 */
const addDefaults = (itemData, taskConfig) => {
  const itemClone = cloneDeep(itemData)
  if (taskConfig.defaults) {
    return merge(cloneDeep(taskConfig.defaults), itemClone)
  }
  return itemClone
}

/**
 * Turns an array into an object of keys all set to true.
 */
const toKeys = arr => arr.reduce((all, item) => ({ ...all, [item]: true }), {})

/**
 * Returns all permutations of two arrays of strings (or objects castable to string).
 * 
 * E.g. ['a', 'b', 'c'], ['1', '2', '3'] returns:
 * [['a', '1'], ['a', '2'], ['a', '3'], ['b', '1'], ['b', '2'], ['b', '3'], ['c', '1'], ['c', '2'], ['c', '3']].
 */
const combineArrays = (arrA, arrB) => (
  arrA.reduce((allA, itemA) => [...allA, ...arrB.reduce((allB, itemB) => [...allB, [itemA, itemB]], [])], [])
)

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
  combineArrays,
  wrapArray,
  toKeys,
  removeDefaults
}
