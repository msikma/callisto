// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

/** Runtime state. */
const runtime = {
  baseDir: null,         // Base dir of the application code
  tasksDir: null,        // Base dir of the available tasks
  cacheDir: null,        // Cache directory (e.g. for the sqlite database)
  cachePath: null,       // Cache database file path
  configDir: null,       // Config directory
  configPath: null,      // Config file path
  discord: {
    bot: null,             // Ref to the Discord bot user
    client: null           // Ref to the Discord client interface
  },
  cliArgs: null,         // Settings passed via CLI
  config: null,          // Bot config data
  state: {
    isLoggedIn: false,     // Whether the bot user is logged in
    isShuttingDown: false  // Whether the bot is currently shutting down
  },
  dev: {
    noPost: true           // Posting is replaced by a no-op
  },
  tasks: null,           // Parsed list of tasks that the bot is able to run
  pkgData: null,         // Application code package data (note: the top level package belonging to the monorepo)
  taskData: null,        // Code and metadata for all registered tasks
  systemTask: null       // Task object for the bot itself
}

module.exports = runtime
