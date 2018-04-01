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
  [1800000, 'find new Parisa chapters', actionNewChapters, true]
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
