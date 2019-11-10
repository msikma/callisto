// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { db, openDb, closeDb, installSystemTables } = require('./sqlite')
const { findCachedIDs, filterOutCachedItems, globalizeIDs, cacheItems } = require('./cache-items')
const { cacheDbFilePath } = require('./files')

module.exports = {
  cacheDbFilePath,
  cacheItems,
  closeDb,
  filterOutCachedItems,
  findCachedIDs,
  globalizeIDs,
  installSystemTables,
  openDb,

  // Object containing the raw sqlite handle.
  db
}
