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
  [7200000, 'find new episodes for various shows on Rarbg Torrents', actionNewEpisodes, true]
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
