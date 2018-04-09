/**
 * Callisto - callisto-task-cut-time <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { actionNewChapters } from './actions'

export const id = 'cut-time'
export const color = 0xa88ba5
const name = 'Cut Time'
const formats = []
const triggerActions = []
const scheduledActions = [
  [1800000, 'find new Cut Time chapters', actionNewChapters, true]
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
