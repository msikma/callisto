/**
 * Calypso - calypso-task-vgmrips <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionRecentReleases } from './actions'
import { configTemplate } from './config'

export const id = 'vgmrips'
export const name = 'VGMRips'
export const color = 0x00ff00
export const icon = 'https://i.imgur.com/rb5dl18.png'
const scheduledActions = [
  { delay: 1800000, desc: 'find new pack releases from VGMRips', fn: actionRecentReleases }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions, configTemplate }
}
