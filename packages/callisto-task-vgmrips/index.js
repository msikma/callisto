/**
 * Callisto - callisto-task-vgmrips <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { actionRecentReleases } from './actions'

export const id = 'vgmrips'
export const name = 'VGMRips'
export const color = 0x00ff00
export const icon = 'https://i.imgur.com/rb5dl18.png'
const formats = [
//  ['todo', [], [], 'Nothing here yet'],
//  ['help', [], [], 'Displays this help message']
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 1800000, desc: 'find new pack releases from VGMRips', fn: actionRecentReleases, type: 'Function' }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, formats, triggerActions, scheduledActions }
}
