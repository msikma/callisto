// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { isFunction } = require('lodash')
const { htmlToMarkdown, isHTML, getImagesFromHTML } = require('dada-cli-tools/util/html')

/**
 * Wrapper for htmlToMarkdown() with options for Discord.
*/
const htmlToMarkdownDiscord = (html, settings = {}, options = {}) => {
  return htmlToMarkdown(html, settings, { ...options, emDelimiter: '*', codeBlockStyle: 'fenced', bulletListMarker: '-' })
}

/**
 * Returns the abstract of a wiki article.
 * 
 * Takes a Cheerio object of the whole wiki page.
 * 
 * This takes out any <table> tags and searches until either the table of contents or a <h1> or <h2> tag is found,
 * and returns everything from up to that point.
 */
const getWikiArticleAbstract = (
  $,
  anchorsAbsoluteObj = null,
  naTag = ['table'],
  endTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  contentID = '#mw-content-text',
  contentObj = null
) => {
  const $content = contentObj ? contentObj : $(contentID)
  const items = $('> *', $content).get()
  const abstract = []
  for (const item of items) {
    const $item = $(item)
    if (~naTag.indexOf(item.name)) continue
    if (~endTag.indexOf(item.name) || $item.attr('id') === 'toc') break

    if (anchorsAbsoluteObj) {
      makeLinksAbsolute($, $item, anchorsAbsoluteObj)
    }
    abstract.push($.html($item).trim())
  }
  return abstract.join('\n')
}

/**
 * Returns the largest image from a 'srcset' (or 'src') attribute.
 * 
 * Must pass in an <img> tag. If no 'srcset' attribute is found, 'src' will be used instead.
 * Data is returned as: { url: String, size: Number }
 */
const getLargestImageSrcset = ($, img) => {
  const $img = $(img)
  let srcData = $img.attr('srcset')
  if (!srcData) {
    return { url: $img.attr('src'), size: 1 }
  }
  srcData = srcData.split(',')
    .map(n => n.trim())
    .map(n => {
      const split = n.split(/\s+/)
      const url = split.slice(0, -1)
      const sizeVal = split.slice(-1)[0]
      const size = Number(sizeVal.toLowerCase().slice(-1) === 'x' ? sizeVal.slice(0, -1) : sizeVal)
      return { url, size }
    })
    .filter(n => n.size > 0 && !isNaN(n.size))
    .sort((a, b) => a.size > b.size ? -1 : 1)
  
  return srcData.shift()
}

/**
 * Runs through the anchors in a Cheerio object and ensures they are absolute.
 */
const makeLinksAbsolute = ($, item, objBaseURL) => {
  // Allow objBaseURL to be either a function or a plain string.
  const fnBaseURL = isFunction(objBaseURL) ? objBaseURL : n => `${objBaseURL}${n}`

  $('a', item).get().map(a => {
    const $a = $(a)
    const href = $a.attr('href').trim()
    const hrefAbs = href.slice(0, 1) === '/' ? fnBaseURL(href) : href
    $a.attr('href', hrefAbs)
  })
}

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
  findTagContent,
  getImagesFromHTML,
  getLargestImageSrcset,
  getWikiArticleAbstract,
  htmlToMarkdown: htmlToMarkdownDiscord,
  isHTML,
  makeLinksAbsolute
}
