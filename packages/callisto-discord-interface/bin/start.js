const fs = require('fs')
const path = require('path')
const ArgumentParser = require('argparse').ArgumentParser
const addLongHelp = require('argparse-longhelp')
const package = require('../../../package.json')

const parser = new ArgumentParser({
  version: package.version,
  addHelp: true,
  description: package.description,
  epilog: '(C) Michiel Sikma, 2018. All rights reserved.\nSend questions and comments to @michielsikma on Twitter.'
})
addLongHelp(parser, 'To run this bot, you need to register an application in the Discord\ndeveloper portal, and you need to invite that account to the channels you\nintend on posting to. See the readme for more information.\n', true)
parser.addArgument('--test', { help: 'Runs the bot with a single task only for testing.', dest: 'task' })
parser.addArgument('--no-post', { help: 'Replaces Discord posting code with a no-op.', action: 'storeTrue', dest: 'noPost' })
parser.addArgument('--log', { help: `Sets console logging level. Default: 'verbose'.`, dest: 'level', choices: ['error', 'warn', 'info', 'verbose', 'debug'], defaultValue: 'verbose' })
parser.addArgument('--list-tasks', { help: 'Lists supported tasks in Markdown format and exits.', action: 'storeTrue' })
// 'task' is null or a string, e.g. 'rarbg'. Do not add the 'callisto-task' part.
// 'level' is one of the logging choices, except 'silly' because we don't use it. It's 'verbose' by default.
const parsed = { ...parser.parseArgs() }

// Add our packages root to the include path so we can use absolute imports.
require('include-path')(`${__dirname}/../../`)

// Install the require() hook.
require('babel-polyfill')
require('babel-register')({
  presets: [require('babel-preset-env')],
  plugins: [
    require('babel-plugin-transform-class-properties'),
    require('babel-plugin-transform-object-rest-spread')
  ]
})

if (parsed['list_tasks']) {
  // List tasks and exit.
  require('../src/index').listPackages()
}
else {
  // Main application.
  require('../src/index').run(parsed)
}
