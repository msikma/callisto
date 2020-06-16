// Callisto - callisto-task-vgmrips <https://github.com/msikma/callisto>
// © MIT license

const cheerio = require('cheerio')
const { request } = require('callisto-core/lib/request')

/** Recent releases page. */
const VGMRIPS_LATEST = 'https://vgmrips.net/packs/latest'

/**
 * Retrieves all latest released packs.
 */
const reqLatestAdditions = async () => {
  const res = await request(VGMRIPS_LATEST)
  const $ = cheerio.load(res.body)

  const items = findReleases($)
    .sort((a, b) => a.released > b.released ? 1 : -1)

  return {
    success: true,
    errorType: null,
    error: null,
    items
  }
}

/**
 * Extracts information from scraped albums HTML.
 */
const findReleases = $ => {
  const packs = $('#recent > .result.row')
  return packs.map((_, pack) => {
    const $pack = $(pack)
    const image = $('.image img', $pack).attr('src').replace('/images/small/', '/images/large/')
    const title = $('.image img', $pack).attr('alt')
    const link = $('.title a:nth-child(2)', $pack).attr('href')
    const chips = getArray($, $('.info .chips a', $pack))
    const developers = getArray($, $('.info .developers a', $pack))
    const publishers = getArray($, $('.info .publishers a', $pack))
    const systems = getArray($, $('.info .systems a', $pack))
    const composers = getArray($, $('.info .composers a', $pack))
    const packAuthors = getArray($, $('.info .authors a', $pack))
    const downloadLink = $('.title a.download', $pack).attr('href')
    const id = `vgmrips:${$pack.attr('id').trim()}`

    // "16 songs • 526.25 KB"
    const metaTextA = $('.title a.download > small', $pack).text()
    // "122 downloads • 738 views • released 21.02.2020 • updated 04.05.2020"
    const metaTextB = $('.details > small', $pack).text()
    // ['16 songs', '526.25 KB', '122 downloads', '738 views', 'released 21.02.2020', 'updated 04.05.2020']
    const meta = `${metaTextA} • ${metaTextB}`.split('•').map(s => s.trim())

    const tracks = parseInt(meta[0], 10)
    const size = meta[1]
    const downloads = parseInt(meta[2], 10)
    const views = parseInt(meta[3], 10)
    const released = getDateDDMMYYYY(meta[4])
    const updated = getDateDDMMYYYY(meta[5])

    return {
      title,
      image,
      id,
      link,
      downloadLink,
      downloads,
      size,
      views,
      tracks,
      released,
      updated,
      chips,
      developers,
      publishers,
      systems,
      composers,
      packAuthors
    }
  }).get()
}

/**
 * Retrieves a date out of a string like 'updated 21.02.2020'.
 * 
 * Returns a Date object.
 */
const getDateDDMMYYYY = str => {
  if (!str) return null
  let bits = str.split(' ')
  if (!bits[1]) return null
  bits = bits[1].trim().split('.')
  if (!bits.length === 3) return null
  bits = bits.reverse()
  return new Date(bits.join('-'))
}

/** Returns the text content for a selector of nodes. */
const getArray = ($, $item) => $item.map((_, item) => $(item).text().trim()).get()

module.exports = {
  reqLatestAdditions
}
