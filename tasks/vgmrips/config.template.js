export const template = () => {
  const obj = `
vgmrips: {
  // No configuration. Just posts new albums from VGMRips.
  // That is, from this page: <https://vgmrips.net/packs/latest>
  target: [[MY_SERVER, CHANNEL_VGMRIPS]]
}
  `
  return { obj: obj.trim() }
}
