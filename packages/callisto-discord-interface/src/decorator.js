/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import readyTask from 'callisto-discord-interface/src/tasks/ready'
import { taskMandarake } from 'callisto-task-mandarake'

export default (discordClient) => {
  discordClient.on('ready', readyTask)
  //taskMandarake(discordClient)
}
