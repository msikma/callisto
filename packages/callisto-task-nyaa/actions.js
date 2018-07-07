/**
 * Callisto - callisto-task-nyaa <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import { getTaskLogger } from 'callisto-discord-interface/src/logging'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription, wait } from 'callisto-util-misc'
import { runNyaaSearch } from './search'
import * as categories from './categories'
import * as filters from './filters'
import { id, color, icon } from './index'

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
  const taskLogger = getTaskLogger(id)
  // Default search parameters.
  const { defaultDetails, defaultTarget } = taskConfig

  // Run through each of our searches and fire off a query.
  taskConfig.searches.forEach(async (search, i) => {
    const { details, target } = search
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
      taskLogger.debug(searchDetails.query, `Found ${results.length} item(s) for query: ${searchDetails.query}, filter: ${searchDetails.filter}, category: ${searchDetails.category}, url: ${url}`)

      // Now we just send these results to every channel we configured.
      msgTarget.forEach(t => reportResults(t[0], t[1], results, search))
    }
    catch (err) {
      return taskLogger.error(`Error occurred while searching`, `${searchDetails.query}\n\n${err.stack}`)
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
const formatMessage = (item, search) => {
  const embed = new RichEmbed();
  embed.setAuthor('New torrent file on Nyaa.si', icon)
  embed.setTitle(embedTitle(item.title))
  if (item._description) {
    // Add the scraped description if it's been added.
    embed.setDescription(embedDescription(item._description))
  }
  if (search.thumbnail) {
    // If the configuration contains a thumbnail, add it.
    embed.setThumbnail(search.thumbnail)
  }
  if (item._images.length > 0) {
    // If there are images, add one.
    embed.setImage(item._images[0].url)
  }
  embed.addField('Category', item['nyaa:category']['#'], true)
  embed.addField('Size', item['nyaa:size']['#'], true)
  embed.addField('Torrent', `[${item.link}](${item.link})`)
  embed.setURL(item.guid)
  embed.setColor(color)
  embed.setTimestamp()
  embed.setFooter(`Searched for keyword "${search.details.query}"`)
  return embed
}
