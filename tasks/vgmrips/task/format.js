// Callisto - callisto-task-vgmrips <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { attachRemoteImage } = require('callisto-core/util/richembed')

const systems = require('./systems')
const { info } = require('../info')

/**
 * Returns a RichEmbed to post to Discord.
 * 
 *   { title: 'Bob the Builder: Fix-it Fun!',
 *     image: 'https://vgmrips.net/packs/images/large/GameBoy/Bob_the_Builder_-_Fix-it_Fun%21_%28Nintendo_Game_Boy_Color%29.png',
 *     id: 'vgmrips:pack-420',
 *     link: 'https://vgmrips.net/packs/pack/bob-the-builder-fix-it-fun-nintendo-game-boy-color',
 *     downloadLink: 'https://vgmrips.net/files/GameBoy/Bob_the_Builder_-_Fix-it_Fun%21_%28Nintendo_Game_Boy_Color%29.zip',
 *     downloads: 55,
 *     size: '239.27 KB',
 *     views: 188,
 *     tracks: 20,
 *     released: 2020-03-03T00:00:00.000Z,
 *     updated: 2020-05-04T00:00:00.000Z,
 *     chips: [ 'Game Boy DMG' ],
 *     developers: [ 'Tiertex Design Studios' ],
 *     publishers: [ 'THQ' ],
 *     systems: [ 'Game Boy Color' ],
 *     composers: [ 'Mark Ortiz', 'Paul K. Joyce' ],
 *     packAuthors: [ 'Lu9' ] }
 */
const formatMessage = (item) => {
  const embed = new RichEmbed();
  embed.setAuthor('New release on VGMRips', info.icon)
  embed.setTitle(item.title)
  if (item.image) {
    attachRemoteImage(embed, item.image)
  }
  embed.setTimestamp(item.updated)
  embed.setURL(item.link)
  if (item.systems.length) {
    embed.addField('System', item.systems.join(', '), true)
    const mainSystem = item.systems[0]
    const systemInfo = systems[mainSystem]
    if (systemInfo && systemInfo.image) {
      embed.setThumbnail(systemInfo.image)
    }
  }
  if (item.chips.length) {
    embed.addField('Chip', item.chips.join(', '), true)
  }
  if (item.composers.length) {
    embed.addField('Composer', item.composers.join(', '), false)
  }
  return embed
}

module.exports = {
  formatMessage
}
