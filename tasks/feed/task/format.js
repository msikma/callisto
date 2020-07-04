// Callisto - callisto-task-feed <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { attachRemoteImage } = require('callisto-core/util/richembed')
const { embedTitle, embedDescription } = require('callisto-core/util/richembed')

const { info } = require('../info')

/**
 * Formats a RichEmbed to post to Discord.
 * 
 * An item contains all standard RSS/Atom item fields, plus these:
 * 
 *   { id: '(unique id)',
 *     _images: [ 'http://example.com/image.jpg', 'http://example.com/image2.jpg' ],
 *     _bestImage: 'http://example.com/image.jpg',
 *     _description: 'Description in Markdown' }
 */
const formatMessage = (item, { feedName, feedURL, color, thumbnail }) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New update from ${feedName}`, info.icon)
  embed.setTitle(embedTitle(item.title))
  embed.setDescription(embedDescription(item._description))
  embed.setURL(item.link)
  if (item._bestImage) {
    attachRemoteImage(embed, item._bestImage)
  }
  if (thumbnail) {
    embed.setThumbnail(encodeURI(thumbnail))
  }

  // Additional fields that might be present.
  if (item.comments) {
    embed.addField('Comments', item.comments, false)
  }
  if (item.categories) {
    embed.addField('Categories', item.categories.join(', '), false)
  }

  embed.setColor(color != null ? color : info.color)
  embed.setTimestamp(item.pubDate)
  return embed
}

module.exports = {
  formatMessage
}
