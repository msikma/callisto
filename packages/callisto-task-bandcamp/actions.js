/**
 * Callisto - callisto-task-bandcamp <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import { get } from 'lodash'

import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription, objectInspect, wait, getFormattedDate, getExactDuration } from 'callisto-util-misc'
import { getTaskLogger } from 'callisto-discord-interface/src/logging'
import { runBandcampSearch } from './search'
import { id, color, icon } from './index'

/**
 * Wraps the search code in a single promise.
 */
export const actionRunSearches = async (discordClient, user, taskConfig) => {
  await actionSearch(discordClient, user, taskConfig)
}

/**
 * Runs Bandcamp searches. Always resolves.
 */
const actionSearch = async (discordClient, user, taskConfig) => {
  const taskLogger = getTaskLogger(id)
  const searches = get(taskConfig, 'searches', [])

  await Promise.all(searches.map(async ({ details, target }, i) => {
    if (!details) return false
    // Search staggering.
    const waitingTime = i * 5000
    await wait(waitingTime)
    const msgTarget = target ? target : taskConfig.defaultTarget

    try {
      const { search, newItems } = await runBandcampSearch(details)
      taskLogger.debug(details.search, `Searched: ${objectInspect(details)} - wait: ${waitingTime}, entries: ${newItems.length}, url: <${search.url}>`)

      // Now we just send these results to every channel we configured.
      msgTarget.forEach(t => reportResults(t[0], t[1], newItems, details))
    }
    catch (err) {
      if (err.code === 'ENOTFOUND') {
        taskLogger.debug(details.search, `Ignored ENOTFOUND error during search: ${objectInspect(details)} - wait: ${waitingTime}`)
      }
      else {
        taskLogger.error(`Caught error during search`, `${objectInspect(details)}\n\nWait: ${waitingTime}, error code: ${err.code}\n\n${err.stack}`)
      }
    }
  }))
}

/**
 * Passes on the search results to the server.
 */
const reportResults = (server, channel, results, search) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessageMain(item, search)))
}

/**
 * The 'item' object looks like this:
 *
 * { hidden_license: null,
 *   band_name: 'Pterodactyl Squad',
 *   title: 'The Sixth Extinction',
 *   has_audio: null,
 *   hidden_band: null,
 *   filtered: null,
 *   page_url: '/album/the-sixth-extinction',
 *   subscriber_only: null,
 *   artist: 'HarleyLikesMusic',
 *   private: null,
 *   art_id: 299232782,
 *   band_id: 3285245614,
 *   id: 3325914768,
 *   is_purchasable: true,
 *   pending_transfer: null,
 *   invited_item: false,
 *   type: 'album',
 *   featured_date: null,
 *   release_date: '07 Sep 2013 00:00:00 GMT',
 *   publish_date: '07 Sep 2013 22:13:41 GMT',
 *   detailedInfo:
 *    { credits: 'string',
 *      about: 'string',
 *      ...much more },
 *   _art_url: 'https://f4.bcbits.com/img/a299232782_2.jpg',
 *   band:
 *    { bandData: [Object],
 *      name: 'Pterodactyl Squad',
 *      description: 'A video game music netlabel',
 *      image: 'https://f4.bcbits.com/img/0001683086_23.jpg' } }
 *
 * Detailed information will be available as well.
 */
const formatMessageMain = (item, searchDetails) => {
  const embed = new RichEmbed();
  if (item.type === 'album') {
    // Album type.
    const band = get(item, 'band_name', get(item, 'detailedInfo.otherInfo.artist', '(unknown)'))
    const bandIcon = get(item, 'band.image')
    const linkColor = get(item, 'band.bandData.design.link_color')
    const bandColor = linkColor ? parseInt(linkColor, 16) : color
    const url = `${item.baseURL}${item.page_url}`
    const releaseDate = getFormattedDate(item.release_date)
    embed.setAuthor(`New album by ${band} on Bandcamp`, icon)
    embed.setImage(item._art_url)
    embed.setURL(url)
    embed.setColor(bandColor)
    embed.setTitle(item.artist === item.title || !item.artist ? embedTitle(item.title) : embedTitle(`${item.artist} - ${item.title}`))

    const descr = get(item, 'detailedInfo.baseInfo.about')
    if (descr) embed.setDescription(embedDescription(descr))
    if (bandIcon) embed.setThumbnail(bandIcon)

    const numberOfTracks = get(item, 'detailedInfo.tracks.length', 0)
    if (numberOfTracks) {
      // If we have the number of tracks, add the number and also calculate the length.
      embed.addField('Tracks', numberOfTracks.toString(), true)
      const length = item.detailedInfo.tracks.reduce((val, track) => val + track.duration, 0)
      embed.addField('Total length', getExactDuration(length), true)
    }

    embed.setTimestamp()
    embed.setFooter(`Released on ${releaseDate}`)
    return embed
  }
  else {
    taskLogger.error(`Invalid item type: ${item.type}`, `${objectInspect(item)}`)
  }
}

