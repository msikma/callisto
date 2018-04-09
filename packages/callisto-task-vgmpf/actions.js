/**
 * Callisto - callisto-task-vgmpf <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle } from 'callisto-util-misc'
import { runVGMPFSearch } from './search'
import { color } from './index'

const VGMPF_URL = 'http://www.vgmpf.com/Wiki/index.php?title=Main_Page'

// URL to the VGMPF icon.
const VGMPF_ICON = 'https://i.imgur.com/C9kyOuE.png'

/**
 * Runs VGMPF searches.
 */
export const actionRecentReleases = async (discordClient, user, taskConfig) => {
  // Default search parameters.
  const { target } = taskConfig

  // 'result' contains everything needed to send a message to the user.
  // Previously reported items have already been removed, and the items
  // we found have been added to the cache.
  const results = await runVGMPFSearch(VGMPF_URL)

  // Now we just send these results to every channel we configured.
  target.forEach(t => reportResults(t[0], t[1], results))
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
  embed.setAuthor('New soundtrack on VGMPF', VGMPF_ICON)
  embed.setTitle(embedTitle(item.title))
  embed.setThumbnail(item.image)
  embed.setURL(item.link)
  embed.setFooter('From the Video Game Music Preservation Foundation Wiki')
  embed.setColor(color)
  return embed
}
