/**
 * Callisto - callisto-task-weedonwantcha <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import moment from 'moment'

import { sendMessage } from 'callisto-discord-interface/src/responder'
import { runSearch } from './search'
import { color } from './index'

const BASE_URL = 'http://campcomic.com/'
const ICON = 'https://i.imgur.com/uQIcnQq.png'

export const actionNewChapters = async (discordClient, user, taskConfig) => {
  const { target } = taskConfig
  const results = await runSearch(BASE_URL)
  target.forEach(t => reportResults(t[0], t[1], results))
}

const reportResults = (server, channel, results) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item)))
}

const formatMessage = (item) => {
  const embed = new RichEmbed();
  embed.setAuthor('New Camp Weedonwantcha chapter', ICON)
  embed.setTitle(item.title)
  embed.setImage(item.image)
  embed.setURL(item.link)
  embed.setFooter(`Posted on ${item.pubTime}`)
  embed.setColor(color)
  return embed
}
