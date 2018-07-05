/**
 * Callisto - callisto-task-ocremix <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import { getTaskLogger } from 'callisto-discord-interface/src/logging'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription, getFormattedDate } from 'callisto-util-misc'
import { findNewItems } from './search'
import { id, color, icon } from './index'

/**
 * Find new tracks and albums on OCReMix.
 */
export const actionRemixes = async (discordClient, user, taskConfig) => {
  try {
    const taskLogger = getTaskLogger(id)
    taskLogger.debug(`Searching for new tracks and albums`)
    const { tracks, albums } = await findNewItems()

    if (tracks.length) {
      logger.debug(`Found ${tracks.length} new track(s)`)
      taskConfig.tracks.target.forEach(t => reportResults(t[0], t[1], tracks, 'track'))
    }

    if (albums.length) {
      logger.debug(`Found ${albums.length} new album(s)`)
      taskConfig.albums.target.forEach(t => reportResults(t[0], t[1], albums, 'album'))
    }
  }
  catch (err) {
    const taskLogger = getTaskLogger(id)
    logger.error(`Error occurred while scraping:\n\n${err.stack}`)
  }
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, type) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, type)))
}

/**
 * Returns a RichEmbed describing a new item.
 */
const formatMessage = (item, type) => {
  if (type === 'track') return formatMessageTrack(item)
  if (type === 'album') return formatMessageAlbum(item)
}

/**
 * Returns a RichEmbed for a track.
 */
const formatMessageTrack = (item) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New track on OverClocked ReMix`, icon)
  embed.setTitle(embedTitle(item.title))
  embed.setThumbnail(item.image)
  embed.setURL(item.link)
  if (item.artist.artistName) embed.addField('Author', item.artist.artistName)
  if (item.game.gameName) embed.addField('Game', item.game.gameName)
  embed.setFooter(`Published on ${getFormattedDate(item.pubDate)}`)
  embed.setTimestamp()
  embed.setColor(color)
  return embed
}

/**
 * Returns a RichEmbed for an album.
 */
const formatMessageAlbum = (item) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New album on OverClocked ReMix`, icon)
  embed.setTitle(embedTitle(item.title))
  embed.setImage(item.image)
  embed.setURL(item.link)
  embed.setFooter(`Published on ${getFormattedDate(item.pubDate)}`)
  embed.setTimestamp()
  embed.setColor(color)
  return embed
}
