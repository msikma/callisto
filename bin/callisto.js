#!/usr/bin/env node
process.env.CALLISTO_BASE_DIR = `${__dirname}/..`;
require('../packages/callisto-discord-interface/bin/start');
