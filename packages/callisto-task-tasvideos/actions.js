/**
 * Callisto - callisto-task-tasvideos <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import { rssParse, embedTitle, embedDescription } from 'callisto-util-misc'
import logger from 'callisto-util-logging'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { findNewTASes } from './search'
import { color } from './index'

const ICON = 'https://i.imgur.com/wlRgRr5.png'

/**
 * Runs TASVideos searches.
 */
export const actionSearchUpdates = (discordClient, user, taskConfig) => {
  taskConfig.searches.forEach(async searchData => {
    const { type, target } = searchData
    const results = await findNewTASes(type)
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
const formatMessage = (item, type = '', showCategories = false) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New publication on TASVideos`, ICON)
  embed.setTitle(embedTitle(item.title))
  embed.setImage(item.image)
  embed.setDescription(embedDescription(item.description))
  if (showCategories) {
    embed.addField('Categories', item.categoriesWithoutGenre.join(', '))
  }
  // Sometimes there is no Youtube link.
  // I can only assume that the RSS feed is constructed at publication time,
  // and if the link hasn't already been added at that time it just isn't in there.
  embed.setURL(item.youtubeLink ? item.youtubeLink : item.link)
  embed.setColor(color)
  return embed
}
