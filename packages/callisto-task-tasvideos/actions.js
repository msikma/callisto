/**
 * Callisto - callisto-task-tasvideos <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import { getTaskLogger } from 'callisto-discord-interface/src/logging'
import { rssParse, embedTitle, embedDescription } from 'callisto-util-misc'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { findNewTASes } from './search'
import { id, color, icon } from './index'

/**
 * Runs TASVideos searches.
 */
export const actionSearchUpdates = (discordClient, user, taskConfig) => {
  const taskLogger = getTaskLogger(id)
  taskLogger.verbose('Searching for new TASes.')
  taskConfig.searches.forEach(async searchData => {
    const { type, target } = searchData
    const results = await findNewTASes(type)
    taskLogger.verbose(`Found ${results.length} new item(s)`)
    target.forEach(t => reportResults(t[0], t[1], results, type))
  })
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, type) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, type)))
}

/**
 * Returns a RichEmbed describing a new item.
 */
const formatMessage = (item, type = '', showCategories = false, useYoutubeLink = false) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New publication on TASVideos`, icon)
  embed.setTitle(embedTitle(item.title))
  embed.setImage(item.image)
  embed.setDescription(embedDescription(item.description))
  if (showCategories) {
    embed.addField('Categories', item.categoriesWithoutGenre.join(', '), true)
  }
  embed.setTimestamp()
  // Sometimes there is no Youtube link.
  // I can only assume that the RSS feed is constructed at publication time,
  // and if the link hasn't already been added at that time it just isn't in there.
  if (item.youtubeLink && useYoutubeLink) {
    embed.addField('Youtube', `[${item.youtubeLink}](${item.youtubeLink})`, true)
  }
  embed.setURL(item.link)
  embed.setColor(color)
  return embed
}
