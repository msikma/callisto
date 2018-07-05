/**
 * Callisto - callisto-task-nyaa <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import { requestURL } from 'callisto-util-request'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { rssParse, separateMarkdownImages } from 'callisto-util-misc'
import { id } from './index'

export const runNyaaSearch = async (url) => {
  // Parse RSS - on error, this resolves with an empty array.
  const items = await rssParse(url, true)

  if (items.length === 0) return []

  // Copy 'guid' to 'id' for caching.
  const allItems = items.map(entry => ({ ...entry, id: entry.guid }))
  const newItems = await Promise.all((await removeCached(id, allItems)).map(addDescription))

  // Add the remaining items to the database.
  cacheItems(id, newItems)

  // Now we can send these results to the channel.
  return newItems
}

/**
 * Adds the torrent description to the entry. If images are present, we will save them as well.
 */
const addDescription = async entry => {
  const url = entry.guid
  const $ = cheerio.load(await requestURL(url), { decodeEntities: false })
  // The HTML contains raw Markdown, which is then converted to HTML using Javascript.
  // Thus we can just steal it verbatim.
  const mdDescription = $('#torrent-description').html()
  // However, we can't display images, so we'll have to take those out.
  const mdTextImages = separateMarkdownImages(mdDescription)

  return {
    ...entry,
    _images: mdTextImages.images,
    _description: isNoDescription(mdDescription) ? null : mdTextImages.text
  }
}

// Returns true if the description is Nyaa's generic "no description."
// If so, we should not display it in the rich embed.
const isNoDescription = description => description.trim() === '#### No description.'
