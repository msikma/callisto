// Callisto - callisto-task-feed <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const validator = {
  feed: PropTypes.shape({
    defaults: PropTypes.shape({
      target: PropTypes.array,
      color: PropTypes.number,
      thumbnail: PropTypes.number
    }).isRequired,
    feeds: PropTypes.arrayOf(PropTypes.shape({
      feedURL: PropTypes.string.isRequired,
      feedName: PropTypes.string.isRequired,
      target: PropTypes.array,
      baseURL: PropTypes.string,
      color: PropTypes.number,
      thumbnail: PropTypes.string
    })).isRequired
  })
}

const template = () => (
  `
feed: {
  defaults: {
    target: [[SERVER, CHANNEL]]
  },
  feeds: [
    {
      feedURL: 'http://example.com/feed.rss',
      feedName: 'Example feed',
      target: [[SERVER, CHANNEL]],
      // Used in case there are relative links
      baseURL: 'http://example.com',
      // Custom color and icon for the new post notifications
      color: 0x000000,
      thumbnail: 'http://example.com/feed-icon.png'
    }
  ]
}
  `.trim()
)

module.exports = {
  template,
  validator
}
