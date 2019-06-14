/**
 * Calypso - calypso-task-catawiki <https://github.com/msikma/calypso>
 * © MIT license
 */

import { RichEmbed } from 'discord.js'
import { get } from 'lodash'

import { getDuration } from 'calypso-misc/time'
import { sendMessage } from 'calypso-core/src/responder'
import { embedTitle, wait, embedDescription, capitalizeFirst } from 'calypso-misc'
import { getTaskLogger } from 'calypso-core/src/logging'

import { runCatawikiSearch } from './search'
import { id, color, icon } from './index'

/**
 * Wraps the search code in a single promise.
 */
export const actionRunSearches = async (discordClient, user, taskConfig) => {
  await actionSearch(discordClient, user, taskConfig)
}

/**
 * Runs Catawiki searches. Always resolves.
 */
const actionSearch = async (discordClient, user, taskConfig) => {
  const taskLogger = getTaskLogger(id)
  const searches = get(taskConfig, 'searches', [])
  const defaultDetails = get(taskConfig, 'defaultDetails', {})
  const defaultTarget = get(taskConfig, 'defaultTarget', null)
  const defaultCountryCode = get(taskConfig, 'defaultCountryCode', 'com')

  // How much time to wait in between searches.
  const waitTime = 4000

  // Replace unset values with defaults.
  const searchItems = searches.reduce(
    (allSearches, { details, target }) => {
      if (!details) return allSearches
      const search = {
        details: {
          ...defaultDetails,
          countryCode: defaultCountryCode,
          ...details
        },
        target: target ? target : defaultTarget
      }
      return [...allSearches, search]
    },
    []
  )

  let searchItem
  for (let a = 0; a < searchItems.length; ++a) {
    searchItem = searchItems[a]
    await wait(waitTime)
    try {
      const { items, meta } = runCatawikiSearch(searchItem)
      taskLogger.logTaskItem(`Item search`, searchItem.details, items, a, searchItems.length)
      searchItem.target.forEach(t => reportResults(t[0], t[1], items, searchItem.details, meta.url))
    }
    catch (err) {
      taskLogger.logError(`Item search`, searchItem.details, err)
    }
  }
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, searchDetails, url) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item, searchDetails, url)))
}

/**
 * Returns a RichEmbed describing a new item.
 */
const formatMessage = (item, searchDetails, url) => {
  const embed = new RichEmbed();
  embed.setAuthor('New auction found on Catawiki', icon)

  const price = get(item, 'currentPrice.EUR', null)
  const title = get(item, 'title', 'Unnamed item')
  const description = get(item, 'description', 'No description')
  const image = get(item, 'image', null)
  const link = get(item, 'link', null)
  const end = get(item, 'biddingEnd', null)
  const timeLeft = end ? ((+new Date(end)) - (+new Date())) : null

  if (end) embed.addField('Remaining time', getDuration(timeLeft), true)
  if (end) embed.addField('Ends', getFormattedTime(end), true)
  if (price) embed.addField('Current price', `€ ${price}`, false)

  if (image) {
    embed.setImage(encodeURI(image))
  }
  embed.setURL(link)
  embed.setColor(color)
  embed.setTitle(embedTitle(title))
  embed.setDescription(embedDescription(description))
  embed.setTimestamp()
  embed.setFooter(`Searched for keyword "${searchDetails.keyword}" - [search page](${url})`)
  return embed
}
