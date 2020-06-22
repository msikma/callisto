// Callisto - callisto-task-ocremix <https://github.com/msikma/callisto>
// © MIT license

// Returns the date contained inside of a title.
const getDate = (fullTitle) => {
  const match = fullTitle.match(new RegExp('^(.+?) \\((.+?)\\)'))
  if (match && match[0] && match[1]) {
    return { date: new Date(match[2]), title: match[1] }
  }
  return { date: null, title: null }
}

// Increases the size of a dynamically generated image.
const enlargeImage = (imageURL) => (
  imageURL.replace('/thumbs/250', '/thumbs/500')
)

// Increases the size of a dynamically generated thumbnail.
const enlargeGameThumb = (imageURL) => (
  imageURL.replace('/thumbs/150', '/thumbs/500')
)

// Ensures consistent slashes for a link.
const fixSlashes = (url) => {
  const lead = url[0] === '/' ? '/' : ''
  const trail = url[url.length - 1] === '/' ? '/' : ''
  const singled = url.split('/').filter(n => n !== '').join('/')

  return `${lead}${singled}${trail}`
}

module.exports = {
  getDate,
  enlargeImage,
  enlargeGameThumb,
  fixSlashes
}
