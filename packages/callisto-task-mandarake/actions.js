/**
 * Callisto - callisto-task-mandarake <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import { categories, shops } from 'mdrscr'

import { sendMessage, test } from 'callisto-discord-interface/src/responder'
import { embedTitle } from 'callisto-util-misc'
import { logger } from 'callisto-util-logging'
import { runMandarakeSearch } from './search'
import { color } from './index'

// List of shops and categories by their codes.
const shopsByCode = {
  en: Object.values(shops).reduce((acc, shop) => ({ ...acc, [shop[0]]: shop[1] }), {}),
  ja: Object.values(shops).reduce((acc, shop) => ({ ...acc, [shop[0]]: shop[2] }), {})
}
const categoriesByCode = {
  en: Object.values(categories).reduce((acc, cat) => ({ ...acc, [cat[0]]: cat[1] }), {}),
  ja: Object.values(categories).reduce((acc, cat) => ({ ...acc, [cat[0]]: cat[2] }), {})
}

// URL to the Mandarake icon.
const MANDARAKE_ICON = 'https://i.imgur.com/30I7Ir1.png'

/**
 * Runs Mandarake searches.
 */
export const actionRunSearches = (discordClient, user, taskConfig) => {
  // Default search parameters.
  const { defaultDetails, defaultTarget, defaultLang } = taskConfig

  // Run through each of our searches and fire off a query.
  taskConfig.searches.forEach(async ({ details, target, lang }) => {
    // Only perform the search if the details have been set.
    if (!details) return false
    const msgTarget = target ? target : defaultTarget
    const msgLang = lang ? lang : defaultLang
    const searchDetails = { ...defaultDetails, ...details }

    try {
      const results = await runMandarakeSearch(searchDetails, msgLang)

      // Now we just send these results to every channel we configured.
      msgTarget.forEach(t => reportResults(t[0], t[1], results, searchDetails))
    }
    catch (err) {
      logger.error(`mandarake: Caught error during search at ${new Date().toString()}:`)
      logger.error(err)
      logger.error(`mandarake: Associated search:`)
      logger.error(searchDetails)
    }
  })
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, search) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, search)))
}

/**
 * Returns a RichEmbed describing a new item.
 */
const formatMessage = (item, searchDetails, fields = ['price', 'category', 'adult']) => {
  const embed = new RichEmbed();
  embed.setAuthor('New item found on Mandarake', MANDARAKE_ICON)
  if (fields.indexOf('price') !== -1) {
    embed.addField('Price', `¥${item.price} (±€${(item.price / 125).toFixed(2)})`)
  }
  if (fields.indexOf('stock') !== -1) {
    embed.addField('In stock', `${item.inStock ? 'Yes' : 'No'}${item.inStoreFront ? ' (store front item)' : ''}`)
  }
  if (fields.indexOf('store') !== -1) {
    embed.addField('Store', shopsByCode.en[item.shopCode])
  }
  if (fields.indexOf('category') !== -1) {
    embed.addField('Category', categoriesByCode.en[searchDetails.categoryCode])
  }
  if (fields.indexOf('itemno') !== -1) {
    embed.addField('Item no.', `${item.itemNo[0]} (${item.itemNo[1]})`)
  }
  if (fields.indexOf('adult') !== -1 && item.isAdult) {
    embed.addField('Rating', 'Adult product')
  }

  embed.setImage(item.image)
  embed.setURL(item.link)
  embed.setColor(color)
  embed.setTitle(embedTitle(item.title))
  embed.setFooter(`Searched for keyword "${searchDetails.keyword}"`)
  return embed
}
