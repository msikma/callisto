/**
 * Callisto - callisto-task-jailbird <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { actionNewChapters } from './actions'

export const id = 'jailbird'
export const color = 0x0e7536
const name = 'Jailbird'
const formats = []
const triggerActions = []
const scheduledActions = [
  [1800000, 'find new Jailbird chapters', actionNewChapters, true]
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
