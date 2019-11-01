#!/usr/bin/env node
process.env.CALYPSO_BASE_DIR = `${__dirname}/..`;
require('../packages/callisto-cli/index.js')
