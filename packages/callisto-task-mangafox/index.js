/**
 * Callisto - callisto-task-mangafox <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { actionNewChapters } from './actions'

export const id = 'mangafox'
export const color = 0x41a95c
export const name = 'MangaFox'
export const icon = 'https://i.imgur.com/pfveukN.png'
const formats = []
const triggerActions = []
const scheduledActions = [
  { delay: 1700000, desc: 'find new MangaFox chapters for various mangas', fn: actionNewChapters }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, formats, triggerActions, scheduledActions }
}
