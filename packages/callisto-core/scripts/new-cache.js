// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { logFatal, logDebug, logError } = require('dada-cli-tools/log')
const { progName, ensureDirBool } = require('dada-cli-tools/util/fs')

const { cacheDbFilePath, openDb } = require('../lib/cache')

/**
 * Creates a new cache database.
 * 
 * Returns a number to be used as exit code.
 */
const newCache$ = async ({ pathCache }) => {
  const pathCacheFile = cacheDbFilePath(pathCache)
  
  logDebug(`Creating new cache database file: ${pathCacheFile}`)

  const pathExists = await ensureDirBool(pathCache)
  if (!pathExists) {
    return exitError('could not find cache base directory, and failed to create it.', null, null, pathCache)
  }

  const result = await openDb(pathCacheFile, true)
  if (result.exists) {
    return exitError('could not create new cache database file - one already exists at the given path.', pathCacheFile)
  }
  if (result.success && result.status.createdNew) {
    return 0
  }

  return exitError('an unknown error occurred while attempting to create a new cache database file.', pathCacheFile, result.error)
}

/** Exits the program if something went wrong. */
const exitError = (error, file, err, baseDir) => {
  const prog = progName()
  logFatal(`${prog}: error: ${error}`)
  if (err) logError(err)
  if (file) logError(`Used the following path:`, file)
  if (baseDir) logError(`Used the following base directory:`, baseDir)
  return 1
}

module.exports = newCache$
