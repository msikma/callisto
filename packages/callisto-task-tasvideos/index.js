/**
 * Callisto - callisto-task-tasvideos <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { actionSearchUpdates } from './actions'

export const id = 'tasvideos'
export const name = 'TASVideos'
export const color = 0x9747cf
export const icon = 'https://i.imgur.com/wlRgRr5.png'
const formats = [
//  ['todo', [], [], 'Nothing here yet'],
//  ['help', [], [], 'Displays this help message']
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 480000, desc: 'find new TASes from TASVideos', fn: actionSearchUpdates, type: 'Function' }
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
