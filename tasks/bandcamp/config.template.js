export const template = () => {
  const obj = `
bandcamp: {
  defaultTarget: [[/* server, channel */]],
  searches: [
    { details: { search: '/* searchstring */' }, target: [[/* server, channel */]] }
    // ...
  ]
}
  `
  return { obj: obj.trim() }
}
