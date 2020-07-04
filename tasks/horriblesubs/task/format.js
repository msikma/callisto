// Callisto - callisto-task-horriblesubs <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { attachRemoteImage } = require('callisto-core/util/richembed')

const { info } = require('../info')

/**
 * Formats a RichEmbed to post to Discord.
 * 
 * An item has the following format:
 * 
 *   { title: 'One Piece 929',
 *     showTitle: 'One Piece',
 *     showURL: 'https://horriblesubs.info/shows/one-piece/',
 *     episodeTitle: 'Full title here',
 *     episodeNumber: 929,
 *     episodeTitle: 'Episode 929',
 *     episodeImage:
 *      { url: 'https://...',
 *        name: 'Episode_929.png' },
 *     resolution: 1080,
 *     communityWikiURL: 'https://onepiece.fandom.com/wiki/Episode_929',
 *     magnetLink: 'magnet:?xt=urn:btih:...',
 *     torrentLink: 'https://nyaa.si/view/1234/torrent',
 *     id: 'horriblesubs:one-piece$929',
 *     hasCommunityInfo: true,
 *     needsCommunityInfo: true }
 */
const formatMessage = (item, { showName, showCommunityWiki, showLogo }) => {
  const embed = new RichEmbed()
  embed.setAuthor(`New episode of ${item.showTitle} on HorribleSubs`, info.icon)
  embed.setURL(item.showURL)

  if (showLogo) {
    embed.setThumbnail(encodeURI(showLogo))
  }
  
  if (item.episodeImage) {
    attachRemoteImage(embed, item.episodeImage.url, item.episodeImage.name)
  }

  if (item.episodeTitle)
    embed.setTitle(`**${item.title}** - ${item.episodeTitle}`)
  if (item.torrentLink)
    embed.addField('Links', `• [Torrent link](${item.torrentLink}) (${item.resolution}p)${item.communityWikiURL ? `\n• [Community wiki page](${item.communityWikiURL})` : ''}`, false)
  
  return embed
}

module.exports = {
  formatMessage
}
