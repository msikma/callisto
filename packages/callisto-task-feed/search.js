/**
 * Callisto - callisto-task-feed <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { cacheItems, removeCached } from 'callisto-util-cache'
import { parseFeedURL, isHTML, htmlToMarkdown, removeEmptyLines, getImagesFromHTML, limitDescription } from 'callisto-util-misc'
import { getBestImage } from './util'
import { id } from './index'

/**
 * Checks the given RSS, Atom or RDF feed for updates that have not been posted yet.
 */
export const checkForUpdates = async (url, slug) => {
  // Retrieve items from the feed, and parse the content for easy consumption later.
  const items = (await parseFeedURL(url)).map(i => parseItem(i))
  if (items.length === 0) return []

  const newItems = await removeCached(`${id}$${slug}`, items)
  if (newItems.length === 0) return []
  cacheItems(`${id}$${slug}`, newItems)

  return newItems
}

/**
 * Cleans up a feed item's data slightly so it can be easily posted later.
 */
const parseItem = (item) => {
  // For caching in the database.
  const itemID = item.guid

  // Convert the description to Markdown (or leave it as it is, if it's not HTML).
  const descriptionIsHTML = isHTML(item.description)
  const descriptionClean = descriptionIsHTML
    ? limitDescription(removeEmptyLines(htmlToMarkdown(item.description, false, true, true, false, true), true))
    : item.description

  // Retrieve images from the feed item.
  const images = item.enclosures.filter(e => e.type === 'image').map(e => e.url)
  const bestImage = getBestImage(images)
  // Retrieve images from HTML as backup, in case we don't have images from the feed item itself.
  const htmlImages = descriptionIsHTML ? getImagesFromHTML(item.description) : []
  const htmlBestImage = getBestImage(htmlImages)

  return {
    ...item,
    id: itemID,
    _images: images,
    _bestImage: bestImage ? bestImage : htmlBestImage,
    _description: descriptionClean
  }
}