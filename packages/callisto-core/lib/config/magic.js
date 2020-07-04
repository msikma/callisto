// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { isObject, isArray, isString } = require('lodash')

/**
 * Replaces <%base%>, <%config%> and <%cache%> strings from the configuration file
 * with their proper values. Iterates through the whole config file
 * and changes every string that applies.
 */
const replaceMagic = (obj, baseStr, configStr, cacheStr) => {
  // Note: isArray() must come first...because isObject() returns true for both arrays and objects.
  if (isArray(obj)) {
    return obj.map(o => replaceMagic(o, baseStr, configStr, cacheStr))
  }
  if (isObject(obj)) {
    return Object.keys(obj)
      .reduce((newObj, key) => ({ ...newObj, [key]: replaceMagic(obj[key], baseStr, configStr, cacheStr) }), {})
  }
  if (isString(obj)) {
    return replaceMagicString(obj, baseStr, configStr, cacheStr)
  }
  // Return anything else - probably a number.
  return obj
}

/**
 * Handles string replacement for replaceMagic().
 * 
 * Matches <%base%>, <%config%> and <%cache%> magic strings:
 * 
 *   - base    e.g. /usr/local/lib/node_modules/callisto (bot program files)
 *   - config  e.g. ~/.config/callisto
 *   - cache   e.g. ~/.cache/callisto
 */
const replaceMagicString = (str, baseStr, configStr, cacheStr) => (
  str
    .replace(/<%base%>/g, baseStr)
    .replace(/<%config%>/g, configStr)
    .replace(/<%cache%>/g, cacheStr)
)

module.exports = {
  replaceMagic
}
