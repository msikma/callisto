/**
 * Callisto - callisto-task-horriblesubs <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import URL from 'url-parse'

import logger from 'callisto-util-logging'
import { cacheItems, removeCached } from 'callisto-util-cache'
import { requestURL } from 'callisto-util-request'
import { rssParse, objectInspect } from 'callisto-util-misc'
import { id } from './index'

/**
 * Loads the HorribleSubs RSS feed and match its entries against our search query.
 */
export const runHorribleSubsSearch = async (url, searchDetails, link, wikia) => {
  const items = await rssParse(url)
  const queryRe = new RegExp(searchDetails.query, 'i')

  if (items.length === 0) return []

  // Since the RSS feed contains everything on the site, we have to manually filter for our search query.
  const matchingItems = items.filter(item => queryRe.test(item.title))

  // Copy 'guid' to 'id' for caching.
  const allItems = matchingItems.map(entry => ({ ...entry, id: entry.guid }))
  const newItems = await removeCached(id, allItems)
  logger.debug(`horriblesubs: ${searchDetails.query}: found ${matchingItems.length} matching item(s), ${newItems.length} new item(s)`)

  if (newItems.length === 0) return []

  // Add the remaining items to the database.
  cacheItems(id, newItems)
  try {
    // For all matching items, retrieve an image. If there's a Wikia link, try that.
    // Otherwise, find the series image on HorribleSubs itself.
    if (wikia) {
      return await retrieveWikiaInfo(newItems, wikia, searchDetails.query)
    }
    else {
      return await retrieveSeriesImage(newItems, link, searchDetails.query)
    }
  }
  catch (e) {
    // If something went wrong, just return the items without series image.
    return newItems
  }
}

/**
 * Retrieves information from Wikia about this episode.
 */
const retrieveWikiaInfo = (items, tpl, query) => (
  // Episodes all follow this naming pattern: [HorribleSubs] One Piece - 841 [1080p].mkv
  Promise.all(items.map(async item => {
    const episode = item.title.match(/- ([0-9]+) \[/)[1]

    // Load the 'history' page. Then pick out the latest revision of the article.
    // Apparently Wikia sometimes gives us an old version. I don't know why.
    const link = `${tpl}${episode}?action=history`
    const page = await requestURL(link)
    const $ = cheerio.load(page)

    // Pick the latest revision.
    const latest = $($('#pagehistory li:first-child a')[0]).attr('href')
    const origin = new URL(link).origin
    const latestRevision = `${origin}${latest}`
    const latestPage = await requestURL(latestRevision)
    const $page = cheerio.load(latestPage)

    // There could be multiple. Take the first.
    const episodeImage = $page($page('.pi-image-thumbnail')[0]).attr('src')

    // Now try to get the title. This is more difficult. Some Wikia pages use the first class,
    // others use the second class.
    // The meta description will usually contain the title as well, so we'll see if any of them
    // match the contents of the description. That's the one we'll take.
    const headers = $page('.portable-infobox h2').map((n, el) => $page(el).text().trim()).get()
    const metaDescription = $page('meta[name="description"]').attr('content')
    const correctHeader = headers.filter(h => metaDescription.toLowerCase().match(h.toLowerCase()) != null)

    // All the metadata we'll add to the item.
    const metadata = {
      _episodeNumber: episode,
      _title: correctHeader.length > 0 ? correctHeader[0] : null,
      _episodeImage: episodeImage
    }

    logger.debug(`horriblesubs: ${query}: for item "${item.title}": added metadata: ${objectInspect(metadata)}`)

    return {
      ...item,
      ...metadata
    }
  }))
)

/**
 * Retrieves the series image for a specific series, and adds it to the items we found.
 */
const retrieveSeriesImage = async (items, link, query) => {
  const page = await requestURL(link)
  const $ = cheerio.load(page)
  const seriesImage = $('.series-image img').attr('src')

  logger.debug(`horriblesubs: ${query}: added series image: ${seriesImage}`)

  return items.map(item => ({ ...item, _seriesImage: seriesImage }))
}
