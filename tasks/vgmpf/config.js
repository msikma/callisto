export const configTemplate = () => {
  const obj = `
vgmpf: {
  // No configuration. Just posts updates (new albums) from VGMPF.
  target: [[/* server, channel */]]
}
  `
  return { obj: obj.trim() }
}
