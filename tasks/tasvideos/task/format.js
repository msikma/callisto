// Callisto - callisto-task-tasvideos <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { attachRemoteImage } = require('callisto-core/util/richembed')
const { embedDescription } = require('callisto-core/util/richembed')
const { bulletizeList } = require('callisto-core/util/text')

const { info } = require('../info')

/**
 * Returns a RichEmbed to post to Discord.
 * 
 *   { id: '4159M',
 *     title: 'DS Castlevania: Portrait of Ruin (USA) "1000%" by mtbRc in 38:11.56',
 *     description: 'The second Castlevania title released on Nintendo DS after _[Dawn of Sorrow](http://tasvideos.org/2528M.html "[2528] DS Castlevania: Dawn of Sorrow (USA) by mtbRc in 03:30.71")_, this game is a direct sequel to _[Bloodlines](http://tasvideos.org/1220M.html "[1220] Genesis Castlevania: Bloodlines (USA) "John Morris" by Samhain-Grim & Truncated in 27:36.17")_ on Sega Genesis. Dracula rises from the dead yet again _(cue groan)_, and it\'s up to Jonathan Morris, helped out by Charlotte Aulin, a powerful mage student, to defeat him.\n\nThis time, mtbRc fully completes every single map (amounting to 1000% in total, and is therefore considered full completion), defeats all bosses and completes the game in record time.',
 *     author: 'mtbRc',
 *     image: 'http://media.tasvideos.org/4159M.png',
 *     categories:
 *      [ '100% completion',
 *        'Takes damage to save time',
 *        'Uses warps',
 *        'Uses a game restart sequence' ],
 *     hasStar: false,
 *     hasMoon: true,
 *     link:
 *      { comments: 'http://tasvideos.org/forum/t/21750',
 *        publication: 'http://tasvideos.org/4159M.html',
 *        submission: 'http://tasvideos.org/6701S.html',
 *        youtube: 'http://www.youtube.com/watch?v=oRpKyHAqJMA' },
 *     meta:
 *      { title:
 *         { id: '4159',
 *           console: 'DS',
 *           game: 'Castlevania: Portrait of Ruin (USA) "1000%"',
 *           author: 'mtbRc',
 *           duration: '38:11.56',
 *           publisher: 'Published by fsvgm777 to Moons' },
 *        date: 2020-04-10T15:10:56.000Z,
 *        published: '2 months ago',
 *        publishedExact: 2020-04-10T15:10:56.000Z } }
 */
const formatMessage = (item, { showCategories = true, showOtherLinks = true, addStarEmoji = true, addMoonEmoji = false } = {}) => {
  const embed = new RichEmbed();
  embed.setAuthor('New publication on TASVideos', info.icon)
  embed.setTitle(`${item.hasStar && addStarEmoji ? '⭐ ' : ''}${item.hasMoon && addMoonEmoji ? '🌙 ' : ''}${item.title}`)
  if (item.description)
    embed.setDescription(embedDescription(item.description))
  if (item.meta.publishedExact)
    embed.setTimestamp(item.meta.publishedExact)
  if (item.link.publication)
    embed.setURL(item.link.publication)

  if (item.image) {
    attachRemoteImage(embed, item.image)
  }
  if (showOtherLinks) {
    const links = [
      `[Publication page](${item.link.publication})`,
      item.link.submission ? `[Author's comments](${item.link.submission})` : null,
      item.link.youtube ? `[View on Youtube](${item.link.youtube})` : null,
      `[Forum topic](${item.link.comments})`
    ]
    embed.addField('Other links', bulletizeList(links.filter(n => n)), true)
  }
  if (showCategories && item.categories.length) {
    embed.addField('Categories', bulletizeList(item.categories), true)
  }
  return embed
}

module.exports = {
  formatMessage
}
