/**
 * Calypso - calypso-task-rarbg <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionNewEpisodes } from './actions'

export const id = 'rarbg'
export const color = 0x385bba
export const name = 'Rarbg Torrents'
export const icon = 'https://i.imgur.com/tYMa40S.png'
const scheduledActions = [
  { delay: 7200000, desc: 'find new episodes for various shows on Rarbg Torrents', fn: actionNewEpisodes }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions }
}
