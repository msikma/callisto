/**
 * Callisto - callisto-task-hiveworks <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { htmlToMarkdown } from 'callisto-util-misc'

const fourDigit = new RegExp('([0-9]{4})')

// Base URLs for the pages we'll scrape.
export const urlComic = (base, slug = '') => {
  if (slug.startsWith('comic/')) return `${base}${slug}`
  return `${base}comic/${slug}`
}
export const urlArchive = base => `${base}comic/archive/`

// Returns the year from a month string, e.g. 'January, 2018'.
// To be as flexible as possible and allow for other formats,
// we're just searching for a 4-digit number.
export const getYear = (str) => {
  const match = str.match(fourDigit)
  return match && match[1]
}

// Separates a date and time, e.g. 'June 11, 2012 - Chapter 1, Page 1'.
// Used by SELECT_COMIC type pages.
export const separateDateTitle = (dateTitle) => {
  const bits = dateTitle.split(' - ')
  return { date: bits[0], title: bits.slice(1).join(' - ') }
}

// Returns Markdown that represents an HTML string.
export const getMarkdownFromHTML = (html) => (
  htmlToMarkdown(html, true)
)
