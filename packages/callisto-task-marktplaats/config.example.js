const MY_SERVER = '1234'
const CHANNEL_MARKTPLAATS = '1234'

// Categories can be found on the website itself by copying them from the address bar.
const CATEGORY_COMPUTERS_EN_SOFTWARE = '322'
const CATEGORY_SPELCOMPUTERS_EN_GAMES = '356'

module.exports = {
  CALLISTO_TASK_SETTINGS: {
    marktplaats: {
      // Just leave this empty.
      defaultDetails: {},
      defaultTarget: [[MY_SERVER, CHANNEL_MARKTPLAATS]],
      searches: [
        // This is where the searches are set up. Here's the basic format:
        //
        // {
        //   details: {
        //     keyword: 'something',
        //     category: 'something'
        //   },
        //   target: [['target', 'here']]
        // },
        //
        // Basically, you override the 'defaultDetails', and the 'keyword'
        // value is mandatory.
        { details: { keyword: 'zolderopruiming', category: CATEGORY_COMPUTERS_EN_SOFTWARE } },
        { details: { keyword: 'zolderopruiming', category: CATEGORY_SPELCOMPUTERS_EN_GAMES } },
        { details: { keyword: 'diskette', category: CATEGORY_COMPUTERS_EN_SOFTWARE } },
        { details: { keyword: 'diskette', category: CATEGORY_SPELCOMPUTERS_EN_GAMES } },
        { details: { keyword: 'floppie' } },
        { details: { keyword: 'floppy' } },
        { details: { keyword: 'floppy' } }
      ]
    }
  }
}
