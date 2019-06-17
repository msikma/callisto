/**
 * Calypso - calypso-task-reddit <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionSubTopics } from './actions'

export const id = 'reddit'
export const name = 'Reddit'
export const color = 0xfc3a05
export const icon = 'https://i.imgur.com/pWjcLbF.png'
const scheduledActions = [
  { delay: 120000, desc: 'find new topics on Reddit', fn: actionSubTopics }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions }
}
