// Callisto - callisto-task-nyaa <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { attachRemoteImage, embedDescription, embedTitle } = require('callisto-core/util/richembed')
const { getFormattedTimestamp } = require('callisto-core/util/time')

const { info } = require('../info')

/** Returns a download summary. */
const dlSummary = (seeders, leechers, downloads) => `↑${seeders} ↓${leechers} ✓${downloads}`

/**
 * Formats a RichEmbed to post to Discord.
 * 
 * An item has the following format:
 * 
 *   { title: '[AkihitoSubs] Pocket Monsters (Pokemon 2019) - 022 Farewell Raboot! [1080p][HEVC][10Bit][EAC3]',
 *     id: 'nyaa:1239986',
 *     torrentURL: 'https://nyaa.si/download/1239986.torrent',
 *     url: 'https://nyaa.si/view/1239986',
 *     seeders: '24',
 *     leechers: '0',
 *     downloads: '794',
 *     infohash: '106dfe5c1f19145926977687f9011eb5efc438eb',
 *     categoryID: '1_2',
 *     category: 'Anime - English-translated',
 *     size: '282.7 MiB',
 *     comments: '0',
 *     trusted: 'No',
 *     remake: 'Yes',
 *     meta:
 *      { published: '2 months ago',
 *        publishedExact: 2020-04-20T03:17:11.000Z },
 *     images:
 *      [ { alt: 'alt text',
 *          url: 'https://i.imgur.com/T6x5xia.png',
 *          title: null },
 *        { alt: 'alt text',
 *          url: 'https://i.imgur.com/PhofSjh.png',
 *          title: null } ],
 *     description: '**Some markdown here\nand here**' }
 */
const formatMessage = (item, { searchQuery, searchCategory, thumbnail }) => {
  const embed = new RichEmbed()
  embed.setAuthor(`New torrent file on Nyaa.si`, info.icon)
  embed.setURL(item.url)

  if (thumbnail) {
    // Thumbnail comes from the user config.
    embed.setThumbnail(encodeURI(thumbnail))
  }
  
  if (item.images.length) {
    // Multiple images are (possibly) present. Use the first one.
    attachRemoteImage(embed, item.images[0].url)
  }

  if (item.title)
    embed.setTitle(embedTitle(item.title))
  if (item.description)
    embed.setDescription(embedDescription(item.description))
  if (item.meta.publishedExact) {
    embed.addField('Published', getFormattedTimestamp(item.meta.publishedExact), false)
    embed.setTimestamp(item.meta.publishedExact)
  }
  if (item.category)
    embed.addField('Category', item.category, true)
  if (item.size)
    embed.addField('Size', item.size, true)
  if (item.seeders && item.leechers && item.downloads)
    embed.addField('Status', dlSummary(item.seeders, item.leechers, item.downloads), true)
  if (searchQuery)
    embed.setFooter(`Searched for keyword: ${searchQuery}`)
  
  return embed
}

module.exports = {
  formatMessage
}
