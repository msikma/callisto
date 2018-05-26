/**
 * Callisto - callisto-task-parisa <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { actionNewChapters } from './actions'

export const id = 'parisa'
export const color = 0x5bb9d5
const name = 'Parisa'
const formats = []
const triggerActions = []
const scheduledActions = [
  { delay: 1800000, desc: 'find new Parisa chapters', fn: actionNewChapters, runOnBoot: true, type: 'Function' }
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
