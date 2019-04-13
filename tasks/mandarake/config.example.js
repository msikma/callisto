const MY_SERVER = '1234'
const CHANNEL_MANDARAKE = '1234'

// Categories can be found on the website itself by copying them.
// from the address bar. There's also a list in the 'mdrscr' source code.
const CATEGORY_ALL = '00'
const CATEGORY_ART_BOOKS = '0131'
const CATEGORY_GALLERY = '08'
const CATEGORY_ANIME_CEL_SCRIPT = '07'
const CATEGORY_COMICS = '1101'
const CATEGORY_COMICS_ALL = '11'
const CATEGORY_BOOKS = '01'
const CATEGORY_DISK_GAME = '04'
const CATEGORY_PRIZE_TOYS = '020111'
const CATEGORY_PAMPHLETS = '0130'
const CATEGORY_OTHERS = '99'

// Auction categories.
const CATEGORY_AUCTION_ANIME_CELS = 'anime_cels'

// For the 'upToMinutes' value. Restricts results to new items.
// There's really no reason to change the value from 360.
const LAST_SIX_HOURS = 360

module.exports = {
  CALYPSO_TASK_SETTINGS: {
    mandarake: {
      main: {
        defaultDetails: {
          // It's not recommended to change any of this, including 'upToMinutes'.
          // Just leave it be and only set up search objects.
          shop: null,
          dispCount: 24,
          soldOut: 1,
          maxPrice: null,
          upToMinutes: LAST_SIX_HOURS,
          sort: 'arrival',
          sortOrder: 1,
          // Whether to display adult (R18) items.
          // It's best to change this on a per search basis.
          dispAdult: 0
        },
        defaultTarget: [[MY_SERVER, CHANNEL_MANDARAKE]],
        // Either 'ja' or 'en'.
        defaultLang: 'ja',
        searches: [
          // This is where the searches are set up. Here's the basic format:
          //
          // {
          //   details: {
          //     keyword: 'something',
          //     categoryCode: 'something',
          //     shop: 'something',
          //     // etc...
          //   },
          //   target: [['target', 'here']],
          //   lang: 'ja'
          // },
          //
          // Basically, you override the 'defaultDetails', and the 'keyword'
          // value is mandatory.
          { details: { keyword: 'pokemon', categoryCode: CATEGORY_COMICS_ALL } },
          { details: { keyword: 'pokemon', categoryCode: CATEGORY_ANIME_CEL_SCRIPT } },
          { details: { keyword: 'pokemon', categoryCode: CATEGORY_GALLERY } },
          { details: { keyword: 'pokemon', categoryCode: CATEGORY_BOOKS } },
          { details: { keyword: 'pokemon', categoryCode: CATEGORY_PAMPHLETS } },
          { details: { keyword: 'pokemon', categoryCode: CATEGORY_ART_BOOKS } },
          { details: { keyword: 'ポケットモンスターSPECIAL', categoryCode: CATEGORY_BOOKS } },
          { details: { keyword: 'あひるのクワック', categoryCode: CATEGORY_ALL } }
        ]
      },
      auction: {
        // None, but here for future updates.
        // We can only set 'q' and 'category'.
        defaultDetails: {
        },
        defaultTarget: [[MY_SERVER, CHANNEL_MANDARAKE]],
        // Note: there's no language setting for auction searches. The site is only in Japanese.
        searches: [
          // Keep in mind that the details object is different.
          { details: { q: 'ポケットモンスター', category: CATEGORY_AUCTION_ANIME_CELS } }
        ]
      }
    }
  }
}
