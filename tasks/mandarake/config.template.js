export const template = () => {
  const obj = `
mandarake: {
  // Mandarake has two different sets of items that it can scrape:
  // regular shop products and auction products ('ekizo').
  main: {
    defaultDetails: {
      // Enter any default details here; these are the website's own defaults.
      // More info can be found here: <https://github.com/msikma/msikma-lib-projects/tree/master/packages/mandarake-js#search-parameters>
      shop: null,
      dispCount: 24,
      soldOut: 1,
      maxPrice: null,
      upToMinutes: 4320, // 72 hours in minutes.
      sort: 'arrival',
      sortOrder: 1,
      dispAdult: 0
    },
    defaultTarget: [[/* server, channel */]],
    defaultLang: 'ja', // Either 'ja' or 'en' - note that 'en' is all machine translated.
    searches: [
      // These are all the settings that can be customized per search.
      // Any from the 'defaultDetails' section can go here.
      // {
      //   details: {
      //     keyword: 'something',
      //     categoryCode: 'something',
      //     shop: 'something',
      //     // etc...
      //   },
      //   target: [['server', 'channel']],
      //   lang: 'ja'
      // },
      //
      // I recommend you define some consts at the top of the file to make categories easier.
      // For example: const CATEGORY_COMICS_ALL = '11'
      //              const CATEGORY_ANIME_CEL_SCRIPT = '07'
      // Then use those here.

      { details: { keyword: 'pokemon', categoryCode: CATEGORY_COMICS_ALL } },
      { details: { keyword: 'pokemon', categoryCode: CATEGORY_ANIME_CEL_SCRIPT } },
      { details: { keyword: 'hunterhunter', categoryCode: CATEGORY_COMICS_ALL } },
      { details: { keyword: 'ゼルダの伝説', categoryCode: CATEGORY_BOOKS } },
      { details: { keyword: 'ゼルダの伝説', categoryCode: CATEGORY_COMICS_ALL } },
      // ...
    ]
  },
  auction: {
    // No default options for the moment.
    defaultDetails: {},
    defaultTarget: [[/* server, channel */]],
    searches: [
      // Confusingly, what used to be 'keyword' is now called 'q'.
      // This will be fixed in a future release.
      { details: { q: 'ポケットモンスター' } },
      { details: { q: 'hunter x hunter' } },
      // ...
    ]
  }
},
  `
  return { obj: obj.trim() }
}
