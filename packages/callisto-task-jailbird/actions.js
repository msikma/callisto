/**
 * Callisto - callisto-task-jailbird <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import moment from 'moment'

import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription } from 'callisto-util-misc'
import { runSearch } from './search'
import { color } from './index'

const BASE_URL = 'http://an.oddlookingbird.com/'
const ICON = 'https://i.imgur.com/DYvn2nK.png'

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
  embed.setAuthor('New Jailbird chapter', ICON)
  embed.setTitle(embedTitle(item.header))
  embed.setImage(item.image)
  embed.setDescription(embedDescription(item.descriptionText))
  embed.setURL(item.link)
  embed.setFooter(`Posted on ${moment(item.pubTime).format('MMMM D, YYYY')}`)
  embed.setColor(color)
  return embed
}
