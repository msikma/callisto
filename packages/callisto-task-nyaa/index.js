/**
 * Callisto - callisto-task-nyaa <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { actionRunSearches } from './actions'

export const id = 'nyaa'
export const name = 'Nyaa.si'
export const color = 0x007eff
export const icon = 'https://i.imgur.com/FfNa3D1.png'
const formats = [
//  ['todo', [], [], 'Nothing here yet'],
//  ['help', [], [], 'Displays this help message']
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 1200000, desc: 'run Nyaa.si searches', fn: actionRunSearches, type: 'Function' }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, formats, triggerActions, scheduledActions }
}
