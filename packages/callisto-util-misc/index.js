/**
 * Callisto - callisto-util-misc <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

export { errorObject } from './error'
export { objectInspect, wrapInJSCode, wrapInMono, wrapInPre, removeNil, removeDefaults, wait, readFile } from './util'
export { getSystemInfo, callistoCommitURL, getLockfile, saveLockFile } from './system'
export { findScriptData } from './script'
export { getFormattedDate, getIntegerTimestamp, getExactDuration, getDuration, getSimpleDuration, getFormattedTime, getFormattedTimeOnly, isValidDate } from './time'
export { embedTitle, embedDescription, embedDescriptionShort, isHTML, removeEmptyLines, separateMarkdownImages, getImagesFromHTML, limitDescription, htmlToMarkdown, capitalizeFirst, escapeMarkdown } from './text'
export { registerBotName, showCommandHelp, showCommandUsage, parseCommand, findChannelPath, getChannelFromPath } from './discord'
export { rssParse, parseFeed, parseFeedURL } from './parse'

// Export slugify directly.
export { default as slugify } from 'slugify'
