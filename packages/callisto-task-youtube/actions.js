/**
 * Callisto - callisto-task-youtube <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import path from 'path'

import logger from 'callisto-util-logging'
import { config } from 'callisto-util-misc/resources'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription } from 'callisto-util-misc'
import { findNewSubscriptionVideos, findNewSearchVideos } from './search'
import { readSubscriptions } from './util'
import { color } from './index'

const ICON = 'https://i.imgur.com/rAFBjZ4.jpg'

/**
 * Main entry point for this task.
 * Find new videos in Youtube searches and subscriptions.
 */
export const actionSearchUpdates = (discordClient, user, taskConfig) => {
  taskConfig.subscriptions.forEach(async taskData => parseSubscriptionTask(taskData))
  taskConfig.searches.forEach(async taskData => parseSearchTask(taskData))
}

/**
 * Find new subscription videos.
 */
const parseSubscriptionTask = async (accountData) => {
  const subscriptionsFile = accountData.subscriptions
  const subscriptionData = await readSubscriptions(subscriptionsFile, accountData.slug)
  logger.debug(`youtube: ${accountData.slug}: Iterating through subscriptions`)
  const subscriptions = subscriptionData.opml.body[0].outline[0].outline.map(n => n.$)

  const updates = []

  for (const sub of subscriptions) {
    const { title, xmlUrl } = sub
    try {
      // Pass on the 'slug' from the account data, which we'll use for caching.
      const results = await findNewSubscriptionVideos(xmlUrl, accountData.slug)
      if (results.length) {
        logger.silly(`youtube: ${path.basename(subscriptionsFile)}: channel: ${title}: found ${results.length} new ${results.length === 1 ? 'item' : 'items'}`)
        updates.push({ target: accountData.target, results, subscriptionsFile })
      }
    }
    catch (err) {
      // Sometimes the RSS parser complains if it can't find any items.
      // Also, occasionally a request will fail for some reason. E.g. if the channel disappeared.
      // Only report an error if it's something else.
      const badStatusCode = String(err).indexOf('Bad status code') > 0
      if (err !== 'no articles' && !badStatusCode) {
        logger.error(`youtube: ${path.basename(subscriptionsFile)}: channel: ${title}: An error occurred while scraping subscription videos\n\n${err.stack}`)
      }
    }
  }

  // Post all updates we've gathered.
  if (updates.length) {
    logger.debug(`youtube: ${accountData.slug}: Posting ${updates.length} new ${updates.length === 1 ? 'item' : 'items'}`)
    updates.forEach(update =>
      update.target.forEach(t => reportResults(t[0], t[1], update.results, update.subscriptionsFile))
    )
  }
}

/**
 * Find new videos from a search task.
 */
const parseSearchTask = async (searchData) => {
  const { slug, searchParameters, searchQuery, target } = searchData
  logger.debug(`youtube: ${searchQuery} (${slug}): Running Youtube search`)
  const results = await findNewSearchVideos(searchParameters, searchQuery, slug)
  if (results.length) {
    logger.debug(`youtube: ${searchQuery} (${slug}): Posting ${results.length} ${results.length === 1 ? 'item' : 'items'}`)
    target.forEach(t => reportResults(t[0], t[1], results, null, searchQuery))
  }
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, file, query) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, file, query)))
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
 */
const formatMessage = (item, file = '', query = '') => {
  const embed = new RichEmbed();
  embed.setAuthor(`New Youtube video by ${item.author}`, ICON)
  if (item.title) embed.setTitle(embedTitle(item.title))
  if (item.description && item.description !== item.title) {
    embed.setDescription(embedDescription(shortenDescription(item.description)))
  }
  if (item.views) embed.addField('Views', `${item.views === '0' ? 'No views' : item.views}`)
  if (item.duration) embed.addField('Duration', `${item.duration}`)
  if (item.imageURL) embed.setImage(item.imageURL)
  if (item.link) embed.setURL(item.link)

  embed.setColor(color)

  // Include the source of this video.
  if (file && !query) {
    embed.setFooter(`Sourced from subscriptions file: ${path.basename(file)}`)
  }
  if (query && !file) {
    embed.setFooter(`Searched for keyword: ${query}`)
  }
  return embed
}
