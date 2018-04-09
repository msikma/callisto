/**
 * Callisto - callisto-task-ocremix <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { actionRemixes } from './actions'

export const id = 'ocremix'
const name = 'OverClocked ReMix'
export const color = 0xf36b00
const formats = []
const triggerActions = []
const scheduledActions = [
  [120000, 'find new albums and single tracks on OCReMix', actionRemixes, true]
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
