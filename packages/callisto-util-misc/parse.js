/**
 * Callisto - callisto-util-misc <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { PassThrough } from 'stream'
import rssParser from 'parse-rss'
import feedParser from 'FeedParser'

import { requestURL } from 'callisto-util-request'

/**
 * Returns a promise which, upon resolution, contains the contents of the RSS found at the given URL.
 * Note: this is deprecated.
 */
export const rssParse = (url, alwaysResolve = false) => new Promise((resolve, reject) => {
  rssParser(url, (err, rss) => {
    if (err) {
      // If we're always resolving, send back an empty array.
      if (alwaysResolve) return resolve([])
      return reject(err, rss)
    }
    if (rss) return resolve(rss)
  })
})

/**
 * Parses a feed string and returns its items. Returns a Promise.
 *
 * @param {String} content String contents of an RSS, Atom or RDF feed
 * @param {Object?} options Extra options to pass on to the FeedParser object
 */
export const parseFeed = (content, options = {}) => new Promise((resolve, reject) => {
  // Create a stream from our string.
  const contentStream = new PassThrough()
  contentStream.write(content)
  contentStream.end()

  // Pipe it to the universal feed parser.
  const feed = new feedParser(options)
  contentStream.pipe(feed)

  const items = []

  // Reject on any parsing error.
  feed.on('error', (err) => {
    reject(err)
  })

  // Wait for all items to be collected, then resolve.
  feed.on('readable', function readItems() {
    let item
    while (item = this.read()) {
      items.push(item)
    }
    resolve(items)
  })
})

/**
 * Parses a feed by URL and returns its items. Returns a Promise.
 *
 * @param {String} url URL to the stream we want to download and parse
 * @param {Boolean} alwaysResolve Returns an empty array if there were any errors, if true (otherwise throws)
 * @param {Object?} options Extra options to pass on to the FeedParser object
 */
export const parseFeedURL = (url, alwaysResolve = false, options = {}) => new Promise(async (resolve, reject) => {
  try {
    const content = await requestURL(url)
    const items = await parseFeed(content, options)
    return resolve(items)
  }
  catch (err) {
    if (alwaysResolve) return resolve([])
    else return reject(err)
  }
})
