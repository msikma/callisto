/**
 * Calypso - calypso-task-horriblesubs <https://github.com/msikma/calypso>
 * © MIT license
 */

import { commandResponder } from 'calypso-core/src/responder'
import { actionRunSearches } from './actions'

export const id = 'horriblesubs'
export const name = 'HorribleSubs'
export const color = 0xfc55a1
export const icon = 'https://i.imgur.com/jjQBNkY.jpg'
const formats = [
//  ['todo', [], [], 'Nothing here yet'],
//  ['help', [], [], 'Displays this help message']
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 240000, desc: 'run HorribleSubs searches', fn: actionRunSearches }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, formats, triggerActions, scheduledActions }
}
