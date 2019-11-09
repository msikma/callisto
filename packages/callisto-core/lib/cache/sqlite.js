// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const sqlite = require('sqlite')
const { OPEN_READWRITE, OPEN_CREATE } = require('sqlite3')
const { isArray, get } = require('lodash')
const { fileExists, canAccess } = require('dada-cli-tools/util/fs')

/** Global handle for the database file. */
let db

/**
 * Attempts to open the database and returns the database state.
 */
const openDb = async (dbPath = './database.sqlite', createNew = true) => {
  const mode = createNew ? OPEN_READWRITE | OPEN_CREATE : OPEN_READWRITE
  const exists = await fileExists(dbPath)
  const access = await canAccess(dbPath)

  let success = false
  let error = null

  let createdNew = false
  let couldNotOpen = false
  let maybeCorrupted = false
  
  try {
    await sqlite.open(dbPath, { mode })
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
      createdNew,
      couldNotOpen,
      maybeCorrupted,
    }
  }
}

const createDb = async dbPath => {

}

/**
 * Opens the database file and checks whether we need to bootstrap our required tables.
 */
const initDb = async (dbPath) => {
  db = await sqlite.open(dbPath)
  // If we don't have the 'cached_items' table, assume that this is a new database file.
  if (!await hasTable('cached_items')) {
    await createTables()
  }
  return {
    success: db.driver.open,
    i
  }
}

/**
 * Checks whether a table exists. Resolves with true/false.
 */
const hasTable = async ($name) => (
  !!await db.get(`select * from sqlite_master where type='table' and name=$name`, { $name })
)

/**
 * Creates all necessary tables.
 */
const createTables = () => (
  Promise.all([
    db.run(`
      create table cached_items (
        id varchar(127),
        task text,
        title text,
        added datetime default current_timestamp,
        primary key (id, task)
      )
    `),
    db.run(`
      create table task_settings (
        identifier varchar(127),
        namespace varchar(127),
        data text,
        primary key (identifier, namespace)
      )
    `)
  ])
)

/**
 * Closes the database file.
 */
const closeDb = () => (
  db.close()
)

/**
 * Returns a list of which IDs, from a given array, have been cached in the database.
 */
const filterCachedIDs = async (task, check) => {
  if (!check) return

  // Ensure our ids are in an array.
  const ids = !isArray(check) ? [check] : check
  const sql = (`
    select id, task
    from cached_items
    where id in (${new Array(ids.length).fill('?').join(', ')})
    and task = ?
  `)
  const stmt = await db.prepare(sql)
  const cachedIDs = await stmt.all([...ids, task])
  return cachedIDs ? cachedIDs : []
}

/** Adds (or replaces) an ID with one that includes the task name. */
const addTaskID = (task, items, idName = 'id') => {
  return items.map(i => ({ ...i, [idName]: `${task}$${i.id}`}))
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
const removeCached = async (task, items) => {
  if (items.length === 0) return []

  const ids = items.map(item => item.id)
  const results = await filterCachedIDs(task, ids)

  // We now have an array of objects with 'id' and 'task' from the database.
  // Make it an array of just IDs so we can check our list for previously seen items.
  const seenIDs = results.map(r => r.id)
  const newItems = items.filter(i => seenIDs.indexOf(i.id) === -1)

  return newItems;
}

/**
 * Saves items into our database.
 */
const cacheItems = async (task, items) => {
  if (items.length === 0) return
  const stmt = await db.prepare(`insert into cached_items values (?, ?, ?, CURRENT_TIMESTAMP)`)

  // If we try to cache something that's already cached, we should always be notified in the log.
  try {
    await Promise.all(items.map(i => new Promise(async (resolve, reject) => {
      // Warn if a single ID insertion goes wrong.
      try {
        await stmt.run(i.id, task, i.title)
        resolve()
      }
      catch (err) {
        logger.error(`${err} id: ${i.id}, task: ${task}`)
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
 * Returns task settings. If settings do not exist in the database, we will create an empty row.
 * There are two settings objects in the database: one for the task itself, and one for the system.
 * The system task includes when the task was last run. It uses this to decide when to
 * run the task.
 *
 * @param {String} $identifier Name of the task
 * @param {String} settingsType Either 'task' or 'system'
 */
const loadSettings = async ($identifier, $namespace = 'task') => {
  const row = await db.get(`
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
 */
const saveSettings = async ($identifier, $namespace, $data) => (
  db.run(`
    insert or replace into task_settings
    (identifier, namespace, data)
    values ($identifier, $namespace, $data)
  `, { $identifier, $namespace, $data: JSON.stringify($data) })
)

module.exports = {
  openDb,
  createDb,
  initDb
}
