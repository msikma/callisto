// Callisto - callisto-task-buyee <https://github.com/msikma/callisto>
// © MIT license

const { wait } = require('callisto-core/util/promises')
const { findProducts, findAuctions } = require('./task/actions')
const { template, validator } = require('./config')
const { info } = require('./info')

const taskFindProducts = async (taskConfig, taskServices) => {
  for (const search of taskConfig.searches) {
    await findProducts(search, taskServices)
    await wait(1000)
  }
}

const actions = [
  { delay: 1400000, description: 'searches Buyee for new products', fn: taskFindProducts },
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
