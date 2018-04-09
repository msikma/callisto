/**
 * Callisto - callisto-task-vgmpf <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import logger from 'callisto-util-logging'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle } from 'callisto-util-misc'
import { runVGMPFSearch } from './search'
import { color } from './index'

// URL to the VGMPF icon.
const ICON = 'https://i.imgur.com/C9kyOuE.png'

/**
 * Runs VGMPF searches.
 */
export const actionRecentReleases = async (discordClient, user, taskConfig) => {
  try {
    const { target } = taskConfig
    const results = await runVGMPFSearch()
      logger.debug(`vgmpf: Posting new update`)
    target.forEach(t => reportResults(t[0], t[1], results))
  }
  catch (err) {
    logger.error('vgmpf: An error occurred while searching for updates')
    logger.error(err.stack)
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
  embed.setAuthor('New soundtrack on VGMPF', ICON)
  embed.setTitle(embedTitle(item.title))
  embed.setThumbnail(item.image)
  embed.setURL(item.link)
  embed.setFooter('From the Video Game Music Preservation Foundation Wiki')
  embed.setColor(color)
  return embed
}
