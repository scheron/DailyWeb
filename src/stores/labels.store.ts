import {computed, ref} from "vue"
import {defineStore} from "pinia"

import {API} from "@/api"

import type {Label} from "@/types/tasks"

export const useLabelsStore = defineStore("labels", () => {
  const isLabelsLoaded = ref(false)
  const labels = ref<Label[]>([])

  const labelsMap = computed(() => new Map<Label["name"], Label>(labels.value.map((label) => [label.name, label])))

  async function loadLabels() {
    try {
      const loadedLabels = await API.getLabels()
      labels.value = loadedLabels
    } catch (error) {
      console.error("Error loading labels:", error)
    } finally {
      isLabelsLoaded.value = true
    }
  }

  async function createLabel(name: string, color: string) {
    const newLabel = await API.createLabel({name, color})
    if (!newLabel) return null

    labels.value.push(newLabel)

    return newLabel
  }

  async function deleteLabel(name: string) {
    const deletedLabel = await API.deleteLabel(name)
    if (!deletedLabel) return false

    labels.value = labels.value.filter((label) => label.name !== name)

    return true
  }

  function defineInitialLabels() {
    const initialLabels = [
      {name: "🔥 Work", color: "#D01C55"},
      {name: "🎨 Design", color: "#015A6F"},
      {name: "🐶 Pet", color: "#35A4D9"},
    ]

    for (const label of initialLabels) {
      const existingLabel = labels.value.find((l) => l.name === label.name)
      if (!existingLabel) createLabel(label.name, label.color)
    }
  }

  defineInitialLabels()

  return {
    isLabelsLoaded,
    labels,
    labelsMap,

    loadLabels,
    createLabel,
    deleteLabel,
  }
})
