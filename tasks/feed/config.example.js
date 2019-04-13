const MY_SERVER = '1234'
const CHANNEL_RSS_FEEDS = '1234'

module.exports = {
  CALYPSO_TASK_SETTINGS: {
    feed: {
      defaultTarget: null,
      feeds: [
        {
          url: 'https://pixel-mixers.com/category/albums/feed/',
          name: 'Pixel Mixers',
          color: 0x2b80b6,
          thumbnail: 'https://i.imgur.com/ZvddOat.png',
          target: [[MY_SERVER, CHANNEL_RSS_FEEDS]]
        }
      ]
    }
  }
}
