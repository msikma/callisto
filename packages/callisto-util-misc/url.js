/**
 * Callisto - callisto-util-misc <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

/** Turns coordinates into a Google Maps link. */
export const mapsCoordsLink = (lat, lng) => (
  `https://www.google.com/maps/place/${lat},${lng}`
)
