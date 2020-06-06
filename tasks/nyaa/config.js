// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const validator = {
  nyaa: PropTypes.shape({
    defaults: PropTypes.shape({
      target: PropTypes.array
    }).isRequired,
    searches: PropTypes.arrayOf(PropTypes.shape({
      searchQuery: PropTypes.string.isRequired,
      searchCategory: PropTypes.string,
      searchFilter: PropTypes.string,
      target: PropTypes.array,
      thumbnail: PropTypes.string
    })).isRequired
  })
}

const template = () => (
  `
nyaa: {
  defaults: {
    target: [[SERVER, CHANNEL]]
  },
  searches: [
    {
      searchQuery: 'pocket monsters',
      searchCategory: '3_0',
      thumbnail: 'https://i.imgur.com/rOJmB46.png',
      target: [[SERVER, CHANNEL]]
    }
  ]
}
  `.trim()
)

module.exports = {
  template,
  validator
}
