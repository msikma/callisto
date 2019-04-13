/**
 * Calypso - calypso-misc <https://github.com/msikma/calypso>
 * © MIT license
 */

/** Turns coordinates into a Google Maps link. */
export const mapsCoordsLink = (lat, lng) => (
  `https://www.google.com/maps/place/${lat},${lng}`
)
