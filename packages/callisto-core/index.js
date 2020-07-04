// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { log, logNotice } = require('dada-cli-tools/log')

const initRuntime$ = require('./init/runtime')
const initConfig$ = require('./init/config')
const initCache$ = require('./init/cache')
const initDiscord$ = require('./init/discord')
const initCallisto$ = require('./init/callisto')
const initTasks$ = require('./init/tasks')
const scripts = require('./scripts')
const { printStartupMessage } = require('./lib/discord')
const { activateTasks } = require('./lib/tasks')

/**
 * Main entry point. Initializes the system, finds and runs tasks, and contacts Discord.
 * 
 * This is meant to be run from the command line, as any fatal error will cause the process
 * to be terminated. Any function whose name ends with $ will exit on error.
 */
const runBot$ = async (cliArgs, runtimeData) => {
  const { pathCache, pathConfig, devTask } = cliArgs

  logNotice(`callisto ${runtimeData.pkgData.version}`)
  log(`Press CTRL+C to exit.\n`)

  await initRuntime$(cliArgs, runtimeData)  // Stores invocation arguments and runtime environment.
  await initConfig$(pathConfig)             // Read and parse config file.
  await initCache$(pathCache)               // Opens the cache database.
  await initDiscord$()                      // Initializes the system logger and logs in on Discord.
  await initCallisto$()                     // Starts Callisto queue loop and other runtime tasks.
  await initTasks$(devTask)                 // Finds and inits tasks, or the single task if requested.

  // The bot is now initialized and ready to start sending messages.
  await printStartupMessage()
  await activateTasks()
}

module.exports = {
  runBot$,
  scripts
}
