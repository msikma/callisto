/**
 * Callisto - callisto-task-youtube <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { commandResponder } from 'callisto-discord-interface/src/responder'
import { actionSubscriptionUpdates } from './actions'

export const id = 'youtube'
const name = 'Youtube'
export const color = 0xff0000
const formats = [
//  ['todo', [], [], 'Nothing here yet'],
//  ['help', [], [], 'Displays this help message']
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  [480000, 'find new videos from Youtube subscriptions', actionSubscriptionUpdates, true]
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
