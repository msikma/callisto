/**
 * Calypso - calypso-task-mandarake <https://github.com/msikma/calypso>
 * © MIT license
 */

import { RichEmbed } from 'discord.js'
import { mainCategories, shops } from 'mdrscr'
import { uniq, get } from 'lodash'

import { isTemporaryError } from 'calypso-request'
import { sendMessage } from 'calypso-core/src/responder'
import { embedTitle, wait, objectInspect, removeDefaults } from 'calypso-misc'
import { getTaskLogger } from 'calypso-core/src/logging'
import { runMandarakeSearch, runMandarakeAuctionSearch } from './search'
import { id, color, colorAuctions, icon, iconAuctions } from './index'

// List of shops and categories by their codes.
const shopsByCode = {
  en: Object.values(shops).reduce((acc, shop) => ({ ...acc, [shop[0]]: shop[1] }), {}),
  ja: Object.values(shops).reduce((acc, shop) => ({ ...acc, [shop[0]]: shop[2] }), {})
}
const categoriesByCode = {
  en: Object.values(mainCategories).reduce((acc, cat) => ({ ...acc, [cat[0]]: cat[1] }), {}),
  ja: Object.values(mainCategories).reduce((acc, cat) => ({ ...acc, [cat[0]]: cat[2] }), {})
}

/**
 * Wraps the search code in a single promise.
 */
export const actionRunSearches = async (discordClient, user, taskConfig) => {
  await actionSearch(discordClient, user, taskConfig)
}

/**
 * Runs Mandarake searches. Always resolves.
 */
const actionSearch = async (discordClient, user, taskConfig) => {
  const taskLogger = getTaskLogger(id)
  const mainSearches = get(taskConfig.main, 'searches', [])
  const auctionSearches = get(taskConfig.auction, 'searches', [])

  const mainDefaults = taskConfig.main.defaultDetails

  // Runs the main searches.
  await Promise.all(mainSearches.map(async ({ details, target, lang }, i) => {
    // Only perform the search if the details have been set.
    if (!details) return false
    // Search staggering.
    const waitingTime = i * 5000
    await wait(waitingTime)
    const msgTarget = target ? target : taskConfig.main.defaultTarget
    const msgLang = lang ? lang : taskConfig.main.defaultLang
    const searchDetails = { ...mainDefaults, ...details }
    const searchInfo = objectInspect(removeDefaults(searchDetails, mainDefaults), true)

    try {
      const { search, newItems } = await runMandarakeSearch(searchDetails, msgLang)
      taskLogger.debug(searchDetails.keyword, `Searched main: ${searchInfo} - wait: ${waitingTime}, entries: ${search.entryCount}, url: <${search.url}>`)

      // Now we just send these results to every channel we configured.
      msgTarget.forEach(t => reportResults(t[0], t[1], newItems, searchDetails, 'main'))
    }
    catch (err) {
      if (isTemporaryError(err)) {
        taskLogger.debug(searchDetails.keyword, `Ignored temporary error during regular search: ${searchInfo} - Error: ${err.code}`)
      }
      else {
        taskLogger.error(`Caught error during regular search`, `${searchInfo}\n\nwait: ${waitingTime}, error code: ${err.code}\n\n${err.stack}`)
      }
    }
  }))

  const auctionDefaults = taskConfig.auction.defaultDetails

  // Runs the auction searches.
  await Promise.all(auctionSearches.map(async ({ details, target }, i) => {
    if (!details) return false
    const waitingTime = i * 5000
    await wait(waitingTime)
    const msgTarget = target ? target : taskConfig.auction.defaultTarget
    const searchDetails = { ...auctionDefaults, ...details }
    const searchInfo = objectInspect(removeDefaults(searchDetails, mainDefaults), true)

    try {
      const { search, newItems } = await runMandarakeAuctionSearch(searchDetails)
      taskLogger.debug(searchDetails.q, `Searched auction: ${searchInfo} - wait: ${waitingTime}, entries: ${search.entryCount}, url: ${search.url}`)
      msgTarget.forEach(t => reportResults(t[0], t[1], newItems, searchDetails, 'auction'))
    }
    catch (err) {
      if (isTemporaryError(err)) {
        taskLogger.debug(searchDetails.q, `Ignored temporary error during auction search: ${searchInfo} - Error: ${err.code}`)
      }
      else {
        taskLogger.error(`Caught error during auction search`, `${searchInfo} - wait: ${waitingTime}, error code: ${err.code}\n\n${err.stack}`)
      }
    }
  }))
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
  embed.setAuthor('New item found on Mandarake', icon)
  if (fields.indexOf('price') !== -1) {
    embed.addField('Price', `¥${item.price} (±€${(item.price / 125).toFixed(2)})`, true)
  }
  if (fields.indexOf('stock') !== -1) {
    embed.addField('In stock', `${item.inStock ? 'Yes' : 'No'}${item.inStoreFront ? ' (store front item)' : ''}`, true)
  }
  if (fields.indexOf('store') !== -1) {
    embed.addField('Store', shopsByCode.en[item.shopCode], true)
  }
  if (fields.indexOf('category') !== -1) {
    embed.addField('Category', categoriesByCode.en[searchDetails.categoryCode], true)
  }
  if (fields.indexOf('itemno') !== -1) {
    embed.addField('Item no.', `${item.itemNo[0]} (${item.itemNo[1]})`, true)
  }
  if (fields.indexOf('adult') !== -1 && item.isAdult) {
    embed.addField('Rating', 'Adult product', true)
  }

  embed.setImage(encodeURI(item.image))
  embed.setURL(item.link)
  embed.setColor(color)
  embed.setTitle(embedTitle(item.title))
  embed.setTimestamp()
  embed.setFooter(`Searched for keyword "${searchDetails.keyword}"`)
  return embed
}

const formatMessageAuction = (item, searchDetails, fields) => {
  const embed = new RichEmbed();
  embed.setAuthor('New item found on Mandarake Auctions', iconAuctions)
  if (fields.indexOf('price') !== -1) {
    embed.addField('Current price', `¥${item.currentPrice} (±€${(item.currentPrice / 125).toFixed(2)})`, true)
  }

  if (item.timeLeft.type === 'pre-bidding') {
    embed.addField('Time left', 'Auction has not started yet')
  }
  else {
    const daysLeft = `${item.timeLeft.days} day${item.timeLeft.days !== 1 ? 's' : ''}`
    const hoursLeft = `${item.timeLeft.hours} hour${item.timeLeft.hours !== 1 ? 's' : ''}`
    const minutesLeft = `${item.timeLeft.minutes} minute${item.timeLeft.minutes !== 1 ? 's' : ''}`
    const timeLeftBits = [
      ...(item.timeLeft.days > 0 ? [daysLeft] : []),
      ...(item.timeLeft.hours > 0 ? [hoursLeft] : []),
      ...(item.timeLeft.minutes > 0 ? [minutesLeft] : []),
    ]
    // rework
    const timeLeft = timeLeftBits.length === 3
      ? `${timeLeftBits.slice(0, 1)[0]}, ${timeLeftBits.slice(1, 3).join(' and ')}`
      : (timeLeftBits.length === 2
          ? timeLeftBits.join(' and ')
          : (timeLeftBits.length === 0
              ? '(unknown)'
              : timeLeftBits[0]))

    embed.addField('Time left', timeLeft, true)
  }

  if (fields.indexOf('store') !== -1) {
    embed.addField('Store', shopsByCode.en[item.shopCode], true)
  }
  if (fields.indexOf('category') !== -1) {
    embed.addField('Category', uniq(item.categories.map(c => c.name)).join(' > '), true)
  }
  if (fields.indexOf('itemno') !== -1) {
    embed.addField('Item no.', `${item.itemNo}`, true)
  }

  embed.setImage(encodeURI(item.image))
  embed.setURL(item.link)
  embed.setColor(colorAuctions)
  embed.setTitle(embedTitle(item.title))
  embed.setTimestamp()
  embed.setFooter(`Searched for keyword "${searchDetails.q}"`)
  return embed
}
