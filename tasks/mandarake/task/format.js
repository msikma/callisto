// Callisto - callisto-task-mandarake <https://github.com/msikma/callisto>
// © MIT license

const { uniq } = require('lodash')
const { RichEmbed } = require('discord.js')
const { attachRemoteImage, embedTitle } = require('callisto-core/util/richembed')
const { mainCategories, shops } = require('mdrscr')
const { info } = require('../info')

// List of shops and categories by their codes.
const shopsByCode = {
  en: Object.values(shops).reduce((acc, shop) => ({ ...acc, [shop[0]]: shop[1] }), {}),
  ja: Object.values(shops).reduce((acc, shop) => ({ ...acc, [shop[0]]: shop[2] }), {})
}
const categoriesByCode = {
  en: Object.values(mainCategories).reduce((acc, cat) => ({ ...acc, [cat[0]]: cat[1] }), {}),
  ja: Object.values(mainCategories).reduce((acc, cat) => ({ ...acc, [cat[0]]: cat[2] }), {})
}

/** Converts a yen value into yen/eur. */
const priceYenEur = yen => `¥${yen} (±€${(yen / 125).toFixed(2)})`

/**
 * Returns a RichEmbed to post to Discord.
 * 
 *   { title: '小学館 てんとう虫コミックス 山本サトシ ポケットモンスターSPECIAL サン・ムーン 5',
 *     itemNo: [ 'nitem-00INQQYP', '0101394461' ],
 *     image: 'https://img.mandarake.co.jp/webshopimg/01/01/461/0101394461/s_01013944610.jpg',
 *     link: 'https://order.mandarake.co.jp/order/detailPage/item?itemCode=1128270337&ref=list&dispAdult=0&soldOut=1&categoryCode=11&keyword=pokemon',
 *     shop: [ 'SAHRA' ],
 *     shopCode: '55',
 *     price: 300,
 *     isAdult: false,
 *     inStock: true,
 *     inStorefront: false,
 *     id: 'nitem-00INQQYP_0101394461' }
 */
const formatMessageMain = (item, searchDetails, fields = ['price', 'category', 'adult']) => {
  const embed = new RichEmbed();
  embed.setAuthor('New item found on Mandarake', info.icon)
  if (fields.indexOf('price') !== -1) {
    embed.addField('Price', priceYenEur(item.price), true)
  }
  if (fields.indexOf('stock') !== -1) {
    embed.addField('In stock', `${item.inStock ? 'Yes' : 'No'}${item.inStoreFront ? ' (store front item)' : ''}`, true)
  }
  if (fields.indexOf('store') !== -1) {
    embed.addField('Store', shopsByCode.en[item.shopCode], true)
  }
  if (fields.indexOf('category') !== -1 && searchDetails.categoryCode) {
    embed.addField('Category', categoriesByCode.en[searchDetails.categoryCode], true)
  }
  if (fields.indexOf('itemno') !== -1) {
    embed.addField('Item no.', `${item.itemNo[0]} (${item.itemNo[1]})`, true)
  }
  if (fields.indexOf('adult') !== -1 && item.isAdult) {
    embed.addField('Rating', 'Adult product', true)
  }

  attachRemoteImage(embed, item.image)
  embed.setURL(item.link)
  embed.setTitle(embedTitle(item.title))
  embed.setFooter(`Searched for keyword "${searchDetails.keyword}"`)
  return embed
}

/**
 * Returns a RichEmbed to post to Discord.
 * 
 *   { title: '遊戯王シリーズ ×アニメイトカフェ 闇遊戯 描き下ろしタペストリー 29cm×40cm',
 *     itemNo: '01040041420400002',
 *     link: 'https://ekizo.mandarake.co.jp/auction/item/itemInfoJa.html?index=632973',
 *     image: 'https://img.mandarake.co.jp/aucimg/5/7/6/0/0001975760.jpeg',
 *     auctionType: '毎オク',
 *     shop: '名古屋店',
 *     shopCode: '4',
 *     categories: [],
 *     currentPrice: 4000,
 *     startingPrice: 4000,
 *     bids: 0,
 *     watchers: 0,
 *     timeLeft: { days: 0, hours: 13, minutes: 6, formattedTime: '13:06' },
 *     id: '01040041420400002' }
 */
const formatMessageAuction = (item, searchDetails, fields = ['price', 'category', 'store', 'bids', 'watchers']) => {
  const embed = new RichEmbed();
  embed.setAuthor('New item found on Mandarake Auctions', info.iconAuctions)
  if (fields.indexOf('price') !== -1) {
    embed.addField('Current price', priceYenEur(item.currentPrice), false)
  }

  if (item.timeLeft.type === 'pre-bidding') {
    embed.addField('Time left', 'Auction has not started yet')
  }
  else {
    const daysLeft = `${item.timeLeft.days} day${item.timeLeft.days !== 1 ? 's' : ''}`
    const hoursLeft = `${item.timeLeft.hours} hour${item.timeLeft.hours !== 1 ? 's' : ''}`
    const minutesLeft = `${item.timeLeft.minutes} minute${item.timeLeft.minutes !== 1 ? 's' : ''}`
    const timeLeftBits = [
      ...(item.timeLeft.days > 0 ? [daysLeft] : []),
      ...(item.timeLeft.hours > 0 ? [hoursLeft] : []),
      ...(item.timeLeft.minutes > 0 ? [minutesLeft] : []),
    ]
    // rework
    const timeLeft = timeLeftBits.length === 3
      ? `${timeLeftBits.slice(0, 1)[0]}, ${timeLeftBits.slice(1, 3).join(' and ')}`
      : (timeLeftBits.length === 2
          ? timeLeftBits.join(' and ')
          : (timeLeftBits.length === 0
              ? '(unknown)'
              : timeLeftBits[0]))

    embed.addField('Time left', timeLeft, false)
  }

  if (fields.indexOf('store') !== -1) {
    embed.addField('Store', shopsByCode.en[item.shopCode], true)
  }
  if (fields.indexOf('category') !== -1 && item.categories.length) {
    embed.addField('Category', uniq(item.categories.map(c => c.name)).join(' > '), true)
  }
  if (fields.indexOf('itemno') !== -1) {
    embed.addField('Item no.', `${item.itemNo}`, true)
  }
  if (fields.indexOf('bids') !== -1) {
    embed.addField('Current bids', `${item.bids} bids`, true)
  }
  if (fields.indexOf('watchers') !== -1) {
    embed.addField('People watching', `${item.bids} people`, true)
  }

  attachRemoteImage(embed, item.image)
  embed.setURL(item.link)
  embed.setColor(info.colorAuctions)
  embed.setTitle(embedTitle(item.title))
  embed.setFooter(`Searched for keyword "${searchDetails.keyword}"`)
  return embed
}

module.exports = {
  formatMessageMain,
  formatMessageAuction
}
