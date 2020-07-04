// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { sendLogMessageRaw } = require('./post')
const { getSystemInfo } = require('../../util/system')
const { loadShutdownTime } = require('../cache')
const { getFormattedTimestamp, getSimpleDuration, getDuration } = require('../../util/time')
const runtime = require('../../state')

// Colors used in the bootup and shutdown logs.
const SHUTDOWN_COLOR = 0xff034a  // #ff034a
const WARNING_COLOR = 0xffaa02   // #ffaa02
const STARTUP_COLOR = 0x35ed36   // #35ed36

// Returns a string depicting a task item. Used by bulletizeTasks().
const taskItemString = (task, isSingleTask, isFailedTask) => [
  `• ${task.data.package.name}@${task.data.package.version}`,
  `${isSingleTask ? ' (testing with only this task)' : ''}`,
  `${isFailedTask ? ' (failed to initialize)' : ''}`
].join('')

// Creates a bulletized list of tasks.
const bulletizeTasks = (allTasks, failedTaskSlugs, singleTask) => {
  const lines = []
  for (const [slug, task] of Object.entries(allTasks)) {
    const isSingleTask = singleTask && singleTask.data.package.name === slug
    const isFailedTask = ~failedTaskSlugs.indexOf(slug)
    lines.push(taskItemString(task, isSingleTask, isFailedTask))
  }
  return lines.sort().join('\n')
}

/**
 * Prints a message saying that the bot is shutting down.
 */
const printShutdownMessage = async () => {
  const { systemTask, pkgData, state } = runtime

  const currentTs = getFormattedTimestamp()
  const uptime = Number(new Date()) - state.startTime
  const uptimeString = getDuration(uptime)

  // Create a RichEmbed to send directly to the channel.
  const embed = new RichEmbed()
  embed.setAuthor(`Callisto v${systemTask.data.package.version}`, systemTask.data.meta.icon, pkgData.homepage)
  embed.setColor(SHUTDOWN_COLOR)
  embed.setDescription(`Callisto Bot is shutting down. The queue will be locked and emptied out before quitting.`)
  embed.addField('Shutdown time', `${currentTs}`, true)
  embed.addField('Uptime', `${uptimeString}`, true)
  embed.setTimestamp()
  return sendLogMessageRaw({ msgRichEmbed: embed, logOnError: true })
}

/**
 * Prints the startup message.
 */
const printStartupMessage = async () => {
  const { systemTask, tasks, tasksMeta, pkgData } = runtime
  const { singleTask, failedTasks } = tasksMeta

  // Display all tasks we're running with.
  const allTasks = { ...tasks, ...failedTasks }
  const failedTaskSlugs = Object.keys(failedTasks)
  const tasksList = bulletizeTasks(allTasks, failedTaskSlugs, singleTask)

  // Some interesting information about the current runtime environment.
  const systemInfo = await getSystemInfo()
  const currentTs = getFormattedTimestamp()
  const lastShutdownMs = await loadShutdownTime()
  const timeSinceLastRun = getSimpleDuration(Number(new Date()) - lastShutdownMs)
  const timeString = `${currentTs}${lastShutdownMs ? ` (${timeSinceLastRun} since last run)` : ''}`

  const embed = new RichEmbed()
  embed.setAuthor(`Callisto v${systemTask.data.package.version}`, systemTask.data.meta.icon, pkgData.homepage)
  embed.setColor(STARTUP_COLOR)
  embed.setDescription(`Callisto Bot is up and running.`)
  embed.addField('Commit', `[\`${systemInfo.repo.formatted} [${systemInfo.repo.hash}]\`](${systemInfo.repo.commitLink})`, true)
  embed.addField('Server', systemInfo.server, true)
  embed.addField('Time', timeString, false)
  embed.addField('Tasks', tasksList)
  embed.setTimestamp()
  return sendLogMessageRaw({ msgRichEmbed: embed, logOnError: true })
}

// TODO
module.exports = {
  printStartupMessage,
  printShutdownMessage
}
