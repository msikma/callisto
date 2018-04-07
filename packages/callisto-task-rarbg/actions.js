/**
 * Callisto - callisto-task-rarbg <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import moment from 'moment'

import { sendMessage } from 'callisto-discord-interface/src/responder'
import { setCookies } from 'callisto-util-request'
import { wait } from 'callisto-util-misc'
import logger from 'callisto-util-logging'
import { findNewEpisode, getEpisodeInfo, getTorrentDetails, cacheEpisode } from './search'
import { color } from './index'

const BASE_URL = 'https://rarbg.to'
const ICON_FALLBACK = 'https://i.imgur.com/tYMa40S.png'
const SCRAPE_DELAY = 10000

// Returns URL to a show's torrent listing page.
const getShowURL = (slug) => `${BASE_URL}/tv/${slug}/`

// Returns URL to tv.php's list of episodes for an episode ID.
const getTVURL = (episodeID) => `${BASE_URL}/tv.php?ajax=1&tvepisode=${episodeID}`

// Reutrns URL to a torrent's detail page.
const getTorrentDetailURL = (torrentID) => `${BASE_URL}/torrent/${torrentID}`

export const actionNewEpisodes = async (discordClient, user, taskConfig) => {
  const { items, cookies } = taskConfig
  // Set our initial cookies.
  setCookies(cookies, BASE_URL)

  for (let n = 0; n < items.length; ++n) {
    const show = items[n]
    // We need to request our items slowly to avoid being forced to enter a captcha by the server.
    // Add a random delay up to a second to our standard delay, except the last item.
    const randDelay = Math.round(Math.random() * 1000) + SCRAPE_DELAY
    logger.debug(`rarbg: scraping item ${show.name} (${show.slug})${n !== items.length - 1 ? ` (delay until next: ${randDelay} ms)` : ' (last)'}`)

    // Begin scraping. First request the show's overview page, which lists all the shows.
    // We then check if this is a new item. Normally we do this at the end of the scraping cycle
    // because it's simpler, but we need to conserve requests here so we're doing it as early as possible.
    const url = getShowURL(show.slug)
    const latestEpisode = await findNewEpisode(url, show)
    if (latestEpisode) {
      // We have a new episode to display. The next step is to request 'tv.php'
      // to get a piece of HTML containing the links to the episode.
      // We will return whichever link has the largest filesize (the highest quality version).
      await wait(randDelay)

      // Retrieve list of torrent links for this episode.
      logger.debug(`rarbg: new episode found (delay until next: ${randDelay} ms)`)
      const urlTV = getTVURL(latestEpisode.episodeID)
      const episodeLink = await getEpisodeInfo(urlTV, url)
      await wait(randDelay)

      // Retrieve torrent and image URLs.
      logger.debug(`rarbg: new episode torrent code is ${episodeLink.code} (delay until next: ${randDelay} ms)`)
      const urlDetails = getTorrentDetailURL(episodeLink.code)
      const torrentDetails = await getTorrentDetails(urlDetails, urlTV)

      // Send results to Discord.
      logger.debug(`rarbg: caching new episode and its information to Discord`)
      const episodeFullData = { ...latestEpisode, ...episodeLink, ...torrentDetails }
      await cacheEpisode(episodeFullData)

      show.target.forEach(t => sendMessage(t[0], t[1], null, formatMessage(episodeFullData, show)))
    }

    // Wait a while to avoid getting banned.
    await wait(n !== items.length - 1 ? randDelay : 0)
  }
}

const formatMessage = (item, show) => {
  const embed = new RichEmbed();
  embed.setAuthor(`New episode of ${show.name}`, show.icon || ICON_FALLBACK)
  embed.setTitle(item.title)
  embed.setImage(item.image)
  embed.addField('Episode', `${item.seasonNumber} ${item.episodeNumber}`)
  embed.addField('Torrent', `${item.filename}`)
  embed.addField('Filesize', `${item.filesize}`)
  embed.setURL(`${BASE_URL}${item.torrentURL}`)
  embed.setColor(show.color || color)
  embed.setFooter(`Episode is set to air on ${moment(item.releaseDate).format('MMMM D, YYYY')}`)
  return embed
}
