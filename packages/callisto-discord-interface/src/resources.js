/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import pkg from '../package.json'
const config = {
  ...require(`${process.env.CALLISTO_BASE_DIR}/config`),
  CALLISTO_BASE_DIR: process.env.CALLISTO_BASE_DIR
}

export { config, pkg }
