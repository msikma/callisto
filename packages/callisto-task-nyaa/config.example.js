const MY_SERVER = '1234'
const CHANNEL_POKEMON_RAWS = '1234'
const CHANNEL_ONE_PIECE = '1234'
const CHANNEL_HUNTER_X_HUNTER = '1234'

// See the Nyaa.si search filters for what to put here.
const NYAA_CATEGORY_LITERATURE = '3_0'
const NYAA_CATEGORY_LITERATURE_ENGLISH_TRANSLATED = '3_1'

module.exports = {
  CALLISTO_TASK_SETTINGS: {
    nyaa: {
      defaultDetails: {
      },
      defaultTarget: null,
      searches: [
        { details: { query: 'shark-raws pocket' }, thumbnail: 'https://i.imgur.com/HbK8Xs8.png', target: [[MY_SERVER, CHANNEL_POKEMON_RAWS]] },
        { details: { query: 'pokemon', category: NYAA_CATEGORY_LITERATURE }, target: [[MY_SERVER, CHANNEL_POKEMON_RAWS]] },
        { details: { query: 'pocket monsters', category: NYAA_CATEGORY_LITERATURE }, target: [[MY_SERVER, CHANNEL_POKEMON_RAWS]] },
        { details: { query: 'one piece mangastream', category: NYAA_CATEGORY_LITERATURE_ENGLISH_TRANSLATED }, target: [[MY_SERVER, CHANNEL_ONE_PIECE]] },
        { details: { query: 'hunter x hunter', category: NYAA_CATEGORY_LITERATURE_ENGLISH_TRANSLATED }, target: [[MY_SERVER, CHANNEL_HUNTER_X_HUNTER]] }
      ]
    }
  }
}