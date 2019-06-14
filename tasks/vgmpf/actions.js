/**
 * Calypso - calypso-task-vgmpf <https://github.com/msikma/calypso>
 * © MIT license
 */

import { RichEmbed } from 'discord.js'

import { getTaskLogger } from 'calypso-core/src/logging'
import { isTemporaryError } from 'calypso-request'
import { sendMessage } from 'calypso-core/src/responder'
import { embedTitle } from 'calypso-misc'
import { runVGMPFSearch } from './search'
import { id, color, icon } from './index'

/**
 * Runs VGMPF searches.
 */
export const actionRecentReleases = async (discordClient, user, taskConfig) => {
  try {
    const taskLogger = getTaskLogger(id)
    const { target } = taskConfig
    const results = await runVGMPFSearch()
    if (results.length > 0) {
      taskLogger.debug(`Posting new update`)
    }
    target.forEach(t => reportResults(t[0], t[1], results))
  }
  catch (err) {
    const taskLogger = getTaskLogger(id)
    if (isTemporaryError(err)) {
      taskLogger.debug(`Temporary network error (${err.code}) while searching for updates`)
    }
    else {
      taskLogger.error('An error occurred while searching for updates', `${err.stack}`)
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
  embed.setAuthor('New soundtrack on VGMPF', icon)
  embed.setTitle(embedTitle(item.title))
  if (item.platform) {
    embed.addField('Platform', item.platform, true)
  }
  embed.setThumbnail(encodeURI(item.image))
  embed.setURL(item.link)
  embed.setTimestamp()
  embed.setFooter('From the Video Game Music Preservation Foundation Wiki')
  embed.setColor(color)
  return embed
}