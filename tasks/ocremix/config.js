export const configTemplate = () => {
  const obj = `
ocremix: {
  // There's no configuration aside from setting a target.
  // This task just retrieves new tracks and new albums.
  tracks: {
    target: [[/* server, channel */]]
  },
  albums: {
    target: [[/* server, channel */]]
  }
}
  `
  return { obj: obj.trim() }
}
