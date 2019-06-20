export const template = () => {
  const obj = `
hiveworks: {
  comics: [
    {
      name: '/* Name of the comic */',
      slug: '/* Unique slug identifying the comic (used for caching) */',
      color: 0xa88ba5, // Color
      url: '/* Main website of the comic */',
      icon: '/* Icon for the comic */',
      target: [[/* server, channel */]]
    },
    // ...
  ]
}
  `
  return { obj: obj.trim() }
}
