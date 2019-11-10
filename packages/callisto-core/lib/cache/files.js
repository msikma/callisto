// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const runtime = require('../../state')

/** Returns path to the cache database file from a base dir. */
const cacheDbFilePath = (cacheBaseDir = runtime.cacheDir) => {
  return `${cacheBaseDir}/cache-db.sqlite`
}

module.exports = {
  cacheDbFilePath
}
