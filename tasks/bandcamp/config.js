export const configTemplate = () => {
  const obj = `
bandcamp: {
  defaultTarget: [[/* server, channel */]],
  searches: [
    {
      details: {
        search: '/* searchString */'
      },
      target: [[/* server, channel */]]
    }
    // ...
  ]
}
  `
  return { obj: obj.trim() }
}
