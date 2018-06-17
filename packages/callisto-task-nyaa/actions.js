/**
 * Callisto - callisto-task-nyaa <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import logger from 'callisto-util-logging'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, wait } from 'callisto-util-misc'
import { runNyaaSearch } from './search'
import * as categories from './categories'
import * as filters from './filters'
import { color } from './index'

// URL to the Mandarake icon.
const NYAA_ICON = 'https://i.imgur.com/FfNa3D1.png'

/**
 * Returns an RSS feed URL for Nyaa.si.
 */
const nyaaURL = (search='', filter=filters.NO_FILTER, category=categories.ALL_CATEGORIES) => (
  `https://nyaa.si/?page=rss&q=${encodeURIComponent(search)}&c=${category}&f=${filter}`
)

/**
 * Standard defaults.
 */
const standardDefaults = {
  filter: filters.NO_FILTER,
  category: categories.ALL_CATEGORIES
}

/**
 * Runs Mandarake searches.
 */
export const actionRunSearches = (discordClient, user, taskConfig) => {
  // Default search parameters.
  const { defaultDetails, defaultTarget } = taskConfig

  // Run through each of our searches and fire off a query.
  taskConfig.searches.forEach(async ({ details, target }, i) => {
    // Stagger our searches a bit.
    await wait(i * 5000)
    // Only perform the search if the details have been set.
    if (!details) return false
    const msgTarget = target ? target : defaultTarget
    const searchDetails = { ...standardDefaults, ...defaultDetails, ...details }
    const url = nyaaURL(searchDetails.query, searchDetails.filter, searchDetails.category)

    // 'result' contains everything needed to send a message to the user.
    // Previously reported items have already been removed, and the items
    // we found have been added to the cache.
    try {
      const results = await runNyaaSearch(url)
      logger.debug(`nyaa: Found ${results.length} item(s) for query: ${searchDetails.query}, filter: ${searchDetails.filter}, category: ${searchDetails.category}, url: ${url}`)

      // Now we just send these results to every channel we configured.
      msgTarget.forEach(t => reportResults(t[0], t[1], results, searchDetails))
    }
    catch (err) {
      return logger.error(`nyaa: Error occurred while searching in sub: ${name}, type: ${type}\n\n${err.stack}`)
    }
  })
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
 *
 * Note: 'guid' links to the overview page. 'link' goes directly to the torrent.
 */
const formatMessage = (item, searchDetails) => {
  const embed = new RichEmbed();
  embed.setAuthor('New torrent file on Nyaa.si', NYAA_ICON)
  embed.setTitle(embedTitle(item.title))
  embed.addField('Category', item['nyaa:category']['#'], true)
  embed.addField('Size', item['nyaa:size']['#'], true)
  embed.addField('Torrent', `[${item.link}](${item.link})`)
  embed.setURL(item.guid)
  embed.setColor(color)
  embed.setTimestamp()
  embed.setFooter(`Searched for keyword "${searchDetails.query}"`)
  return embed
}
