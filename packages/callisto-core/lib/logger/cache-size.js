// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const filesize = require('file-size')
const { statSync } = require('fs')

const runtime = require('../../state')

/**
 * Returns the size of the cache file as a humanized string.
 */
const getCacheSize = () => {
  const { cachePath } = runtime
  return filesize(statSync(cachePath).size).human()
}

module.exports = {
  getCacheSize
}
