/**
 * Calypso - calypso-misc <https://github.com/msikma/calypso>
 * © MIT license
 */

const { limitString, limitStringSentence } = require('dada-cli-tools/util/text')

/** Limits a description to a reasonable length per-sentence. */
const limitDescription = limitStringSentence(700)

/** Limits title and description so they fit in a RichEmbed. */
const embedTitle = limitString(250) // Really 256, but with some buffer built in.
const embedDescription = limitString(2000) // Really 2048.

module.exports = {
  limitDescription,
  embedTitle,
  embedDescription
}
