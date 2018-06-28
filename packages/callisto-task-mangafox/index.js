/**
 * Callisto - callisto-task-mangafox <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { actionNewChapters } from './actions'

export const id = 'mangafox'
export const color = 0x41a95c
const name = 'MangaFox'
const formats = []
const triggerActions = []
const scheduledActions = [
  { delay: 1700000, desc: 'find new MangaFox chapters for various mangas', fn: actionNewChapters, runOnBoot: true, type: 'Function' }
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
