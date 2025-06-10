<script setup lang="ts">
import {useTasksStore} from "@/stores/tasks.store"
import {useUIStore} from "@/stores/ui.store"

import type {ISODate} from "@/types/date"
import BaseCalendar from "@/ui/base/BaseCalendar"

const tasksStore = useTasksStore()
const uiStore = useUIStore()

function selectDay(date: ISODate) {
  tasksStore.setActiveDay(date)
  uiStore.setIsCalendarOpen(false)
}
</script>

<template>
  <BaseCalendar
    mode="single"
    :days="tasksStore.days"
    :selected-date="tasksStore.activeDay"
    :initial-month="tasksStore.activeDay"
    size="md"
    @select-date="selectDay"
  />
</template>
