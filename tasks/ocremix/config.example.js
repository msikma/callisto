const MY_SERVER = '1234'
const CHANNEL_OCREMIX_TRACKS = '1234'
const CHANNEL_OCREMIX_ALBUMS = '1234'

module.exports = {
  CALYPSO_TASK_SETTINGS: {
    ocremix: {
      tracks: {
        target: [[MY_SERVER, CHANNEL_OCREMIX_TRACKS]]
      },
      albums: {
        target: [[MY_SERVER, CHANNEL_OCREMIX_ALBUMS]]
      }
    }
  }
}
