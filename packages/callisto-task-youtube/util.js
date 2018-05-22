/**
 * Callisto - callisto-task-youtube <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import fs from 'fs'
import cheerio from 'cheerio'
import xml2js from 'xml2js'

import logger from 'callisto-util-logging'
import { findScriptData } from 'callisto-util-misc'
import { config } from 'callisto-util-misc/resources'
import { requestAsBrowser } from 'callisto-util-request'

const parser = new xml2js.Parser()

// Used to extract the video ID from a URL.
const videoID = new RegExp('watch\\?v=(.+?)$')

// Returns the video ID for a given Youtube URL.
export const getVideoID = (url) => {
  const idMatch = url.match(videoID)
  return videoID && videoID[1].trim()
}

// Returns a Youtube video URL from a video ID.
export const videoURL = (watch, prefix = '/watch?v=') => (
  `https://www.youtube.com${prefix}${watch}`
)

// Parses a subscriptions XML file.
export const readSubscriptions = (url, slug) => (
  new Promise((resolve, reject) => {
    parser.reset()
    logger.debug(`youtube: ${slug}: Reading subscriptions XML file: ${url.replace(config.CALLISTO_BASE_DIR, '')}`)
    fs.readFile(url, (errFs, data) => {
      parser.parseString(data, (errParse, result) => {
        if (errFs || errParse) return reject(errFs, errParse, result)
        return resolve(result)
      });
    });
  })
)

// Scrapes a Youtube video page and returns the initial player response data.
// This contains all of the video's extended information such as the description,
// keywords, thumbnails, view count, etc.
export const getVideoExtendedInfo = async (videoURL) => {
  const html = await requestAsBrowser(videoURL)
  const $html = cheerio.load(html)
  const { ytInitialPlayerResponse } = getPageInitialData($html)
  return ytInitialPlayerResponse
}

// Finds the <script> tag containing the 'ytInitialData' object.
const findDataContent = ($) => (
  $('script')
    .filter((n, el) => $(el).html().indexOf('window["ytInitialData"]') !== -1)
    .map((n, el) => $(el).html())
    .get()[0]
)

/**
 * Returns the largest thumbnail from an array of Youtube video thumbnails.
 */
export const getBestThumbnail = (thumbnails) => {
  const best = thumbnails.reduce((acc, curr) => Number(curr.width) > Number(acc.width) ? curr : acc, { width: 0, height: 0, url: '' })
  return best.url
}

// Returns the 'initial data' Javascript object used by Youtube to render the page.
// There are two objects: 'ytInitialData' and 'ytInitialPlayerResponse'.
// The former is useful when running searches, the latter when looking at detail pages.
export const getPageInitialData = ($) => {
  const pageDataString = findDataContent($)
  const pageData = findScriptData(pageDataString)
  const { ytInitialData, ytInitialPlayerResponse } = pageData.sandbox.window
  return { ytInitialData, ytInitialPlayerResponse }
}
