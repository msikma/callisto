/**
 * Callisto - callisto-task-feed <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { checkFeeds } from './actions'

export const id = 'feed'
export const name = 'Feed'
export const color = 0xff6600 // #ff6600
export const icon = 'https://i.imgur.com/YmcB7Tb.png'
const formats = [
//  ['todo', [], [], 'Nothing here yet'],
//  ['help', [], [], 'Displays this help message']
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 200000, desc: 'retrieve syndicated feed updates', fn: checkFeeds, type: 'Promise' }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, formats, triggerActions, scheduledActions }
}
