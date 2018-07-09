/**
 * Callisto - callisto-task-rarbg <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import { sendMessage } from 'callisto-discord-interface/src/responder'
import { setCookies } from 'callisto-util-request'
import { wait, embedTitle, getFormattedDate } from 'callisto-util-misc'
import { getTaskLogger } from 'callisto-discord-interface/src/logging'
import { findNewEpisodes, getEpisodeInfo, getTorrentDetails, cacheEpisode } from './search'
import { id, color, icon } from './index'

const BASE_URL = 'https://rarbg.to'
// Base amount of ms to wait in between scraping.
const SCRAPE_DELAY = 10000

// Returns URL to a show's torrent listing page.
const getShowURL = (slug) => `${BASE_URL}/tv/${slug}/`

// Returns URL to tv.php's list of episodes for an episode ID.
const getTVURL = (episodeID) => `${BASE_URL}/tv.php?ajax=1&tvepisode=${episodeID}`

// Reutrns URL to a torrent's detail page.
const getTorrentDetailURL = (torrentID) => `${BASE_URL}/torrent/${torrentID}`

export const actionNewEpisodes = async (discordClient, user, taskConfig) => {
  const taskLogger = getTaskLogger(id)
  const { items, cookies } = taskConfig
  // Set our initial cookies.
  setCookies(cookies, BASE_URL)

  for (let n = 0; n < items.length; ++n) {
    const show = items[n]
    // We need to request our items slowly to avoid being forced to enter a captcha by the server.
    // Add a random delay up to a second to our standard delay, except the last item.
    const randDelay = Math.round(Math.random() * 1000) + SCRAPE_DELAY
    taskLogger.debug(show.slug, `Scraping item ${show.name} (${show.slug})${n !== items.length - 1 ? ` (delay until next: ${randDelay} ms)` : ' (last)'}`)

    // Begin scraping. First request the show's overview page, which lists all the shows.
    // We then check if this is a new item. Normally we do this at the end of the scraping cycle
    // because it's simpler, but we need to conserve requests here so we're doing it as early as possible.
    const url = getShowURL(show.slug)
    const latestEpisodes = await findNewEpisodes(url, show)
    if (latestEpisodes) {
      // We have new episodes to display.
      for (let epN = 0; epN < latestEpisodes.length; ++epN) {
        // An episode example:
        //
        // { title: 'Stuck Together',
        //   slug: 'Stuck-Together',
        //   releaseDate: '2017-05-29',
        //   episodeID: 'episode_293146',
        //   episodeNumber: 'Episode 1',
        //   seasonNumber: 'Season 5',
        //   id: 'rarbg$tt3061046$Stuck-Together' }

        const episode = latestEpisodes[epN]

        // The next step is to request 'tv.php'
        // to get a piece of HTML containing the links to the episode.
        // We will return whichever link has the largest filesize (the highest quality version).
        await wait(randDelay)

        // Retrieve list of torrent links for this episode.
        taskLogger.debug(show.slug, `New episode found (delay until next: ${randDelay} ms)`)
        const urlTV = getTVURL(episode.episodeID)
        const episodeLink = await getEpisodeInfo(urlTV, url)
        await wait(randDelay)

        // Retrieve torrent and image URLs.
        taskLogger.debug(show.slug, `New episode torrent code is ${episodeLink.code} (delay until next: ${randDelay} ms)`)
        const urlDetails = getTorrentDetailURL(episodeLink.code)
        const torrentDetails = await getTorrentDetails(urlDetails, urlTV)

        // Send results to Discord.
        taskLogger.debug(show.slug, `Caching new episode and its information to Discord`)
        const episodeFullData = { ...episode, ...episodeLink, ...torrentDetails }
        await cacheEpisode(episodeFullData)

        show.target.forEach(t => sendMessage(t[0], t[1], null, formatMessage(episodeFullData, show, urlDetails, url)))
      }
    }

    // Wait a while to avoid getting banned.
    await wait(n !== items.length - 1 ? randDelay : 0)
  }
}

const formatMessage = (item, show, urlDetails, urlTVGuide) => {
  const embed = new RichEmbed();
  const torrentURL = `${BASE_URL}${item.torrentURL}`
  embed.setAuthor(`New episode of ${show.name}`, show.icon || icon)
  embed.setTitle(embedTitle(item.title))
  embed.setImage(encodeURI(item.image))
  embed.addField('Episode', `${item.seasonNumber} ${item.episodeNumber}`, true)
  embed.addField('Filesize', `${item.filesize}`, true)
  embed.addField('Download', `• [${item.filename}](${torrentURL})\n• [Full list of episodes](${urlTVGuide})`)
  embed.setURL(urlDetails)
  embed.setColor(show.color || color)
  embed.setTimestamp()
  embed.setFooter(`Air date: ${getFormattedDate(item.releaseDate)}`)
  return embed
}
