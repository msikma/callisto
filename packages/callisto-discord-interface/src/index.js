/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import Discord from 'discord.js'

import { dbInit, getSettings } from 'callisto-util-cache'
import { registerBotName } from 'callisto-util-misc'
import { config, pkg } from 'callisto-util-misc/resources'
import logger, { configureLogger } from 'callisto-util-logging'

import decorateResponses from './decorator'
import { checkVersion } from './logging'
import { findTasks, findAndRegisterTasks } from './task-manager'

export const discord = {
  client: null,
  settings: null,
  bot: null,
  noPost: false
}

/**
 * Main entry point that runs the bot. Command line arguments are passed here.
 * If 'task' is set, we'll run the bot with that one task only. Others get ignored.
 * 'level' sets the console logging verbosity.
 */
export const run = async ({ task, level, noPost = false }) => {
  // Prevent us from being able to actually post to Discord if --no-post was passed.
  discord.noPost = noPost

  // Make sure we can write logs.
  configureLogger(config.CALLISTO_BASE_DIR, level)

  // Saves our chosen bot name for writing responses to users instructing them to @ us.
  // TODO: this should likely be removed, since we can just pass the bot user object's name.
  registerBotName(config.CALLISTO_BOT_NAME)

  // Mount database file, or create a new file if it doesn't exist.
  await dbInit(`${config.CALLISTO_BASE_DIR}/cache/`);
  discord.settings = await getSettings('discordInterface')
  discord.client = new Discord.Client()

  // Log in to the server.
  await discord.client.login(config.CALLISTO_BOT_TOKEN)
  discord.bot = await discord.client.fetchUser(config.CALLISTO_BOT_CLIENT_ID)

  // Print info about the current runtime.
  logger.info(`callisto-bot ${pkg.version}`, false)

  // Load single task if testing.
  let taskData
  if (task) {
    taskData = findTasks().filter(taskData => taskData.slug === task)[0]
    if (!taskData) {
      logger.error(`Could not find task: callisto-task-${task}`)
      process.exit(1)
    }
    logger.warn(`Testing with only this task: ${taskData.slug}`, false)
  }

  // Check whether we are reporting the right version.
  checkVersion()

  // Get a list of all installed tasks and register them.
  findAndRegisterTasks(discord.client, discord.bot, config.CALLISTO_TASK_SETTINGS, taskData)
}

/**
 * Entry point used by packages.js. This lists the packages we currently support
 * along with a description. The output format is Markdown.
 */
export const listPackages = () => {
  const tasks = findTasks()
  const taskInfo = tasks.map(task => `| ${task.slug} | ${task.description} | [${task.siteShort}](${task.site}) |`)
  const md = [
    '| Name | Description | Site |',
    '|:-----|:------------|:-----|',
    ...taskInfo
  ]
  console.log(md.join('\n'))
  process.exit(0)
}
