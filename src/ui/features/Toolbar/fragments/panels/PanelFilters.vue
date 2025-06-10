<script lang="ts" setup>
import {computed} from "vue"

import {capitalize} from "@/utils/strings"

import type {TasksFilter} from "@/types/filters"
import type {Label, Task} from "@/types/tasks"

const props = defineProps<{
  activeFilter: TasksFilter
  activeLabel?: Label | null
  tasks: Task[]
  labels: Label[]
}>()

const emit = defineEmits<{"update:active-filter": [TasksFilter]; "update:active-label": [Label]}>()

const options: {label: string; value: TasksFilter}[] = [
  {label: "All", value: "all"},
  {label: "Active", value: "active"},
  {label: "Done", value: "done"},
  {label: "Canceled", value: "canceled"},
]

const count = computed(() => {
  return props.tasks.reduce(
    (acc, task) => {
      if (task.status === "active") acc.active++
      else if (task.status === "done") acc.done++
      else if (task.status === "canceled") acc.canceled++

      return acc
    },
    {active: 0, done: 0, canceled: 0},
  )
})
</script>
<template>
  <div class="bg-base-100 flex size-full flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between">
    <div class="flex items-center gap-2">
      <button
        v-for="label in labels"
        :key="label.name"
        class="focus-visible-ring border opacity-80 hover:opacity-100 rounded-full focus-visible:ring-offset-base-100 relative focus-visible:ring-base-content px-2 py-0.5 transition-colors outline-none"
        :style="{
          borderColor: activeLabel?.name === label.name ? label.color : 'transparent',
        }"
        @click="emit('update:active-label', label)"
      >
        <span class="absolute inset-0 rounded-full opacity-20 size-full" :style="{backgroundColor: label.color}" />
        <span class="text-xs relative">{{ label.name }}</span>
      </button>
    </div>

    <div class="flex w-full items-center gap-2 md:w-auto">
      <div class="bg-base-300 text-base-content0 inline-flex w-full gap-2 rounded-lg p-0.5 md:w-auto">
        <button
          v-for="option in options"
          :key="option.value"
          class="focus-visible-ring focus-visible:ring-offset-base-100 focus-visible:ring-base-content flex-1 rounded-md px-2 py-0.5 text-sm transition-colors outline-none md:flex-none"
          :class="{
            'bg-base-100 text-base-content shadow-sm': activeFilter === option.value,
            'text-base-content/70 hover:text-base-content': activeFilter !== option.value,
          }"
          @click="emit('update:active-filter', option.value)"
        >
          {{ capitalize(option.value) }}
          <span v-if="option.value !== 'all'" class="ml-1.5 text-xs"> ({{ count[option.value as keyof typeof count] }}) </span>
        </button>
      </div>
    </div>
  </div>
</template>
