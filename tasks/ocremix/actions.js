/**
 * Calypso - calypso-task-ocremix <https://github.com/msikma/calypso>
 * © MIT license
 */

import { RichEmbed } from 'discord.js'

import { getTaskLogger } from 'calypso-core/logging'
import { sendMessage, sendTemporaryError } from 'calypso-core/responder'
import { isTemporaryError } from 'calypso-request'
import { embedTitle, embedDescription, getFormattedDate } from 'calypso-misc'
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
    taskLogger.debug(`Found ${tracks.length} new track${tracks.length !== 1 ? 's' : ''} and ${albums.length} new album${albums.length !== 1 ? 's' : ''}`)

    if (tracks.length) {
      taskConfig.tracks.target.forEach(t => reportResults(t[0], t[1], tracks, 'track'))
    }

    if (albums.length) {
      taskConfig.albums.target.forEach(t => reportResults(t[0], t[1], albums, 'album'))
    }
  }
  catch (err) {
    const taskLogger = getTaskLogger(id)
    if (isTemporaryError(err)) {
      sendTemporaryError(taskLogger, err)
    }
    else {
      taskLogger.error(`Error occurred while scraping:\n\n${err.stack}`)
    }
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
  embed.setThumbnail(encodeURI(item.image))
  embed.setURL(item.link)
  if (item.artists) embed.addField(`Author${item.artists.length !== 1 ? 's' : ''}`, item.artists.join(', '))
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
  embed.setImage(encodeURI(item.image))
  embed.setURL(item.link)
  embed.setFooter(`Published on ${getFormattedDate(item.pubDate)}`)
  embed.setTimestamp()
  embed.setColor(color)
  return embed
}
