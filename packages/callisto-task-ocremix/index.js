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
  { delay: 240000, desc: 'find new albums and single tracks on OCReMix', fn: actionRemixes, runOnBoot: true, type: 'Function' }
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
