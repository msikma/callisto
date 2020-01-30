// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const channelsFns = require('./channels')
const postFns = require('./post')

module.exports = {
  ...channelsFns,
  ...postFns
}
