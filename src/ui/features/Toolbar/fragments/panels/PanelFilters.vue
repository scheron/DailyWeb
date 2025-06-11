<script lang="ts" setup>
import {computed} from "vue"

import {capitalize} from "@/utils/strings"
import BaseButton from "@/ui/base/BaseButton.vue"
import BaseIcon from "@/ui/base/BaseIcon"
import BasePopup from "@/ui/base/BasePopup.vue"

import type {TasksFilter} from "@/types/filters"
import type {Tag, Task} from "@/types/tasks"

const props = defineProps<{
  activeFilter: TasksFilter
  activeTags: Tag["id"][]
  tasks: Task[]
  tags: Tag[]
}>()

const emit = defineEmits<{"update:active-filter": [TasksFilter]; "update:active-tags": [Tag["id"]]}>()

const options: {label: string; value: TasksFilter}[] = [
  {label: "All", value: "all"},
  {label: "Active", value: "active"},
  {label: "Done", value: "done"},
  {label: "Discarded", value: "discarded"},
]

const visibleTags = computed(() => props.tags.slice(0, 3))
const remainingTags = computed(() => props.tags.slice(3))

const count = computed(() => {
  return props.tasks.reduce(
    (acc, task) => {
      if (task.status === "active") acc.active++
      else if (task.status === "done") acc.done++
      else if (task.status === "discarded") acc.discarded++

      return acc
    },
    {active: 0, done: 0, discarded: 0},
  )
})

const hasSelectedInPopup = computed(() => remainingTags.value.some((tag) => props.activeTags.includes(tag.id)))

function isActiveTag(tagId: Tag["id"]) {
  return props.activeTags.includes(tagId)
}

function selectTag(tagId: Tag["id"]) {
  emit("update:active-tags", tagId)
}
</script>

<template>
  <div class="bg-base-100 flex size-full flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between">
    <div class="relative flex items-center gap-2 max-w-2/5">
      <span v-if="!tags.length" class="text-sm text-base-content/70">
        <BaseIcon name="tags" class="size-4" />
        No daily tags
      </span>

      <template v-else>
        <BaseButton
          v-for="tag in visibleTags"
          :key="tag.id"
          variant="ghost"
          size="sm"
          icon-class="size-4"
          class="focus-visible-ring shrink-0 border hover:opacity-100 rounded-full focus-visible:ring-offset-base-100 relative focus-visible:ring-base-content px-2 py-0.5"
          :class="isActiveTag(tag.id) ? 'opacity-100' : 'opacity-80'"
          :style="{
            borderColor: isActiveTag(tag.id) ? tag.color : 'transparent',
            color: isActiveTag(tag.id) ? tag.color : 'inherit',
          }"
          @click="selectTag(tag.id)"
        >
          <span class="absolute inset-0 rounded-full opacity-20 size-full" :style="{backgroundColor: tag.color}" />
          <span class="text-xs relative">{{ tag.name }}</span>
        </BaseButton>

        <BasePopup v-if="remainingTags.length" title="Select Tags" show-close position="start" class="relative">
          <template #trigger="{toggle}">
            <BaseButton
              variant="outline"
              class="rounded-full px-2 py-0.5 gap-1 flex-row-reverse"
              :class="[hasSelectedInPopup ? 'bg-accent/10 text-accent border-accent px-2' : '']"
              size="sm"
              icon="tags"
              icon-class="size-4"
              @click="toggle"
            >
              <span class="text-xs"> +{{ remainingTags.length }} </span>
            </BaseButton>
          </template>

          <BaseButton
            v-for="tag in remainingTags"
            :key="tag.id"
            variant="ghost"
            size="sm"
            icon-class="size-4"
            :class="isActiveTag(tag.id) ? 'bg-base-200' : ''"
            @click="selectTag(tag.id)"
          >
            <span class="size-3 rounded-full shrink-0" :style="{backgroundColor: tag.color}" />
            <span class="text-sm truncate">{{ tag.name }}</span>
            <BaseIcon name="check" class="size-4 ml-auto text-base-content/70 shrink-0" :class="{invisible: !isActiveTag(tag.id)}" />
          </BaseButton>
        </BasePopup>
      </template>
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
