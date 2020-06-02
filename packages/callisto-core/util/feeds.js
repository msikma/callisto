// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const fs = require('fs').promises
const { PassThrough } = require('stream')
const feedParser = require('FeedParser')

const { request } = require('../lib/request')

/**
 * Parses a feed string and returns its items. Returns a Promise.
 *
 * @param {String} content String contents of an RSS, Atom or RDF feed
 * @param {Object?} options Extra options to pass on to the FeedParser object
 */
const parseFeed = (content, options = {}) => new Promise((resolve, reject) => {
  // Create a stream from our string.
  const contentStream = new PassThrough()
  contentStream.write(content)
  contentStream.end()

  // Pipe it to the universal feed parser.
  const feed = new feedParser(options)
  contentStream.pipe(feed)

  const items = []

  // Reject on any parsing error.
  feed.on('error', err => reject(err))

  // Wait for all items to be collected, then resolve.
  feed.on('readable', function() {
    let item
    if (this.read) {
      while (item = this.read()) {
        items.push(item)
      }
    }
    resolve(items)
  })
})

/**
 * Parses a feed from a local filename.
 */
const parseFeedFile = async (filename, options = {}, encoding = 'utf8') => {
  const str = await fs.readFile(filename, encoding)
  const items = await parseFeed(str, options)
  return items
}

/**
 * Parses a feed by URL and returns its items. Returns a Promise.
 */
const parseFeedURL = (url, options = {}) => new Promise(async (resolve, reject) => {
  try {
    const content = await request(url)
    if (content.statusCode !== 200) {
      return resolve([])
    }
    const items = await parseFeed(content.body, options)
    return resolve(items)
  }
  catch (err) {
    return reject(err)
  }
})

module.exports = {
  parseFeed,
  parseFeedFile,
  parseFeedURL
}
