// Callisto - callisto-task-marktplaats <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const validator = {
  marktplaats: PropTypes.shape({
    defaults: PropTypes.shape({
      details: PropTypes.shape({
        keywords: PropTypes.arrayOf(PropTypes.string),
        categories: PropTypes.arrayOf(PropTypes.oneOf([PropTypes.string, PropTypes.number]))
      }).isRequired,
      target: PropTypes.array,
    }),
    searches: PropTypes.arrayOf(PropTypes.shape({
      details: PropTypes.shape({
        keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
        categories: PropTypes.arrayOf(PropTypes.oneOf([PropTypes.string, PropTypes.number])).isRequired
      }).isRequired,
      target: PropTypes.array,
    }))
  })
}

const template = () => (
  `
marktplaats: {
  defaults: {
    details: {},
    target: [[SERVER, CHANNEL]]
  },
  searches: [
    // Each search has a 'details' object, containing 'keywords' and 'categories'.
    // Both of these are arrays. Each combination of keyword and category is searched.
    // Finally a server/channel target can be set per search.
    {
      details: {
        keywords: [
          'diskette',
          'floppies',
          'floppie',
          'floppy',
          'disketten',
          'diskettes',
          'cd vintage'
        ],
        categories: [
          MARKTPLAATS_CATEGORY_SOFTWARE_ANTIVIRUS,
          MARKTPLAATS_CATEGORY_SOFTWARE_MAC,
          MARKTPLAATS_CATEGORY_SOFTWARE_OS,
          MARKTPLAATS_CATEGORY_SOFTWARE_EDU,
        ]
      },
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
