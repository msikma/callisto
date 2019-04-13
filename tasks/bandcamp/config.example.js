const MY_SERVER = '1234'
const CHANNEL_BANDCAMP = '1234'

module.exports = {
  CALYPSO_TASK_SETTINGS: {
    bandcamp: {
      defaultTarget: [[MY_SERVER, CHANNEL_BANDCAMP]],
      searches: [
        { details: { search: 'ptesquad' }, target: [[MY_SERVER, CHANNEL_BANDCAMP]] }
      ]
    }
  }
}
