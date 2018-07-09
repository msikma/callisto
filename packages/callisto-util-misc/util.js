/**
 * Callisto - callisto-util-misc <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import util from 'util'
import { isNil, omit, omitBy } from 'lodash'

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
 * Removes null and undefined from objects.
 * Useful for cleaning up objects before printing/inspecting them.
 */
export const removeNil = (obj) => (
  omitBy(obj, isNil)
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
