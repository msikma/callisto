/**
 * Calypso - calypso-task-mangafox <https://github.com/msikma/calypso>
 * © MIT license
 */

import { RichEmbed } from 'discord.js'

import { getTaskLogger } from 'calypso-core/src/logging'
import { sendMessage } from 'calypso-core/src/responder'
import { embedTitle, embedDescription, getFormattedDate, wait } from 'calypso-misc'
import { runMangaSearch } from './search'
import { id, color, icon } from './index'

export const actionNewChapters = async (discordClient, user, taskConfig) => {
  const taskLogger = getTaskLogger(id)
  const { searches } = taskConfig
  for (let search of searches) {
    const { name, slug, thumbnail, color, target } = search
    taskLogger.debug(`${slug}`, `Retrieving latest chapters`)
    const results = await runMangaSearch(slug)
    taskLogger.debug(`${slug}`, `Done - ${results.length} results`)
    target.forEach(t => reportResults(t[0], t[1], results, { slug, thumbnail, color, name }, taskLogger))
  }
}

const reportResults = (server, channel, results, comic, taskLogger) => {
  if (results.length === 0) return
  taskLogger.debug(`${comic.slug}`, `Posting ${results.length} ${results.length === 1 ? 'item' : 'items'}`)
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, comic)))
}

const formatMessage = (item, comic) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New ${comic.name} chapter on MangaFox`, comic.thumbnail || icon)
  embed.setTitle(embedTitle(item.title))
  if (comic.thumbnail) embed.setThumbnail(encodeURI(comic.thumbnail))
  if (item.image) embed.setImage(encodeURI(item.image))
  embed.setURL(item.url)
  embed.setTimestamp()
  embed.setColor(comic.color || color)
  return embed
}
