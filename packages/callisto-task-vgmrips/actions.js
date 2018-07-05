/**
 * Callisto - callisto-task-vgmrips <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import { getTaskLogger } from 'callisto-discord-interface/src/logging'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle } from 'callisto-util-misc'
import { runVGMRipsSearch } from './search'
import { id, color, icon } from './index'

/**
 * Runs VGMRips searches.
 */
export const actionRecentReleases = async (discordClient, user, taskConfig) => {
  try {
    const taskLogger = getTaskLogger(id)
    // Default search parameters.
    const { target } = taskConfig

    // 'result' contains everything needed to send a message to the user.
    // Previously reported items have already been removed, and the items
    // we found have been added to the cache.
    taskLogger.verbose('Searching for new albums')
    const results = await runVGMRipsSearch()

    // Now we just send these results to every channel we configured.
    if (results.length) {
      taskLogger.verbose(`Found ${results.length} new item(s)`)
      target.forEach(t => reportResults(t[0], t[1], results))
    }
  }
  catch (err) {
    const taskLogger = getTaskLogger(id)
    taskLogger.error('An error occurred while searching for new releases', `${err.stack}`)
  }
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item)))
}

/**
 * Returns a RichEmbed describing a new item.
 */
const formatMessage = (item) => {
  const embed = new RichEmbed();
  embed.setAuthor('New pack on VGMRips', icon)
  embed.setTitle(embedTitle(item.title))
  embed.setThumbnail(item.image)
  embed.setURL(item.link)
  if (item.chips) {
    embed.addField('Chip', item.chips.join(', '))
  }
  if (item.systems) {
    embed.addField('System', item.systems.join(', '))
  }
  if (item.composers) {
    embed.addField('Composer', item.composers.join(', '))
  }
  //embed.addField('Size', item.download.size)
  embed.setColor(color)
  embed.setTimestamp(new Date())
  return embed
}
