Callisto Discord bot
====================

My bot, a good boy.

This is a simple bot designed to log on to Discord and report site updates. Some sites are checked by reading RSS feeds, some by screen scraping. I've tried to make the bot's output as nice as possible; it posts `RichEmbed` objects with images and customization per site.

## Installation

### Prerequisites

* [Node 8.1.0](https://nodejs.org/en/) or higher
* A [Discord API key](https://discordapp.com/developers/applications/me)

Node can be easily installed using [Homebrew](https://brew.sh/) or via your package manager.

### Register a bot

You can make a new bot by going to the [applications section](https://discordapp.com/developers/applications/me) of Discord's developer portal. You don't need to set a redirect URI.

Once the bot is set up, you'll get a client ID and secret. They need to be entered into the config later, and *you must keep these values secret* or anyone can take over your bot. I recommend you keep the "public bot" setting off, since there's no point to Callisto being in any server other than the one it's configured to post to.

To add your bot to a server, visit the following link (replacing the `client_id` value with your own):

```
https://discordapp.com/api/oauth2/authorize?client_id=1234&scope=bot&permissions=1
```

### Setup

Install the bot via npm:

    npm i -g callisto-bot

Now you need to setup your config file. Callisto will look for your config file in `~/.config/callisto/config.js` as per the XDG specification. Copy [`config.example.js`](https://bitbucket.org/msikma/callisto-bot/src/master/config.md) to `config.js` and fill in the missing data, including the client ID and secret you got when you registered your bot.

You will need to setup *task settings* for each task you want to run. Each task has an example task settings file that you can copy and edit. Look in the subdirectories in [`packages`](https://bitbucket.org/msikma/callisto-bot/src/master/packages/) to find them.

After that, you should be able to run the bot:

    callisto.js

This will start the bot and allow it to start responding to user input in the channels you've invited it to. Press `CTRL+C` to quit.

### Development

Installing the project for development purposes is a little more involved. This project is a monorepo managed via [Lerna](https://lernajs.io/), which should be installed globally first. We also need to install dependencies in the root package. Finally, we use [hoisting](https://github.com/lerna/lerna/blob/master/doc/hoist.md) to simplify the modules structure.

Run the following commands in order:

    npm i
    lerna bootstrap
    lerna bootstrap --hoist

Finally, we need to manually link the CLI tool:

    npm link

Now our local `bin/callisto.js` is on the path.

## Tasks

Currently, these tasks are available:

| Name | Description | Site |
|:-----|:------------|:-----|
| bandcamp | Posts new albums added to Bandcamp pages | [bandcamp.com](https://bandcamp.com/) |
| hiveworks | Posts new comics added to any configured Hiveworks Comics site | [hiveworkscomics.com](https://hiveworkscomics.com/) |
| horriblesubs | Posts new torrent uploads for anime shows on HorribleSubs | [horriblesubs.info](http://horriblesubs.info/) |
| mandarake | Posts new items added to the Mandarake shop and its auction site | [mandarake.co.jp](http://mandarake.co.jp/) |
| mangafox | Posts new manga chapters added to MangaFox | [manga-fox.com](https://manga-fox.com/) |
| nyaa | Posts torrent links to new anime and manga uploads on Nyaa.si | [nyaa.si](http://nyaa.si/) |
| ocremix | Posts new video game music remixes, covers and albums released on OverClocked ReMix | [ocremix.org](https://ocremix.org/) |
| rarbg | Posts TV series updates released on Rarbg | [rarbg.to](https://rarbg.to/) |
| reddit | Posts new topics made to specified Reddit subs | [reddit.com](http://reddit.com/) |
| tasvideos | Posts new tool-assisted speedruns released on TASVideos | [tasvideos.org](http://tasvideos.org/) |
| vgmpf | Posts new video game soundtrack releases from VGMPF | [vgmpf.com](http://www.vgmpf.com/) |
| vgmrips | Posts new video game soundtracks released on VGMRips | [vgmrips.net](http://vgmrips.net/) |
| youtube | Posts new videos released by specified Youtube channels and reports on new videos for search queries | [youtube.com](https://youtube.com/) |

## Copyright

Copyright © 2018, Michiel Sikma
