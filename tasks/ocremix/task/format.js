// Callisto - callisto-task-ocremix <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { attachRemoteImage, embedTitle } = require('callisto-core/util/richembed')

const { info } = require('../info')

/**
 * Returns a RichEmbed to post to Discord.
 * 
 * Formats a message for either a new track or a new album.
 */
const formatMessage = (item, type) => {
  if (type === 'tracks') {
    return formatMessageTrack(item)
  }
  else if (type === 'albums') {
    return formatMessageAlbum(item)
  }
  else {
    return null
  }
}

/**
 * Formats a RichEmbed for a new track.
 * 
 *   { title: 'Teenage Mutant Ninja Koopa',
 *     id: 'remixOCR04085',
 *     image: 'https://ocremix.org/thumbs/500/files/images/games/n64/0/paper-mario-n64-title-80726.png',
 *     link: 'https://ocremix.org/remix/OCR04085',
 *     published: 2020-06-17T22:00:00.000Z,
 *     game:
 *      { name: 'Paper Mario',
 *        link: 'https://ocremix.org/game/3070/paper-mario-n64' },
 *     artists: [ 'jnWake', 'UV Sir J', 'XPRTNovice' ] }
 */
const formatMessageTrack = (item) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New track on OverClocked ReMix`, info.icon)
  embed.setTitle(embedTitle(item.title))
  embed.setThumbnail(item.image)
  embed.setURL(item.link)
  if (item.game.name) embed.addField('Game', `[${item.game.name}](${item.game.link})`, true)
  if (item.artists) embed.addField(`Artist`, item.artists.join(', '), true)
  embed.setTimestamp(item.published)
  return embed
}

/**
 * Formats a RichEmbed for a new album.
 * 
 *   { title: 'Shonen ReMix Jump!',
 *     id: 'Shonen-ReMix-Jump',
 *     published: 2020-02-27T00:00:00.000Z,
 *     image: 'https://ocremix.org/thumbs/500/files/images/albums/5/6/95-236.png',
 *     link: 'https://ocremix.org/album/95/shonen-remix-jump' }
 */
const formatMessageAlbum = (item) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New album on OverClocked ReMix`, info.icon)
  embed.setTitle(embedTitle(item.title))
  if (item.image) {
    attachRemoteImage(embed, item.image)
  }
  embed.setURL(item.link)
  embed.setTimestamp(item.published)
  return embed
}

module.exports = {
  formatMessage
}
