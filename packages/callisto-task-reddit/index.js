/**
 * Callisto - callisto-task-reddit <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { actionSubTopics } from './actions'

export const id = 'reddit'
const name = 'Reddit'
export const color = 0xfc3a05
const formats = [
//  ['todo', [], [], 'Nothing here yet'],
//  ['help', [], [], 'Displays this help message']
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 120000, desc: 'find new topics on Reddit', fn: actionSubTopics, runOnBoot: true, type: 'Function' }
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
