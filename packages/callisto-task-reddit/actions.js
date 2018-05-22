/**
 * Callisto - callisto-task-reddit <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import logger from 'callisto-util-logging'
import { config } from 'callisto-util-misc/resources'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription } from 'callisto-util-misc'
import { findNewTopics } from './search'
import { color } from './index'

// URL to the icon.
const REDDIT_ICON = 'https://i.imgur.com/pWjcLbF.png'

/**
 * Find new topics on Reddit.
 */
export const actionSubTopics = (discordClient, user, taskConfig) => {
  taskConfig.subs.forEach(async ({ name, type, target }) => {
    logger.debug(`reddit: Searching for updates from sub ${name}, type ${type}`)
    try {
      const results = await findNewTopics(name, type)
      if (results.length) {
        logger.debug(`reddit: Found ${results.length} item(s) in sub ${name}, type ${type}`)
        target.forEach(t => reportResults(t[0], t[1], results, name))
      }
    }
    catch (err) {
      logger.error(`reddit: Error occurred while searching in sub ${name}, type ${type}`)
      logger.error(err.stack)
    }
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
  embed.setTitle(embedTitle(item.title))
  embed.setDescription(embedDescription(item.descriptionText))
  embed.setURL(item.link)
  embed.setFooter(`By ${item.author}`)
  embed.setColor(color)
  return embed
}
