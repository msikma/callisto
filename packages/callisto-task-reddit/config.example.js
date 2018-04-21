const MY_SERVER = '1234'
const CHANNEL_REDDIT_SPEEDRUNS = '1234'
const CHANNEL_REDDIT_VGCOVERS = '1234'

module.exports = {
  CALLISTO_TASK_SETTINGS: {
    reddit: {
      subs: [
        {
          name: 'speedrun',
          type: 'hot',
          target: [[MY_SERVER, CHANNEL_REDDIT_SPEEDRUNS]]
        },
        {
          name: 'VGCovers',
          type: 'new',
          target: [[MY_SERVER, CHANNEL_REDDIT_VGCOVERS]]
        }
      ]
    }
  }
}