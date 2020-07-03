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

/**
 * Ensures a URL has http:// or https:// in front of it.
 * 
 * Primarily for URLs that start with // so that they work either on http or https pages.
 */
const ensureHttp = (url, preferHttps = true) => {
  if (url.startsWith('https://')) return url
  if (url.startsWith('//')) return (preferHttps ? 'https:' : 'http:') + url
  return (preferHttps ? 'https://' : 'http://') + url
}

module.exports = {
  getQueryVariable,
  ensureHttp
}
