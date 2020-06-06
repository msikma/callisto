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

/**
 * Returns image URLs from an HTML string.
 */
const getImagesFromHTML = (html) => {
  const $ = cheerio.load(`<div id="callisto-wrapper">${html}</div>`)
  const $html = $('#calypso-wrapper')
  return $html.find('img').get().map(i => $(i).attr('src'))
}

/**
 * Returns whether a string is likely HTML or not.
 */
const isHTML = (string) => {
  const items = [
    string.indexOf('<p>') > 0,
    string.indexOf('<strong>') > 0,
    string.indexOf('<img') > 0,
    string.indexOf('<br /') > 0,
    string.indexOf('<br/') > 0,
    string.indexOf('<br>') > 0,
    string.indexOf('href="') > 0
  ]
  return items.indexOf(true) > -1
}

module.exports = {
  findTagContent,
  getImagesFromHTML,
  isHTML
}
