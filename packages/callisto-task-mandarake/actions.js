/**
 * Callisto - callisto-task-mandarake <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import { mainCategories, shops } from 'mdrscr'
import { uniq } from 'lodash'

import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle } from 'callisto-util-misc'
import { logger } from 'callisto-util-logging'
import { runMandarakeSearch, runMandarakeAuctionSearch } from './search'
import { color, colorAuctions } from './index'

// List of shops and categories by their codes.
const shopsByCode = {
  en: Object.values(shops).reduce((acc, shop) => ({ ...acc, [shop[0]]: shop[1] }), {}),
  ja: Object.values(shops).reduce((acc, shop) => ({ ...acc, [shop[0]]: shop[2] }), {})
}
const categoriesByCode = {
  en: Object.values(mainCategories).reduce((acc, cat) => ({ ...acc, [cat[0]]: cat[1] }), {}),
  ja: Object.values(mainCategories).reduce((acc, cat) => ({ ...acc, [cat[0]]: cat[2] }), {})
}

// URL to the Mandarake icons: for the main site, and the auction site.
const MANDARAKE_MAIN_ICON = 'https://i.imgur.com/30I7Ir1.png'
const MANDARAKE_EKIZO_ICON = 'https://i.imgur.com/KsL3wSY.png'

/**
 * Runs Mandarake searches.
 */
export const actionRunSearches = (discordClient, user, taskConfig) => {
  // Runs the main searches.
  taskConfig.main.searches.forEach(async ({ details, target, lang }) => {
    // Only perform the search if the details have been set.
    if (!details) return false
    const msgTarget = target ? target : taskConfig.main.defaultTarget
    const msgLang = lang ? lang : taskConfig.main.defaultLang
    const searchDetails = { ...taskConfig.main.defaultDetails, ...details }

    try {
      const results = await runMandarakeSearch(searchDetails, msgLang)

      // Now we just send these results to every channel we configured.
      //msgTarget.forEach(t => reportResults(t[0], t[1], results, searchDetails, 'main'))
    }
    catch (err) {
      logger.error(`mandarake: Caught error during search`)
      logger.error(err.stack)
      logger.error(`mandarake: Associated search:`)
      logger.error(searchDetails)
    }
  })

  // Runs the auction searches.
  taskConfig.auction.searches.forEach(async ({ details, target }) => {
    if (!details) return false
    const msgTarget = target ? target : taskConfig.auction.defaultTarget
    const searchDetails = { ...taskConfig.auction.defaultDetails, ...details }
    try {
      const results = await runMandarakeAuctionSearch(searchDetails)
      msgTarget.forEach(t => reportResults(t[0], t[1], results, searchDetails, 'auction'))
    }
    catch (err) {
      logger.error(`mandarake: Caught error during search`)
      logger.error(err.stack)
      logger.error(`mandarake: Associated search:`)
      logger.error(searchDetails)
    }
  })
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, search, type) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, search, type)))
}

/**
 * Returns a RichEmbed describing a new item.
 */
const formatMessage = (item, searchDetails, type, fields = ['price', 'category', 'adult']) => {
  if (type === 'main') return formatMessageMain(item, searchDetails, fields)
  if (type === 'auction') return formatMessageAuction(item, searchDetails, fields)
}

const formatMessageMain = (item, searchDetails, fields) => {
  const embed = new RichEmbed();
  embed.setAuthor('New item found on Mandarake', MANDARAKE_MAIN_ICON)
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

const formatMessageAuction = (item, searchDetails, fields) => {
  const embed = new RichEmbed();
  embed.setAuthor('New item found on Mandarake Auctions', MANDARAKE_EKIZO_ICON)
  if (fields.indexOf('price') !== -1) {
    embed.addField('Current price', `¥${item.currentPrice} (±€${(item.currentPrice / 125).toFixed(2)})`)
  }

  const daysLeft = `${item.timeLeft.days} day${item.timeLeft.days !== 1 ? 's' : ''}`
  const hoursLeft = `${item.timeLeft.hours} hour${item.timeLeft.hours !== 1 ? 's' : ''}`
  const minutesLeft = `${item.timeLeft.minutes} minute${item.timeLeft.minutes !== 1 ? 's' : ''}`
  const timeLeftBits = [
    ...(item.timeLeft.days > 0 ? [daysLeft] : []),
    ...(item.timeLeft.hours > 0 ? [hoursLeft] : []),
    ...(item.timeLeft.minutes > 0 ? [minutesLeft] : []),
  ]
  const timeLeft = timeLeftBits.length === 3
    ? `${timeLeftBits.slice(0, 1)[0]}, ${timeLeftBits.slice(1, 3).join(' and ')}`
    : (timeLeftBits.length === 2 ? timeLeftBits.join(' and ') : timeLeftBits[0])

  embed.addField('Time left', timeLeft)
  if (fields.indexOf('store') !== -1) {
    embed.addField('Store', shopsByCode.en[item.shopCode])
  }
  if (fields.indexOf('category') !== -1) {
    embed.addField('Category', uniq(item.categories.map(c => c.name)).join(' > '))
  }
  if (fields.indexOf('itemno') !== -1) {
    embed.addField('Item no.', `${item.itemNo}`)
  }

  embed.setImage(item.image)
  embed.setURL(item.link)
  embed.setColor(colorAuctions)
  embed.setTitle(embedTitle(item.title))
  embed.setFooter(`Searched for keyword "${searchDetails.q}"`)
  return embed
}
