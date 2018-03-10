/**
 * Callisto - callisto-task-mandarake <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

export const commandAdd = ({ keyword }, { category, maxPrice }) => (
  { small: true, success: false, text: `Sorry. Not implemented yet. ${JSON.stringify(keyword, category, maxPrice)}` }
)

export const commandList = (args) => (
  { small: true, success: false, text: `Sorry. Not implemented yet. ${JSON.stringify(args)}` }
)

export const commandRemove = (args) => (
  { small: true, success: false, text: `Sorry. Not implemented yet. ${JSON.stringify(args)}` }
)

export const commandCategories = (args) => (
  { small: true, success: false, text: `Sorry. Not implemented yet. ${JSON.stringify(args)}` }
)
