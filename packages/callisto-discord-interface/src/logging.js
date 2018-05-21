/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import logger, { severity } from 'callisto-util-logging'
import { embedDescription } from 'callisto-util-misc'
import { sendMessage } from './responder'
import { config } from './resources'

const WARNING_COLOR = 0xf2ca5c
const ERROR_COLOR = 0xf75455

/**
 * Logs a debugging message to Discord. We check if the severity is high enough
 * for it to be worth logging and grab the target channels from the config.
 * Logging is done using a simple colorized RichEmbed.
 */
export const logToDiscord = (msgLevel, msg) => {
  const severityLimit = severity[config.CALLISTO_SETTINGS.errorLevel]
  // Don't log if the message is not as important as the minimum specified in the config.
  // If no error level is specified at all, don't log anything.
  if (severity[msgLevel] < severityLimit || severityLimit == null) {
    return
  }
  const errorChannels = config.CALLISTO_SETTINGS.errorChannel

  // Log based on severity.
  if (msgLevel === 'warn') {
    logWarnToDiscord(msg, errorChannels)
  }
  if (msgLevel === 'error') {
    logErrorToDiscord(msg, errorChannels)
  }
}

/**
 * Logs a message to Discord for debugging purposes.
 * This simply wraps the message in a colored RichEmbed so that it stands out.
 */
const logMsgToDiscord = (color) => (msg, channels) => {
  const embed = new RichEmbed()
  embed.setDescription(embedDescription(msg))
  embed.setColor(color)
  channels.forEach(c => sendMessage(c[0], c[1], null, embed))
}

// Helper functions that log with a specific color.
const logWarnToDiscord = logMsgToDiscord(WARNING_COLOR)
const logErrorToDiscord = logMsgToDiscord(ERROR_COLOR)
