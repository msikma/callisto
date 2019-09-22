const PropTypes = require('prop-types')

const configValidator = {
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

const configTemplate = () => (
  `
youtube: {
  // Setting a default target means it can be omitted in subscriptions and searches.
  defaults: {
    target: [[/* server, channel */]]
  },
  // This task retrieves new videos through a subscriptions XML file.
  // To get your latest subscriptions XML files, you need to export them.
  // Subscription manager: <https://www.youtube.com/subscription_manager>
  subscriptions: [
    {
      // The slug is used for caching purposes. Just give each item a unique one.
      slug: 'my-videos',
      // To keep your xml files inside your home config folder, prefix your files
      // with <%config%> and trailing slash.
      // E.g. '<%config%>/youtube.xml' for '~/.config/calypso/youtube.xml'.
      subscriptions: '<%config%>/youtube.xml',
      target: [[/* server, channel */]]
    }
    // ...
  ],
  // Aside from subscription updates, you can also get updates for search queries.
  searches: [
    {
      // As above, the slug is just for caching.
      slug: '1stpersontrains',
      // The 'searchParameters' can be taken from Youtube's search page after using
      // the filter functionality. This produces an 'sp' query variable.
      // The content of this variable needs to be decoded before it's added here.
      // E.g. if the address bar says 'sp=EgJwAQ%253D%253D', run 'decodeURI(\`EgJwAQ%253D%253D\`)'
      // and put the return value in the searchParameters field—without the 'sp=' part.
      searchParameters: 'CAISCBABGAIgAXAB',
      searchQuery: '前面展望',
      target: [[/* server, channel */]]
    }
  ]
}
  `.trim()
)

module.exports = {
  configTemplate,
  configValidator
}
