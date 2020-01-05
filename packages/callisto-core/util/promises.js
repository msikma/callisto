// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

/**
 * Runs a series of promises sequentially.
 */
const promiseSerial = (tasks) => (
  tasks.reduce((promiseChain, currentTask) => (
    promiseChain.then(chainResults => (
      currentTask.then(currentResult => [...chainResults, currentResult])
    ))
  ), Promise.resolve([]))
)

/**
 * Promisified version of setInterval() for use with await.
 * Use like: await wait(1000) to halt execution 1 second.
 */
const wait = (ms) => (
  new Promise((resolve) => (
    setInterval(() => resolve(), ms)
  ))
)

module.exports = {
  promiseSerial,
  wait
}
