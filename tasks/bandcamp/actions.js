/**
 * Calypso - calypso-task-bandcamp <https://github.com/msikma/calypso>
 * © MIT license
 */

import { RichEmbed } from 'discord.js'
import { get } from 'lodash'

import { sendMessage } from 'calypso-core/responder'
import { isTemporaryError } from 'calypso-request'
import { embedTitle, embedDescription, objectInspect, wait, getFormattedDate, getExactDuration } from 'calypso-misc'
import { getTaskLogger } from 'calypso-core/logging'
import { runBandcampSearch } from './search'
import { id, color, icon } from './index'

/**
 * Runs Bandcamp update searches.
 */
export const actionRunSearches = async (discordClient, user, taskConfig) => {
  await actionSearch(discordClient, user, taskConfig)
}

/** Runs Bandcamp searches. Always resolves. */
const actionSearch = async (discordClient, user, taskConfig) => {
  const taskLogger = getTaskLogger(id)
  const searches = get(taskConfig, 'searches', [])

  for (let a = 0; a < searches.length; ++a) {
    const { details, target } = searches[a]
    if (!details) continue

    // Search staggering.
    await wait(5000)
    
    runSearch(details, target ? target : taskConfig.defaultTarget, taskLogger)
  }
}

/** Runs a single search and posts the results. */
const runSearch = async (details, target, taskLogger) => {
  try {
    const { search, newItems } = await runBandcampSearch(details)
    taskLogger.debug(details.search, `Searched: ${objectInspect(details)} - entries: ${newItems.length}, url: <${search.url}>`)
    target.forEach(t => reportResults(t[0], t[1], newItems, details))
  }
  catch (err) {
    if (isTemporaryError(err)) {
      taskLogger.logTaskTempError(details.search, details, err)
    }
    else {
      taskLogger.logTaskError(`Caught error during search`, details, err)
    }
  }
}

/** Passes on the search results to the server. */
const reportResults = (server, channel, results, search) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessageMain(item, search)))
}

/**
 * Formats a RichEmbed message to post a new search result.
 * 
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
    embed.setImage(encodeURI(item._art_url))
    embed.setURL(url)
    embed.setColor(bandColor)
    embed.setTitle(item.artist === item.title || !item.artist ? embedTitle(item.title) : embedTitle(`${item.artist} - ${item.title}`))

    const descr = get(item, 'detailedInfo.baseInfo.about')
    if (descr) embed.setDescription(embedDescription(descr))
    if (bandIcon) embed.setThumbnail(encodeURI(bandIcon))

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
    taskLogger.logTaskError(`Invalid item type: ${item.type}`, item);
  }
}

