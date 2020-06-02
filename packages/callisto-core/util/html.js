// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const cheerio = require('cheerio')

/**
 * Finds a tag with a specific content.
 */
const findTagContent = ($, tag, contentHint) => {
  return $(tag)
    .filter((n, el) => ~$(el).html().indexOf(contentHint))
    .map((n, el) => $(el).html())
    .get()[0]
}

module.exports = {
  findTagContent
}
