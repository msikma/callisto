// Callisto - callisto-task-tasvideos <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const validator = {
  tasvideos: PropTypes.shape({
    target: PropTypes.array.isRequired
  })
}

const template = () => (
  `
tasvideos: {
  target: [[SERVER, CHANNEL]]
}
  `.trim()
)

module.exports = {
  template,
  validator
}
