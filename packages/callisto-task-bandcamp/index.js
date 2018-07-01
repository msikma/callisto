/**
 * Callisto - callisto-task-bandcamp <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { actionRunSearches } from './actions'

export const id = 'bandcamp'
const name = 'Bandcamp'
export const color = 0x408ea3
const formats = [
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 2400000, desc: 'run Bandcamp searches', fn: actionRunSearches, runOnBoot: false, type: 'Promise' }
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
