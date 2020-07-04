// Callisto - callisto-task-feed <https://github.com/msikma/callisto>
// © MIT license

const { parseFeedURL } = require('callisto-core/util/feeds')
const { limitDescriptionParagraph, removeEmptyLines } = require('callisto-core/util/text')
const { getImagesFromHTML, htmlToMarkdown, isHTML } = require('callisto-core/util/html')
const { getBestImage, cleanupImage } = require('callisto-core/util/image')

/**
 * Checks the given RSS, Atom or RDF feed for updates that have not been posted yet.
 */
const getFeedUpdates = async ({ feedURL, feedName, feedSlug, baseURL }) => {
  const results = (await parseFeedURL(feedURL))
    .map(item => parseItem(item, baseURL))
    .sort((a, b) => a.pubDate > b.pubDate ? 1 : -1)

  return {
    success: true,
    items: results,
    meta: {
      url: feedURL,
      baseURL,
      feedName,
      feedSlug
    }
  }
}
/**
 * Cleans up a feed item's data slightly so it can be easily posted later.
 */
const parseItem = (item, baseURL) => {
  // For caching in the database.
  const itemID = item.guid

  // Convert the description to Markdown (or leave it as it is, if it's not HTML).
  const descriptionIsHTML = isHTML(item.description)
  const descriptionClean = descriptionIsHTML
    ? limitDescriptionParagraph(removeEmptyLines(htmlToMarkdown(item.description, { removeEmpty: false, removeScript: true, removeStyle: true, removeHr: false, removeImages: true }), true))
    : item.description

  let _bestImage = null
  let images = []

  try {
    // Retrieve images from the feed item.
    images = item.enclosures.filter(e => e.type === 'image').map(e => cleanupImage(e.url, baseURL)).filter(n => n)
    const bestImage = getBestImage(images)
    if (bestImage) _bestImage = bestImage
  }
  catch (err) {
  }

  try {
    // Retrieve images from HTML as backup, in case we don't have images from the feed item itself.
    const htmlImages = descriptionIsHTML ? getImagesFromHTML(item.description).map(e => cleanupImage(e, baseURL)).filter(n => n) : []
    const htmlBestImage = getBestImage(htmlImages)
    if (!_bestImage && htmlBestImage) {
      images = htmlImages
      _bestImage = htmlBestImage
    }
  }
  catch (err) {
  }

  return {
    ...item,
    id: itemID,
    _images: images,
    _bestImage,
    _description: descriptionClean
  }
}

module.exports = {
  getFeedUpdates
}
