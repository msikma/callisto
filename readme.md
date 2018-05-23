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

Once the bot is set up, you'll get a client ID and secret. They need to be entered into the config later, and you must keep these values secret or anyone can take over your bot. I recommend you keep the "public bot" setting off, since there's no point to Callisto being in any server other than the one it's configured to post to.

To add your bot to a server, visit the following link (replacing the `client_id` value with your own):

```
https://discordapp.com/api/oauth2/authorize?client_id=1234&scope=bot&permissions=1
```

### Setup

This project is a monorepo managed via [Lerna](https://lernajs.io/), which should be installed globally first. To install dependencies, run Lerna's bootstrap command:

    lerna bootstrap

Now you need to setup your config file. Copy `config.example.js` to `config.js` and fill in the missing data, including the client ID and secret you got when you registered your bot.

You will need to setup *task settings* for each task you want to run. Each task has an example task settings file that you can copy and edit.

After that, you should be able to run the bot:

    ./start.js

This will start the bot and allow it to start responding to user input in the channels you've invited it to.

## Tasks

Currently, these tasks are available:

| Name | Description | Site |
|:-----|:------------|:-----|
| hiveworks | Posts new comics added to any configured Hiveworks Comics site | [https://hiveworkscomics.com/](hiveworkscomics.com) |
| horriblesubs | Posts new torrent uploads for anime shows on HorribleSubs | [http://horriblesubs.info/](horriblesubs.info) |
| mandarake | Posts new items added to the Mandarake shop and its auction site | [http://horriblesubs.info/](horriblesubs.info) |
| nyaa | Posts torrent links to new anime and manga uploads on Nyaa.si | [http://nyaa.si/](nyaa.si) |
| ocremix | Posts new video game music remixes, covers and albums released on OverClocked ReMix | [https://ocremix.org/](ocremix.org) |
| parisa | Posts updates to the Parisa comic | [http://parisa-comic.tumblr.com/](parisa-comic.tumblr.com) |
| rarbg | Posts TV series updates released on Rarbg | [https://rarbg.to/](rarbg.to) |
| reddit | Posts new topics made to specified Reddit subs | [http://reddit.com/](reddit.com) |
| tasvideos | Posts new tool-assisted speedruns released on TASVideos | [http://tasvideos.org/](tasvideos.org) |
| vgmpf | Posts new video game soundtrack releases from VGMPF | [http://www.vgmpf.com/](vgmpf.com) |
| vgmrips | Posts new video game soundtracks released on VGMRips | [http://vgmrips.net/](vgmrips.net) |
| youtube | Posts new videos released by specified Youtube channels and reports on new videos for search queries | [https://youtube.com/](youtube.com) |

## Copyright

Copyright © 2018, Michiel Sikma
