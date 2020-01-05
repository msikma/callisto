// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { log, logNotice } = require('dada-cli-tools/log')

const initRuntime$ = require('./init/runtime')
const initConfig$ = require('./init/config')
const initCache$ = require('./init/cache')
const initTasks$ = require('./init/tasks')
const initCallisto$ = require('./init/callisto')
const initDiscord$ = require('./init/discord')
const runtime = require('./state')
const scripts = require('./scripts')

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
  const { pathCache, pathConfig, logLevel, devTask, devNoop } = cliArgs

  await initRuntime$(cliArgs, runtimeData)  // Stores invocation arguments and runtime environment.
  await initConfig$(pathConfig)             // Read and parse config file.
  await initCache$(pathCache)               // Initializes the cache database.
  await initTasks$(devTask)                 // Finds and inits tasks, or the single task if requested.
  /*await initCallisto$()                     // Starts Callisto queue loop and other runtime tasks.
  await initDiscord$(devNoop)               // Logs in on Discord.
*/
  // The bot is now running its tasks and connected to Discord.
  // Print feedback to let the user know how to exit.
  logNotice(`callisto ${runtime.pkgData.version}`)
  log(`Press CTRL+C to exit.`)
  process.exit(0)
}

module.exports = {
  runBot$,
  scripts
}
