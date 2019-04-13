/**
 * Calypso - calypso-misc <https://github.com/msikma/calypso>
 * © MIT license
 */

import util from 'util'
import { isNil, omit, omitBy, isArray } from 'lodash'

/**
 * Returns a string representing an object (or array).
 * This is a better way to print objects than JSON.stringify().
 */
export const objectInspect = (obj, noNil = false) => (
  util.inspect(noNil ? removeNil(obj) : obj, { showHidden: false, depth: 6 })
)

/**
 * Wraps a string in Markdown JS code blocks.
 * Useful for posting the contents of an objectInspect() to Discord.
 */
export const wrapInJSCode = (str) => (
  `\`\`\`js\n${str}\n\`\`\``
)

/**
 * Wraps a string in a preformatted text block.
 */
export const wrapInPre = (str) => (
  `\`\`\`\n${str}\n\`\`\``
)

/**
 * Wraps a string in a monospace block (without linebreak).
 */
export const wrapInMono = (str) => (
  `\`${str}\``
)

/**
 * Removes null and undefined from objects.
 * Useful for cleaning up objects before printing/inspecting them.
 */
export const removeNil = (obj) => (
  omitBy(obj, isNil)
)

/**
 * Ensure that an object is wrapped in an array.
 * Returns the object verbatim if it's an array, or returns the object inside a 1-length array.
 */
export const wrapArray = obj => (
  isArray(obj) ? obj : [obj]
)

/**
 * Remove the values from an object that are the same in another object.
 * Useful for removing the default values from a configuration object that extended the defaults.
 */
export const removeDefaults = (details, defaults) => (
  omit(details, Object.keys(details).filter(n => details[n] === defaults[n]))
)

/**
 * Promisified version of setInterval() for use with await.
 * Use like: await wait(1000) to halt execution 1 second.
 */
export const wait = (ms) => (
  new Promise((resolve) => (
    setInterval(() => resolve(), ms)
  ))
)

// Simple Promisified version of fs.readFile().
export const readFile = (file) => new Promise((resolve, reject) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) return reject(err)
    return resolve(data)
  })
})

// Simple Promisified version of fs.writeFile().
export const writeFile = (file, data) => new Promise((resolve, reject) => {
  fs.writeFile(file, data, (err, data) => {
    if (err) return reject(err)
    return resolve(data)
  })
})
