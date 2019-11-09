// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { logFatal, logInfo, logError, die } = require('dada-cli-tools/log')
const { canAccess, progName, ensureDirBool } = require('dada-cli-tools/util/fs')

const { getCachePath, openDb } = require('../lib/cache')



/**
 * Initializes the cache directory and database.
 * 
 *   1) verifies the cache directory exists and is writeable
 *   2) creates a new file if it does not exist (if applicable)
 *   3) connects to the cache database and ensures its tables are set up properly
 * 
 * If the cache database cannot be loaded, this will exit the program.
 * If this is the first time running the program and there's no database,
 * a new file will be created.
 */
const initCache$ = async (pathCacheDir, createNew = true) => {
  const pathCache = getCachePath(pathCacheDir)
  const pathExists = await ensureDirBool(pathCacheDir)
  if (!pathExists) {
    return exitCache('could not find cache base directory, and failed to create it.', pathCacheDir)
  }
  
  const result = await openDb(pathCache, createNew)
  if (!result.success) {
    if (!result.exists && !result.create) {
      return exitCache('could not find cache database (and not creating a new file).', pathCache)
    }
    if (!result.exists && result.create) {
      return exitCache('could not find cache database, and failed to create a new file.', pathCache)
    }
    if (result.exists && !result.access) {
      return exitCache('could open cache database - insufficient rights to read and write to file.', pathCache)
    }
    if (result.status.couldNotOpen) {
      return exitCache(`could not open cache database file (${result.error.code})${result.status.maybeCorrupted ? ' - the file may be corrupted' : ''}.`, pathCache, result.error)
    }
  }
  if (result.success) {
    if (result.status.createdNew) {
      logInfo('Created new database file:', pathCache)
    }

    return true
  }
}

/** Exits the program if there's something wrong with the cache file. */
const exitCache = (error, path, err) => {
  const prog = progName()
  logFatal(`${prog}: error: ${error}`)
  if (err) logError(err)
  logError(`Used the following file: ${path}`)
  logError(`You can create a new database file: ${prog} --new-cache`)
  die()
}

module.exports = initCache$
