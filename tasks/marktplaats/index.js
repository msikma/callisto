// Callisto - callisto-task-marktplaats <https://github.com/msikma/callisto>
// © MIT license

const { wait } = require('callisto-core/util/promises')
const { findSales } = require('./task/actions')
const { template, validator } = require('./config')
const { info } = require('./info')

const taskRunSearches = async (taskConfig, taskServices) => {
  for (const search of taskConfig.searches) {
    await findSales(search, taskServices)
    await wait(1000)
  }
}

const actions = [
  { delay: 700000, description: 'searches Marktplaats for new items for sale', fn: taskRunSearches },
]

module.exports = {
  task: {
    info,
    actions
  },
  config: {
    template,
    validator
  }
}
