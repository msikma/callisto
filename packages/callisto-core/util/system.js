// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const runtime = require('../state')
const { exec } = require('child_process')

// Links to a commit URL.
const getCommitURL = hash => `${runtime.pkgData._callisto_commit_url}${hash}`

/**
 * Calls an external program and returns the result.
 */
const callExternal = cmd => new Promise((resolve, reject) => (
  exec(cmd, (error, stdout = '', stderr = '') => {
    if (error) return reject(stdout.trim(), stderr.trim(), error)
    else resolve(stdout.trim(), stderr.trim())
  })
))

/**
 * Retrieves information about the system that the code is currently running on.
 */
const getSystemInfo = async () => {
  const dirPrefix = `--git-dir "${runtime.baseDir}/.git"`
  const [branch, hash, hashFull, commits, server] = await Promise.all([
    callExternal(`git ${dirPrefix} describe --all | sed s@heads/@@`),
    callExternal(`git ${dirPrefix} rev-parse --short head`),
    callExternal(`git ${dirPrefix} rev-parse head`),
    callExternal(`git ${dirPrefix} rev-list head --count`),
    callExternal('uname -n')
  ])
  const commitLink = getCommitURL(hashFull)

  return {
    repo: {
      formatted: `${branch}-${commits}`,
      branch,
      hash,
      hashFull,
      commits,
      commitLink
    },
    server
  }
}

module.exports = {
  getCommitURL,
  getSystemInfo
}
