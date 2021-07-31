// Callisto - callisto-task-buyee <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { attachRemoteImage, embedTitle } = require('callisto-core/util/richembed')
const { formatCurrency } = require('callisto-core/util/text')
const { URL } = require('url')

const { info } = require('../info')

/**
 * Extracts the thumbnail hidden inside the 'wing-auctions' URL.
 * 
 * An example input: "https://wing-auctions.c.yimg.jp/sim?furl=auctions.c.yimg.jp/images.auctions.yahoo.co.jp/image/dr000/auc0207/users/d74506ff42228a95154972aed8ae445e85203758/i-img759x683-1626960561vy4cjm15481.jpg&dc=1&sr.fs=20000"
 */
const extractRealThumbnail = url => {
  try {
    const parsed = new URL(url)
    const furl = parsed.searchParams.get('furl')
    return furl.startsWith('http') ? furl : `https://${furl}`
  }
  catch (err) {
    return url
  }
}

/**
 * Returns a RichEmbed to post to Discord.
 * 
 *   { "data": {
 *       "id": "k1000070559",
 *       "title": "【勇】保存刀剣 剛刀84.8cm 武蔵大掾是一　最上作 生ぶ品 刀 7 刀身988ｇ 日本美術刀剣保存協会",
 *       "link": "https://buyee.jp/item/yahoo/auction/k1000070559",
 *       "thumbnail": "https://wing-auctions.c.yimg.jp/sim?furl=auctions.c.yimg.jp/images.auctions.yahoo.co.jp/image/dr000/auc0207/users/d74506ff42228a95154972aed8ae445e85203758/i-img759x683-1626960561vy4cjm15481.jpg&dc=1&sr.fs=20000",
 *       "details": {},
 *       "price": {
 *         "currentPrice": {
 *           "price": 10000,
 *           "locale": {
 *             "style": "currency",
 *             "currency": "JPY"
 *           }
 *         },
 *         "numberOfBids": 1
 *       },
 *       "time": {
 *         "isNewlyListed": true,
 *         "timeRemaining": "3 day(s)"
 *       },
 *       "seller": {
 *         "name": "lrvz8414"
 *       }
 *     },
 *     "id": "k1000070559",
 *     "searchURL": "https://buyee.jp/item/search/query/8cm",
 *     "searchParameters": {
 *       "currentPriceRange": {
 *         "min": null,
 *         "max": null
 *       },
 *       "buyoutPriceRange": {
 *         "min": null,
 *         "max": null
 *       },
 *       "itemStatus": "any",
 *       "storeType": "any",
 *       "options": {
 *         "withBuyout": false,
 *         "newlyListed": false,
 *         "freeDeliveryInJapan": false,
 *         "withPictures": false,
 *         "buyeeRecommended": false
 *       },
 *       "query": "8cm"
 *     },
 *     "_details": { "keyword": "asdf", "category": "ASDF", "alert": true },
 *     "hasExtendedData": false } *   
 */
const formatMessage = (item, searchDetails, fields = ['price', 'store', 'time', 'bids', 'itemno', 'watchers']) => {
  const embed = new RichEmbed();
  embed.setAuthor('New item found on Yahoo Auctions through Buyee', info.icon)
  if (fields.indexOf('price') !== -1) {
    embed.addField('Current price', formatCurrency(item.data.price.currentPrice.price, item.data.price.currentPrice.locale.currency), false)
  }
  if (fields.indexOf('time') !== -1) {
    embed.addField('Time left', `${item.data.time.timeRemaining}`, true)
  }
  if (fields.indexOf('itemno') !== -1) {
    embed.addField('Item no.', `${item.data.id}`, true)
  }
  if (fields.indexOf('bids') !== -1) {
    embed.addField('Current bids', `${item.data.price.numberOfBids} bids`, true)
  }

  if (item.data.thumbnail) {
    attachRemoteImage(embed, extractRealThumbnail(item.data.thumbnail))
  }
  embed.setURL(item.data.link)
  embed.setColor(info.color)
  embed.setTitle(embedTitle(item.data.title))
  embed.setFooter(`Searched for keyword "${searchDetails.keyword}" in category "${searchDetails.category ? searchDetails.category : '(none)'}"`)
  return embed
}

module.exports = {
  formatMessage
}
