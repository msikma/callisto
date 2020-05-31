Callisto
========

My bot, a good boy. Callisto is a Discord bot that acts kind of like an RSS reader: it retrieves updates from various websites and posts them to Discord.

This repository is structured as a monorepo, with a core namespace for bot functionality and a separate namespace for tasks. Websites that don't support RSS and have no public API are (gently) screen scraped to get their information. The bot is non-interactive: it reads its configuration from a file and does not respond to user input.

## Setting up a bot

To set up a bot, you must first create an *application* and a *bot user*. Head over to the [Discord developer portal](https://discordapp.com/developers/applications) to do this. When you're done with this, save the generated *client ID* and the bot's *token* to your config file, to `systemConfig.botClientID` and `systemConfig.botToken` respectively.

Now invite your bot to the server you intend to use by running the OAuth 2 flow:

* [https://discordapp.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot&permissions=1](https://discordapp.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot&permissions=1)

Replace `CLIENT_ID` with the generated client ID from before. The `permissions` integer contains a bitmask of what a bot will be permitted to do; it can be customized using the permissions calculator on the developer portal bot page.

The bot will now be able to post messages to whatever channels it's permitted to access.

### Activity

This bot *only* posts messages (plain text and rich embeds). It does not use any other API features except for logging in.

### Log channels

Callisto posts log messages to two channels: one for all general logs, the other for errors only. To finalize setup, create two channels and save their IDs to `systemConfig.logInfoChannels` and `systemConfig.logErrorChannels`.

## Links

* [Discord embed visualizer](https://leovoel.github.io/embed-visualizer/)

## Copyright

MIT License
