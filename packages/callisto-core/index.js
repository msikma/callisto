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

const runtime = require('./state')
const tasks = require('./tasks')



const initDiscordConnection$ = async (noPost = false) => {
  // Bind warn/error handling routines.
  //bindEmitHandlers(discord.client)
  // Catch uncaught exceptions (this happens in very rare cases only).
  //catchAllExceptions()
}




/**
 * Main entry point. Initializes the system, finds and runs tasks, and contacts Discord.
 * 
 * This is meant to be run from the command line, as any fatal error will cause the process
 * to be terminated. Any function whose name ends with $ will exit on error.
 */
const runBot$ = async (cliArgs, runtimeData) => {
  const { pathCache, pathConfig, logLevel, devTask, devNoop = false } = cliArgs

  await initRuntime$(cliArgs, runtimeData)  // Stores invocation arguments and runtime environment.
  await initConfig$(pathConfig)             // Read and parse config file.
  await initLogFiles$(pathCache, logLevel)  // Make sure we can write logs.
  await initCache$(pathCache)               // Initializes the cache database.
  await initTasks$(devTask)                 // Finds and inits tasks, or the single task if requested.
  await initCallisto$()                     // Starts Callisto queue loop and other runtime tasks.
  await initDiscord$(devNoop)               // Logs in on Discord.

  // The bot is now running its tasks and connected to Discord.
  // Print feedback to let the user know how to exit.
  log(`callisto ${data.pkg.version}`)
  log(`Press CTRL+C to exit.`)
}


module.exports = {
  runBot$,
  tasks
}
