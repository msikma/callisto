// Callisto - callisto-task-ocremix <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const validator = {
  ocremix: PropTypes.shape({
    tracks: PropTypes.shape({
      target: PropTypes.array.isRequired
    }),
    albums: PropTypes.shape({
      target: PropTypes.array.isRequired
    })
  })
}

const template = () => (
  `
ocremix: {
  tracks: {
    target: [[SERVER, CHANNEL]]
  },
  albums: {
    target: [[SERVER, CHANNEL]]
  }
}
  `.trim()
)

module.exports = {
  template,
  validator
}
