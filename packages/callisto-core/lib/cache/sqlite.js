// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const sqlite = require('sqlite')
const { OPEN_READWRITE, OPEN_CREATE } = require('sqlite3')
const { fileExists, canAccess } = require('dada-cli-tools/util/fs')

/** Global handle for the database file. */
const db = {
  handle: null
}

/**
 * Attempts to open the database and returns the database state.
 * 
 * If 'createNew' is true, a new database will be created if none is found.
 * 
 * The following status bools are returned:
 * 
 *   - hasAppTables     - whether the required system tables are there (ready for production use)
 *   - createdNew       - whether we just newly created the database file
 *   - couldNotOpen     - if the database could not be opened (doesn't exist and couldn't create; no write access; or corrupted)
 *   - maybeCorrupted   - whether the database is possibly corrupted
 */
const openDb = async (dbFilePath, createNew = true) => {
  const mode = createNew ? (OPEN_READWRITE | OPEN_CREATE) : (OPEN_READWRITE)
  const exists = await fileExists(dbFilePath)
  const access = await canAccess(dbFilePath)

  let success = false
  let error = null

  let hasAppTables = false
  let createdNew = false
  let couldNotOpen = false
  let maybeCorrupted = false
  
  try {
    db.handle = await sqlite.open(dbFilePath, { mode })
    hasAppTables = await dbHasAppTables()
    success = true
    createdNew = !exists && createNew
  }
  catch (err) {
    success = false
    couldNotOpen = err.code === 'SQLITE_CANTOPEN'
    maybeCorrupted = exists && couldNotOpen
  }

  return {
    success,
    error,
    access,
    exists,
    create: createNew,
    status: {
      hasAppTables,
      createdNew,
      couldNotOpen,
      maybeCorrupted,
    }
  }
}

/**
 * Closes the database file. Needs to be done before shutdown.
 */
const closeDb = () => (
  db.handle.close()
)

/**
 * Inserts the required tables into an empty database.
 */
const installSystemTables = async () => {
  return await _createTables(dbHasAppTables, createCacheTable)
}

/**
 * Checks whether all the application's required tables are present in the database.
 * 
 * This returns a boolean: if it returns 'false', it means we need to create the tables.
 */
const dbHasAppTables = async () => {
  const tables = await Promise.all(['cached_items'].map(tableName => new Promise(async resolve => resolve(await dbHasTable(tableName)))))
  return !~tables.indexOf(false)
}

/**
 * Checks whether a table exists. Resolves with true/false.
 */
const dbHasTable = async ($name) => (
  !!await db.handle.get(`select * from sqlite_master where type='table' and name=$name`, { $name })
)

/**
 * Create the cache table, which is used to ensure we only post new items.
 */
const createCacheTable = () => (
  db.handle.run(`
    create table cached_items (
      id varchar(127),
      task text,
      title text,
      added datetime default current_timestamp,
      primary key (id, task)
    )
  `)
)

/**
 * Creates tables; takes both a function to check if some tables exist,
 * and a function that creates them. Returns whether the tables were
 * successfully created, and whether they were already there. 
 */
const _createTables = async (checkTablesFn, createTablesFn) => {
  let hasTables = false
  hasTables = await checkTablesFn()
  if (hasTables) return {
    success: true,
    status: {
      alreadyHadTables: true
    }
  }

  await createTablesFn()
  hasTables = await checkTablesFn()
  return {
    success: hasTables,
    status: {
      alreadyHadTables: false
    }
  }
}

module.exports = {
  db,
  openDb,
  closeDb,
  installSystemTables
}
