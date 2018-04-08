/**
 * Callisto - callisto-task-youtube <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import xml2js from 'xml2js'
import fs from 'fs'
import path from 'path'

import logger from 'callisto-util-logging'
import { config } from 'callisto-discord-interface/src/resources'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription } from 'callisto-util-misc'
import { findNewSubscriptionVideos, findNewSearchVideos } from './search'
import { color } from './index'

// URL to the Youtube icon.
const YOUTUBE_ICON = 'https://i.imgur.com/rAFBjZ4.jpg'

// XML parser.
const parser = new xml2js.Parser()

/**
 * Parses the subscriptions XML file.
 */
const readSubscriptions = (url, slug) => (
  new Promise((resolve, reject) => {
    parser.reset()
    logger.debug(`youtube: ${slug}: Reading subscriptions XML file: ${url.replace(config.CALLISTO_BASE_DIR, '')}`)
    fs.readFile(url, (errFs, data) => {
      parser.parseString(data, (errParse, result) => {
        if (errFs || errParse) return reject(errFs, errParse, result)
        return resolve(result)
      });
    });
  })
)

/**
 * Find new subscription videos.
 */
const parseSubscriptionTask = async (accountData) => {
  const subscriptionsFile = accountData.subscriptions.replace('<%base%>', config.CALLISTO_BASE_DIR)
  const subscriptionData = await readSubscriptions(subscriptionsFile, accountData.slug)
  logger.debug(`youtube: ${accountData.slug}: Iterating through subscriptions`)
  const subscriptions = subscriptionData.opml.body[0].outline[0].outline.map(n => n.$)

  const updates = []

  for (const sub of subscriptions) {
    const { title, xmlUrl } = sub
    try {
      // Pass on the 'slug' from the account data, which we'll use for caching.
      const results = await findNewSubscriptionVideos(xmlUrl, accountData.slug)
      updates.push({ target: accountData.target, results, subscriptionsFile })
    }
    catch (err) {
      // Nothing. Sometimes the RSS parser complains if it can't find any items.
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
  const results = await findNewSearchVideos(searchParameters, searchQuery, slug)
  target.forEach(t => reportResults(t[0], t[1], results, null, searchQuery))
}

/**
 * Find new videos in Youtube searches and subscriptions.
 */
export const actionSearchUpdates = (discordClient, user, taskConfig) => {
  taskConfig.subscriptions.forEach(async taskData => parseSubscriptionTask(taskData))
  taskConfig.searches.forEach(async taskData => parseSearchTask(taskData))
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, file, query) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, file, query)))
}

/**
 * Returns a RichEmbed describing a new item.
 */
const formatMessage = (item, file = '', query = '') => {
  const baseFile = file && path.basename(file)
  const embed = new RichEmbed();
  embed.setAuthor(`New Youtube video by ${item.author}`, YOUTUBE_ICON)
  embed.setTitle(embedTitle(item.title))
  if (file && !query) {
    embed.setFooter(`Sourced from subscriptions file: ${baseFile}`)
    embed.setImage(item.image.url)
  }
  if (query && !file) {
    if (item.description) {
      embed.setDescription(embedDescription(item.description))
    }
    embed.setFooter(`Searched for keyword: ${query}`)
    embed.addField('Views', `${item.views}`)
    embed.addField('Duration', `${item.duration}`)
    embed.setImage(item.image)
  }
  embed.setURL(item.link)
  embed.setColor(color)
  return embed
}
