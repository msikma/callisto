/**
 * Calypso - calypso-task-mangafox <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionNewChapters } from './actions'

export const id = 'mangafox'
export const color = 0x41a95c
export const name = 'MangaFox'
export const icon = 'https://i.imgur.com/pfveukN.png'
const scheduledActions = [
  // actionNewChapters() is disabled: MangaFox now utilizes Cloudflare, making scraping impossible.
  //{ delay: 1700000, desc: 'find new MangaFox chapters for various mangas', fn: actionNewChapters }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions }
}
