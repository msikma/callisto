/**
 * Callisto - callisto-task-horriblesubs <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import logger from 'callisto-util-logging'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription, wait } from 'callisto-util-misc'
import { runHorribleSubsSearch } from './search'
import * as res from './res'
import { color } from './index'

// URL to the HorribleSubs icon.
const HORRIBLESUBS_ICON = 'https://i.imgur.com/jjQBNkY.jpg'

/**
 * Returns an RSS feed URL for HorribleSubs.
 */
const horribleSubsURL = (search='', res=res.RES_EVERYTHING) => (
  `http://horriblesubs.info/rss.php?res=${res}`
)

/**
 * Runs HorribleSubs searches.
 */
export const actionRunSearches = (discordClient, user, taskConfig) => {
  // Default search parameters.
  const { defaultDetails, defaultTarget } = taskConfig

  // Run through each of our searches and fire off a query.
  taskConfig.searches.forEach(async ({ details, target, link, wikia }, i) => {
    await wait(i * 8000)
    // Only perform the search if the details have been set.
    if (!details) return false
    const msgTarget = target ? target : defaultTarget
    const searchDetails = { ...defaultDetails, ...details }
    const url = horribleSubsURL(searchDetails.query, searchDetails.res)
    logger.debug(`horriblesubs: ${searchDetails.query}: loading from url: ${url}`)
    const results = await runHorribleSubsSearch(url, searchDetails, link, wikia)
    msgTarget.forEach(t => reportResults(t[0], t[1], results, searchDetails, link))
  })
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, search, link) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, search, link)))
}

/**
 * Returns a RichEmbed describing a new item.
 */
const formatMessage = (item, searchDetails, link) => {
  const embed = new RichEmbed();
  embed.setAuthor('New torrent file on HorribleSubs', HORRIBLESUBS_ICON)
  embed.setTitle(embedTitle(item.title))
  if (item._title) {
    embed.setDescription(`Episode ${item._episodeNumber}: ${item._title}`, '')
  }
  if (link) {
    embed.setURL(link)
  }
  else {
    embed.setDescription(embedDescription(item.link))
  }
  if (item._seriesImage) {
    embed.setThumbnail(item._seriesImage)
  }
  if (item._episodeImage) {
    embed.setImage(item._episodeImage)
  }
  embed.setColor(color)
  embed.setTimestamp()
  embed.setFooter(embedDescription(`Searched for keyword "${searchDetails.query}"`))
  return embed
}
