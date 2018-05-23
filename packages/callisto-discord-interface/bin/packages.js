const fs = require('fs')
const path = require('path')
const ArgumentParser = require('argparse').ArgumentParser
const addLongHelp = require('argparse-longhelp')
const package = require('../../../package.json')

const parser = new ArgumentParser({
  version: package.version,
  addHelp: true,
  description: 'Lists the packages supported by this version of Callisto in Markdown format.',
  epilog: package._callisto_copyright
})
addLongHelp(parser, '', true)
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
require('../src/index').listPackages()
