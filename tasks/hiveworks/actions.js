/**
 * Calypso - calypso-task-hiveworks <https://github.com/msikma/calypso>
 * © MIT license
 */

import { RichEmbed } from 'discord.js'

import { getTaskLogger } from 'calypso-core/logging'
import { sendMessage } from 'calypso-core/responder'
import { embedTitle, embedDescription, getFormattedDate, wait } from 'calypso-misc'
import { runComicSearch } from './search'
import { id, color, icon } from './index'

// Goes through each configured comic in the configuration and scrapes that comic's archive page
// to find new chapters. Once found, it posts each new chapter to Discord.
export const actionNewChapters = async (discordClient, user, taskConfig) => {
  const taskLogger = getTaskLogger(id)
  const { comics } = taskConfig
  for (let comic of comics) {
    const { name, slug, url, target } = comic
    taskLogger.debug(`${slug}`, `Retrieving latest chapters`)
    const results = await runComicSearch(url, slug)
    taskLogger.debug(`${slug}`, `Done - ${results.length} results`)
    target.forEach(t => reportResults(t[0], t[1], results, comic, taskLogger))
  }
}

const reportResults = (server, channel, results, comic, taskLogger) => {
  if (results.length === 0) return
  taskLogger.debug(`${comic.slug}`, `Posting ${results.length} ${results.length === 1 ? 'item' : 'items'}`)
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, comic)))
}

const formatMessage = (item, comic) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New ${comic.name} chapter`, comic.icon || icon)
  embed.setTitle(embedTitle(item.date ? `${item.title} (${item.date})` : item.title))
  if (item.image) embed.setImage(encodeURI(item.image))
  if (item.description) embed.setDescription(embedDescription(item.description))
  embed.setURL(item.link)
  embed.setTimestamp()
  embed.setColor(comic.color || color)
  return embed
}
