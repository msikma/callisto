/**
 * Calypso - calypso-task-bandcamp <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionRunSearches } from './actions'
import { configTemplate } from './config'

export const id = 'nyaa'
export const name = 'Nyaa.si'
export const color = 0x007eff
export const icon = 'https://i.imgur.com/FfNa3D1.png'

const scheduledActions = [
  { delay: 1200000, desc: 'run Nyaa.si searches', fn: actionRunSearches }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions, configTemplate }
}
