/**
 * Callisto - callisto-task-marktplaats <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { actionRunSearches } from './actions'

export const id = 'marktplaats'
export const name = 'Marktplaats'
export const color = 0xf3a462
export const icon = 'https://i.imgur.com/XhpaBIf.png'
const formats = [
]
const triggerActions = [
  //['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  { delay: 700000, desc: 'run Marktplaats searches', fn: actionRunSearches }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, formats, triggerActions, scheduledActions }
}
