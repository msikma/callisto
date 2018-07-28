/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { objectInspect, wrapInPre } from 'callisto-util-misc'
import { getSystemLogger } from './logging'

/**
 * Catches all uncaught exceptions.
 *
 * All tasks run within a try/catch block, so they can safely crash.
 * This is for all other cases, and it's very rare for this catch to be triggered.
 */
export const catchAllExceptions = async () => {
  process.on('uncaughtException', err => {
    getSystemLogger().error('Unhandled exception', `${err.code ? `Code: \`${err.code}\`\n\n` : ''}\`\`\`${err.stack}\`\`\``, [
      ...(err.name ? ['Name', `${err.name}`, true] : []),
      ...(err.id ? ['ID', `${err.id}`, true] : []),
      ...(err.error ? ['Error', wrapInPre(objectInspect(err.error)), false] : [])
    ])
  })
}

