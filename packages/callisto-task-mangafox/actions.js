/**
 * Callisto - callisto-task-mangafox <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import logger from 'callisto-util-logging'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription, getFormattedDate, wait } from 'callisto-util-misc'
import { runMangaSearch } from './search'
import { color } from './index'

const ICON = 'https://i.imgur.com/pfveukN.png'

export const actionNewChapters = async (discordClient, user, taskConfig) => {
  const { searches } = taskConfig
  for (let search of searches) {
    const { name, slug, thumbnail, color, target } = search
    logger.debug(`mangafox: ${slug}: Retrieving latest chapters`)
    const results = await runMangaSearch(slug)
    logger.debug(`mangafox: ${slug}: Done - ${results.length} results`)
    target.forEach(t => reportResults(t[0], t[1], results, { slug, thumbnail, color, name }))
  }
}

const reportResults = (server, channel, results, comic) => {
  if (results.length === 0) return
  logger.debug(`mangafox: ${comic.slug}: Posting ${results.length} ${results.length === 1 ? 'item' : 'items'}`)
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, comic)))
}

const formatMessage = (item, comic) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New ${comic.name} chapter on MangaFox`, comic.thumbnail || ICON)
  embed.setTitle(embedTitle(item.title))
  if (comic.thumbnail) embed.setThumbnail(comic.thumbnail)
  if (item.image) embed.setImage(item.image)
  embed.setURL(item.url)
  embed.setTimestamp()
  embed.setColor(comic.color || color)
  return embed
}
