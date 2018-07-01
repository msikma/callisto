/**
 * Callisto - callisto-task-mandarake <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'

import { actionRunSearches } from './actions'

export const id = 'mandarake'
const name = 'Mandarake'
export const color = 0xaf031d
export const colorAuctions = 0x106770
const formats = [
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 1200000, desc: 'run Mandarake searches', fn: actionRunSearches, runOnBoot: false, type: 'Promise' }
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
