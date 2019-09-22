// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const path = require('path')
const { taskLogger } = require('callisto-logging')
const { isTempError } = require('callisto-request')
const { postMessage } = require('callisto-core')
const { addDefaults, wrapStack } = require('callisto-util')

const { findSubVideos, findSearchVideos } = require('./search')
const { readSubFile } = require('./util')
const { taskInfo } = require('./index')

const log = taskLogger(taskInfo)

/** Searches for new videos from search results. */
const taskSearchVideos = (taskConfig, discordClient, user) => (
  taskConfig.searches.map(async taskData => runSearchTask(taskData, taskConfig))
)

/** Searches for new videos from subscriptions. */
const taskSubVideos = (taskConfig) => (
  taskConfig.subscriptions.map(async taskData => runSubTask(taskData, taskConfig))
)

/** Checks a search term for new video results on Youtube. */
const runSearchTask = async (taskData, taskConfig) => {
  const { slug, searchParameters, searchQuery, target } = addDefaults(taskData, taskConfig)
}

/** Checks a list of accounts from a subscriptions file for new videos. */
const runSubTask = async (taskData, taskConfig) => {
  // Extract data from subscriptions.
  const { slug, subscriptions, target } = addDefaults(taskData, taskConfig)
  const subList = await readSubFile(subscriptions, slug)
  const subBase = path.basename(subscriptions)
  log.debug(`${slug}`, `Iterating through ${subList.length} subscription${subList.length === 1 ? '' : 's'}`)

  const updates = []

  for (const sub of subList) {
    const { title, xmlUrl } = sub
    try {
      const results = await findSubVideos(xmlUrl, slug)
      if (results.length) {
        log.silly(`${subBase} - Channel: ${title}`, `Found ${results.length} new result${results.length === 1 ? '' : 's'}`)
        updates.push({ target, results, subscriptions })
      }
    }
    catch (err) {
      if (isTempError(err)) continue
      log.error('An error occurred while scraping subscription videos', wrapStack(err.stack), [['File', subBase], ['Channel', title]])
    }
  }

  // Post all updates we've gathered.
  if (updates.length) {
    log.debug(`${slug}`, `Posting ${results.length} new item${results.length === 1 ? '' : 's'}`)
    postRichItems(updates, formatMessage)
    updates.forEach(update =>
      update.target.forEach(t => reportResults(t[0], t[1], update.results, update.subscriptionsFile))
    )
  }
}

const postRichItems = (items, formatter) => {
  items.forEach(item => item.target.forEach(target => postRichEmbed(target[0], target[1], null, formatter(item))))
}

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
const formatMessage = (messageData) => {
  const { item, file = '', query = '' } = messageData
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
    embed.setFooter(`Sourced from subscriptions file: ${path.basename(file)}`)
  }
  if (query && !file) {
    embed.setFooter(`Searched for keyword: ${query}`)
  }
  return embed
}

module.exports = {
  taskSearchVideos,
  taskSubVideos
}
