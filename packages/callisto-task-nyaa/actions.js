/**
 * Callisto - callisto-task-nyaa <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle } from 'callisto-util-misc'
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
  taskConfig.searches.forEach(async ({ details, target }) => {
    // Only perform the search if the details have been set.
    if (!details) return false
    const msgTarget = target ? target : defaultTarget
    const searchDetails = { ...standardDefaults, ...defaultDetails, ...details }
    const url = nyaaURL(searchDetails.query, searchDetails.filter, searchDetails.category)

    // 'result' contains everything needed to send a message to the user.
    // Previously reported items have already been removed, and the items
    // we found have been added to the cache.
    const results = await runNyaaSearch(url)

    // Now we just send these results to every channel we configured.
    msgTarget.forEach(t => reportResults(t[0], t[1], results, searchDetails))
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
 */
const formatMessage = (item, searchDetails) => {
  const embed = new RichEmbed();
  embed.setAuthor('New torrent file on Nyaa.si', NYAA_ICON)
  embed.setTitle(embedTitle(item.title))
  embed.addField('Category', item['nyaa:category']['#'])
  embed.addField('Size', item['nyaa:size']['#'])
  embed.setURL(item.link)
  embed.setColor(color)
  embed.setFooter(`Searched for keyword "${searchDetails.query}"`)
  return embed
}
