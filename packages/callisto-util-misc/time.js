/**
 * Callisto - callisto-util-misc <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import moment from 'moment'
import humanizeDuration from 'humanize-duration'
import momentDurationFormatSetup from 'moment-duration-format'

// Hide deprecation warning.
moment.suppressDeprecationWarnings = true

// Extend Moment to be able to format durations.
// See <https://github.com/jsmreese/moment-duration-format>.
momentDurationFormatSetup(moment)

/**
 * Returns true for a string that can be turned into a valid date using moment(),
 * false if it is not.
 */
export const isValidDate = dateStr => (
  moment(dateStr).format() !== 'Invalid date'
)

/**
 * Returns a formatted date.
 */
export const getFormattedDate = (dateObject) => (
  moment(dateObject).format('MMMM D, YYYY')
)

/**
 * Returns a timestamp for a date string.
 */
export const getIntegerTimestamp = (dateStr) => (
  moment(dateStr).format('x')
)

/**
 * Returns an exact duration.
 */
export const getExactDuration = (seconds) => (
  moment.duration({ seconds }).format()
)

/**
 * Returns a duration, e.g. '1 day, 43 minutes, 31 seconds'
 */
export const getDuration = (time) => (
  humanizeDuration(time, { round: true })
)

/**
 * Returns a simplified humanized duration, e.g. '1 hour'.
 */
export const getSimpleDuration = (time) => (
  moment.duration(time).humanize()
)

/**
 * Simply returns a timestamp in the format '2018-05-23 01:09:21 +0200'.
 */
export const getFormattedTime = () => (
  moment().format('Y-MM-DD HH:mm:ss ZZ')
)
/**
 * Simply returns a timestamp in the format '01:09:21 +0200'.
 */
export const getFormattedTimeOnly = () => (
  moment().format('HH:mm:ss ZZ')
)
