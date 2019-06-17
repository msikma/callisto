/**
 * Calypso - calypso-task-hiveworks <https://github.com/msikma/calypso>
 * © MIT license
 */

import { actionNewChapters } from './actions'

export const id = 'hiveworks'
export const name = 'Hiveworks Comics'
export const color = 0xefb313
export const icon = 'https://i.imgur.com/0Lit9ql.png'
const scheduledActions = [
  { delay: 1800000, desc: 'find new Hiveworks Comics chapters for various webcomics', fn: actionNewChapters }
]

export const getTaskInfo = () => {
  return { id, name, color, icon, scheduledActions }
}
