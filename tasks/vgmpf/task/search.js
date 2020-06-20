// Callisto - callisto-task-vgmpf <https://github.com/msikma/callisto>
// © MIT license

const cheerio = require('cheerio')
const { request } = require('callisto-core/lib/request')
const { charTrim } = require('callisto-core/util/text')
const { getHHMMSS } = require('callisto-core/util/time')
const { slugify } = require('callisto-core/util/slug')
const { getQueryVariable } = require('callisto-core/util/uri')
const { getWikiArticleAbstract, htmlToMarkdown, getLargestImageSrcset } = require('callisto-core/util/html')

/** Base URL */
const baseURL = url => `http://www.vgmpf.com${url}`

/** Home page containing the latest soundtracks. */
const homePage = baseURL('/Wiki/index.php?title=Main_Page')

/** Invalid box images - if the box image contains this in the filename, it's missing or invalid. */
const invalidBoxImages = ['BoxMissing.png', 'NoBox.png']

/**
 * Retrieves all latest released packs.
 */
const reqLatestSoundtracks = async () => {
  const res = await request(homePage)
  const $ = cheerio.load(res.body)

  const items = findReleases($)

  return {
    success: true,
    errorType: null,
    error: null,
    items
  }
}

/**
 * Returns release data from the infobox of the soundtrack's wiki article.
 */
const getReleaseData = $ => {
  const infobox = $('#mw-content-text > table:first-child')
  const title = $('> tbody > tr:nth-child(1) b', infobox).text().trim()
  const imageNode = $('> tbody a.image img', infobox)
  const imageSrc = getLargestImageSrcset($, imageNode)
  const image = baseURL(imageSrc.url)
  const imageIsInvalid = invalidBoxImages.map(i => !!~imageSrc.url.indexOf(i)).filter(i => i).length > 0
  const dataRows = $('> tbody > tr:nth-child(3) table > tbody > tr', infobox).get()
  const data = dataRows.reduce((acc, row) => {
    const $row = $(row)
    const $col1 = $('> td:nth-child(1)', $row)
    const $col2 = $('> td:nth-child(2)', $row)
    const key = charTrim($col1.text().trim(), ':').toLowerCase()
    const val = $col2.text().trim()
    return { ...acc, [key]: val }
  }, {})
  return {
    title,
    image: imageIsInvalid ? null : image,
    data
  }
}

/**
 * Returns screenshots.
 */
const getScreenshots = $ => {
  // Screenshot divs are all set to 288px width.
  const screenshotNodes = $('#mw-content-text td > div[style*="width:288px"]').get()
  const screenshots = screenshotNodes.map(s => {
    const rowImage = getLargestImageSrcset($, $('tbody > tr:nth-child(1) img', s))
    const rowTitle = $('tbody > tr:nth-child(2) div', s)
    return { url: baseURL(rowImage), title: rowTitle.text().trim() }
  })
  return screenshots
}

/**
 * Returns metadata about the tracks: total length and composers.
 */
const getTracksInfo = $ => {
  const trackRows = $('tr[itemType*="schema.org/MusicComposition"]').get()
  const headerRow = $(trackRows[0]).prev()
  const lengthCol = $('td, th', headerRow).get()
    .map((item, n) => ({ name: $(item).text().trim().toLowerCase(), n }))
    .find(n => n.name === 'length')

  const lengthItems = $(`td:nth-child(${lengthCol.n + 1})`, trackRows).get()
    // [seconds, [minutes, [hours]]]
    .map(l => $(l).text().trim().split(':').reverse())
    // seconds
    .map(l => {
      return (Number(l[0]) || 0) + ((Number(l[1]) || 0) * 60) + ((Number(l[2]) || 0) * 60 * 60)
    })
  const lengthTotal = getHHMMSS(lengthItems.reduce((acc, track) => acc + track, 0))
  const composersAll = {}
  $('td:not([itemprop*="musicArrangement"]) *[itemprop*="composer"] a', trackRows).get().forEach(c => composersAll[$(c).text()] = true)
  return {
    length: lengthTotal,
    composers: Object.keys(composersAll)
  }
}

/**
 * Requests the actual information of each new soundtrack.
 */
const addAdditionalData = async soundtracks => {
  const newSoundtracks = []
  for (const s of soundtracks) {
    const res = await request(s.link)
    const $ = cheerio.load(res.body, { decodeEntities: false })
    const title = $('#firstHeading').text().trim()
    const contentHTML = getWikiArticleAbstract($, baseURL)
    const contentMD = contentHTML ? htmlToMarkdown(contentHTML) : null
    const data = getReleaseData($)
    const screenshots = getScreenshots($)
    const tracksInfo = getTracksInfo($)
    newSoundtracks.push({
      titleFull: title,
      content: contentMD,
      ...data,
      ...tracksInfo,
      screenshots,
      link: s.link
    })
  }
  return newSoundtracks
}

/**
 * Extracts information from scraped albums HTML.
 */
const findReleases = $ => {
  // Track down the <div> containing the latest soundtracks.
  // We have to find this by looking for its title. The structure looks like this:
  //
  //   <td>
  //     <div>
  //       <div>Latest Soundtracks</div>
  //       <div>[information we need]</div>
  //     [..]

  const tdDivs = $('#bodyContent td > div').get()
  const container = tdDivs.find(div => {
    const $div = $(div)
    const first = $('> div:first-child', $div)
    if (!first.length) return false
    return !!~first.text().toLowerCase().indexOf('latest soundtracks')
  })
  const soundtracks = $('> div:nth-child(2) > div', container).get()
  return soundtracks.map(s => {
    const link = $('a', s)
    const title = getQueryVariable(link.attr('href'), 'title').replace('_', ' ')
    const id = slugify(title)
    return {
      title,
      id,
      link: baseURL(link.attr('href'))
    }
  })
}

module.exports = {
  reqLatestSoundtracks,
  addAdditionalData
}
