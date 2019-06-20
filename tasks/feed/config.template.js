export const template = () => {
  const obj = `
feed: {
  defaultTarget: [[/* server, channel */]],
  feeds: [
    {
      url: '/* RSS feed URL */',
      name: '/* Name of the feed or website */',
      color: 0x000000, // Custom color for the new post notifications
      thumbnail: '/* Icon or other identifier image to display in the notification */',
      target: [[/* server, channel */]]
    }
    // ...
  ]
}
  `
  return { obj: obj.trim() }
}
