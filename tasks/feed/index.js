/**
 * Calypso - calypso-task-feed <https://github.com/msikma/calypso>
 * © MIT license
 */

import { checkFeeds } from './actions'
import { configTemplate } from './config'

export const id = 'feed'
export const name = 'Feed'
export const color = 0xff6600
export const icon = 'https://i.imgur.com/YmcB7Tb.png'
const scheduledActions = [
  { delay: 200000, desc: 'retrieve syndicated feed updates', fn: checkFeeds }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions, configTemplate }
}
