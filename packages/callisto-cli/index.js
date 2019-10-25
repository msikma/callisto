// Callisto - callisto-cli <https://github.com/msikma/callisto>
// © MIT license

const { homedir } = require('os')
const { makeArgParser } = require('dada-cli-tools')
const { ensurePeriod } = require('dada-cli-tools/util/text')

const homePath = homedir()
const pkgData = require('../../package.json')

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

  callisto.js --new-config <path>

The default location for config files is in ~/.config/callisto; the cache
file is located in ~/.cache/callisto, and will be created on first run.
`
  ),
  description: ensurePeriod(pkgData.description),
  epilog: 'Send questions and comments to @michielsikma on Twitter.'
})

const configDir = `${homePath}/.config/callisto`
const cacheDir = `${homePath}/.cache/callisto`

parser.addArgument('--config-path', { help: 'Path to the config file.', metavar: 'PATH', dest: 'configPath', defaultValue: `${configDir}/config.js` })
parser.addArgument('--check-config', { action: 'storeTrue', help: 'Verifies whether the config file is correct.', dest: 'checkConfig' })
parser.addArgument('--cache-path', { help: 'Path to the cache directory.', metavar: 'PATH', dest: 'cachePath', defaultValue: `${cacheDir}/` })
parser.addArgument('--check-cache', { action: 'storeTrue', help: 'Verifies whether the cache database is intact.', dest: 'checkCache' })

parser.addArgument('--new-cache', { nargs: '?', help: 'Creates a new, empty cache database.', metavar: 'PATH', dest: 'newCache' })
parser.addArgument('--new-config', { nargs: '?', help: 'Creates a config file with standard values.', metavar: 'PATH', dest: 'newConfig' })

parser.addArgument('--dev-task', { help: 'Runs the bot with a single task only for testing.', metavar: 'TASK', dest: 'devTask' })
parser.addArgument('--dev-dont-post', { help: 'Replaces Discord posting code with a no-op.', action: 'storeTrue', dest: 'noPost' })
parser.addArgument('--dev-list-tasks', { help: 'Lists supported tasks in Markdown format.', dest: 'listTasks', action: 'storeTrue' })
parser.addArgument('--log', { help: `Sets console logging level ("info" by default).`, dest: 'level', choices: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'], defaultValue: 'info' })

// 'task' is null or a string, e.g. 'rarbg'.
// 'level' is one of the logging choices, except 'silly' because we don't use it. It's 'info' by default.
const parsed = { ...parser.parseArgs() }

console.log('parsed cli args:');
console.log(parsed);
