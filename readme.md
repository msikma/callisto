Callisto
========

My bot, a good boy. Callisto is a Discord bot that acts kind of like an RSS reader: it retrieves updates from various websites and posts them to Discord.

This repository is structured as a monorepo, with a core namespace for bot functionality and a separate namespace for tasks. Websites that don't support RSS and have no public API are (gently) screen scraped to get their information. The bot is non-interactive: it reads its configuration from a file and does not respond to user input.

**This bot is a personal project. You're free to use it if you want, but there is very little documentation for adding new functionality.**

## Setting up the bot

To set up the bot, you must first create an *application* and a *bot user*. Head over to the [Discord developer portal](https://discordapp.com/developers/applications) to do this. When you're done with this, save the generated *client ID* and the bot's *token* to your config file, to `systemConfig.botClientID` and `systemConfig.botToken` respectively.

Now invite your bot to the server you intend to use by running the OAuth 2 flow:

* [https://discordapp.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot&permissions=1](https://discordapp.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot&permissions=1)

Replace `CLIENT_ID` with the generated client ID from before. The `permissions` integer contains a bitmask of what a bot will be permitted to do; it can be customized using the permissions calculator on the developer portal bot page.

The bot will now be able to post messages to whatever channels it's permitted to access.

### Activity

This bot *only* posts messages (plain text and rich embeds). It does not use any other API features except for logging in.

### Log channels

Callisto posts log messages to two channels: one for all general logs, the other for errors only. To finalize setup, create two channels and save their IDs to `systemConfig.logInfoChannels` and `systemConfig.logErrorChannels`.

## Running the bot

To start the bot, first a *config file* is needed. The bot can autogenerate an empty config file:

```sh
$ callisto.js --new-config
```

By default, the file will be saved to `~/.config/callisto/config.js`. The bot also keeps a cache file at `~/.cache/callisto` to keep track of what items have been posted. This will be created on first startup.

After setting up a config file, run the bot by running `callisto.js`. If anything is wrong, the bot will explain how to fix the problem and then quit.

## Task interface

Each task must export two objects from its entry point:

**`task`**

* `info` - task metadata:
    * `id` - unique slug identifying the task
    * `name` - human-readable name of the task
    * `color` - a color that represents the task and is used to style embeds
    * `icon` - URL to the task's icon
* `actions` - an array of actions that get queued and executed by the bot, each of which is an object containing:
    * `delay` - the amount of time in milliseconds in between invocations
    * `description` - a description of the task
    * `fn` - the function to run, which *must* return **a promise**

**`config`**

* `template` - a function that returns a string containing an example config
* `validator` - a PropTypes object for validating configs

Here's an example of such an `index.js` file with all the required exports, from the `youtube` task:

```js
// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const { wait } = require('callisto-core/util/promises')

const { runSearchTask, runSubscriptionTask } = require('./task/actions')
const { template, validator } = require('./config')
const { info } = require('./info')

/** Searches for new videos from search results. */
const taskSearchVideos = async (taskConfig, taskServices) => {
  for (const taskData of taskConfig.searches) {
    await runSearchTask(taskData, taskServices)
    await wait(1000)
  }
}

/** Searches for new videos from subscriptions. */
const taskSubscriptionVideos = async (taskConfig, taskServices) => {
  for (const taskData of taskConfig.subscriptions) {
    await runSubscriptionTask(taskData, taskServices)
    await wait(1000)
  }
}

const actions = [
  { delay: 480000, description: 'finds new videos from Youtube searches', fn: taskSearchVideos },
  { delay: 480000, description: 'finds new videos from Youtube subscriptions', fn: taskSubscriptionVideos }
]

module.exports = {
  task: {
    info,
    actions
  },
  config: {
    template,
    validator
  }
}
```

Each task function should return a promise. After the time specified under `delay`, the indicated task runs and the next one is scheduled after it finishes—so the exact schedule of when the tasks run depends on how long they take to complete.

Task descriptions should be written as if prefixed with "it", e.g. *"[it] finds new videos from Youtube subscriptions"*.

### The `taskServices` object

The bot exposes a number of services to each task in the `taskServices` object. These can be used for posting messages and logging, among other things.

* `postTextMessage()` - posts a new text message
* `postMessage()` - posts a new RichEmbed object
* `taskConfig` - a copy of the task's full config object
* `logger` - the log functions object (e.g. `logger.logDebug()`)

## Links

* [Discord embed visualizer](https://leovoel.github.io/embed-visualizer/)

## Copyright

MIT License
