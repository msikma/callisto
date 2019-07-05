export const configTemplate = () => {
  const obj = `
marktplaats: {
  // Just leave this empty.
  defaultDetails: {},
  defaultTarget: [[/* server, channel */]],
  searches: [
    // This is where the searches are set up. You can enter multiple keywords,
    // and multiple categories - the task will search every combination.
    //
    // For example:
    //
    // {
    //   details: {
    //     keyword: ['diskette', 'floppy'],
    //     category: ['322', '356']
    //   },
    //   target: [['target', 'here']]
    // },
    //
    // This will fire off 4 searches (2 * 2), one after the other.
    // The options in 'details' override the 'defaultDetails', if any are set there.
    //
    // Categories can be found on the website itself by copying them from the address bar.
    // E.g. 322: Computers and software
    //      356: Consoles and games
    { details: { keyword: ['diskette', 'floppy'], category: ['322', '356'] }, target: [[/* server, channel */]] },
    { details: { keyword: ['zolderopruiming'], category: ['322'] }, target: [[/* server, channel */]] }
    // ...
  ]
}
  `
  return { obj: obj.trim() }
}
