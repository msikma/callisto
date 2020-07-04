// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const moment = require('moment')
const humanizeDuration = require('humanize-duration')
const momentDurationFormatSetup = require('moment-duration-format')

// Hide deprecation warning.
moment.suppressDeprecationWarnings = true

// Extend Moment to be able to format durations.
// See <https://github.com/jsmreese/moment-duration-format>.
momentDurationFormatSetup(moment)

/**
 * Returns a seconds duration formatted as HH:MM:SS.
 */
const getHHMMSS = time => {
  const secs = parseInt(time, 10)
  const hours = Math.floor(secs / 3600)
  const minutes = Math.floor((secs - (hours * 3600)) / 60)
  const seconds = secs - (hours * 3600) - (minutes * 60)
  
  let hoursStr = `${hours < 10 ? '0' : ''}${hours}`
  let minutesStr = `${minutes < 10 && hours > 0 ? '0' : ''}${minutes}`
  let secondsStr = `${seconds < 10 ? '0' : ''}${seconds}`

  return (hours > 0 ? `${hoursStr}:` : '') + `${minutesStr}:${secondsStr}`
}

/**
 * Returns true for a string that can be turned into a valid date using moment(),
 * false if it is not.
 */
const isValidDate = dateStr => (
  moment(dateStr).format() !== 'Invalid date'
)

/**
 * Returns a formatted date, e.g. 'June 2, 2020'.
 */
const getFormattedDate = (dateObject) => (
  moment(dateObject).format('MMMM D, YYYY')
)

/**
 * Returns a timestamp for a date string.
 */
const getIntegerTimestamp = (dateStr) => (
  moment(dateStr).format('x')
)

/**
 * Returns an exact duration.
 */
const getExactDuration = (seconds) => (
  moment.duration({ seconds }).format()
)

/**
 * Returns a duration, e.g. '1 day, 43 minutes, 31 seconds'
 */
const getDuration = (time) => (
  humanizeDuration(time, { round: true })
)

/**
 * Returns a simplified humanized duration, e.g. '1 hour'.
 */
const getSimpleDuration = (time) => (
  moment.duration(time).humanize()
)

/**
 * Returns how much time ago something was, e.g. '5 hours ago'.
 */
const getTimeAgo = (time) => {
  return moment(time).fromNow()
}

/**
 * Returns an exact date from a relative one, e.g. '5 hours ago'.
 */
const getAbsoluteFromRelative = (time) => {
  const items = time.split(' ') // ['5', 'hours', 'ago']
  return getParseableTimestamp(moment().subtract(items[0], items[1]))
}

/**
 * Returns a timestamp in the format '2018-05-23 01:09:21 +0200'.
 */
const getFormattedTimestamp = (dateStr) => (
  moment(dateStr ? dateStr : undefined).format('Y-MM-DD HH:mm:ss ZZ')
)

/**
 * Returns a timestamp in the format '2018-05-23 01:09:21+0200'.
 */
const getParseableTimestamp = (dateStr) => (
  moment(dateStr ? dateStr : undefined).format('Y-MM-DD HH:mm:ss ZZ')
)
/**
 * Returns a timestamp in the format '01:09:21 +0200'.
 */
const getFormattedTime = (dateStr) => (
  moment(dateStr ? dateStr : undefined).format('HH:mm:ss ZZ')
)

/**
 * Returns how long ago the item was published.
 * 
 * 'pubDate' is a value like "2012-10-25T07:15:47.000Z".
 */
const formatPubDateDuration = pubDate => {
  return `${getSimpleDuration(Number(new Date()) - Number(new Date(pubDate)))} ago`
}

module.exports = {
  isValidDate,
  getHHMMSS,
  getFormattedDate,
  getIntegerTimestamp,
  getAbsoluteFromRelative,
  getTimeAgo,
  getExactDuration,
  getDuration,
  getParseableTimestamp,
  getSimpleDuration,
  getFormattedTimestamp,
  getFormattedTime,
  formatPubDateDuration
}
