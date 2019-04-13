/**
 * Calypso - calypso-task-feed <https://github.com/msikma/calypso>
 * © MIT license
 */

/** Returns the 'best' image. */
export const getBestImage = (images) => {
  if (!images || images.length === 0) return null
  if (images.length === 1) return images[0]

  // Run images through the scoreImage() function to sort them.
  const sorted = images.sort((a, b) => scoreImage(a) < scoreImage(b) ? 1 : -1)
  return sorted[0]
}

/**
 * Removes some common image URL problems.
 */
export const cleanupImage = (url, baseURL) => {
  // If the URL is a local link, make it global based on the item's base URL.
  if (!url.startsWith('http') && baseURL) {
    return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`
  }
  if (url === 'null' || !url) return null
  return url
}

/**
 * Gives an image a score based on its URL. E.g. gravatar URLs are ranked lower.
 */
const scoreImage = image => {
  let score = 0
  if (image.indexOf('gravatar.com') > -1) score -= 1
  if (image.indexOf('identicon') > -1) score -= 1
  if (image.indexOf('.svg') > -1) score -= 5
  if (image.indexOf('.gif') > -1) score -= 5
  if (image.indexOf('smiley') > -1) score -= 1
  if (image.indexOf('emoji') > -1) score -= 1

  return score
}
