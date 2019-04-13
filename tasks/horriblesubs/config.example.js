const MY_SERVER = '1234'
const CHANNEL_ONE_PIECE = '1234'
const CHANNEL_MY_HERO_ACADEMIA = '1234'
const CHANNEL_POP_TEAM_EPIC = '1234'

module.exports = {
  CALYPSO_TASK_SETTINGS: {
    horriblesubs: {
      defaultDetails: {
      },
      defaultTarget: null,
      searches: [
        {
          details: { query: 'one piece', res: '1080' },
          link: 'http://horriblesubs.info/shows/one-piece',
          // If a Wikia link is given in this form, we will attempt to get an image for this episode.
          // This is optional.
          wikia: 'http://onepiece.wikia.com/wiki/Episode_',
          target: [[MY_SERVER, CHANNEL_ONE_PIECE]]
        },
        {
          details: { query: 'hero academia', res: '1080' },
          link: 'http://horriblesubs.info/shows/boku-no-hero-academia',
          wikia: 'http://bokunoheroacademia.wikia.com/wiki/Episode_',
          target: [[MY_SERVER, CHANNEL_MY_HERO_ACADEMIA]]
        },
        {
          details: { query: 'pop team epic', res: '1080' },
          link: 'http://horriblesubs.info/shows/pop-team-epic',
          target: [[MY_SERVER, CHANNEL_POP_TEAM_EPIC]]
        },
      ]
    }
  }
}
