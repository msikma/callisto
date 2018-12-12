/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { wait, errorObject, objectInspect } from 'callisto-util-misc'
import { isTemporaryError } from 'callisto-util-request'

import { isShuttingDown } from './shutdown'
import { trySendingPayload, sendError } from './responder'
import logger, { getSystemLogger } from './logging'

/** Queue container. This holds message objects for sending to Discord. */
let queue = []

/** Whether the queue is allowed to send messages or not. */
let enableQueue = false
let queueIsRunning = false
/** How long we wait before sending the next message. */
const queuePauseDuration = 1000

/** If we're shutting down but a task tried to queue a message, log it here, but only to the console. */
const shutdownLog = (payload) => {
  logger.verbose(`Not sending payload since we are shutting down:\n${objectInspect(payload)}`, false)
}

/** Pushes a message to the back of the queue. */
export const pushToQueueBack = (msgObj) => {
  if (isShuttingDown()) {
    shutdownLog(msgObj.payload)
    return
  }
  
  queue.push(msgObj)
}

/** Pushes a message to the front of the queue, for sending next. */
export const pushToQueueFront = (msgObj) => {
  if (isShuttingDown()) {
    shutdownLog(msgObj.payload)
    return
  }
  
  queue.unshift(msgObj)
}

/** Quick sanity check to ensure this payload has content. */
const isValidPayload = (payload) => {
  if (!payload.channel || !payload.payload) {
    return false
  }
  return true
}

/** Forever looping queue that sends messages to Discord once per interval. */
const queueLoop = async () => {
  // Only run once.
  if (queueIsRunning) return
  queueIsRunning = true

  const sysLog = getSystemLogger()

  // Loop forever until 'enableQueue' is set to false.
  let nextPayload
  let tries = 0
  while (true) {
    // Ensure we wait a while before sending any payload.
    await wait(queuePauseDuration)
    sysLog.silly(`Queue iteration - length: ${queue.length}`, false)
    if (enableQueue && queue.length > 0) {
      nextPayload = queue.shift()
      tries += 1

      // Only continue if this is a valid payload.
      if (!isValidPayload(nextPayload)) {
        sysLog.verbose(`Encountered an invalid payload\n${objectInspect(payload)}`)
        continue
      }

      try {
        const result = await trySendingPayload(nextPayload, tries)

        // Everything went well.
        if (result === true) {
          tries = 0
          continue
        }
        else {
          // If sending the message was unsuccessful, but the error indicates a temporary problem, retry it.
          // If it's not a temporary error, log an error if desired for this message.
          if (isTemporaryError(result)) {
            pushToQueueFront(nextPayload)
          }
          else if (nextPayload.logOnError) {
            sendError(result, nextPayload)
          }
        }
      }
      catch (err) {
        // Something went wrong. If this occurs it indicates some problem beyond just a temporary network error.
        sysLog.warn(`Error while attempting to send payload`, errorObject(err))
      }
    }
  }
}

/** Returns whether the queue is empty. This is used when shutting down. */
export const queueIsEmpty = () => {
  return queue.length === 0
}

/** Starts the queue loop. */
export const startQueueLoop = () => {
  enableQueue = true
  queueLoop()
}

/** Stops the queue loop. */
export const pauseQueueLoop = () => {
  enableQueue = false
}
