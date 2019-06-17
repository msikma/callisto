/**
 * Calypso - calypso-task-vgmpf <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionRecentReleases } from './actions'

export const id = 'vgmpf'
export const name = 'Video Game Music Preservation Foundation'
export const color = 0xfc50ad
export const icon = 'https://i.imgur.com/C9kyOuE.png'
const scheduledActions = [
  { delay: 1800000, desc: 'find new soundtrack releases from VGMPF', fn: actionRecentReleases }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions }
}
