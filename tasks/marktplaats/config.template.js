export const template = () => {
  const obj = `
marktplaats: {
  // Just leave this empty.
  defaultDetails: {},
  defaultTarget: [[/* server, channel */]],
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
    { details: { keyword: 'zolderopruiming', category: CATEGORY_COMPUTERS_EN_SOFTWARE }, target: [[/* server, channel */]] },
    { details: { keyword: 'zolderopruiming', category: CATEGORY_SPELCOMPUTERS_EN_GAMES } },
    { details: { keyword: 'diskette', category: CATEGORY_COMPUTERS_EN_SOFTWARE } },
    { details: { keyword: 'diskette', category: CATEGORY_SPELCOMPUTERS_EN_GAMES } },
    { details: { keyword: 'floppie' } },
    { details: { keyword: 'floppy' } }
  ]
}
  `
  return { obj: obj.trim() }
}
