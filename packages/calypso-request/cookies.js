/**
 * Calypso - calypso-request <https://github.com/msikma/calypso>
 * © MIT license
 */

import FileCookieStore from 'tough-cookie-file-store-sync'
import request from 'request'

/**
 * Allow setting individual cookies manually, rather than loading a file.
 */
export const jarFromArray = (cookieStrings, url) => {
  const jar = request.jar()
  cookieStrings.forEach(cookieStr => jar.setCookie(requestCookie(cookieStr), url))
  return jar
}

/**
 * Loads cookies from a specified cookies.txt file and loads them into
 * a jar so that we can make requests with them.
 */
export const jarFromFile = (cookieFile) => (
  new Promise((resolve, reject) => {
    try {
      // Cookies exported from the browser in Netscape cookie file format.
      // These are sent with our request to ensure we have access to logged in pages.
      const cookieStore = new FileCookieStore(cookieFile, { no_file_error: true })
      const jar = request.jar(cookieStore)
      resolve(jar)
    }
    catch (err) {
      reject(err)
    }
  })
)
