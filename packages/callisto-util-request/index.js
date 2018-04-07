/**
 * Callisto - callisto-util-request <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import request from 'request-promise-native'
import requestSync from 'request'
import FileCookieStore from 'file-cookie-store'

// Cookie file and jar container.
const cookies = {
  file: process.env.COOKIE_FILE,
  jar: request.jar()
}

// These headers are sent with each request to make us look more like a real browser.
const browserHeaders = {
  'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8,nl;q=0.7,de;q=0.6,es;q=0.5,it;q=0.4,pt;q=0.3',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive'
}

/**
 * Loads cookies from the specified cookies.txt file (or the default file)
 * and loads them into a jar so that we can make requests with them.
 */
export const loadCookies = (cookieOverride) => {
  // Cookies exported from the browser in Netscape cookie file format.
  // These are sent with our request to ensure we have access to logged in pages.
  const cookieFile = cookieOverride || process.env.COOKIE_FILE
  const cookieStore = new FileCookieStore(cookieFile, { no_file_error: true })
  cookies.file = cookieFile
  cookies.jar = request.jar(cookieStore)
}

/**
 * Safely requests and returns the HTML for a URL.
 *
 * This mimics a browser request to ensure we don't hit an anti-bot wall.
 */
export const requestAsBrowser = (url, extraHeaders = {}, gzip = true, noCookies = false) => (
  request({
    url,
    headers: { ...browserHeaders, ...extraHeaders },
    jar: noCookies ? null : cookies.jar,
    gzip
  })
)

/**
 * Same as requestAsBrowser, but does a POST request and includes form data.
 * This sends a form upload using application/x-www-form-urlencoded.
 */
export const postAsBrowser = (url, form, extraHeaders = {}, gzip = true, noCookies = false) => (
  request.post({
    url,
    form,
    headers: { ...browserHeaders, ...extraHeaders },
    jar: noCookies ? null : cookies.jar,
    gzip
  })
)

/**
 * Alternate version of requestAsBrowser() that takes a callback instead.
 * This is used because request-promise-native currently has a bug related to piping to a file,
 * which we use to download files.
 *
 * See <https://github.com/request/request-promise/issues/90>
 */
export const requestAsBrowserCb = (url, extraHeaders = {}, cb, gzip = true) => (
  requestSync({ url, headers: { ...browserHeaders, ...extraHeaders }, jar: cookies.jar, gzip }, cb)
)
