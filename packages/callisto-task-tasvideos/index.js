/**
 * Callisto - callisto-task-tasvideos <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { actionSearchUpdates } from './actions'

export const id = 'tasvideos'
const name = 'TASVideos'
export const color = 0x9747cf
const formats = [
//  ['todo', [], [], 'Nothing here yet'],
//  ['help', [], [], 'Displays this help message']
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  [480000, 'find new TASes from TASVideos', actionSearchUpdates, true]
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
