// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

/** Delay between queue heartbeats. */
const queueDelay = 1000

/** State variables for the queue. */
const queueState = {
  isRunning: false,
  queueRef: null
}

/**
 * Reads the contents of a config file.
 * 
 * If the config file cannot be read for some reason, null is returned;
 * otherwise, an object with the config content is returned.
 * 
 * TODO: run the JS file in a separate VM instance.
 */
const queueHeartbeat = () => {
  console.log('heartbeat')
}


/**
 * Starts the queue.
 */
const startQueueLoop = () => {
  console.log('startQueue')
  queueState.queueRef = setInterval(queueHeartbeat, queueDelay)
}

/**
 * Stops the queue.
 */
const stopQueueLoop = () => {
  clearInterval(queueState.queueRef)
}

module.exports = {
  startQueueLoop,
  stopQueueLoop
}
