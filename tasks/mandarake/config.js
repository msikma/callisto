// Callisto - callisto-task-mandarake <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const validator = {
  mandarake: PropTypes.shape({
    main: PropTypes.shape({
      defaults: PropTypes.shape({
        details: PropTypes.shape({
          shop: PropTypes.string,
          dispCount: PropTypes.number,
          soldOut: PropTypes.number,
          maxPrice: PropTypes.number,
          upToMinutes: PropTypes.number,
          sort: PropTypes.string,
          sortOrder: PropTypes.number,
          dispAdult: PropTypes.number
        }).isRequired,
        target: PropTypes.array,
        language: PropTypes.oneOf(['en', 'ja'])
      }),
      searches: PropTypes.arrayOf(PropTypes.shape({
        details: PropTypes.shape({
          keyword: PropTypes.string.isRequired,
          shop: PropTypes.string,
          dispCount: PropTypes.number,
          soldOut: PropTypes.number,
          maxPrice: PropTypes.number,
          upToMinutes: PropTypes.number,
          sort: PropTypes.string,
          sortOrder: PropTypes.number,
          dispAdult: PropTypes.number
        }).isRequired,
        target: PropTypes.array,
        language: PropTypes.oneOf(['en', 'ja'])
      }))
    }),
    auction: PropTypes.shape({
      defaults: PropTypes.shape({
        details: PropTypes.shape({
          keyword: PropTypes.string
        }),
        target: PropTypes.array
      }),
      searches: PropTypes.arrayOf(PropTypes.shape({
        details: PropTypes.shape({
          keyword: PropTypes.string.isRequired
        }).isRequired,
        target: PropTypes.array
      }))
    })
  })
}

const template = () => (
  `
mandarake: {
  main: {
    defaults: {
      details: {
        shop: null,
        dispCount: 24,
        soldOut: 1,
        maxPrice: null,
        upToMinutes: 4320, // Last 72 hours = 4320; all time = 0
        sort: 'arrival',
        sortOrder: 1,
        dispAdult: 0
      },
      target: [[SERVER, CHANNEL]],
      language: 'ja' // 'ja' of 'en'
    },
    searches: [
      { details: { keyword: 'keyword', categoryCode: 'categoryCode' } },
      // ...
    ]
  },
  auction: {
    defaults: {
      details: {},
      target: [[SERVER, CHANNEL]]
    },
    searches: [
      { details: { keyword: 'keyword' } },
      // ...
    ]
  }
}
  `.trim()
)

module.exports = {
  template,
  validator
}
