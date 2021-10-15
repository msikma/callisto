// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { basename } = require('path')
const { embedTitle, embedDescription } = require('callisto-core/util/richembed')
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
 *      { publishedExact: 2020-03-03T00:00:00.000Z,
 *        published: '1 week ago',
 *        isPublished: true,
 *        isScheduled: false,
 *        isPremiering: false,
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
    embed.setTitle(embedTitle(item.title))
  if (item.description)
    embed.setDescription(embedDescription(item.description))
  if (item.meta.isPublished && item.meta.published)
    embed.addField('Published', `${item.meta.published}`, false)
  if (item.meta.isScheduled && item.meta.publishedExact)
    embed.addField('Scheduled for', `${getFormattedTimestamp(item.meta.publishedExact)} (${getTimeAgo(item.meta.publishedExact)})`, false)
  if (item.meta.isPremiering)
    embed.addField('Premiere', `Premiere in progress`, false)
  if (item.meta.publishedExact)
    embed.setTimestamp(item.meta.publishedExact)
  if (item.meta.views && item.meta.isPublished)
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
