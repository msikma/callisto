// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { openDb } = require('./sqlite')
const runtime = require('../../state')

/** Returns path to the cache database file. */
const getCachePath = (cacheBaseDir = runtime.cacheDir) => {
  return `${cacheBaseDir}/cache-db.sqlite`
}

/**
 * Creates a new database file.
 * 
 * Used when running the program for the first time, and when running
 * the new-cache task.
 */
const createNewDb = async cacheBaseDir => {
  const cache = getCachePath(cacheBaseDir)
  //const newDb = 
  // start new db here
  console.log('STARTING NEW DB', cache)
  return {
    success: false,
    path: cache
  }
}

/**
 * Loads a cache database and checks if it's usable and has the necessary tables.
 */
const validateCacheFile = cacheBaseDir => {
  const cache = getCachePath(cacheBaseDir)
  console.log('VDALIDATE CACHE DB', cache)
  return {
    success: false
  }
}

module.exports = {
  getCachePath,
  createNewDb,
  openDb,
  validateCacheFile
}
