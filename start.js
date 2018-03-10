#!/usr/bin/env node
const config = require('./config');
process.env.CALLISTO_BASE_DIR = process.env.PWD;
require('./packages/callisto-discord-interface/bin/start');
