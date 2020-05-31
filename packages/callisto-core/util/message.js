// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { limitStringParagraph, limitString } = require('dada-cli-tools/util/text')

/**
 * Reduces the length of a description. Most Youtube descriptions are gigantic.
 * We try to reduce them to a specific paragraph.
 */
const shortenDescription = limitStringParagraph(400)

/**
 * Reduces the length of a title.
 */
const shortenTitle = limitString(255)

module.exports = {
  shortenTitle,
  shortenDescription
}
