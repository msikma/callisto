/**
 * Calypso - calypso-task-horriblesubs <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionRunSearches } from './actions'

export const id = 'horriblesubs'
export const name = 'HorribleSubs'
export const color = 0xfc55a1
export const icon = 'https://i.imgur.com/jjQBNkY.jpg'
const scheduledActions = [
  { delay: 240000, desc: 'run HorribleSubs searches', fn: actionRunSearches }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions }
}
