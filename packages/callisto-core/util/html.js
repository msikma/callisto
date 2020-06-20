// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { htmlToMarkdown, isHTML, getImagesFromHTML } = require('dada-cli-tools/util/html')

/**
 * Finds a tag with a specific content.
 */
const findTagContent = ($, tag, contentHint) => {
  return $(tag)
    .filter((_, el) => ~$(el).html().indexOf(contentHint))
    .map((_, el) => $(el).html())
    .get()[0]
}

module.exports = {
  htmlToMarkdown,
  findTagContent,
  getImagesFromHTML,
  isHTML
}
