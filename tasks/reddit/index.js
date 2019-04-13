/**
 * Calypso - calypso-task-reddit <https://github.com/msikma/calypso>
 * © MIT license
 */

import { commandResponder } from 'calypso-core/src/responder'
import { actionSubTopics } from './actions'

export const id = 'reddit'
export const name = 'Reddit'
export const color = 0xfc3a05
export const icon = 'https://i.imgur.com/pWjcLbF.png'
const formats = [
//  ['todo', [], [], 'Nothing here yet'],
//  ['help', [], [], 'Displays this help message']
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 120000, desc: 'find new topics on Reddit', fn: actionSubTopics }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, formats, triggerActions, scheduledActions }
}
