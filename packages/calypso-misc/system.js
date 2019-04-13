/**
 * Calypso - calypso-misc <https://github.com/msikma/calypso>
 * © MIT license
 */

import { exec } from 'child_process'
import { readFile, writeFile } from './util'
import { data } from './resources'

// Links to a commit URL.
export const calypsoCommitURL = hash => `${data.pkg._calypso_commit_url}${hash}`

const lockfileLoc = botName => `${process.env.HOME}/.config/calypso/${botName}.lock`

// Check if this bot's lockfile exists.
export const getLockfile = (botName) => new Promise(async (resolve, reject) => {
  try {
    const data = await readFile(lockfileLoc(botName))
    return resolve(data)
  }
  catch (err) {
    return reject(err)
  }
})

// Saves a new lockfile.
export const saveLockFile = (botName) => new Promise(async (resolve, reject) => {
  try {
    await writeFile(lockfileLoc(botName))
    return resolve()
  }
  catch (err) {
    return reject(err)
  }
})

/**
 * Retrieves information about the system that the code is currently running on.
 */
export const getSystemInfo = async () => {
  const [branch, hash, hashFull, commits, server] = await Promise.all([
    callExternal('git describe --all | sed s@heads/@@'),
    callExternal('git rev-parse --short head'),
    callExternal('git rev-parse head'),
    callExternal('git rev-list head --count'),
    callExternal('uname -n')
  ])
  const commitLink = calypsoCommitURL(hashFull)

  return {
    formatted: `${branch}-${commits}`,
    branch,
    hash,
    hashFull,
    commits,
    server,
    commitLink
  }
}

/**
 * Calls an external program and returns the result.
 */
const callExternal = (cmd) => (
  new Promise((resolve, reject) => {
    exec(cmd, (error, stdout = '', stderr = '') => {
      if (error) return reject(stdout.trim(), stderr.trim(), error)
      else resolve(stdout.trim(), stderr.trim())
    })
  })
)
