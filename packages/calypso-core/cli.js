/**
 * Calypso - calypso-core <https://github.com/msikma/calypso>
 * © MIT license
 */

const { homedir } = require('os')
const { resolve } = require('path')
const { ArgumentParser } = require('argparse')
const addLongHelp = require('argparse-longhelp')

const homePath = homedir()
const pkgData = require('../../package.json')

// Resolve the base directory to clean it up; e.g. 'path/bin/..' becomes 'path/'.
process.env.CALYPSO_BASE_DIR = resolve(process.env.CALYPSO_BASE_DIR);

const parser = new ArgumentParser({
  version: pkgData.version,
  addHelp: true,
  description: `${pkgData.description}.`,
  epilog: 'Send questions and comments to @michielsikma on Twitter.'
})
addLongHelp(parser, `To run this bot, you need to register an application in the Discord\ndeveloper portal, create a new bot user on that application, and then invite\nthat bot to the server you intend on posting to.\nSee the readme for more information.\n\nDiscord developer portal: <https://discordapp.com/developers/applications>\nCalypso documentation: <${pkgData.homepage}>\n`, true)
parser.addArgument('--config-path', { help: 'Path to the config file (~/.config/calypso/config.js).', metavar: 'PATH', dest: 'configPath', defaultValue: `${homePath}/.config/calypso/config.js` })
parser.addArgument('--db-path', { help: 'Path to the database (~/.config/calypso/db.sqlite).', metavar: 'PATH', dest: 'dbPath', defaultValue: `${homePath}/.config/calypso/db.sqlite` })
parser.addArgument('--new-config', { help: 'Creates a config file with standard values and exits.', metavar: 'PATH', dest: 'newConfig' })
parser.addArgument('--new-db', { help: 'Creates a new, empty database and exits.', metavar: 'PATH', dest: 'newDb' })
parser.addArgument('--list-tasks', { help: 'Lists supported tasks in Markdown format and exits.', dest: 'listTasks', action: 'storeTrue' })
parser.addArgument('--test', { help: 'Runs the bot with a single task only for testing.', dest: 'task' })
parser.addArgument('--log', { help: `Sets console logging level ('info').`, dest: 'level', choices: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'], defaultValue: 'info' })
parser.addArgument('--no-post', { help: 'Replaces Discord posting code with a no-op.', action: 'storeTrue', dest: 'noPost' })

// 'task' is null or a string, e.g. 'rarbg'.
// 'level' is one of the logging choices, except 'silly' because we don't use it. It's 'info' by default.
const parsed = { ...parser.parseArgs() }

// Add our packages root to the include path so we can use absolute imports.
require('include-path')(`${__dirname}/../../`)

// Install the require() hook.
require('babel-polyfill')
require('babel-register')({
  presets: [require('babel-preset-env'), require('babel-preset-react')],
  plugins: [
    require('babel-plugin-transform-class-properties'),
    require('babel-plugin-transform-object-rest-spread')
  ]
})

// Import actions now, since we only just activated Babel.
const actions = require('./actions')

const coreTasks = {
  newConfig: (path) => actions.newSystemFile('config', path),
  newDb: (path) => actions.newSystemFile('db', path),
  listTasks: actions.listPackages
}
const doTasks = Object.keys(parsed).filter(cmd => !!coreTasks[cmd] && !!parsed[cmd])

if (doTasks.length > 0) {
  // Run task scripts and exit.
  doTasks.forEach(cmd => coreTasks[cmd](parsed[cmd]))
  process.exitCode = 0
}
else {
  // Start the main application.
  require('./index').run(parsed)
}
