/**
 * Callisto - callisto-task-hiveworks <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { actionNewChapters } from './actions'

export const id = 'hiveworks'
export const color = 0xefb313
const name = 'Hiveworks Comics'
const formats = []
const triggerActions = []
const scheduledActions = [
  [1800000, 'find new Hiveworks Comics chapters for various webcomics', actionNewChapters, true]
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
