// Callisto - callisto-task-buyee <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const validator = {
  buyee: PropTypes.shape({
    defaults: PropTypes.shape({
      details: PropTypes.shape({
      }).isRequired,
      alert: PropTypes.bool,
      target: PropTypes.array
    }),
    searches: PropTypes.arrayOf(PropTypes.shape({
      details: PropTypes.shape({
        keyword: PropTypes.string.isRequired,
        category: PropTypes.string,
        alert: PropTypes.bool
      }).isRequired,
      target: PropTypes.array
    }))
  })
}

const template = () => (
  `
buyee: {
  defaults: {
    details: {
    },
    target: [[SERVER, CHANNEL]]
  },
  searches: [
    { details: { keyword: 'keyword', category: '1234' }, alert: true },
    // ...
  ]
}
  `.trim()
)

module.exports = {
  template,
  validator
}
