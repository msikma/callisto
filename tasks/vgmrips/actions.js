/**
 * Calypso - calypso-task-vgmrips <https://github.com/msikma/calypso>
 * © MIT license
 */

import { RichEmbed } from 'discord.js'

import { getTaskLogger } from 'calypso-core/logging'
import { isTemporaryError } from 'calypso-request'
import { sendMessage } from 'calypso-core/responder'
import { embedTitle } from 'calypso-misc'
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
    taskLogger.debug('Searching for new albums')
    const results = await runVGMRipsSearch()

    // Now we just send these results to every channel we configured.
    if (results.length) {
      taskLogger.debug(`Found ${results.length} new item(s)`)
      target.forEach(t => reportResults(t[0], t[1], results))
    }
  }
  catch (err) {
    const taskLogger = getTaskLogger(id)
    if (isTemporaryError(err)) {
      taskLogger.debug(`Temporary network error (${err.code}) while searching for new releases`)
    }
    else {
      taskLogger.error('An error occurred while searching for new releases', `${err.stack}`)
    }
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
