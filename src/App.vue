<script setup lang="ts">
import {computed} from "vue"
import {Toaster} from "vue-sonner"
import {invoke} from "@vueuse/core"

import {useContentSize} from "@/composables/useContentSize"
import {useDevice} from "@/composables/useDevice"
import {useShortcut} from "@/composables/useShortcut"
import {useLabelsStore} from "@/stores/labels.store"
import {useTaskEditorStore} from "@/stores/taskEditor.store"
import {useTasksStore} from "@/stores/tasks.store"
import {useThemeStore} from "@/stores/theme.store"
import {useUIStore} from "@/stores/ui.store"
import {IconsSprite} from "@/ui/base/BaseIcon"
import CalendarModal from "@/ui/modals/CalendarModal.vue"
import ExportTasksModal from "@/ui/modals/ExportTaskModal.vue"
import InfoPanelModal from "@/ui/modals/InfoPanelModal.vue"
import Main from "@/ui/sections/Main.vue"
import Sidebar from "@/ui/sections/Sidebar.vue"
import SidebarMini from "@/ui/sections/SidebarMini.vue"

const tasksStore = useTasksStore()
const labelsStore = useLabelsStore()
const taskEditorStore = useTaskEditorStore()
const uiStore = useUIStore()
useThemeStore()

const {isDesktop, isMacOS} = useDevice()
const {contentHeight, contentWidth} = useContentSize("container")

const isDataLoaded = computed(() => tasksStore.isDaysLoaded && labelsStore.isLabelsLoaded)

function onCreateTask() {
  taskEditorStore.setCurrentEditingTask(null)
  taskEditorStore.setIsTaskEditorOpen(true)
}

useShortcut([isMacOS ? "cmd" : "ctrl", "n"], onCreateTask)
useShortcut([isMacOS ? "cmd" : "ctrl", "i"], () => uiStore.toggleIsInfoPanelOpen())
useShortcut([isMacOS ? "cmd" : "ctrl", "e"], () => uiStore.toggleIsExportTaskOpen())

invoke(async () => {
  await Promise.all([tasksStore.loadTasks(), labelsStore.loadLabels()])
  console.log(tasksStore.days)
})
</script>

<template>
  <div ref="container" class="bg-base-300 flex h-dvh w-dvw overflow-hidden">
    <SidebarMini v-if="uiStore.isSidebarCollapsed" :content-height="contentHeight" :data-loaded="isDataLoaded" />
    <Sidebar v-else :content-height="contentHeight" :data-loaded="isDataLoaded" />

    <Main
      :content-height="contentHeight"
      :content-width="contentWidth"
      :task-editor-open="taskEditorStore.isTaskEditorOpen"
      @create-task="onCreateTask"
    />

    <CalendarModal :z-index="1" fullscreen />
    <InfoPanelModal v-if="!isDesktop" :z-index="2" fullscreen />
    <ExportTasksModal v-if="uiStore.isExportTaskOpen" :z-index="3" />
  </div>

  <IconsSprite />
  <Toaster class="toaster" :duration="3000" close-button />
</template>
