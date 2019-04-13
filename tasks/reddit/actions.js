/**
 * Calypso - calypso-task-reddit <https://github.com/msikma/calypso>
 * © MIT license
 */

import { RichEmbed } from 'discord.js'

import { getTaskLogger } from 'calypso-core/src/logging'
import { isTemporaryError } from 'calypso-request'
import { sendMessage } from 'calypso-core/src/responder'
import { embedTitle, embedDescription, wait } from 'calypso-misc'
import { findNewTopics } from './search'
import { id, color, icon } from './index'

/**
 * Find new topics on Reddit.
 */
export const actionSubTopics = (discordClient, user, taskConfig) => {
  const taskLogger = getTaskLogger(id)
  taskConfig.subs.forEach(async ({ name, type, target }, i) => {
    // Stagger the searches a bit.
    await wait(i * 5000)
    taskLogger.debug(name, `Searching for updates from sub ${name}, type ${type} (wait: ${i * 5000})`)
    try {
      const results = await findNewTopics(name, type)
      if (results.items.length) {
        taskLogger.debug(name, `Found ${results.items.length} item(s) in sub: ${name}, type: ${type}, url: ${results.url}`)
        target.forEach(t => reportResults(t[0], t[1], results.items, name))
      }
    }
    catch (err) {
      if (isTemporaryError(err)) {
        return taskLogger.debug(name, `Temporary network error (${err.code}) while searching in sub: ${name}, type: ${type}`)
      }
      else if (err.error) {
        return taskLogger.error(`Error occurred while searching in sub`, `Sub: ${name}, type: ${type}, url: ${err.url}\n\n${err.error.stack}`)
      }
      else {
        return taskLogger.error(`Error occurred while searching in sub`, `Sub: ${name}, type: ${type}\n\n${err.stack}`)
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
