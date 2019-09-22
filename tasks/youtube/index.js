// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const { runSearchTask, runSubTask } = require('./task/actions')

/** Searches for new videos from search results. */
const taskSearchVideos = (taskConfig, discordClient, user) => (
  taskConfig.searches.map(async taskData => runSearchTask(taskData, taskConfig))
)

/** Searches for new videos from subscriptions. */
const taskSubVideos = (taskConfig) => (
  taskConfig.subscriptions.map(async taskData => runSubTask(taskData, taskConfig))
  // TODO
)

const taskInfo = {
  id: 'youtube',
  name: 'Youtube',
  color: 0xff0000,
  icon: 'https://i.imgur.com/rAFBjZ4.jpg'
}

const taskActions = [
  { delay: 480000, description: 'find new videos from Youtube searches', fn: taskSearchVideos },
  { delay: 480000, description: 'find new videos from Youtube subscriptions', fn: taskSubVideos }
]

module.exports = {
  taskInfo,
  taskActions
}
