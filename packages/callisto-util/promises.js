// Callisto - callisto-util <https://github.com/msikma/callisto>
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

module.exports = {
  promiseSerial
}
