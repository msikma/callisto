const MY_SERVER = '1234'
const CHANNEL_CUT_TIME = '1234'
const CHANNEL_JAILBIRD = '1234'
const CHANNEL_DEVILS_CANDY = '1234'
const CHANNEL_CAMP_WEEDONWANTCHA = '1234'

module.exports = {
  CALLISTO_TASK_SETTINGS: {
    hiveworks: {
      comics: [
        {
          name: 'Cut Time',
          slug: 'cut-time',
          color: 0xa88ba5,
          url: 'http://www.cuttimecomic.com/',
          icon: 'https://i.imgur.com/GGHURBB.png',
          target: [[MY_SERVER, CHANNEL_CUT_TIME]]
        },
        {
          name: 'Jailbird',
          slug: 'jailbird',
          color: 0x0e7536,
          url: 'http://an.oddlookingbird.com/',
          icon: 'https://i.imgur.com/DYvn2nK.png',
          target: [[MY_SERVER, CHANNEL_JAILBIRD]]
        },
        {
          name: 'Devil\'s Candy',
          slug: 'devils-candy',
          color: 0x4f4a5f,
          url: 'http://devilscandycomic.com/',
          icon: 'https://i.imgur.com/isxguy1.png',
          target: [[MY_SERVER, CHANNEL_DEVILS_CANDY]]
        },
        {
          name: 'Camp Weedonwantcha',
          slug: 'camp-weedonwantcha',
          color: 0x90ac99,
          url: 'http://campcomic.com/',
          icon: 'https://i.imgur.com/uQIcnQq.png',
          target: [[MY_SERVER, CHANNEL_CAMP_WEEDONWANTCHA]]
        }
      ]
    }
  }
}