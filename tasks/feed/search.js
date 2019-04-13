/**
 * Calypso - calypso-task-feed <https://github.com/msikma/calypso>
 * © MIT license
 */

import { cacheItems, removeCached } from 'calypso-cache'
import { parseFeedURL, isHTML, htmlToMarkdown, removeEmptyLines, getImagesFromHTML, limitDescription } from 'calypso-misc'
import { getBestImage, cleanupImage } from './util'
import { id } from './index'

/**
 * Checks the given RSS, Atom or RDF feed for updates that have not been posted yet.
 */
export const checkForUpdates = async (url, slug, baseURL = '') => {
  // Retrieve items from the feed, and parse the content for easy consumption later.
  const items = (await parseFeedURL(url)).map(i => parseItem(i, baseURL))
  if (items.length === 0) return []

  const newItems = await removeCached(`${id}$${slug}`, items)
  if (newItems.length === 0) return []
  cacheItems(`${id}$${slug}`, newItems)

  return newItems
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
    ? limitDescription(removeEmptyLines(htmlToMarkdown(item.description, false, true, true, false, true), true))
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
