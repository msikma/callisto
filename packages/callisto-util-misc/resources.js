/**
 * Callisto - callisto-util-misc <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

// Relative link to the base package.
const pkg = require(`${process.env.CALLISTO_BASE_DIR}/package.json`)
const config = {
  // Our config.js file.
  ...require(`${process.env.CALLISTO_BASE_DIR}/config`),
  CALLISTO_BASE_DIR: process.env.CALLISTO_BASE_DIR
}

export { config, pkg }
