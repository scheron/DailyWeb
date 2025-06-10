import {ref} from "vue"
import {defineStore} from "pinia"

import type {TasksFilter} from "@/types/filters"
import type {Label} from "@/types/tasks"

export const useFilterStore = defineStore("filter", () => {
  const activeFilter = ref<TasksFilter>("all")
  const activeLabel = ref<Label | null>(null)

  function setActiveFilter(filter: TasksFilter) {
    activeFilter.value = filter
  }

  function setActiveLabel(label: Label) {
    if (activeLabel.value?.name === label.name) {
      activeLabel.value = null
    } else {
      activeLabel.value = label
    }
  }

  return {
    activeFilter,
    activeLabel,

    setActiveFilter,
    setActiveLabel,
  }
})
