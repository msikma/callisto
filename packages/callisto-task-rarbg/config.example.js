const MY_SERVER = '1234'
const CHANNEL_STEVEN_UNIVERSE = '1234'
const CHANNEL_CRAIG_OF_THE_CREEK = '1234'
const CHANNEL_OK_KO = '1234'

module.exports = {
  CALLISTO_TASK_SETTINGS: {
    rarbg: {
      // It's required to get cookies from the site, or the task won't work.
      // When there are no cookies, every request will return a warning
      // page stating there is "suspicious activity" from your IP.
      //
      // To get an array of cookies, simply visit the website, browse around
      // a bit, and then open the console. Type:
      //
      //    decodeURI(document.cookie).split('; ')
      //
      // Then input the result here.
      // You may need to update this every once in a while.
      cookies: [
        'aby=1',
        'tcc',
        'q2bquVJn=qCBnZk87',
        'skt=8I5ET5zw8s',
        'skt=8I5ET5zw8s',
        'q2bquVJn=qCBnZk87'
      ],
      items: [
        {
          // Get e.g. the 'slug' from the site by visiting the show's
          // information page.
          name: 'Steven Universe',
          slug: 'tt3061046',
          target: [[MY_SERVER, CHANNEL_STEVEN_UNIVERSE]],
          icon: 'https://i.imgur.com/HyFAJHR.png',
          color: 0xff578b
        },
        {
          name: 'Craig of the Creek',
          slug: 'tt7713450',
          target: [[MY_SERVER, CHANNEL_CRAIG_OF_THE_CREEK]],
          icon: 'https://i.imgur.com/1PSSSxs.png',
          color: 0xfff03e
        },
        {
          name: 'OK K.O.! Let\'s Be Heroes',
          slug: 'tt6965802',
          target: [[MY_SERVER, CHANNEL_OK_KO]],
          icon: 'https://i.imgur.com/Z6qGjPk.png',
          color: 0xe02e2c
        }
      ]
    }
  }
}