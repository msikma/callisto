/**
 * Callisto - callisto-task-hiveworks <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import logger from 'callisto-util-logging'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription, getFormattedDate } from 'callisto-util-misc'
import { runComicSearch } from './search'
import { color } from './index'

const ICON = 'https://i.imgur.com/0Lit9ql.png'

// Goes through each configured comic in the configuration and scrapes that comic's archive page
// to find new chapters. Once found, it posts each new chapter to Discord.
export const actionNewChapters = (discordClient, user, taskConfig) => {
  const { comics } = taskConfig
  comics.forEach(async comic => {
    const { name, slug, url, target } = comic
    logger.debug(`hiveworks: ${slug}: Retrieving latest chapters`)
    const results = await runComicSearch(url, slug)
    target.forEach(t => reportResults(t[0], t[1], results, comic))
  })
}

const reportResults = (server, channel, results, comic) => {
  if (results.length === 0) return
  logger.debug(`hiveworks: ${comic.slug}: Posting ${results.length} ${results.length === 1 ? 'item' : 'items'}`)
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, comic)))
}

const formatMessage = (item, comic) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New ${comic.name} chapter`, comic.icon || ICON)
  embed.setTitle(embedTitle(item.title))
  if (item.image) embed.setImage(item.image)
  if (item.description) embed.setDescription(embedDescription(item.description))
  embed.setURL(item.link)
  embed.setFooter(`Posted on ${getFormattedDate(new Date(item.date))}`)
  embed.setColor(comic.color || color)
  return embed
}
