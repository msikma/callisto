/**
 * Calypso - calypso-core <https://github.com/msikma/calypso>
 * © MIT license
 */

import { data, initResources } from 'calypso-misc/resources'
import logger, { configureLogger, printLogSize } from 'calypso-logging'
import { dbInitOrExit } from 'calypso-cache'

import { shutdown } from './shutdown'
import { discordInitOrExit } from './discord'
import { checkVersion, bindEmitHandlers, catchAllExceptions } from './logging'
import { startQueueLoop } from './queue'
import { startRequestQueue } from 'calypso-request'
import { findAndRegisterTasks, loadSingleTask } from './task-manager'

// Runtime settings.
export const discord = {
  client: null,
  settings: null,
  bot: null,
  noPost: false
}

/**
 * Main entry point that runs the bot. Command line arguments are passed here.
 * If 'task' is set, we'll run the bot with that one task only. Others get ignored.
 * 'level' sets the console logging verbosity.
 */
export const run = async ({ task, level, dbPath, configPath, noPost = false }) => {
  // Prevent us from being able to actually post to Discord if --no-post was passed.
  discord.noPost = noPost

  // Read and parse config file.
  initResources(configPath)

  // Make sure we can write logs.
  configureLogger(data.config.CALYPSO_BASE_DIR, level)

  // Print info about the current runtime. Log the exit method to the console only.
  logger.info(`calypso-bot ${data.pkg.version}`, false)
  console.log(`Press CTRL+C to exit.`)

  // Attempt to open the databse (or exit on failure).
  dbInitOrExit(dbPath)

  // Start message and request queues, which will send messages to Discord one by one.
  startQueueLoop()
  startRequestQueue()

  // Attempt to log in to the server. The program will exit if something goes wrong.
  const connection = await discordInitOrExit()
  discord.client = connection.client
  discord.bot = connection.bot

  // Bind warn/error handling routines.
  bindEmitHandlers(discord.client)

  // Load single task if testing.
  const taskData = loadSingleTask(task)

  // Check whether we are reporting the right version.
  checkVersion()

  // Catch uncaught exceptions (this happens in very rare cases only).
  catchAllExceptions()

  // Get a list of all installed tasks and register them.
  await findAndRegisterTasks(discord.client, discord.bot, data.config.CALYPSO_TASK_SETTINGS, taskData)

  // Log the size of the log files, to remember not to let them get too big.
  printLogSize(data.config.CALYPSO_BASE_DIR)

  // Listen for SIGINT and perform a graceful shutdown.
  process.on('SIGINT', shutdown)
}
