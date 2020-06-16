// Callisto - callisto-task-vgmrips <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const validator = {
  vgmrips: PropTypes.shape({
    target: PropTypes.array.isRequired
  })
}

const template = () => (
  `
vgmrips: {
  target: [[SERVER, CHANNEL]]
}
  `.trim()
)

module.exports = {
  template,
  validator
}
