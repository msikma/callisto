// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { Attachment } = require('discord.js')
const { limitString } = require('dada-cli-tools/util/text')
const { splitFilename } = require('dada-cli-tools/util/fs')
const { getURLFilename } = require('dada-cli-tools/request')
const { slugifyUnderscore } = require('./slug')

/**
 * Attaches a remote image to a RichEmbed and sets it as image.
 */
const attachRemoteImage = (embed, url, filename) => {
  let imageName = filename
  if (!filename) {
    const urlFilename = getURLFilename(url)
    const { basename, extension } = splitFilename(urlFilename)
    imageName = `image_${slugifyUnderscore(basename)}.${extension}`
  }
  const attachment = new Attachment(url, imageName)
  embed.attachFile(attachment)
  embed.setImage(`attachment://${imageName}`)
  return embed
}

/** Limits title and description so they fit in a RichEmbed. */
const embedTitle = limitString(250) // Really 256, but with some buffer built in.
const embedDescription = limitString(2000) // Really 2048.

module.exports = {
  attachRemoteImage,
  embedTitle,
  embedDescription
}
