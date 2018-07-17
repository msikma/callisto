/**
 * Callisto - callisto-task-feed <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import { slugify } from 'callisto-util-misc'
import { getTaskLogger } from 'callisto-discord-interface/src/logging'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription, wait, objectInspect, wrapInJSCode, getFormattedDate } from 'callisto-util-misc'
import { checkForUpdates } from './search'
import { id, color as genericColor, icon } from './index'

/**
 * Runs through all configured feed URLs and checks them for updates.
 * Returns a promise that fulfills when all checks are done.
 */
export const checkFeeds = async (discordClient, user, taskConfig) => {
  const { feeds, defaultTarget } = taskConfig
  const taskLogger = getTaskLogger(id)

  taskLogger.debug('Checking feeds for updates.')

  return Promise.all(feeds.map(async (item, i) => {
    try {
      await checkFeedItem(item, i, defaultTarget, taskLogger)
    }
    catch (err) {
      taskLogger.error('Error while checking feed', `${wrapInJSCode(objectInspect(item))}${err.code ? `\nError code: ${err.code}\n` : ''}\n${err.stack}`)
    }
  }))
}

const checkFeedItem = async (item, i, defaultTarget, taskLogger) => {
  // Rate limiting.
  const waitTime = i * 8000
  taskLogger.debug(item.name, `Checking feed (wait: ${waitTime})`)
  await wait(waitTime)

  const msgTarget = item.target ? item.target : defaultTarget
  const newPosts = await checkForUpdates(item.url, slugify(item.name))
  if (newPosts.length > 0) {
    taskLogger.debug(item.name, `Found ${newPosts.length} new item(s)`)
    msgTarget.forEach(t => reportResults(t[0], t[1], newPosts, item))
  }
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, item) => {
  if (results.length === 0) return
  results.forEach(result => sendMessage(server, channel, null, formatMessage(result, item)))
}

/**
 * Returns a RichEmbed describing a new item.
 */
const formatMessage = (result, item) => {
  // Any of these can be null.
  const { name, color, thumbnail } = item

  const embed = new RichEmbed();
  embed.setAuthor(`New update from ${name}`, icon)
  embed.setTitle(embedTitle(result.title))
  embed.setDescription(embedDescription(result._description))
  embed.setURL(result.link)
  if (result._bestImage) embed.setImage(encodeURI(result._bestImage))
  if (thumbnail) embed.setThumbnail(encodeURI(thumbnail))
  embed.setColor(color != null ? color : genericColor)
  embed.setFooter(`Published on ${getFormattedDate(result.pubDate)}`)
  embed.setTimestamp()
  return embed
}
