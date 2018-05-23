/**
 * Callisto - callisto-util-request <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { loadCookieFile as loadCookieFileReq, requestCookie } from 'requestAsBrowser'

// Keep our cookies globally available.
const cookieJar = {
  jar: null
}

/**
 * Allow setting individual cookies manually, rather than loading a file.
 */
export const setCookies = (cookieStrings, url) => {
  cookieStrings.forEach(cookieStr => cookieJar.jar.setCookie(requestCookie(cookieStr), url))
}

/**
 * Loads cookies from the specified cookies.txt file (or the default file)
 * and loads them into a jar so that we can make requests with them.
 *
 * Cookies must be exported from the browser in Netscape cookie file format.
 * Without cookies, all requests will be logged out. This particularly affects Pixiv.
 */
export const loadCookieFile = async (file) => {
  // If passing a null value, just delete the jar and go back to logged out calls.
  if (!file) {
    cookieJar.jar = null
    return
  }
  cookieJar.jar = (await loadCookieFileReq(file)).jar
}

export default cookieJar
