/**
 * This week's show card. Edit src/week.json (and keep design/week.json in sync).
 * Guest, hype, and puzzle swap here — not in the spin code.
 */

import card from './week.json'

export const WEEK = {
  guestName: card.guestName,
  guestKicker: card.guestKicker,
  guestLine: `${card.guestKicker}  ·  ${card.guestName}`,
  prizeHype: card.prizeHype,
  whenLine: card.whenLine,
  puzzleCategory: card.puzzleCategory,
  puzzleAnswer: card.puzzleAnswer,
  showWeekday: card.showWeekday,
  showHour: card.showHour,
  showMinute: card.showMinute,
  showDurationHours: card.showDurationHours,
  timeZone: card.timeZone
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export type ClockParts = {
  live: boolean
  days: number
  hours: number
  minutes: number
  seconds: number
  remainingMs: number
  compact: string
  headline: string
  whenLine: string
  guestKicker: string
  guestName: string
  guestLine: string
  prizeHype: string
}

export function clockParts(now = Date.now()): ClockParts {
  const live = isLiveShow(now)
  const remainingMs = Math.max(0, (live ? showEndUtc(now) : nextShowStartUtc(now)) - now)
  const split = splitMs(remainingMs)
  return {
    live,
    ...split,
    remainingMs,
    compact: formatDuration(remainingMs),
    headline: live ? 'LIVE NOW' : 'NEXT SHOW',
    whenLine: live ? 'ON AIR  ·  THE WIP MEETUP' : WEEK.whenLine,
    guestKicker: WEEK.guestKicker,
    guestName: WEEK.guestName,
    guestLine: WEEK.guestLine,
    prizeHype: WEEK.prizeHype
  }
}

export function showClock(now = Date.now()) {
  return clockParts(now)
}

export function pad2(value: number): string {
  const n = Math.max(0, Math.floor(value))
  return n < 10 ? `0${n}` : `${n}`
}

function splitMs(ms: number): { days: number; hours: number; minutes: number; seconds: number } {
  const total = Math.floor(Math.max(0, ms) / 1000)
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60
  }
}

export function isLiveShow(now = Date.now()): boolean {
  const pt = pacificParts(now)
  if (weekdayIndex(pt.weekday) !== WEEK.showWeekday) return false
  const minutes = pt.hour * 60 + pt.minute
  const start = WEEK.showHour * 60 + WEEK.showMinute
  const end = start + WEEK.showDurationHours * 60
  return minutes >= start && minutes < end
}

export function nextShowStartUtc(now = Date.now()): number {
  const pt = pacificParts(now)
  const currentDow = weekdayIndex(pt.weekday)
  let addDays = (WEEK.showWeekday - currentDow + 7) % 7
  const minutes = pt.hour * 60 + pt.minute
  const start = WEEK.showHour * 60 + WEEK.showMinute
  const end = start + WEEK.showDurationHours * 60
  if (addDays === 0 && minutes >= end) addDays = 7
  const target = addCalendarDays(pt.year, pt.month, pt.day, addDays)
  return zonedLocalToUtc(target.year, target.month, target.day, WEEK.showHour, WEEK.showMinute, WEEK.timeZone)
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return 'NOW'
  const total = Math.floor(ms / 1000)
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (days > 0) return `${pad(days)}D  ${pad(hours)}H  ${pad(minutes)}M  ${pad(seconds)}S`
  if (hours > 0) return `${pad(hours)}H  ${pad(minutes)}M  ${pad(seconds)}S`
  return `${pad(minutes)}M  ${pad(seconds)}S`
}

export function formatDailyReset(ms: number): string {
  if (ms <= 0) return 'READY'
  return `NEXT DAILY  ${formatDuration(ms)}`
}

function showEndUtc(now: number): number {
  return nextShowStartUtc(now) + WEEK.showDurationHours * 3600 * 1000
}

function weekdayIndex(label: string): number {
  const index = WEEKDAYS.indexOf(label)
  return index === -1 ? 0 : index
}

function pad(value: number): string {
  return pad2(value)
}

type PacificParts = {
  weekday: string
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

function pacificParts(now: number): PacificParts {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: WEEK.timeZone,
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23'
    }).formatToParts(new Date(now))
    const map: Record<string, string> = {}
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part.type !== 'literal') map[part.type] = part.value
    }
    return {
      weekday: map.weekday || 'Sun',
      year: Number(map.year),
      month: Number(map.month),
      day: Number(map.day),
      hour: Number(map.hour),
      minute: Number(map.minute)
    }
  } catch (_err) {
    const shifted = new Date(now - 7 * 3600 * 1000)
    return {
      weekday: WEEKDAYS[shifted.getUTCDay()],
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
      hour: shifted.getUTCHours(),
      minute: shifted.getUTCMinutes()
    }
  }
}

function addCalendarDays(year: number, month: number, day: number, days: number): { year: number; month: number; day: number } {
  const utc = Date.UTC(year, month - 1, day + days)
  const date = new Date(utc)
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }
}

function zonedLocalToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0)
  try {
    const first = guess - timeZoneOffsetMs(new Date(guess), timeZone)
    return guess - timeZoneOffsetMs(new Date(first), timeZone)
  } catch (_err) {
    return guess + 7 * 3600 * 1000
  }
}

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date)
  const map: Record<string, string> = {}
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part.type !== 'literal') map[part.type] = part.value
  }
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  )
  return asUtc - date.getTime()
}
