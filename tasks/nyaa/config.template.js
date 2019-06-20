export const template = () => {
  const obj = `
nyaa: {
  defaultDetails: {},
  defaultTarget: null,
  searches: [
    {
      // Set a search query, and optionally a category.
      // You can get the category string from the address bar on the site.
      details: { query: 'pokemon', category: NYAA_CATEGORY_LITERATURE },
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
