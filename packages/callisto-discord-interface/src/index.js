/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import Discord from 'discord.js'

import { dbInit, getSettings } from 'callisto-util-cache'
import { registerBotName } from 'callisto-util-misc'

import decorateResponses from './decorator'
import { findAndRegisterTasks } from './task-manager'
import { config, pkg } from './resources'

export const discord = {
  client: null,
  settings: null,
  bot: null
}

export const run = async () => {
  console.log(`callisto-bot ${pkg.version}`)

  registerBotName(config.CALLISTO_BOT_NAME)

  // Mount database file, or create a new file if it doesn't exist.
  await dbInit(`${config.CALLISTO_BASE_DIR}/cache/`);
  discord.settings = await getSettings('discordInterface')
  discord.client = new Discord.Client()

  // Log in to the server.
  await discord.client.login(config.CALLISTO_BOT_TOKEN)
  discord.bot = await discord.client.fetchUser(config.CALLISTO_BOT_CLIENT_ID)

  // Get a list of all installed tasks and register them.
  findAndRegisterTasks(discord.client, discord.bot, config.CALLISTO_TASK_SETTINGS)
}
