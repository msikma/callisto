// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const Url = require('url-parse')

/**
 * Returns a parsed URL.
 */
const getQueryVariable = (url, varName) => {
  const urlData = new Url(url)
  const query = new URLSearchParams(urlData.query)
  return query.get(varName)
}

module.exports = {
  getQueryVariable
}
