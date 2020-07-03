// Callisto - callisto-task-vgmpf <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const validator = {
  vgmpf: PropTypes.shape({
    target: PropTypes.array.isRequired
  })
}

const template = () => (
  `
vgmpf: {
  target: [[SERVER, CHANNEL]]
}
  `.trim()
)

module.exports = {
  template,
  validator
}
