// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

/**
 * Returns an array of server/channel combinations.
 * 
 * If a single server/channel is passed, a list of one combination is returned.
 * If a list of server/channel combinations is passed, it is returned verbatim.
 */
const getServerChannelsList = (singleOrMultipleItems) => {
  if (!Array.isArray(singleOrMultipleItems) || singleOrMultipleItems.length === 0 || Array.isArray(singleOrMultipleItems[0])) {
    return singleOrMultipleItems
  }
  return [singleOrMultipleItems]
}

module.exports = {
  getServerChannelsList
}
