/**
 * Callisto - callisto-task-nyaa <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { actionRunSearches } from './actions'

export const id = 'nyaa'
const name = 'Nyaa.si'
export const color = 0x007eff
const formats = [
//  ['todo', [], [], 'Nothing here yet'],
//  ['help', [], [], 'Displays this help message']
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 1200000, desc: 'run Nyaa.si searches', fn: actionRunSearches, runOnBoot: false, type: 'Function' }
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
