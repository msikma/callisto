/**
 * Callisto - callisto-task-weedonwantcha <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { actionNewChapters } from './actions'

export const id = 'weedonwantcha'
export const color = 0x90ac99
const name = 'Camp Weedonwantcha'
const formats = []
const triggerActions = []
const scheduledActions = [
  [1800000, 'find new Camp Weedonwantcha chapters', actionNewChapters, true]
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
