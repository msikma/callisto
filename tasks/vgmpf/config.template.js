export const template = () => {
  const obj = `
vgmpf: {
  // No configuration. Just posts updates (new albums) from VGMPF.
  target: [[MY_SERVER, CHANNEL_VGMPF]]
}
  `
  return { obj: obj.trim() }
}
