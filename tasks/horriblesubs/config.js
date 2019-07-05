export const configTemplate = () => {
  const obj = `
horriblesubs: {
  defaultDetails: {
    // Add any of the items seen in the search details section.
    // You might want to have "res: '1080'" in here.
  },
  defaultTarget: null,
  searches: [
    {
      details: {
        query: '/* Search query */',
        res: '/* One of 1080, 720 or 480 */'
      },
      link: "http://horriblesubs.info/shows/ /* URL to the show's page on HS */",
      target: [[/* server, channel */]]
    },
    // ...
  ]
}
  `
  return { obj: obj.trim() }
}
