export const configTemplate = () => {
  const obj = `
nyaa: {
  defaultDetails: {},
  defaultTarget: null,
  searches: [
    {
      // Set a search query, and optionally a category.
      // You can get the category string from the address bar on the site.
      // A few to get started:
      //   * 0_0: Everything     3_0: Literature
      //   * 1_0: Anime          4_0: Live action
      //   * 1_4: Anime - Raw    5_0: Pictures
      //   * 2_0: Audio          6_0: Software
      details: { query: 'pokemon', category: '1_4' },
      // Optionally a thumbnail can be added to the output. This could be the logo of a show or manga.
      thumbnail: 'https://i.imgur.com/HbK8Xs8.png',
      target: [[/* server, channel */]]
    },
    // ...
  ]
}
  `
  return { obj: obj.trim() }
}
