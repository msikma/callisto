/**
 * Callisto - callisto-task-reddit <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import { config } from 'callisto-discord-interface/src/resources'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { rssParse } from 'callisto-util-misc'
import { findNewTopics } from './search'
import { color } from './index'

// URL to the icon.
const REDDIT_ICON = 'https://i.imgur.com/pWjcLbF.png'
const SUB_URL = sub => `https://www.reddit.com/r/${sub}/.rss`

/**
 * Find new topics on Reddit.
 */
export const actionSubTopics = (discordClient, user, taskConfig) => {
  taskConfig.subs.forEach(async ({ name, target }) => {
    const url = SUB_URL(name)
    const results = await findNewTopics(url, name)
    target.forEach(t => reportResults(t[0], t[1], results, name))
  })
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, name) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, name)))
}

/**
 * Returns a RichEmbed describing a new item.
 */
const formatMessage = (item, name) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New topic on /r/${name}`, REDDIT_ICON)
  embed.setTitle(item.title)
  embed.setDescription(item.descriptionText)
  embed.setURL(item.link)
  embed.setFooter(`By ${item.author}`)
  embed.setColor(color)
  return embed
}
