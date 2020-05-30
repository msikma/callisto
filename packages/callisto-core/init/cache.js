// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { logFatal, logInfo, logError, die } = require('dada-cli-tools/log')
const { progName, ensureDirBool } = require('dada-cli-tools/util/fs')

const { cacheDbFilePath, openDb, ensureAppTables } = require('../lib/cache')

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
  const pathCacheFile = cacheDbFilePath(pathCacheDir)
  const pathExists = await ensureDirBool(pathCacheDir)
  if (!pathExists) {
    return exitError('could not find cache base directory, and failed to create it.', null, null, pathCacheDir)
  }
  
  const result = await openDb(pathCacheFile, createNew)
  if (!result.success) {
    if (!result.exists && !result.create) {
      return exitError('could not find cache database (and not creating a new file).', pathCacheFile)
    }
    if (!result.exists && result.create) {
      return exitError('could not find cache database, and failed to create a new file.', pathCacheFile)
    }
    if (result.exists && !result.access) {
      return exitError('could not open cache database - insufficient rights to read and write to file.', pathCacheFile)
    }
    else {
      return exitError(`could not open cache database (${result.error && result.error.code})${result.status.maybeCorrupted ? ' - the file may be corrupted' : ''}.`, pathCacheFile, result.error)
    }
  }
  if (result.success) {
    if (result.status.createdNew) {
      logInfo('Created new database file:', pathCacheFile)
    }
    if (!result.status.hasAppTables) {
      await ensureAppTables()
      logInfo('Inserted application tables.')
    }

    return true
  }
}

/** Exits the program if there's something wrong with the cache file. */
const exitError = (error, file, err, baseDir) => {
  const prog = progName()
  logFatal(`${prog}: error: ${error}`)
  if (err) logError(err)
  if (file) logError(`Used the following file:`, file)
  if (baseDir) logError(`Used the following base directory:`, baseDir)
  logError(`You can create a new database file: ${prog} --new-cache`)
  die()
}

module.exports = initCache$
