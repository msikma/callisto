const MY_SERVER = '1234'
const CHANNEL_TASVIDEOS = '1234'

module.exports = {
  CALLISTO_TASK_SETTINGS: {
    tasvideos: {
      searches: [
        // 'type' must be one of the RSS files served by the site.
        { type: 'publications', target: [[MY_SERVER, CHANNEL_TASVIDEOS]] }
      ]
    }
  }
}