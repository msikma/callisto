export const configTemplate = () => {
  const obj = `
reddit: {
  // Add subs to post updates for.
  subs: [
    {
      // Name of the sub, without r/ prefix. e.g. 'news' for 'r/news'.
      name: 'speedrun',
      // Optionally, the view type to get updates from. 'hot', 'new', etc.
      type: 'hot',
      target: [[/* server, channel */]]
    }
    // ...
  ]
}
  `
  return { obj: obj.trim() }
}
