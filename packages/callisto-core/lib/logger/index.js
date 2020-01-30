// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

// Note: this logger is used for messages that should be seen remotely on Discord.
const discordFns = require('./discord')
const cacheSizeFns = require('./cache-size')
const exceptionsFns = require('./exceptions')

module.exports = {
  ...cacheSizeFns,
  ...discordFns,
  ...exceptionsFns
}
