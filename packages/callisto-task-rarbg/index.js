/**
 * Callisto - callisto-task-rarbg <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { actionNewEpisodes } from './actions'

export const id = 'rarbg'
export const color = 0x385bba
const name = 'Rarbg Torrents'
const formats = []
const triggerActions = []
const scheduledActions = [
  { delay: 7200000, desc: 'find new episodes for various shows on Rarbg Torrents', fn: actionNewEpisodes, runOnBoot: false, type: 'Function' }
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
