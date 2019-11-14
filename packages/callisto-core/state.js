// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

/** Runtime state. */
const runtime = {
  baseDir: null,    // Base dir of the application code
  tasksDir: null,   // Base dir of the available tasks
  cacheDir: null,   // Cache directory (e.g. for the sqlite database)
  bot: null,        // Ref to the Discord bot user
  client: null,     // Ref to the Discord client interface
  cliArgs: null,    // Settings passed via CLI
  config: null,     // Bot config data
  state: {
    willTerminate: false, // Whether the bot is currently shutting down
  },
  dev: {
    noPost: true    // Posting is replaced by a no-op
  },
  tasks: null,      // Parsed list of tasks that the bot is able to run
  pkgData: null,    // Application code package data
  taskData: null    // Code and metadata for all registered tasks
}

module.exports = runtime
