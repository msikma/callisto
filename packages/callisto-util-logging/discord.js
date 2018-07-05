/**
 * Callisto - callisto-util-logging <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import { zipObject } from 'lodash'
import { sendMessage } from 'callisto-discord-interface/src/responder'
import { embedTitle, embedDescription, getFormattedTimeOnly } from 'callisto-util-misc'
import { config } from 'callisto-util-misc/resources'
import logger from './index'
import { logLevels } from './severity'
import severity from './severity'

// The colors used for our RichEmbed log messages.
const levelColors = {
  error: 0xff034a,     // #ff034a
  warn: 0xffaa02,      // #ffaa02
  info: 0x17a1eb,      // #17a1eb
  verbose: 0x424555,   // #424555
  debug: 0x363946,     // #363946
  silly: 0x2a2c37      // #2a2c37
}

/**
 * Logs a message to Discord. The log is sent as either a RichEmbed (if the severity is high enough,
 * 'info' by default) or as regular text ('verbose' by default). The values in the config that control
 * this are 'logLevel' and 'logLevelText'. Note that the command line --log parameter only controls
 * what is logged in the console, nothing more.
 *
 * The channels we log to are also taken from the config file, from 'logChannels'.
 */
const logMsgToDiscord = (level, id, version, name, icon) => (title, desc, fields = [], force = false) => {
  // List of channels to log to.
  const logChannels = config.CALLISTO_SETTINGS.logChannels
  // Severity limit. If it meets 'type one', we post a RichEmbed. If 'type two', we post text.
  // If the message meets neither, we ignore it.
  const typeOneLimit = severity[config.CALLISTO_SETTINGS.logLevel]
  const typeTwoLimit = severity[config.CALLISTO_SETTINGS.logLevelText]
  const messageSeverity = severity[level]
  // Color to use for the embed, indicating the severity.
  const levelColor = levelColors[level]

  // Send the message to our regular logger (file, console).
  logger[level](`${id}: ${title}${desc ? ` - ${desc}` : ''}${fields ? fields.map(f => ` [${f[0]}: ${f[1]}]`).join('') : ''}`)

  // Return if we don't meet the severity level, unless forced.
  // Also return if we lack both 'title' and 'desc'.
  if (((messageSeverity < typeTwoLimit) && force !== true) || (!title && !desc)) {
    return
  }

  if (severity[level] >= typeOneLimit) {
    // Send a RichEmbed.
    const embed = new RichEmbed()
    if (title) embed.setTitle(embedTitle(title))
    if (desc) embed.setDescription(embedDescription(desc))
    if (id) embed.setFooter(`Logged by callisto-package-${id}${version ? ` (${version})` : ''}`)
    // Add fields if we have any.
    fields.forEach(field => {
      const [header, content, inline = false] = field
      embed.addField(header, content, inline)
    })
    embed.setAuthor(name, icon)
    embed.setColor(levelColor)
    embed.setTimestamp()
    return logChannels.forEach(c => sendMessage(c[0], c[1], null, embed))
  }
  else {
    // Send regular text.
    const time = getFormattedTimeOnly()
    const msg = `\`${time}\`: \`${id}\`: ${title && desc ? `**${embedTitle(title)}** - ${embedDescription(desc)}` : embedTitle(title)}`
    return logChannels.forEach(c => sendMessage(c[0], c[1], msg))
  }
}

/**
 * Creates a logger object to be used by one specific task.
 * This works exactly the same as the generic 'logger',
 * but it will post logs to Discord using the task's name and icon.
 *
 * @param {String} id ID of the task (its slug)
 * @param {String} version Version of the task (semver from the package.json)
 * @param {String} name Name of the task (human readable)
 * @param {Number} color The task's main color
 * @param {String} icon URL to the task's icon image
 */
export const createTaskLogger = (id, version, name, color, icon) => {
  return zipObject(logLevels, logLevels.map(level => logMsgToDiscord(level, id, version, name, icon)))
}
