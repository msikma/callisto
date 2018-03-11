/**
 * Callisto - callisto-task-youtube <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import xml2js from 'xml2js'
import fs from 'fs'

import { config } from 'callisto-discord-interface/src/resources'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { findNewVideos } from './search'
import { color } from './index'

// URL to the Youtube icon.
const YOUTUBE_ICON = 'https://i.imgur.com/rAFBjZ4.jpg'

// XML parser.
const parser = new xml2js.Parser();

/**
 * Parses the subscriptions XML file.
 */
const readSubscriptions = (url) => (
  new Promise((resolve, reject) => {
    parser.reset()
    fs.readFile(url, (errFs, data) => {
      parser.parseString(data, (errParse, result) => {
        if (errFs || errParse) return reject(errFs, errParse, result)
        return resolve(result)
      });
    });
  })
)

/**
 * Find new videos in Youtube subscriptions.
 */
export const actionSubscriptionUpdates = (discordClient, user, taskConfig) => {
  // Default search parameters.
  taskConfig.accounts.forEach(async accountData => {
    const subscriptionsFile = accountData.subscriptions.replace('<%base%>', config.CALLISTO_BASE_DIR)
    const subscriptionData = await readSubscriptions(subscriptionsFile)
    const subscriptions = subscriptionData.opml.body[0].outline[0].outline.map(n => n.$)

    for (const sub of subscriptions) {
      const { title, xmlUrl } = sub
      try {
        // Pass on the 'slug' from the account data, which we'll use for caching.
        const results = await findNewVideos(xmlUrl, accountData.slug)
        accountData.target.forEach(t => reportResults(t[0], t[1], results, title))
      }
      catch (err) {
        // Nothing. Sometimes the RSS parser complains if it can't find any items.
      }
    }
  })
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, title) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, title)))
}

/**
 * Returns a RichEmbed describing a new item.
 */
const formatMessage = (item, title) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New Youtube video by ${item.author}`, YOUTUBE_ICON)
  embed.setTitle(item.title)
  embed.setImage(item.image.url)
  embed.setURL(item.link)
  embed.setColor(color)
  return embed
}
