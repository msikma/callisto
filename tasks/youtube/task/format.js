// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { basename } = require('path')
const { getFormattedTimestamp, getTimeAgo } = require('callisto-core/util/time')

const { info } = require('../info')

/**
 * Formats a RichEmbed to post to Discord.
 * 
 * An item has the following format:
 * 
 *   { videoID: 'yx8FDoIaTDg',
 *     title: 'video title **optionally with markdown**',
 *     description: 'video description **optionally with markdown**',
 *     url: 'https://www.youtube.com/watch?v=yx8FDoIaTDg',
 *     meta:
 *      { published: '1 week ago',
 *        length: '1:27:58',
 *        views: '1,350 views' },
 *     image:
 *      { url: 'https://i.ytimg.com/vi/filename',
 *        width: 168,
 *        height: 94 },
 *     author:
 *      { name: 'username',
 *        url: 'https://www.youtube.com/user/username',
 *        image:
 *         { url: 'https://i.ytimg.com/vi/filename',
 *           width: 168,
 *           height: 94 } } }
 * 
 * It's possible for 'description', 'author.image' and 'meta.length' to be null.
 */
const formatMessage = (item, { searchQuery, slug, subFile }) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New Youtube video ${searchQuery ? 'search result ' : ''}by ${item.author.name}`, item.author.image ? item.author.image.url : info.icon)
  embed.setURL(item.url)

  if (item.title)
    embed.setTitle(item.title)
  if (item.description)
    embed.setDescription(item.description)
  if (item.meta.published)
    embed.addField('Published', `${getFormattedTimestamp(item.meta.publishedExact)} (${getTimeAgo(item.meta.publishedExact)})`, false)
  if (item.meta.views)
    embed.addField('Views', `${item.meta.views === '0 views' ? 'No views' : item.meta.views}`, true)
  if (item.meta.length)
    embed.addField('Length', item.meta.length, true)

  if (item.author.image)
    embed.setThumbnail(encodeURI(item.author.image.url))
  if (item.image)
    embed.setImage(encodeURI(item.image.url))
  
  if (subFile)
    embed.setFooter(`Sourced from subscriptions file: ${basename(subFile)}`)
  if (searchQuery)
    embed.setFooter(`Searched for keyword: ${searchQuery}`)
  
  return embed
}

module.exports = {
  formatMessage
}
