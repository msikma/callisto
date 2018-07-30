/**
 * Callisto - callisto-util-misc <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { wrapInMono, wrapInPre, objectInspect } from './util'
import { get } from 'lodash'

/** Returns an object we can easily log from an error. */
export const errorObject = err => {
  const code = getFB(err, 'code')
  const stack = getFB(err, 'stack')
  const name = getFB(err, 'name')
  const id = getFB(err, 'id')
  const message = getFB(err, 'message')

  const serverName = get(err, '_socket.servername')
  const targetURL = get(err, 'target.url')

  const msg = []
  if (targetURL) msg.push(`Target URL: [${targetURL}](${targetURL})`)
  if (stack) msg.push(`${wrapInPre(stack)}`)
  if (!targetURL && !code && !stack) msg.push(`No description available.`)

  const fields = []
  if (name && name.toLowerCase() !== 'error') fields.push(['Name', `${name}`, true])
  if (code) fields.push(['Code', `${wrapInMono(code)}`, true])
  if (id) fields.push(['ID', `${id}`, true])
  if (serverName) fields.push(['Socket server name', `${serverName}`, true])
  if (message) fields.push(['Message', `${message}`, true])

  return [msg, fields]
}

/** Returns a field from the error, either from its root or from its .error member. */
const getFB = (err, path) => (
  get(err, path, get(err, `error.${path}`))
)
