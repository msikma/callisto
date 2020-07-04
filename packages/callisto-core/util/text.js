/**
 * Calypso - calypso-misc <https://github.com/msikma/calypso>
 * © MIT license
 */

const { limitStringSentence, limitStringParagraph, charTrim } = require('dada-cli-tools/util/text')

/**
 * Formats money as a string.
 */
const formatCurrency = (units, currency = 'EUR', locale = 'en-US') => {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency })
  return formatter.format(units)
}

/**
 * Returns a 'hierarchy' string from an array.
 * 
 * For example, ['World', 'Europe', 'Netherlands'] becomes 'World ⟩ Europe ⟩ Netherlands'.
 */
const hierarchyList = arr => {
  return arr.join(' ⟩ ')
}

/**
 * Removes empty > quote lines.
 */
const removeEmptyQuotesMd = (md) => {
  return md.replace(/^\>\s*$/mg, '')
}

/**
 * Removes extra empty lines by trimming every line, then removing the empty strings.
 * 
 * If 'leaveGap' is true, we will instead compress multiple empty lines down to a single empty line.
 */
const removeEmptyLines = (str, leaveGap = false) => {
  if (leaveGap) {
    const split = str.split('\n').map(l => l.trim())
    const lines = split.reduce((acc, curr) => [...acc, ...(curr === acc[acc.length - 1] ? [] : [curr])], [])
    return lines.join('\n')
  }
  else {
    return str.split('\n').map(l => l.trim()).filter(l => l !== '').join('\n')
  }
}

/**
 * Converts an array into a bulleted list.
 */
const bulletizeList = (arr, bullet = '• ') => {
  return arr.map(i => `${bullet}${i}`).join('\n')
}

/**
 * Separate images from Markdown. We can't display them on Discord.
 * 
 * This returns the Markdown text with all image tags removed, and the image tags separately.
 * 
 * Matches:
 * 
 *   ![alt text](https://i.imgur.com/asdf.jpg some title text)
 *   ![alt text](https://i.imgur.com/asdf.jpg)
 *   ![](https://i.imgur.com/asdf.jpg)
 * 
 * Return example:
 * 
 *   [{ alt: 'alt text', url: 'https://i.imgur.com/asdf.jpg', title: 'some title text' },
 *    { alt: 'alt text', url: 'https://i.imgur.com/asdf.jpg', title: null }]
 *    { alt: null, url: 'https://i.imgur.com/asdf.jpg', title: null }]
 */
const separateMarkdownImages = (md, leavePlaceholder = false) => {
  const re = /!\[(.*)\]\((.+?)\)/gm
  const images = []
  let match
  while ((match = re.exec(md)) !== null) {
    const alt = match[1]
    const rest = match[2].split(' ')
    const url = rest.slice(0, 1)[0]
    const title = rest.slice(1).join(' ')
    images.push({ alt: alt ? alt : null, url, title: title ? title : null })
  }
  return {
    images,
    text: removeEmptyLines(md.replace(re, leavePlaceholder ? '[image]' : ''), true)
  }
}

/**
 * Converts a filename to something we can display in a title.
 * 
 * For example:
 *    '[Some-Stuffs]_Pocket_Monsters_Twilight_Wings_04_[3117417F].mkv'
 * to '[Some-Stuffs] Pocket Monsters Twilight Wings 04 [3117417F]'.
 */
const titleFromFilename = filename => {
  if (!filename) return ''
  return filename
    .replace(/_/g, ' ')
    // Remove extension at the end.
    .replace(/\.[a-z0-9]+$/i, '')
    .trim()
}

/**
 * Limits a description to a reasonable length per-sentence.
 */
const limitDescriptionSentence = limitStringSentence(700)

/**
 * Reduces the length of a description. Most Youtube descriptions are gigantic.
 * We try to reduce them to a specific paragraph.
 */
const limitDescriptionParagraph = limitStringParagraph(400)

module.exports = {
  bulletizeList,
  charTrim,
  formatCurrency,
  hierarchyList,
  limitDescriptionParagraph,
  limitDescriptionSentence,
  removeEmptyLines,
  removeEmptyQuotesMd,
  separateMarkdownImages,
  titleFromFilename
}
