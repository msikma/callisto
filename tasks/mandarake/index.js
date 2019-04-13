/**
 * Calypso - calypso-task-mandarake <https://github.com/msikma/calypso>
 * © MIT license
 */

import { commandResponder } from 'calypso-core/src/responder'

import { actionRunSearches } from './actions'

export const id = 'mandarake'
export const name = 'Mandarake'
export const color = 0xaf031d
export const colorAuctions = 0x106770
export const icon = 'https://i.imgur.com/30I7Ir1.png'
export const iconAuctions = 'https://i.imgur.com/KsL3wSY.png'
const formats = [
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 1200000, desc: 'run Mandarake searches', fn: actionRunSearches }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, formats, triggerActions, scheduledActions }
}
