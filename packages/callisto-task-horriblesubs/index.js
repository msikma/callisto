/**
 * Callisto - callisto-task-horriblesubs <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { actionRunSearches } from './actions'

export const id = 'horriblesubs'
const name = 'HorribleSubs'
export const color = 0xfc55a1
const formats = [
//  ['todo', [], [], 'Nothing here yet'],
//  ['help', [], [], 'Displays this help message']
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 240000, desc: 'run HorribleSubs searches', fn: actionRunSearches, runOnBoot: false, type: 'Function' }
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
