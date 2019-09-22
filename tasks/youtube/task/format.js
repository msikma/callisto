// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { basename } = require('path')

const { taskInfo } = require('../index')

/**
 * Returns a RichEmbed describing a new found item.
 * This is used for both videos from subscription files, and videos from searches.
 *
 * For search results, the data contains this data:
 *
 *    { id: 'yt:video-search:_H625wvhY9k',
 *      link: 'https://www.youtube.com/watch?v=_H625wvhY9k',
 *      title: '前面展望  一畑電車北松江線 (急行) 松江しんじ湖温泉 → 電鉄出雲市',
 *      author: 'Author name',
 *      views: '620 views',
 *      channelThumbnail: 'http://url.com/img',
 *      movingThumbnail: 'http://url.com/img',
 *      uploadTime: '2 weeks ago',
 *      description: '松江しんじ湖温泉駅構内 2018.06.14（木）17時26分頃から撮影 3:18〜 ',
 *      imageURL: 'https://i.ytimg.com/vi/_H625wvhY9k/hqdefault.jpg?sqp=-oaymwEZCNACELwBSFXyq4qpAwsIARUAAIhCGAFwAQ==&rs=AOn4CLDawp0-hU2xM6pVLmoykPdZbh8Kmg',
 *      duration: '51:00',
 *      durationAria: '51 minutes',
 *      is4K: true }
 */
const formatMessage = ({ item, file = '', query = '' }) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New Youtube video by ${item.author}`, taskInfo.icon)
  if (item.title) embed.setTitle(embedTitle(item.title))
  if (item.description && item.description !== item.title) {
    embed.setDescription(embedDescription(shortenDescription(item.description)))
  }
  if (item.views) embed.addField('Views', `${item.views === '0' ? 'No views' : item.views}`, true)
  if (item.duration) embed.addField('Duration', `${item.duration}`, true)
  if (item.is4K) embed.addField('Quality', `4K`, true)
  if (item.imageURL) embed.setImage(encodeURI(item.imageURL))
  if (item.link) embed.setURL(item.link)
  if (item.channelThumbnail) embed.setThumbnail(encodeURI(item.channelThumbnail))

  embed.setColor(taskInfo.color)
  embed.setTimestamp()

  // Include the source of this video.
  if (file && !query) {
    embed.setFooter(`Sourced from subscriptions file: ${basename(file)}`)
  }
  if (query && !file) {
    embed.setFooter(`Searched for keyword: ${query}`)
  }
  return embed
}

// TODO: MOVE TO UTILS
/**
 * Reduces the length of a description. Most Youtube descriptions are gigantic.
 * We try to reduce them to a specific paragraph.
 */
const shortenDescription = (desc, maxLength = 400, errorRatio = 100) => {
  // Low and high end.
  const low = maxLength - errorRatio
  const high = maxLength + errorRatio

  // If str is already within tolerance, leave it.
  if (desc.length < high) {
    return desc
  }
  // Split into paragraphs, then keep removing one until we reach the tolerance point.
  // If we accidentally go too low, making a description that is too short,
  // we'll instead add a paragraph back on and cull the description with an ellipsis.
  const bits = desc.split('\n\n')
  let item
  while ((item = bits.pop()) != null) {
    const remainder = bits.join('\n\n')
    if (remainder.length < high && remainder.length > low) {
      // Perfect.
      return `${remainder}\n\n[...]`
    }
    if (remainder.length < high && remainder.length < low) {
      // Too small. TODO: cut off words one at a time instead?
      return `${[remainder, item].join('\n\n').substr(0, maxLength)} [...]`
    }
  }
}

module.exports = {
  formatMessage
}
