/**
 * Callisto - callisto-util-misc <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { exec } from 'child_process'
import { readFile, writeFile } from './util'
import { pkg } from './resources'

// Links to a commit URL.
export const callistoCommitURL = hash => `${pkg._callisto_commit_url}${hash}`

const lockfileLoc = botName => `${process.env.HOME}/.config/callisto/${botName}.lock`

// Check if this bot's lockfile exists.
export const getLockfile = (botName) => new Promise((resolve, reject) => {
  try {
    const data = await readFile(lockfileLoc(botName))
    return resolve(data)
  }
  catch (err) {
    console.log(err)
    return reject(err)
  }
})

// Saves a new lockfile.
export const saveLockFile = (botName) => new Promise((resolve, reject) => {
  try {
    await writeFile(lockfileLoc(botName))
  }
  catch (err) {
    console.log(err)
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
  const commitLink = callistoCommitURL(hashFull)

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
