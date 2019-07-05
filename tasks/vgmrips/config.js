export const configTemplate = () => {
  const obj = `
vgmrips: {
  // No configuration. Just posts new albums from VGMRips.
  // That is, from this page: <https://vgmrips.net/packs/latest>
  target: [[/* server, channel */]]
}
  `
  return { obj: obj.trim() }
}
