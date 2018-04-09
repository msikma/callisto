/**
 * Callisto - callisto-task-cut-time <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import moment from 'moment'

import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription } from 'callisto-util-misc'
import { runSearch } from './search'
import { color } from './index'

const ICON = 'https://i.imgur.com/GGHURBB.png'

export const actionNewChapters = async (discordClient, user, taskConfig) => {
  const { target } = taskConfig
  const results = await runSearch()
  target.forEach(t => reportResults(t[0], t[1], results))
}

const reportResults = (server, channel, results) => {
  if (results.length === 0) return
  results.forEach(item => sendMessage(server, channel, null, formatMessage(item)))
}

const formatMessage = (item) => {
  const embed = new RichEmbed();
  embed.setAuthor('New Cut Time chapter', ICON)
  embed.setTitle(embedTitle(item.title))
  embed.setImage(item.image)
  embed.setDescription(embedDescription(item.description))
  embed.setURL(item.link)
  embed.setFooter(`Posted on ${moment(item.pubTime).format('MMMM D, YYYY')}`)
  embed.setColor(color)
  return embed
}
