// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const system = require('../logger')

/** State variables for the queue. */
const queueState = {
  isRunning: false, // Whether the queue has been started or not; it runs once per bot invocation
  isPaused: false,  // Whether the queue has been temporarily paused
  delay: 1000,      // The delay between heartbeats
  ref: null,        // Reference to the queue loop Promise
  items: []
}

/**
 * Moves on to the next task if available and runs it.
 */
const queueHeartbeat = async () => {
  if (queueState.isPaused) return
  if (queueIsEmpty()) return

  system.logDebug(['Queue heartbeat', null, { length: queueState.items.length }])

  const nextPayload = queueState.items.shift()
  let tries = 0

  // Only continue if this is a valid payload.
  if (!isValidPayload(nextPayload)) {
    system.logInfo('Queue:', 'encountered an invalid payload:', payload)
    return
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
    system.logWarn(`Error while attempting to send payload`, errorObject(err))
  }
}

const queueLoop = async () => {
  while (true) {
    await queueHeartbeat()
    await wait(queueState.delay)
    // When the queue has been stopped, continue until the queue is empty and then exit.
    if (!queueState.isRunning && queueIsEmpty()) return
  }
}


/** Initializes the queue. */
const initQueueLoop = () => {
  system.logDebug('Initialized queue loop.')
  queueState.isRunning = true
  queueState.ref = queueLoop()
}

/** Pauses the queue loop temporarily. */
const pauseQueueLoop = () => {
  queueState.isPaused = true
}

/** Resumes the queue loop after it's been paused. */
const unpauseQueueLoop = () => {
  queueState.isPaused = false
}

/** Stops the queue permanently. */
const stopQueueLoop = () => {
  queueState.isRunning = false
}

/** Returns whether the queue is empty. This is used when shutting down. */
const queueIsEmpty = () => queueState.items.length === 0

/** Pushes a message to the back of the queue. */
const pushToQueueBack = msgObj => queueState.items.push(msgObj)

/** Pushes a message to the front of the queue, for sending next. */
const pushToQueueFront = msgObj => queueState.items.unshift(msgObj)

/** Quick sanity check to ensure this payload has content. */
const isValidPayload = payload => payload.channel && payload.payload

module.exports = {
  initQueueLoop,
  pauseQueueLoop,
  unpauseQueueLoop,
  stopQueueLoop,
  pushToQueueBack,
  pushToQueueFront,
  isValidPayload,
  queueIsEmpty
}
