/**
 * Calypso - calypso-task-youtube <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionSearchUpdates } from './actions'
import { configTemplate } from './config'

export const id = 'youtube'
export const name = 'Youtube'
export const color = 0xff0000
export const icon = 'https://i.imgur.com/rAFBjZ4.jpg'
const scheduledActions = [
  { delay: 480000, desc: 'find new videos from Youtube searches and subscriptions', fn: actionSearchUpdates }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions, configTemplate }
}
