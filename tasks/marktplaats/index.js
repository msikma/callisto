/**
 * Calypso - calypso-task-marktplaats <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionRunSearches } from './actions'

export const id = 'marktplaats'
export const name = 'Marktplaats'
export const color = 0xf3a462
export const icon = 'https://i.imgur.com/XhpaBIf.png'
const scheduledActions = [
  { delay: 700000, desc: 'run Marktplaats searches', fn: actionRunSearches }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions }
}
