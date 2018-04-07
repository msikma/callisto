const fs = require('fs')
const path = require('path')
const ArgumentParser = require('argparse').ArgumentParser
const HelpFormatter = require('argparse/lib/help/formatter')
const package = require('../../../package.json')

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
  return formatter.formatHelp()
}
parser.addArgument('--test', { help: 'Runs the bot with a single task only for testing.', dest: 'task' })
// 'task' is null or a string, e.g. 'rarbg'. Do not add the 'callisto-task' part.
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
