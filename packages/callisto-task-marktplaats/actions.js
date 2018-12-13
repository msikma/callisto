/**
 * Callisto - callisto-task-marktplaats <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import { get } from 'lodash'

import { isTemporaryError } from 'callisto-util-request'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, wait, objectInspect, embedDescription, mapsCoordsLink, capitalizeFirst } from 'callisto-util-misc'
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

  await Promise.all(searches.map(async ({ details, target }, i) => {
    // Only perform the search if the details have been set.
    if (!details) return false
    // Search staggering.
    const waitingTime = i * 10000
    await wait(waitingTime)
    const msgTarget = target ? target : defaultTarget
    const searchDetails = { ...defaultDetails, ...details }
    const searchInfo = objectInspect(details, true)

    try {
      const { search, newItems } = await runMarktplaatsSearch(searchDetails)
      taskLogger.debug(searchDetails.keyword, `Search: ${searchInfo} - wait: ${waitingTime}, entries: ${search.entryCount}, new: ${newItems.length}, url: <${search.url}>`)

      // Now we just send these results to every channel we configured.
      msgTarget.forEach(t => reportResults(t[0], t[1], newItems, searchDetails))
    }
    catch (err) {
      if (isTemporaryError(err)) {
        taskLogger.debug(searchDetails.keyword, `Ignored temporary error during search: ${searchInfo} - Error: ${err.code}`)
      }
      else {
        taskLogger.error(`Caught error during search`, `${searchInfo}\n\nwait: ${waitingTime}, error code: ${err.code}\n\n${err.stack}`)
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
