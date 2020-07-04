// Callisto - callisto-task-marktplaats <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const { formatCurrency, hierarchyList } = require('callisto-core/util/text')
const { toKeys } = require('callisto-core/util/misc')
const { ensureHttp } = require('callisto-core/util/uri')
const { embedTitle, embedDescription } = require('callisto-core/util/richembed')
const info = require('../info')

/**
 * Translates the Dutch shipping string into English.
 */
const translateShipping = (string, addEmoji = false) => {
  const emoL = ':package:'
  const emoS = ':truck:'
  const strings = {
    'Verzenden': `${addEmoji ? `${emoS} ` : ''}Shipping only`,
    'Ophalen of Verzenden': `${addEmoji ? `${emoL}${emoS} ` : ''}Shipping or local pickup`,
    'Ophalen': `${addEmoji ? `${emoL} ` : ''}Local pickup only`
  }
  const translation = strings[string]
  return translation ? translation : string
}

/** Wraps a URL into the Marktplaats base URL. */
const baseURL = url => `https://marktplaats.nl${url}`

/** Returns a URL to the item from its ID. */
const getShortURL = id => `https://link.marktplaats.nl/${id}`

/**
 * Returns a RichEmbed to post to Discord.
 * 
 * Item example:
 * 
 *   { id: 'marktplaats$m1564859688',
 *     itemId: 'm1564859688',
 *     title: 'Norton antivirus voor 1 jaar ',
 *     description: 'Inlog voor 1 jaar antivirus norton',
 *     priceInfo: { priceCents: 1000, priceType: 'FIXED' },
 *     location:
 *      { cityName: 'Bilthoven',
 *        countryName: 'Nederland',
 *        countryAbbreviation: 'NL',
 *        distanceMeters: -1000,
 *        isBuyerLocation: false,
 *        onCountryLevel: false,
 *        abroad: false },
 *     date: '2020-06-15T18:42:56Z',
 *     imageUrls:
 *      [ '//i.ebayimg.com/00/s/MjgwWDI2MA==/z/i2EAAOSwVn1e58F~/$_82.JPG' ],
 *     sellerInformation:
 *      { sellerId: 19347195,
 *        sellerName: 'F&A Bilthoven  ',
 *        showSoiUrl: true,
 *        showWebsiteUrl: false,
 *        isVerified: false },
 *     categoryId: 371,
 *     pageLocation: 'L2_SEARCH',
 *     priorityProduct: 'NONE',
 *     videoOnVip: false,
 *     urgencyFeatureActive: false,
 *     napAvailable: false,
 *     attributes: [ { key: 'delivery', value: 'Ophalen' } ],
 *     traits: [ 'PACKAGE_FREE' ],
 *     verticals: [ 'software_anti_virus_and_security', 'computers_and_software' ],
 *     vipUrl: '/a/computers-en-software/software-antivirus-en-beveiliging/m1564859688-norton-antivirus-voor-1-jaar.html' }
 * 
 * Meta example:Computers en Software / Antivirus en Beveiliging
 * 
 *   { params:
 *     { query: 'diskette',
 *       categoryID: '371',
 *       categoryInfo:
 *        { l1Cat:
 *           { id: 322,
 *             name: 'Computers en Software',
 *             slug: 'computers-en-software',
 *             url: 'https://www.marktplaats.nl/c/computers-en-software/c322.html' },
 *          l2Cat:
 *           { id: 371,
 *             name: 'Antivirus en Beveiliging',
 *             slug: '/www.marktplaats.nl/z/computers-en-software/software-antivirus-en-beveiliging',
 *             url: 'https://www.marktplaats.nl/z/computers-en-software/software-antivirus-en-beveiliging.html?categoryId=371',
 *             isSubcat: true,
 *             parentID: 322 } }
 *     url: 'https://www.marktplaats.nl/lrp/api/search?query=a&l1CategoryId=322&l2CategoryId=371' }
 */
const formatMessage = (item, meta, fields = ['price', 'seller', 'location', 'delivery', 'status', 'category'], useLongURL = false, showUnverified = false) => {
  const visibleFields = toKeys(fields)
  const { l1Cat, l2Cat } = meta.params.categoryInfo
  const embed = new RichEmbed();
  embed.setAuthor('New item found on Marktplaats', info.icon)
  embed.setTitle(embedTitle(item.title.trim()))
  embed.setDescription(embedDescription(item.description.trim()))
  embed.setURL(useLongURL ? baseURL(item.vipUrl) : getShortURL(item.itemId))

  if (item.priceInfo && visibleFields.price) {
    const { priceCents, priceType } = item.priceInfo
    if (priceType === 'SEE_DESCRIPTION') {
      embed.addField('Price', 'See description', false)
    }
    else if (priceType === 'FAST_BID') {
      embed.addField('Price', 'Bidding only', false)
    }
    else if (priceType === 'FIXED') {
      embed.addField('Price', formatCurrency(priceCents / 100, 'EUR'), false)
    }
    else if (priceType === 'MIN_BID') {
      embed.addField('Price', `${formatCurrency(priceCents / 100, 'EUR')} (bids accepted)`, false)
    }
    else if (priceType === 'RESERVED') {
      embed.addField('Price', `${formatCurrency(priceCents / 100, 'EUR')} (reserved)`, false)
    }
    else if (priceType === 'FREE') {
      embed.addField('Price', `Free`, false)
    }
    else if (priceType === 'NOTK') {
      embed.addField('Price', `To be agreed upon later`, false)
    }
    else {
      embed.addField('Price', `Unknown price type${priceCents ? ` (${formatCurrency(priceCents / 100, 'EUR')})` : ''}`, false)
    }
  }

  if (item.sellerInformation && item.sellerInformation.sellerName && visibleFields.seller) {
    embed.addField('Seller', `${item.sellerInformation.sellerName}${!item.sellerInformation.isVerified && showUnverified ? ' (unverified)' : ''}`, true)
  }
  if (item.location && visibleFields.location) {
    embed.addField('Location', `${item.location.cityName}, ${item.location.countryAbbreviation}`, true)
  }
  for (const attr of item.attributes) {
    if (attr.key === 'delivery' && visibleFields.delivery) {
      embed.addField('Delivery', translateShipping(attr.value, true), false)
    }
  }
  if (item.priorityProduct && item.priorityProduct !== 'NONE' && visibleFields.status) {
    embed.addField(
      'Status',
      (item.priorityProduct === 'DAGTOPPER') ? 'Dagtopper' :
      (item.priorityProduct === 'TOPADVERTENTIE') ? 'Topadvertentie' :
      (item.priorityProduct),
      false
    )
  }
  if ((l1Cat != null || l2Cat != null) && visibleFields.category) {
    const categoryItems = []
    if (l1Cat && l1Cat.id)
      categoryItems.push(`[${l1Cat.name}](${l1Cat.url})`)
    if (l2Cat && l2Cat.id)
      categoryItems.push(`[${l2Cat.name}](${l2Cat.url})`)
    
    embed.addField('Category', hierarchyList(categoryItems), false)
  }
  if (item.date) {
    embed.setTimestamp(new Date(item.date))
  }
  if (item.imageUrls && item.imageUrls.length) {
    embed.setThumbnail(ensureHttp(item.imageUrls[0]))
  }
  embed.setFooter(`Searched for keyword "${meta.params.query}"`)
  return embed
}

module.exports = {
  formatMessage
}
