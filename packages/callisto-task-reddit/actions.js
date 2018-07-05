/**
 * Callisto - callisto-task-reddit <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import logger from 'callisto-util-logging'
import { isTemporaryError } from 'callisto-util-request'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription, wait } from 'callisto-util-misc'
import { findNewTopics } from './search'
import { color, icon } from './index'

/**
 * Find new topics on Reddit.
 */
export const actionSubTopics = (discordClient, user, taskConfig) => {
  taskConfig.subs.forEach(async ({ name, type, target }, i) => {
    // Stagger the searches a bit.
    await wait(i * 5000)
    logger.debug(`reddit: Searching for updates from sub ${name}, type ${type} (wait: ${i * 5000})`)
    try {
      const results = await findNewTopics(name, type)
      if (results.items.length) {
        logger.debug(`reddit: Found ${results.items.length} item(s) in sub: ${name}, type: ${type}, url: ${results.url}`)
        target.forEach(t => reportResults(t[0], t[1], results.items, name))
      }
    }
    catch (err) {
      if (isTemporaryError(err)) {
        return logger.info(`reddit: Temporary network error (${err.code}) while searching in sub: ${name}, type: ${type}`)
      }
      else if (err.error) {
        return logger.error(`reddit: Error occurred while searching in sub: ${name}, type: ${type}, url: ${err.url}\n\n${err.error.stack}`)
      }
      else {
        return logger.error(`reddit: Error occurred while searching in sub: ${name}, type: ${type}\n\n${err.stack}`)
      }
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
  embed.setAuthor(`New topic on /r/${name}`, icon)
  embed.setTitle(embedTitle(item.title))
  embed.setDescription(embedDescription(item.descriptionText))
  embed.setURL(item.link)
  embed.setFooter(`By ${item.author}`)
  embed.setTimestamp()
  embed.setColor(color)
  return embed
}
