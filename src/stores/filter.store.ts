import { ref, computed } from 'vue';
import {defineStore} from "pinia"

import type {TasksFilter} from "@/types/filters"
import type {Label} from "@/types/tasks"

export const useFilterStore = defineStore("filter", () => {
  const activeFilter = ref<TasksFilter>("all")
  const activeLabels = ref<Set<Label["name"]>>(new Set())

  function setActiveFilter(filter: TasksFilter) {
    activeFilter.value = filter
  }


  function setActiveLabels(label: Label["name"]) {
    if (activeLabels.value.has(label)) activeLabels.value.delete(label)
    else activeLabels.value.add(label)
  }

  return {
    activeFilter,
    activeLabels: computed(() => Array.from(activeLabels.value)),

    setActiveFilter,
    setActiveLabels,
  }
})
