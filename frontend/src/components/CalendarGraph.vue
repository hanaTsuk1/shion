<script lang="ts" setup>
import { addDays, differenceInCalendarDays, format, getDate, getDay, getMonth, isSameDay, startOfDay, subDays } from 'date-fns'
import { vElementSize } from '@vueuse/components'

import type { main } from '../../wailsjs/go/models'
import { Calendar } from '../constants'

const props = defineProps<{
  list: main.Time[]
  date: Date
}>()

const { list } = $(props)
let { date: dateVModel } = $(useVModels(props))

const { t, locale } = useI18n()

interface Cell {
  date: Date
  total: number
  x: number
  y: number
}

const cellRef = $ref<HTMLElement>()

let hoverDate = $ref<Date>(new Date())
let cellList = $ref<Array<Cell>>([])

let calendarWidth = $ref(0)
let calendarHeight = $ref(200)
let cellWidth = $ref(0)
let monthList = $ref<Array<{
  date: Date
  x: number
}>>([])

const maxFontSize = 20
const fontSize = $computed(() => ~~(Math.min(calendarWidth / 50, maxFontSize)))
const lineHeight = 1.5

const dateToActivityMap = $computed(() => {
  const map = new Map<
    string,
    {
      collection: Array<number>
      total: number
    }
  >()
  for (const time of list) {
    let { start } = time
    const { end } = time
    let temp = 0
    const diff = differenceInCalendarDays(end, start)
    for (let i = 0; i <= diff; i++) {
      const time = formatYYYYMMDD(start)
      temp = i === diff ? end : startOfDay(addDays(start, 1)).getTime()
      const match = map.get(time) || {
        collection: [],
        total: 0,
      }
      match.collection = [...match.collection, start, temp]
      match.total += temp - start
      map.set(time, match)
      start = temp
    }
    if (temp === 0) {
      const time = formatYYYYMMDD(start)
      const match = map.get(time) || {
        collection: [],
        total: 0,
      }
      match.collection = [...match.collection, start, end]
      match.total += end - start
      map.set(time, match)
    }
  }
  return map
})

const debounceResize = useDebounceFn(onResize, 100)

function formatYYYYMMDD(date: number | Date) {
  return format(date, 'yyyy-MM-dd')
}

function getColorByDate(date: Date) {
  if (isSameDay(date, dateVModel))
    return Color.PRIMARY
  const hour = getHour(getTotalByDate(date))
  if (hour === 0)
    return '#ebedf0'
  else if (hour < 1)
    return '#9be9a8'
  else if (hour < 3)
    return '#40c463'
  else if (hour < 6)
    return '#30a14e'
  return '#216e39'
}

function formatHourMinute(time: number) {
  const { hour, minute } = extractTime(time)
  return `${hour}${t('hour')}${minute}${t('minute')}`
}

function getHour(time: number) {
  return time / (1000 * 60 * 60)
}

function getTotalByDate(date: Date) {
  return dateToActivityMap.get(formatYYYYMMDD(date))?.total || 0
}

function calcCellList() {
  const now = Date.now()
  const day = getDay(now)

  const cellTotal = (Calendar.WEEK - 1) * Calendar.DAY + day

  const offsetToWidthRatio = 0.2
  const padding = fontSize * lineHeight
  const width = (((calendarWidth - 2 * padding) / Calendar.WEEK) / (1 + offsetToWidthRatio))
  cellWidth = width
  const offset = (offsetToWidthRatio * width)
  calendarHeight = padding * 2 + Calendar.DAY * width + (Calendar.DAY - 1) * offset

  let currentMonth = -1

  for (let i = 0; i < cellTotal; i++) {
    const x = ~~(i / 7)
    const y = i % 7
    const cell: Cell = {
      date: subDays(now, cellTotal - i - 1),
      total: 0,
      x: padding + x * (width + offset),
      y: padding + y * (width + offset),
    }
    cellList.push(cell)
    if (i === 0 && getDate(cell.date) !== 1)
      continue
    if (y === 0) {
      const month = getMonth(cell.date) + 1
      if (currentMonth !== month) {
        monthList.push({
          date: cell.date,
          x: cell.x,
        })
        currentMonth = month
      }
    }
  }
}

function onResize({ width }: { width: number }) {
  monthList = []
  cellList = []
  calendarWidth = width
  calcCellList()
}

function handleEnterCell(date: Date) {
  hoverDate = date
}

function handleClickCell(date: Date) {
  dateVModel = date
}
</script>

<template>
  <div v-element-size="debounceResize" />
  <div
    relative
    flex-shrink-0
    :style="{
      width: `${calendarWidth}px`,
      height: `${calendarHeight}px`,
      fontSize: `${fontSize}px`,
      lineHeight,
    }"
  >
    <div
      v-for="{ date, x } in monthList"
      :key="x" absolute :style="{
        transform: `translate(${x}px, 0px)`,

      }"
    >
      {{ format(date, 'MMM', { locale: getDateLocale(locale) }) }}
    </div>
    <v-tooltip location="bottom">
      <template #activator="{ props }">
        <div
          v-for="{ x, y, date } in cellList" :key="date.getTime()"
          v-bind="props"
          ref="cellRef"
          :style="{
            transform: `translate(${x}px, ${y}px)`,
            width: `${cellWidth}px`,
            height: `${cellWidth}px`,
            backgroundColor: getColorByDate(date),
          }"
          absolute
          rounded
          cursor-pointer
          @mouseenter="handleEnterCell(date)"
          @click="handleClickCell(date)"
        />
      </template>
      <div>{{ formatYYYYMMDD(hoverDate) }}</div>
      <div>
        {{ formatHourMinute(getTotalByDate(hoverDate)) }}
      </div>
    </v-tooltip>
  </div>
</template>
