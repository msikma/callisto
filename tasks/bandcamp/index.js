/**
 * Calypso - calypso-task-bandcamp <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionRunSearches } from './actions'

export const id = 'bandcamp'
export const name = 'Bandcamp'
export const color = 0x408ea3
export const icon = 'https://i.imgur.com/OBJk66Q.png'

const scheduledActions = [
  { delay: 600000, desc: 'run Bandcamp searches', fn: actionRunSearches }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions }
}
