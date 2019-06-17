/**
 * Calypso - calypso-task-ocremix <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionRemixes } from './actions'

export const id = 'ocremix'
export const name = 'OverClocked ReMix'
export const color = 0xf36b00
export const icon = 'https://i.imgur.com/4pVcJnw.png'
const scheduledActions = [
  { delay: 240000, desc: 'find new albums and single tracks on OCReMix', fn: actionRemixes }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions }
}
