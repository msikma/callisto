/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import readyTask from 'callisto-discord-interface/src/tasks/ready'

export default (discordClient) => {
  discordClient.on('ready', readyTask)
}
