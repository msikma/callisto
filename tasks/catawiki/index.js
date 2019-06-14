/**
 * Calypso - calypso-task-catawiki <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionRunSearches } from './actions'

export const id = 'catawiki'
export const name = 'Catawiki'
export const color = 0x00adef;
export const icon = 'https://i.imgur.com/T4w2E3u.jpg';
const scheduledActions = [
  { delay: 700000, desc: 'run Catawiki searches', fn: actionRunSearches }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions }
}
