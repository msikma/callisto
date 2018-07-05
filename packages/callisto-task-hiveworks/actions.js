/**
 * Callisto - callisto-task-hiveworks <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import logger from 'callisto-util-logging'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription, getFormattedDate, wait } from 'callisto-util-misc'
import { runComicSearch } from './search'
import { color, icon } from './index'

// Goes through each configured comic in the configuration and scrapes that comic's archive page
// to find new chapters. Once found, it posts each new chapter to Discord.
export const actionNewChapters = async (discordClient, user, taskConfig) => {
  const { comics } = taskConfig
  for (let comic of comics) {
    const { name, slug, url, target } = comic
    logger.debug(`hiveworks: ${slug}: Retrieving latest chapters`)
    const results = await runComicSearch(url, slug)
    logger.debug(`hiveworks: ${slug}: Done - ${results.length} results`)
    target.forEach(t => reportResults(t[0], t[1], results, comic))
  }
}

const reportResults = (server, channel, results, comic) => {
  if (results.length === 0) return
  logger.debug(`hiveworks: ${comic.slug}: Posting ${results.length} ${results.length === 1 ? 'item' : 'items'}`)
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, comic)))
}

const formatMessage = (item, comic) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New ${comic.name} chapter`, comic.icon || icon)
  embed.setTitle(embedTitle(item.date ? `${item.title} (${item.date})` : item.title))
  if (item.image) embed.setImage(item.image)
  if (item.description) embed.setDescription(embedDescription(item.description))
  embed.setURL(item.link)
  embed.setTimestamp()
  embed.setColor(comic.color || color)
  return embed
}
