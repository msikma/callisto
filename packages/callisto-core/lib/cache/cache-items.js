// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { isArray, isString } = require('lodash')
const db = require('./sqlite')

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
  const results = await filterCachedIDs(taskName, ids)

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

  const stmt = await db.prepare(`insert into cached_items values (?, ?, ?, CURRENT_TIMESTAMP)`)

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
  findCachedIDs,
  filterOutCachedItems,
  addNamespaceToIDs,
  cacheItems
}
