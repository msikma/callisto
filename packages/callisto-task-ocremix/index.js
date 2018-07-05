/**
 * Callisto - callisto-task-ocremix <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { actionRemixes } from './actions'

export const id = 'ocremix'
export const name = 'OverClocked ReMix'
export const color = 0xf36b00
export const icon = 'https://i.imgur.com/4pVcJnw.png'
const formats = []
const triggerActions = []
const scheduledActions = [
  { delay: 240000, desc: 'find new albums and single tracks on OCReMix', fn: actionRemixes, type: 'Function' }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, formats, triggerActions, scheduledActions }
}
