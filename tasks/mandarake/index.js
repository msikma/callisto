// Callisto - callisto-task-mandarake <https://github.com/msikma/callisto>
// © MIT license

const { wait } = require('callisto-core/util/promises')
const { findProducts, findAuctions } = require('./task/actions')
const { template, validator } = require('./config')
const { info } = require('./info')

const taskFindProducts = async (taskConfig, taskServices) => {
  for (const search of taskConfig.main.searches) {
    await findProducts(search, taskServices)
    await wait(1000)
  }
}

const taskFindAuctions = async (taskConfig, taskServices) => {
  for (const search of taskConfig.auction.searches) {
    await findAuctions(search, taskServices)
    await wait(1000)
  }
}
// todo: fix auctions color/icon
const actions = [
  { delay: 1200000, description: 'searches Mandarake for new products', fn: taskFindProducts },
  { delay: 1200000, description: 'searches Mandarake for new auctions', fn: taskFindAuctions },
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
