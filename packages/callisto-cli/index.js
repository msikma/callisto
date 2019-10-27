// Callisto - callisto-cli <https://github.com/msikma/callisto>
// © MIT license

const { resolve } = require('path')
const { makeArgParser } = require('dada-cli-tools/argparse')
const { logLevels, logDefaultLevel } = require('dada-cli-tools/log')
const { ensurePeriod } = require('dada-cli-tools/util/text')
const { resolveTilde } = require('dada-cli-tools/util/fs')
const { readJSONSync } = require('dada-cli-tools/util/read')

// Command line interface for Callisto.
//
// The following data is obtained:
//
//   { checkCache: false,
//     checkConfig: false,
//     newCache: false,
//     newConfig: false,
//     listTasks: false,
//
//     devNoop: false,
//     devTask: null,
//     logLevel: 'info',
//
//     pathCache: '/Users/msikma/.cache/callisto/',
//     pathConfig: '/Users/msikma/.config/callisto/config.js' }
//
// These arguments either instruct us to run one of the task scripts
// which can be found in callisto-core/tasks, or starts up the main application.
// If an invalid set of arguments is passed, usage information will be displayed.

// Path to the application code, i.e. where the top level package.json resides.
const pkgPath = resolve(`${__dirname}/../../`)
const pkgData = readJSONSync(`${pkgPath}/package.json`)

const parser = makeArgParser({
  version: pkgData.version,
  addHelp: true,
  longHelp: (
    `To run this bot, you need to register an application in the Discord
developer portal, create a new bot user on that application, and then invite
that bot to the server you intend on posting to.
See the readme for more information.

Discord developer portal:   <https://discordapp.com/developers/applications>
Callisto documentation:     <${pkgData.homepage}>

Create a new config file with:

  callisto.js --new-config

The default location for config files is in ~/.config/callisto; the cache
file is located in ~/.cache/callisto, and will be created on first run.
`
  ),
  description: ensurePeriod(pkgData.description),
  epilog: 'Send questions and comments to @michielsikma on Twitter.'
})

// Default paths for the config and cache files.
const configDir = resolveTilde('~/.config/callisto')
const cacheDir = resolveTilde('~/.cache/callisto')

parser.addArgument('--config-path', { help: 'Path to the config file.', metavar: 'PATH', dest: 'pathConfig', defaultValue: `${configDir}/config.js` })
parser.addArgument('--check-config', { action: 'storeTrue', help: 'Verifies whether the config file is correct.', dest: 'checkConfig' })
parser.addArgument('--cache-path', { help: 'Path to the cache and logs directory.', metavar: 'PATH', dest: 'pathCache', defaultValue: `${cacheDir}/` })
parser.addArgument('--check-cache', { action: 'storeTrue', help: 'Verifies whether the cache database is intact.', dest: 'checkCache' })

parser.addArgument('--new-cache', { action: 'storeTrue', help: 'Creates a new, empty cache database.', metavar: 'PATH', dest: 'newCache' })
parser.addArgument('--new-config', { action: 'storeTrue', help: 'Creates a config file with standard values.', metavar: 'PATH', dest: 'newConfig' })

parser.addArgument('--log', { help: `Sets console logging level ("${logDefaultLevel}" by default). Choices: {${logLevels.join(',')}}.`, dest: 'logLevel', choices: logLevels, metavar: 'LEVEL', defaultValue: 'info' })
parser.addArgument('--dev-task', { help: 'Runs the bot with a single task only for testing.', metavar: 'TASK', dest: 'devTask' })
parser.addArgument('--dev-dont-post', { help: 'Replaces Discord posting code with a no-op.', action: 'storeTrue', dest: 'devNoop' })
parser.addArgument('--dev-list-tasks', { help: 'Lists supported tasks in Markdown format.', dest: 'listTasks', action: 'storeTrue' })

// Parse input. If usage is incorrect, the program will exit and display an error.
const parsed = { ...parser.parseArgs() }

// Run either the requested task (e.g. 'checkConfig') or the bot.
const core = require('callisto-core')
const tasks = ['checkConfig', 'checkCache', 'newConfig', 'newCache', 'listTasks']
const task = Object.entries(parsed).find(n => ~tasks.indexOf(n[0]) && n[1])

if (task) {
  const exitCode = core.tasks[task[0]](parsed)
  process.exit(exitCode)
}

// Start the bot.
// If something goes wrong during initialization, the process will terminate.
// Otherwise, the bot will continue running until exited using CTRL+C.
core.runBot$(parsed, { pkgData, baseDir: pkgPath })
