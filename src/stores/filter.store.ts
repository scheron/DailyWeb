import {ref} from "vue"
import {defineStore} from "pinia"

import type {TasksFilter} from "@/types/filters"
import type {Tag} from "@/types/tasks"

export const useFilterStore = defineStore("filter", () => {
  const activeFilter = ref<TasksFilter>("all")
  const activeTagIds = ref<Set<Tag["id"]>>(new Set())

  function setActiveFilter(filter: TasksFilter) {
    activeFilter.value = filter
  }

  function setActiveTags(tagId: Tag["id"]) {
    if (activeTagIds.value.has(tagId)) activeTagIds.value.delete(tagId)
    else activeTagIds.value.add(tagId)
  }

  return {
    activeFilter,
    activeTagIds,

    setActiveFilter,
    setActiveTags,
  }
})
