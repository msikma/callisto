// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const validator = {
  youtube: PropTypes.shape({
    defaults: PropTypes.shape({
      target: PropTypes.array
    }),
    subscriptions: PropTypes.arrayOf(PropTypes.shape({
      slug: PropTypes.string.isRequired,
      subscriptions: PropTypes.string.isRequired,
      target: PropTypes.array
    })).isRequired,
    searches: PropTypes.arrayOf(PropTypes.shape({
      slug: PropTypes.string.isRequired,
      searchParameters: PropTypes.string.isRequired,
      searchQuery: PropTypes.string.isRequired,
      target: PropTypes.array
    })).isRequired
  })
}

const template = () => (
  `
youtube: {
  // Setting a default target means it can be omitted in subscriptions and searches.
  defaults: {
    target: [[SERVER, CHANNEL]]
  },
  // This task retrieves new videos through a subscriptions XML file.
  // To get your latest subscriptions XML files, you need to export them.
  // Subscription manager: <https://www.youtube.com/subscription_manager>
  subscriptions: [
    {
      // To keep your xml files inside your home config folder, prefix your files
      // with <%config%> and trailing slash.
      // E.g. '<%config%>/youtube.xml' for '~/.config/callisto/youtube.xml'.
      subscriptions: '<%config%>/youtube.xml',
      target: [[SERVER, CHANNEL]]
    }
    // ...
  ],
  // Aside from subscription updates, you can also get updates for search queries.
  searches: [
    {
      // The slug is used for caching purposes. Just give each item a unique one.
      slug: '1stpersontrains',
      // The 'searchParameters' can be taken from Youtube's search page after using
      // the filter functionality. This produces an 'sp' query variable.
      // The content of this variable needs to be decoded before it's added here.
      // E.g. if the address bar says 'sp=EgJwAQ%253D%253D', run 'decodeURI(\`EgJwAQ%253D%253D\`)'
      // and put the return value in the searchParameters field—without the 'sp=' part.
      searchParameters: 'CAISCBABGAIgAXAB',
      searchQuery: '前面展望',
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
