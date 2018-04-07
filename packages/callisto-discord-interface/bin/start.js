const fs = require('fs')
const path = require('path')
const ArgumentParser = require('argparse').ArgumentParser
const HelpFormatter = require('argparse/lib/help/formatter')
const package = require('../../../package.json')

// For some reason, argparse was outputting an extra linebreak after the usage text.
// This seems to happen when the previous usage line is a precise length.
// Bit hackish, but this removes it.
const removeUnnecessaryLines = (str) => (
  str.split('\n').map(s => s.trim() === '' ? s.trim() : s).join('\n').split('\n\n\n').join('\n\n')
)

const parser = new ArgumentParser({
  version: package.version,
  addHelp: true,
  description: package.description,
  epilog: package._callisto_copyright
})
parser.formatHelp = () => {
  const formatter = new HelpFormatter({ prog: parser.prog })
  formatter.addUsage(parser.usage, parser._actions, parser._mutuallyExclusiveGroups)
  formatter.addText(parser.description)
  parser._actionGroups.forEach((actionGroup) => {
    formatter.startSection(actionGroup.title)
    formatter.addText(actionGroup.description)
    formatter.addArguments(actionGroup._groupActions)
    formatter.endSection()
  });
  // Add epilogue without reformatting the whitespace.
  // Don't you DARE take away my linebreaks.
  formatter._addItem(str => str, [parser.epilog])
  // Somehow we ended up with double linebreaks!
  return removeUnnecessaryLines(formatter.formatHelp())
}
parser.addArgument('--test', { help: 'Runs the bot with a single task only for testing.', dest: 'task' })
parser.addArgument('--log', { help: `Sets console logging level. Default: 'verbose'.`, dest: 'level', choices: ['error', 'warn', 'info', 'verbose', 'debug'], defaultValue: 'verbose' })
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

// Fire up the main application.
require('../src/index').run(parsed)
