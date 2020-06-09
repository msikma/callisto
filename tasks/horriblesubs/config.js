// Callisto - callisto-task-horriblesubs <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const validator = {
  horriblesubs: PropTypes.shape({
    defaults: PropTypes.shape({
      target: PropTypes.array
    }).isRequired,
    shows: PropTypes.arrayOf(PropTypes.shape({
      showName: PropTypes.string.isRequired,
      showCommunityWiki: PropTypes.string,
      showLogo: PropTypes.string,
      target: PropTypes.array
    })).isRequired
  })
}

const template = () => (
  `
horriblesubs: {
  defaults: {
    target: [[SERVER, CHANNEL]]
  },
  shows: [
    {
      // From the URL, e.g. <https://horriblesubs.info/shows/one-piece/>.
      showName: 'one-piece',
      // You can add a link here to a MediaWiki install used by the community of this show.
      // If set, the bot will add a title, image and description for each episode.
      // Use the base URL without trailing slash, e.g. 'https://onepiece.fandom.com'.
      showCommunityWiki: 'https://onepiece.fandom.com',
      showLogo: 'https://i.imgur.com/nmSSWwF.png',
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
