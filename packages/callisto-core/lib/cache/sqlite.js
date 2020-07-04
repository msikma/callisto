// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { isArray, isString } = require('lodash')
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

/**
 * Returns a list of which IDs, from a given array, have been cached in the database for a given task.
 * 
 * Requires a task and an array of IDs. Returns an array; empty if none are cached.
 */
const findCachedIDs = async (taskName, ids) => {
  if (!_hasItems(taskName, ids, 'ids')) return []

  const sql = (`
    select id, task
    from cached_items
    where id in (${new Array(ids.length).fill('?').join(', ')})
    and task = ?
  `)
  const stmt = await db.handle.prepare(sql)
  const cachedIDs = await stmt.all([...ids, taskName])
  return cachedIDs ? cachedIDs : []
}

/**
 * Adds the task name to the IDs in a list of objects.
 * 
 * Used to make IDs global in the database.
 */
const addNamespaceToIDs = (taskName, items, idName = 'id') => {
  if (!_hasItems(taskName, items, 'items')) return []
  return items.map(i => ({ ...i, [idName]: `${taskName}$${i.id}`}))
}

/**
 * Takes a list of items, checks which ones we've already cached in our database,
 * and returns a list of new items that we haven't reported on yet.
 *
 * Normally, you would scrape a page full of items, then run the results through
 * this function, and finally display only the ones we return from here.
 *
 * Every item needs to have at least an 'id' value.
 */
const filterOutCachedItems = async (taskName, items, idName = 'id') => {
  if (!_hasItems(taskName, items, 'items')) return []

  const ids = items.map(item => item[idName])
  const results = await findCachedIDs(taskName, ids)

  // We now have an array of objects with 'id' and 'taskName' from the database.
  // Make it an array of just IDs so we can check our list for previously seen items.
  const seenIDs = results.map(r => r[idName])
  const unseenItems = items.filter(i => seenIDs.indexOf(i[idName]) === -1)

  return unseenItems;
}

/**
 * Saves items into our database.
 */
const cacheItems = async (taskName, items) => {
  if (!_hasItems(taskName, items, 'items')) return null

  const stmt = await db.handle.prepare(`insert into cached_items values (?, ?, ?, CURRENT_TIMESTAMP)`)

  // If we try to cache something that's already cached, we should always be notified in the log.
  try {
    await Promise.all(items.map(i => new Promise(async (resolve, reject) => {
      // Warn if a single ID insertion goes wrong.
      try {
        await stmt.run(i.id, taskName, i.title)
        resolve()
      }
      catch (err) {
        logger.error(`${err} id: ${i.id}, task: ${taskName}`)
        reject({ id: i.id })
      }
    })))
  }
  catch (err) {
    // Warn if any of the IDs could not be inserted.
    logger.warn(`cacheItems: caching did not complete, ID was already found: ${err.id}`)
  }

  stmt.finalize()
  return stmt;
}

/**
 * Returns whether any items are present in the given iterable.
 * 
 * Also performs a type check, which throws a TypeError if invalid.
 */
const _hasItems = (taskName, iterable, iterableName) => {
  if (!taskName) throw new TypeError(`'taskName' needs to be passed`)
  if (!isString(taskName)) throw new TypeError(`'taskName' needs to be a string, but got: ${(typeof taskName)}`)
  if (!isArray(iterable)) throw new TypeError(`'${iterableName}' needs to be an array, but got: ${(typeof iterable)}`)
  return iterable.length > 0
}

module.exports = {
  db,
  openDb,
  closeDb,
  ensureAppTables,
  loadSettings,
  saveSettings,
  findCachedIDs,
  filterOutCachedItems,
  addNamespaceToIDs,
  cacheItems
}
