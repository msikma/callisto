/**
 * Callisto - callisto-task-marktplaats <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import { get, isArray } from 'lodash'

import { isTemporaryError } from 'callisto-util-request'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, wrapArray, wait, objectInspect, embedDescription, mapsCoordsLink, capitalizeFirst } from 'callisto-util-misc'
import { getTaskLogger } from 'callisto-discord-interface/src/logging'

import { runMarktplaatsSearch } from './search'
import { id, color, icon } from './index'

/**
 * Wraps the search code in a single promise.
 */
export const actionRunSearches = async (discordClient, user, taskConfig) => {
  await actionSearch(discordClient, user, taskConfig)
}

/**
 * Runs Marktplaats searches. Always resolves.
 */
const actionSearch = async (discordClient, user, taskConfig) => {
  const taskLogger = getTaskLogger(id)
  const searches = get(taskConfig, 'searches', [])
  const defaultDetails = get(taskConfig, 'defaultDetails', [])
  const defaultTarget = get(taskConfig, 'defaultTarget', [])

  // How much time to wait in between searches.
  const staggerTime = 4000

  await Promise.all(searches.reduce((allSearches, { details, target }) => {
    // Only perform the search if the details have been set.
    if (!details) return false

    // Determine how many search combinations we have (if keywords and/or categories are arrays).
    const keywords = wrapArray(details.keyword)
    const categories = wrapArray(details.category)
    const searchCombinations = keywords.reduce((combinations, kw) => [...combinations, ...categories.map(cat => ({ keyword: kw, category: cat }))], [])

    const currSearchItems = []

    for (let a = 0; a < searchCombinations.length; ++a) {
      const searchTerm = searchCombinations[a]
      const msgTarget = target ? target : defaultTarget
      const searchInfo = objectInspect(searchTerm)
      const fullSearchInfo = objectInspect(details, true)

      currSearchItems.push({ searchTerm, msgTarget, searchInfo, fullSearchInfo })
    }

    return [...allSearches, ...currSearchItems]

  }, [])
  .map(async (searchData, i) => {
    // Wait a little before each search.
    const waitingTime = staggerTime * i
    await wait(waitingTime)
    const { searchTerm, msgTarget, searchInfo, fullSearchInfo } = searchData

    try {
      const { search, newItems } = await runMarktplaatsSearch(searchTerm)
      taskLogger.debug(searchInfo, `Search - wait: ${waitingTime}, entries: ${search.entryCount}, new: ${newItems.length}, url: <${search.url}>`)

      // Now we just send these results to every channel we configured.
      msgTarget.forEach(t => reportResults(t[0], t[1], newItems, searchTerm))
    }
    catch (err) {
      if (isTemporaryError(err)) {
        taskLogger.debug(searchInfo, `Ignored temporary error during search - Error: ${err.code}`)
      }
      else {
        taskLogger.error(`Caught error during search`, `${fullSearchInfo}\n\n${searchInfo}\n\nwait: ${waitingTime}, error code: ${err.code}\n\n${err.stack}`)
      }
    }
  }))
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, search) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, search)))
}

/**
 * Returns a RichEmbed describing a new item.
 */
const formatMessage = (item, searchDetails) => {
  const embed = new RichEmbed();
  embed.setAuthor('New item found on Marktplaats', icon)
  if (item.price || item.priceType) {
    embed.addField('Price', item.price ? `€ ${(item.price.value).toFixed(2)}` : `${capitalizeFirst(item.priceType)}`, true)
  }
  if (item.status) embed.addField('Status', `${capitalizeFirst(item.status)}`, true)
  if (item.seller) embed.addField('Seller', `[${item.seller.name}](${item.seller.url})`, true)
  if (item.delivery) embed.addField('Delivery', `${capitalizeFirst(item.delivery)}`, true)
  if (item.location) embed.addField('Location', `${item.location}`, true)

  if (item.thumb && item.hasImage) {
    embed.setImage(encodeURI(item.thumb))
  }
  embed.setURL(item.urlShort)
  embed.setColor(color)
  embed.setTitle(embedTitle(item.title))
  embed.setDescription(embedDescription(item.desc))
  embed.setTimestamp()
  embed.setFooter(`Searched for keyword "${searchDetails.keyword}"`)
  return embed
}
