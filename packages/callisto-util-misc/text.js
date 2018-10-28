/**
 * Callisto - callisto-util-misc <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import TurndownService from 'turndown'
import cheerio from 'cheerio'
import { escape } from 'markdown-escape'

/**
 * Returns Markdown from HTML.
 */
export const htmlToMarkdown = (html, removeEmpty = false, removeScript = true, removeStyle = true, removeHr = false, removeImages = true) => {
  // Set up the Turndown service for converting HTML to Markdown.
  const turndownService = new TurndownService()
  if (removeScript) turndownService.remove('style')
  if (removeStyle) turndownService.remove('script')
  const $ = cheerio.load(`<div id="callisto-wrapper">${html}</div>`)
  const $html = $('#callisto-wrapper')
  if (removeImages) {
    $html.find('img').remove()
  }
  if (removeHr) {
    $html.find('hr').remove()
  }
  const md = turndownService.turndown($html.html()).trim()
  return removeEmpty ? removeEmptyLines(md) : md
}

// Prevents a string from activating Markdown features.
export const escapeMarkdown = (md) => (
  escape(md)
)

// Capitalizes the first letter of a string.
export const capitalizeFirst = (str) => (
  `${str.charAt(0).toUpperCase()}${str.slice(1)}`
)

/**
 * Cuts a long Markdown description down to something better for embeds.
 */
export const limitDescription = (desc, limit = 700) => {
  if (desc.length < limit) return desc

  const limitedChars = desc.slice(0, limit)
  // Cut off the last line so we don't end on a half-sentence.
  const limitedLines = limitedChars
    .split('\n')
    .slice(0, -1)
    .join('\n')
    .trim()

  return `${limitedLines}\n[...]`
}

/**
 * Returns image URLs from an HTML string.
 */
export const getImagesFromHTML = (html) => {
  const $ = cheerio.load(`<div id="callisto-wrapper">${html}</div>`)
  const $html = $('#callisto-wrapper')
  return $html.find('img').get().map(i => $(i).attr('src'))
}

/**
 * Separate images from Markdown. We can't display them on Discord.
 * This returns the Markdown text with all image tags removed, and the image tags separately.
 */
export const separateMarkdownImages = (md, leavePlaceholder = false) => {
  // Matches images, e.g.: ![alt text](https://i.imgur.com/asdf.jpg title text)
  // Or: ![alt text](https://i.imgur.com/asdf.jpg)
  const imgRe = /!\[(.+?)\]\(([^ ]+)( (.+?))?\)/g
  const images = []
  let match
  while ((match = imgRe.exec(md)) !== null) {
    images.push({ alt: match[1], url: match[2], title: match[4] })
  }
  return {
    images,
    text: removeEmptyLines(md.replace(imgRe, leavePlaceholder ? '[image]' : ''), true)
  }
}

// Removes extra empty lines by trimming every line, then removing the empty strings.
// If 'leaveGap' is true, we will instead compress multiple empty lines down to a single empty line.
export const removeEmptyLines = (str, leaveGap = false) => {
  if (leaveGap) {
    const split = str.split('\n').map(l => l.trim())
    const lines = split.reduce((acc, curr) => [...acc, ...(curr === acc[acc.length - 1] ? [] : [curr])], [])
    return lines.join('\n')
  }
  else {
    return str.split('\n').map(l => l.trim()).filter(l => l !== '').join('\n')
  }
}

/**
 * Returns whether a string is likely HTML or not.
 */
export const isHTML = (string) => {
  const items = [
    string.indexOf('<p>') > 0,
    string.indexOf('<strong>') > 0,
    string.indexOf('<img') > 0,
    string.indexOf('<br /') > 0,
    string.indexOf('<br/') > 0,
    string.indexOf('<br>') > 0,
    string.indexOf('href="') > 0
  ]
  return items.indexOf(true) > -1
}

/**
 * Limits a string to a specific length. Adds ellipsis if it exceeds.
 */
const limitString = (value) => (str) => (
  str.length > value ? `${str.substr(0, value - 3)}...` : str
)

export const embedTitle = limitString(256)
export const embedDescription = limitString(2048)
// Like embedDescription, but with a bit of extra room for formatting.
export const embedDescriptionShort = limitString(2000)
