// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const filesize = require('filesize')
const { statSync } = require('fs')

const runtime = require('../../state')

/** Returns formatted filesize string. */
const getFilesizeString = filesize.partial({ standard: 'iec' })

/**
 * Returns the size of the cache file as a humanized string.
 */
const getCacheSize = () => {
  const { cachePath } = runtime
  return getFilesizeString(statSync(cachePath).size)
}

module.exports = {
  getCacheSize
}
