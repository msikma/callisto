/**
 * Callisto - callisto-task-horriblesubs <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription } from 'callisto-util-misc'
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
  taskConfig.searches.forEach(async ({ details, target, link }) => {
    // Only perform the search if the details have been set.
    if (!details) return false
    const msgTarget = target ? target : defaultTarget
    const searchDetails = { ...defaultDetails, ...details }
    const url = horribleSubsURL(searchDetails.query, searchDetails.res)

    // 'result' contains everything needed to send a message to the user.
    // Previously reported items have already been removed, and the items
    // we found have been added to the cache.
    const results = await runHorribleSubsSearch(url, searchDetails)

    // Now we just send these results to every channel we configured.
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
  if (link) {
    embed.setURL(link)
  }
  else {
    embed.setDescription(embedDescription(item.link))
  }
  embed.setColor(color)
  embed.setFooter(embedDescription(`Searched for keyword "${searchDetails.query}"`))
  return embed
}
