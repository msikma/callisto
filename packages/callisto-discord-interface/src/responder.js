/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { get } from 'lodash'
import logger from 'callisto-util-logging'
import { parseCommand, showCommandHelp, showCommandUsage, wrapInPre, wrapInJSCode, objectInspect, getChannelFromPath, findChannelPath, wait } from 'callisto-util-misc'
import { config } from 'callisto-util-misc/resources'
import { isTemporaryError } from 'callisto-util-request'

import { pushToQueueBack } from './queue'
import { getSystemLogger } from './logging'
import { discord } from './index'

/**
 * Main interface for sending messages to Discord.
 *
 * This requires a server ID and channel ID, and can send either a message
 * or an embed, or both.
 *
 * If 'logOnError' is true, we will send an error report in case sending the message fails.
 * The 'errorRetries' variable is the number of times we'll silently retry to send
 * the message if it fails.
 */
export const sendMessage = async (serverID, channelID, message = null, embed = null, logOnError = true, sendDirectly = false) => {
  if (!message && !embed) {
    logger.warn('sendMessage() called without message or embed.')
    return
  }

  const channel = discord.client.channels.get(channelID)
  logger.silly(`Sending payload to channel: ${String(channel)}`)
  // Quick sanity check. Channel ID should already be unique.
  const guildID = get(channel, 'guild.id')
  if (guildID !== serverID) {
    logger.warn(`Failed sanity check - channel.guild.id: ${guildID}, serverID: ${serverID}, channelID: ${channelID}`)
    return
  }

  // Send either a [message, embed] or [embed] depending on whether we have a message.
  const payload = [message, embed ? { embed } : null].filter(s => s)

  if (sendDirectly) {
    // If this message is urgent, send it immediately without queueing it..
    channel.send(...payload)
  }
  else {
    // Queue the payload for sending to Discord.
    pushToQueueBack({ channel, payload, logOnError })
  }
}

/**
 * Sends an error to Discord in case a payload cannot be sent for some reason.
 */
export const sendError = (err, { payload }) => {
  // Retrieve some information from the error to use for the report.
  const channel = getChannelFromPath(err.path)
  const path = channel ? findChannelPath(channel) : null
  const msg = `\n\nPayload:\n${wrapInJSCode(objectInspect(payload))}\nStack trace:`

  return getSystemLogger().error(
    'Error while sending payload to Discord',
    `${isTemporaryError(err) ? '' : `Attempted to send a malformed payload to Discord.${path ? ` See the "path to target channel" field for caller information.` : ''}`}${msg}\n${wrapInPre(err.stack)}`,
    [
      ...(err.name ? [['Name', err.name, true]] : []),
      ...(err.code ? [['Code', err.code, true]] : []),
      ...(path ? [['Path to target channel', `\`${path.join('.')}\``, true]] : [])
    ],
    false,
    // Don't log on error, or we'll get a nasty loop.
    false
  )
}

/**
 * Logs a temporary error at low priority.
 */
export const sendTemporaryError = (logger, err) => {
  logger.verbose(
    'Temporary network error occurred',
    `${err.stack}`,
    [
      ...(err.name ? [['Name', err.name, true]] : []),
      ...(err.code ? [['Code', err.code, true]] : [])
    ],
    false,
    // Don't log on error.
    false
  )
}

/**
 * Low level send interface. Passes on a message to Discord.
 * All code should send their messages to Discord through this function,
 * not through any other means. That way we can ensure the --no-post
 * command line argument is honored.
 */
const sendPayload = async (sender, payload) => {
  // Don't send anything if noPost is on.
  if (discord.noPost === true) {
    return true
  }
  await sender.send(...payload)
  return true
}

/**
 * Attempts to send a payload to Discord. If no error is raised, we return true.
 * If something went wrong, we return (not raise) the error.
 */
export const trySendingPayload = async ({ channel, payload }, tries = 0) => {
  try {
    const result = await sendPayload(channel, payload)
    return result
  }
  catch (err) {
    getSystemLogger().verbose(`Sending payload failed`, `Channel: ${channel.name}, Error: ${err.code} - Attempt #${tries}`)
    return err
  }
}

/**
 * Processes all messages before we send them to the server.
 */
const makeMessage = (name, color, response) => {
  // "Small" messages are displayed as regular messages.
  if (response.small) {
    return response.text
  }
  // Everything else is an embed to make it stand out more.
  return { 'embed': { title: name, description: response.text, color } }
}

/**
 * Runs a message through a number of checks to find out what to do with it. Most importantly,
 * it checks whether the message is an @ to the bot coming from a regular user.
 * If the command is valid, we see if it matches a task's command definitions.
 * If so, run the command and return the result. If 'help' is requested,
 * we show the standardized help string based on the bot's defined API.
 *
 * 'id' is the name of the task. This function runs once for every message for every task.
 */
const getCommandResponse = (id, formats, messageObject) => {
  // Some sanity checks. Ensure we're not responding to ourselves, or to another bot.
  if (messageObject.author.id === config.CALLISTO_BOT_CLIENT_ID || messageObject.author.bot === true) {
    return false
  }

  // Check whether we are mentioned, except if @here or @everyone was mentioned.
  if (!messageObject.isMentioned(config.CALLISTO_BOT_CLIENT_ID) || messageObject.mentions.everyone) {
    return false
  }

  // Parse the message based on our accepted command formats.
  const command = parseCommand(id, formats, messageObject.content)

  // If no command was entered at all, do nothing.
  if (command === false) {
    return false
  }

  // If the command was invalid, show an error and a list of accepted commands.
  if (command.success === false && !command.name) {
    return { text: `Invalid command. ${showCommandHelp(id, formats)}`, success: false }
  }

  // If the command was invalid, but we know what command it was, show its usage.
  if (command.success === false && command.name) {
    return { text: showCommandUsage(id, command.name, formats), success: false }
  }

  // If the command is 'help', display usage information.
  if (command.name === 'help') {
    return { text: showCommandHelp(id, formats), success: true }
  }

  // If we're here, it means the command was correctly formed and we can run the prescribed function.
  // The function is defined in the format as the fourth item.
  const taskArgsStr = [command.reqArgs, command.optArgs].map(o => JSON.stringify(o)).join(', ')
  logger.verbose(`Calling task function: ${id}, ${command.name} (${taskArgsStr})`)
  const callback = command.matchingFormat[4]
  return callback(command.reqArgs, command.optArgs)
}

/**
 * Standardized message responder that runs through matching command formats and returns a parsed command.
 */
export const commandResponder = (id, name, color, formats) => (messageObject) => {
  const response = getCommandResponse(id, formats, messageObject)
  if (response) {
    return sendPayload(messageObject.channel, makeMessage(name, color, response))
  }
}
