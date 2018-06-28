const MY_SERVER = '1234'
const CHANNEL_ONE_PIECE = '1234'

module.exports = {
  CALLISTO_TASK_SETTINGS: {
    mangafox: {
      searches: [
        {
          name: 'One Piece',
          // This must be the slug used in the base URL for the manga.
          // e.g. 'https://manga-fox.com/one-piece/chapter-905' -> 'one-piece'
          slug: 'one-piece',
          color: 0xc6243e,
          thumbnail: 'https://i.imgur.com/r7t1cdS.png',
          target: [[MY_SERVER, CHANNEL_ONE_PIECE]]
        }
      ]
    }
  }
}