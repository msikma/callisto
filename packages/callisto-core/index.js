/**
 * Calypso - calypso-core <https://github.com/msikma/calypso>
 * © MIT license
 */

import { data, initResources } from 'callisto-misc/resources'
import logger, { configureLogger, printLogSize } from 'callisto-logging'
import { dbInitOrExit } from 'callisto-cache'

import { checkConfigOrExit } from './actions'
import { shutdown } from './shutdown'
import { discordInitOrExit } from './discord'
import { checkVersion, bindEmitHandlers, catchAllExceptions } from './logging'
import { startQueueLoop } from './queue'
import { startRequestQueue } from 'callisto-request'
import { findAndRegisterTasks, loadSingleTask } from './task-manager'

// Runtime settings.
export const runtime = {
  client: null,
  settings: null,
  bot: null,
  dev: {
    noPost: true
  }
}

const initDiscordConnection$ = async (noPost = false) => {
  // Bind warn/error handling routines.
  //bindEmitHandlers(discord.client)
  // Catch uncaught exceptions (this happens in very rare cases only).
  //catchAllExceptions()
}

const initCallisto$ = async () => {
  // Start message and request queues, which will send messages to Discord one by one.
  startQueueLoop()
  startRequestQueue()
  // Log the size of the log files, to remember not to let them get too big.
  //printLogSize(data.config.CALYPSO_BASE_DIR)
  // Listen for SIGINT and perform a graceful shutdown.
  process.on('SIGINT', shutdown)
}

/**
 * Main entry point that runs the bot. Command line arguments are passed here.
 * If 'task' is set, we'll run the bot with that one task only. Others get ignored.
 * 'level' sets the console logging verbosity.
 * 
 * Functions whose names end with $ will automatically exit the program if they fail.
 */
export const runBot = async ({ pathCache, pathConfig, logLevel, devTask, devNoop = false }) => {
  await initConfig$(pathConfig)             // Read and parse config file.
  await initLogger$(pathCache, logLevel)    // Make sure we can write logs.
  await initCache$(pathCache)               // Initializes the cache database.
  await initTasks$(devTask)                 // Finds and inits tasks, or the single task if requested.
  await initCallisto$()                     // Starts Callisto queue loop and other runtime tasks.
  await initDiscordConnection$(devNoop)     // Logs in on Discord.

  // The bot is now running its tasks and connected to Discord.
  // Print feedback to let the user know how to exit.
  logger.info(`callisto ${data.pkg.version}`, false)
  console.log(`Press CTRL+C to exit.`)
}
