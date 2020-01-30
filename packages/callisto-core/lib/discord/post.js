// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

import { get } from 'lodash'
import logger from 'callisto-logging'


const { logWarn } = require('dada-cli-tools/log')

const { wrapStack, wrapObject } = require('../../util')
const { getChannelFromPath, findChannelPath } = require('./channels')
const { isTempError } = require('../../util')
const { pushToQueueBack, pushToQueueFront } = require('../queue')
const runtime = require('../../state')

/**
 * Main interface for sending messages to Discord.
 *
 * This requires a server ID and channel ID, and can send either a message
 * or an embed, or both.
 *
 * If 'logOnError' is true, we will send an error report in case sending the message fails.
 * If 'isImportant' is true, the message will be added to the front of the queue.
 * If 'isUrgent' is true, the message will be sent instantly instead of being queued.
 */
const sendMessage = async (serverID, channelID, { message = null, embed = null, logOnError = true, isUrgent = false, isImportant = false } = {}) => {
  if (!message && !embed) {
    logWarn('sendMessage() called without message or embed.')
    return
  }

  const channel = runtime.discord.client.channels.get(channelID)
  logger.silly(`Sending payload to channel: ${String(channel)}`)
  // Quick sanity check. Channel ID should already be unique.
  const guildID = get(channel, 'guild.id')
  if (guildID !== serverID) {
    logger.warn(`Failed sanity check - channel.guild.id: ${guildID}, serverID: ${serverID}, channelID: ${channelID}`)
    return
  }

  // Send either a [message, embed] or [embed] depending on whether we have a message.
  const payload = [message, embed ? { embed } : null].filter(s => s)

  if (isUrgent) {
    // If this message is urgent, send it immediately without queueing it..
    channel.send(...payload)
  }
  else if (isImportant) {
    pushToQueueFront({ channel, payload, logOnError })
  }
  else {
    pushToQueueBack({ channel, payload, logOnError })
  }
}

/**
 * Sends an error to Discord in case a payload cannot be sent for some reason.
 */
const sendError = (err, { payload }) => {
  // Retrieve some information from the error to use for the report.
  const channel = getChannelFromPath(err.path)
  const path = channel ? findChannelPath(channel) : null
  const msg = `\n\nPayload:\n${wrapObject(payload)}\nStack trace:`

  logDebug('TODO: sendError()')
  /*
  return getSystemLogger().error(
    'Error while sending payload to Discord',
    `${isTempError(err) ? '' : `Attempted to send a malformed payload to Discord.${path ? ` See the "path to target channel" field for caller information.` : ''}`}${msg}\n${wrapStack(err.stack)}`,
    [
      ...(err.name ? [['Name', err.name, true]] : []),
      ...(err.code ? [['Code', err.code, true]] : []),
      ...(path ? [['Path to target channel', `\`${path.join('.')}\``, true]] : [])
    ],
    false,
    // Don't log on error, or we'll get a nasty loop.
    false
  )*/
}

/**
 * Logs a temporary error at low priority.
 */
const sendTempError = (logger, err) => {
  // TODO
  logDebug('TODO: sendTemporaryError()')
  /*logger.verbose(
    'Temporary network error occurred',
    `${err.stack}`,
    [
      ...(err.name ? [['Name', err.name, true]] : []),
      ...(err.code ? [['Code', err.code, true]] : [])
    ],
    false,
    // Don't log on error.
    false
  )*/
}

/**
 * Low level send interface that passes on a message to Discord.
 * 
 * All code should send their messages to Discord through this function,
 * not through any other means. That way we can ensure the --no-post
 * command line argument is honored.
 */
const sendPayload = async (sender, payload) => {
  // Don't send anything if --no-post is on.
  if (runtime.dev.noPost === true) {
    return true
  }
  await sender.send(...payload)
  return true
}

/**
 * Attempts to send a payload to Discord.
 * 
 * If no error is raised, we return true. If something went wrong, we log and return the error.
 */
const trySendingPayload = async ({ channel, payload }, tries = 0) => {
  try {
    const result = await sendPayload(channel, payload)
    return result
  }
  catch (err) {
    logDebug('Sending payload failed', `Channel: ${channel.name}, Error: ${err.code} - Attempt #${tries}`)
    return err
  }
}

module.exports = {
  sendMessage,
  sendError,
  sendTempError,
  trySendingPayload
}
