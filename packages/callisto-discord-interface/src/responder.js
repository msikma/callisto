/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'
import logger from 'callisto-util-logging'
import { parseCommand, showCommandHelp, showCommandUsage } from 'callisto-util-misc'

import { config } from './resources'
import { discord } from './index'

export const sendMessage = (serverID, channelID, message = null, embed = null) => {
  if (!message && !embed) return
  const channel = discord.client.channels.get(channelID)
  // Quick sanity check. Channel ID should already be unique.
  if (channel.guild.id !== serverID) return

  // Remove 'message' or 'embed' if either of them are null.
  const segments = { message, embed }
  const payload = Object.keys(segments)
    .filter(i => segments[i] != undefined && segments[i] !== '')
    .reduce((acc, i) => ({ [i]: segments[i] }), {})

  return sendPayload(channel, payload)
}

/**
 * Low level send interface. Passes on a message to Discord.
 * All code should send their messages to Discord through this function,
 * not through any other means. That way we can ensure the --no-post
 * command line argument is honored.
 */
const sendPayload = (sender, payload) => {
  // Don't send anything if noPost is on.
  if (discord.noPost === true) {
    return false
  }
  return sender.send(payload)
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
