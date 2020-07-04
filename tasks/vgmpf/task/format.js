// Callisto - callisto-task-vgmpf <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { attachRemoteImage, embedDescription, embedTitle } = require('callisto-core/util/richembed')

const { info } = require('../info')

/**
 * Returns a RichEmbed to post to Discord.
 * 
 *   { title: 'Starship Hector',
 *     titleFull: 'Starship Hector (NES)',
 *     content: '_**Starship Hector**_ is a space-themed shooter by Hudson Soft. [...]',
 *     image: 'http://www.vgmpf.com/Wiki/images/thumb/b/bb/Starship_Hector_-_NES.jpg/500px-Starship_Hector_-_NES.jpg',
 *     data: { platform: 'NES', year: '1987', developer: 'Hudson Soft' },
 *     length: '17:29',
 *     composers: [ 'Takeaki Kunimoto' ],
 *     screenshots: [ { url: 'url', title: 'title' }, [Object], [Object], [Object] ],
 *     link: 'http://www.vgmpf.com/Wiki/index.php?title=Starship_Hector_(NES)' }
 * 
 * 'image' is the box image and is possibly null if the item was not released in a box.
 */
const formatMessage = (item) => {
  const embed = new RichEmbed();
  embed.setAuthor('New release on VGMPF', info.icon)
  embed.setTitle(embedTitle(item.titleFull))
  embed.setDescription(embedDescription(item.content))
  if (item.image) {
    embed.setThumbnail(item.image)
  }
  if (item.screenshots.length) {
    const screenshotFirst = item.screenshots[0]
    attachRemoteImage(embed, screenshotFirst.url)
  }
  embed.setURL(item.link)
  if (item.length) {
    embed.addField('Length', item.length, true)
  }
  if (item.data.platform) {
    embed.addField('Platform', item.data.platform, true)
  }
  if (item.data.year) {
    embed.addField('Released', item.data.year, true)
  }
  if (item.composers.length) {
    embed.addField('Composer', item.composers.join(', '), false)
  }
  return embed
}

module.exports = {
  formatMessage
}
