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

  let dbHasAppTables = false
  let createdNew = false
  let couldNotOpen = false
  let maybeCorrupted = false
  
  try {
    db.handle = await sqlite.open(dbFilePath, { mode })
    dbHasAppTables = await hasAppTables()
    success = true
    createdNew = !exists && createNew
  }
  catch (err) {
    success = false
    couldNotOpen = err.code === 'SQLITE_CANTOPEN'
    maybeCorrupted = exists && couldNotOpen
    error = err
  }

  return {
    success,
    error,
    access,
    exists,
    create: createNew,
    status: {
      hasAppTables: dbHasAppTables,
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
 * Checks whether the required application tables are present in the database,
 * and inserts them if they're not.
 */
const ensureAppTables = async () => {
  return await _createTables(hasAppTables, createAppTables)
}

/**
 * Creates the tables needed to run the application.
 */
const createAppTables = async () => {
  await createCacheTable()
  await createSettingsTable()
}

/**
 * Checks whether all the application's required tables are present in the database.
 * 
 * This returns a boolean: if it returns 'false', it means we need to create the tables.
 */
const hasAppTables = async () => {
  const tables = await Promise.all(['cached_items', 'task_settings'].map(tableName =>
    new Promise(async resolve => resolve(await hasTable(tableName)))))
  return !~tables.indexOf(false)
}

/**
 * Checks whether a table exists. Resolves with true/false.
 */
const hasTable = async ($name) => (
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
 * Create the settings table.
 */
const createSettingsTable = () => (
  db.handle.run(`
    create table task_settings (
      identifier varchar(127),
      namespace varchar(127),
      data text,
      primary key (identifier, namespace)
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

/**
 * Returns task settings. If settings do not exist in the database, we will create an empty row.
 * There are two settings objects in the database: one for the task itself, and one for the system.
 * The system task includes when the task was last run. It uses this to decide when to
 * run the task.
 *
 * @param {String} $identifier Name of the task
 * @param {String} $namespace Either 'task' or 'system'
 */
const loadSettings = async ($identifier, $namespace = 'task') => {
  const row = await db.handle.get(`
    select * from task_settings
    where identifier=$identifier
    and namespace=$namespace
  `, { $identifier, $namespace })

  if (!row) {
    // If no data exists, make an empty row. Data is always an object (serialized as JSON), so return {} by default.
    await saveSettings($identifier, $namespace, {});
    return {};
  }
  else {
    // Return deserialized JSON from the database.
    return JSON.parse(row.data);
  }
}

/**
 * Replaces saved task settings with a new set.
 *
 * @param {String} $identifier Name of the task
 * @param {String} $namespace Either 'task' or 'system'
 * @param {Object} $data Data to save to the setting
 */
const saveSettings = async ($identifier, $namespace, $data) => (
  db.handle.run(`
    insert or replace into task_settings
    (identifier, namespace, data)
    values ($identifier, $namespace, $data)
  `, { $identifier, $namespace, $data: JSON.stringify($data) })
)

module.exports = {
  db,
  openDb,
  closeDb,
  ensureAppTables,
  loadSettings,
  saveSettings
}
