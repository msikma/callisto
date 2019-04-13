const MY_SERVER = '1234'
const CHANNEL_YOUTUBE = '1234'
const CHANNEL_NEWS = '1234'
const CHANNEL_1STPERSONTRAINS = '1234'

module.exports = {
  CALYPSO_TASK_SETTINGS: {
    youtube: {
      // To get your latest subscriptions XML file,
      // click the export button in the subscription manager:
      // <https://www.youtube.com/subscription_manager>.
      subscriptions: [
        {
          slug: 'dada78641',
          // To keep your xml files inside your home config folder,
          // prefix your files with <%config%> and trailing slash.
          subscriptions: '<%config%>/yt-dada78641.xml',
          target: [[MY_SERVER, CHANNEL_YOUTUBE]]
        },
        {
          slug: 'dada78641-news',
          subscriptions: '<%config%>/yt-dada78641-news.xml',
          target: [[MY_SERVER, CHANNEL_NEWS]]
        }
      ],
      searches: [
        {
          // The 'slug' is used for caching. It can be anything.
          slug: '1stpersontrains',
          // The 'searchParameters' can be taken from Youtube's search page.
          // Make sure to decode it before adding it here.
          searchParameters: 'CAISCBABGAIgAXAB',
          searchQuery: '前面展望',
          target: [[MY_SERVER, CHANNEL_1STPERSONTRAINS]]
        }
      ]
    }
  }
}
