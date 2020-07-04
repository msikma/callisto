// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const util = require('util')

/**
 * Returns a string representing an object (or array).
 * This is a better way to print objects than JSON.stringify().
 */
const objectInspect = (obj, noNil = false) => (
  util.inspect(noNil ? removeNil(obj) : obj, { showHidden: false, depth: 6 })
)

/**
 * Wraps an object in a printable Markdown code block.
 */
const wrapObject = (obj) => (
  wrapInJSCode(objectInspect(obj))
)

/**
 * Wraps a string in Markdown JS code blocks.
 * Useful for posting the contents of an objectInspect() to Discord.
 */
const wrapInJSCode = (str) => (
  `\`\`\`js\n${str}\n\`\`\``
)

/**
 * Wraps an error stack.
 */
const wrapStack = (stack) => (
  `\`\`\`\n${stack}\n\`\`\``
)

/**
 * Wraps a string in a preformatted text block.
 */
const wrapInPre = (str) => (
  `\`\`\`\n${str}\n\`\`\``
)

/**
 * Wraps a string in a monospace block (without linebreak).
 */
const wrapInMono = (str) => (
  `\`${str}\``
)

module.exports = {
  objectInspect,
  wrapObject,
  wrapInJSCode,
  wrapStack,
  wrapInPre,
  wrapInMono
}
