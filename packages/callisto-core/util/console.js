// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

/**
 * Returns information about the console.
 */
const getConsoleInfo = () => {
  return {
    width: process.stdout.columns,
    height: process.stdout.rows
  }
}

module.exports = {
  getConsoleInfo
}
