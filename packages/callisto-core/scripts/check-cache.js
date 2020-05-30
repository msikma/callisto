// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { logFatal, logError, log } = require('dada-cli-tools/log')
const { progName } = require('dada-cli-tools/util/fs')

const { cacheDbFilePath, openDb } = require('../lib/cache')

/**
 * Checks whether a cache database is in proper order.
 * 
 * Returns a number to be used as exit code.
 */
const checkCache$ = async ({ pathCache }) => {
  const pathCacheFile = cacheDbFilePath(pathCache)
  const result = await openDb(pathCacheFile, false)
  if (!result.success) {
    if (!result.exists) {
      return exitError('could not find cache database.', pathCacheFile)
    }
    if (result.exists && !result.access) {
      return exitError('could not open cache database - insufficient rights to read and write to file.', pathCacheFile)
    }
    else {
      return exitError(`could not open cache database (${result.error && result.error.code})${result.status.maybeCorrupted ? ' - the file may be corrupted' : ''}.`, pathCacheFile, result.error)
    }
  }
  if (result.success) {
    if (!result.status.hasAppTables) {
      log('Database is missing required tables (these will get created when running the bot for the first time).')
    }
    log('Cache database file OK:', pathCacheFile)
    return 0
  }
}

/** Exits the program if something went wrong. */
const exitError = (error, file, err, baseDir) => {
  const prog = progName()
  logFatal(`${prog}: error: ${error}`)
  if (err) logError(err)
  if (file) logError(`Cache database file invalid:`, file)
  if (baseDir) logError(`Used the following base directory:`, baseDir)
  return 1
}

module.exports = checkCache$
