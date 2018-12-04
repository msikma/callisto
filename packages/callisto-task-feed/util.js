/**
 * Callisto - callisto-task-feed <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

export const BASE = 'https://u2.dmhy.org'

/**
 * Returns the 'best' image.
 */
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
export const cleanupImage = url => {
  if (url.startsWith('attachment/')) return `${BASE}/${url}`
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
  if (image.indexOf('smiley') > -1) score -= 1
  if (image.indexOf('emoji') > -1) score -= 1

  return score
}
