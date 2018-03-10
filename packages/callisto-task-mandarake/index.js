/**
 * Callisto - callisto-task-mandarake <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { requestHTML } from 'callisto-util-request'
import { commandResponder } from 'callisto-discord-interface/src/responder'

import { commandAdd, commandList, commandRemove, commandCategories } from './commands'
import { actionRunSearches } from './actions'

export const id = 'mandarake'
const name = 'Mandarake'
export const color = 0xaf031d
const formats = [
//  ['add', ['keyword'], ['category', 'maxPrice'], 'Adds a new search command', commandAdd],
//  ['list', [], [], 'Lists all active search queries', commandList],
//  ['remove', ['id'], [], 'Removes a search command by ID', commandRemove],
//  ['help', [], [], 'Displays this help message'],
//  ['categories', [], ['parent'], 'Lists all main categories, or all subcategories under a parent ID', commandCategories]
]
const triggerActions = [
  ['message', commandResponder(id, name, color, formats)]
]
const scheduledActions = [
  [120000, 'run Mandarake searches', actionRunSearches]
]

export const getTaskInfo = () => {
  return { id, name, color, formats, triggerActions, scheduledActions }
}
//result = await requestHTML('https://order.mandarake.co.jp/order/listPage/list?upToMinutes=1440')
//https://order.mandarake.co.jp/order/ListPage/list?upToMinutes=360&lang=ja&categoryCode=00&keyword=pokemon
