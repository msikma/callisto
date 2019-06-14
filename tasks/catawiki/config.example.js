const MY_SERVER = '1234'
const CHANNEL_CATAWIKI = '1234'

// Categories can be found on the website itself by copying them from the address bar.
// E.g. https://www.catawiki.nl/c/365-computers-en-videogames
const CATEGORY_VIDEO_GAMES = '641'
const CATEGORY_COMPUTERS_AND_VIDEO_GAMES = '365'

module.exports = {
  CALYPSO_TASK_SETTINGS: {
    catawiki: {
      defaultDetails: {},
      defaultTarget: [[MY_SERVER, CHANNEL_CATAWIKI]],
      // The site tld to search from, e.g. catawiki.com, catawiki.nl.
      defaultCountryCode: 'com',
      searches: [
        // This is where the searches are set up. Here's the basic format:
        //
        // {
        //   details: {
        //     keyword: 'something',
        //     category: 'something',
        //     countryCode: 'nl'
        //   },
        //   target: [['target', 'here']]
        // },
        //
        // Only the keyword value is mandatory.
        { details: { keyword: 'zolderopruiming', category: CATEGORY_VIDEO_GAMES, countryCode: 'nl' } },
        { details: { keyword: 'street fighter', category: CATEGORY_COMPUTERS_AND_VIDEO_GAMES }, target: [[MY_SERVER, CHANNEL_CATAWIKI]] }
      ]
    }
  }
}
