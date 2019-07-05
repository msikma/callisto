export const configTemplate = () => {
  const obj = `
tasvideos: {
  searches: [
    // 'type' must be one of the RSS files served by the site.
    // E.g. 'publications' for 'http://tasvideos.org/publications.rss'.
    { type: 'publications', target: [[/* server, channel */]] }
  ]
}
  `
  return { obj: obj.trim() }
}
