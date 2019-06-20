export const template = () => {
  const obj = `
catawiki: {
  defaultDetails: {},
  defaultTarget: [[/* server, channel */]],
  // The site tld to search from, e.g. catawiki.com, catawiki.nl.
  defaultCountryCode: '/* countryCode */',
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
    // You can get the category numbers from the website's address bar.
    { details: { keyword: '/* searchString */', category: /* categoryNumber */, countryCode: '/* countryCode */' } },
    { details: { keyword: '/* searchString */', category: /* categoryNumber */ }, target: [[/* server, channel */]] }
    // ...
  ]
}
  `
  return { obj: obj.trim() }
}
