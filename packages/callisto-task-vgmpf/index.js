/**
 * Callisto - callisto-task-vgmpf <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { actionRecentReleases } from './actions'

export const id = 'vgmpf'
const name = 'Video Game Music Preservation Foundation'
export const color = 0xfc50ad
const formats = [
//  ['todo', [], [], 'Nothing here yet'],
//  ['help', [], [], 'Displays this help message']
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  [1800000, 'find new soundtrack releases from VGMPF', actionRecentReleases]
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
