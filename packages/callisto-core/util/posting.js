// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

/**
 * Posts several rich embeds to a list of targets.
 * 
 * Each item must contain the following:
 * 
 *   { target: [[ ... server information ]]
 *     ... data used by the 'formatter' function }
 */
const postRichItems = (items, formatter) => {
  items.forEach(item => item.target.forEach(target => postRichEmbed(target[0], target[1], null, formatter(item))))
}

module.exports = {
  postRichItems
}
