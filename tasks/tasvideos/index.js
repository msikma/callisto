/**
 * Calypso - calypso-task-tasvideos <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionSearchUpdates } from './actions'
import { configTemplate } from './config'

export const id = 'tasvideos'
export const name = 'TASVideos'
export const color = 0x9747cf
export const icon = 'https://i.imgur.com/wlRgRr5.png'
const scheduledActions = [
  { delay: 480000, desc: 'find new TASes from TASVideos', fn: actionSearchUpdates }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions, configTemplate }
}
