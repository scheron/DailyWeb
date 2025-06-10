<script setup lang="ts">
import {useDevice} from "@/composables/useDevice"
import {useUIStore} from "@/stores/ui.store"
import BaseButton from "@/ui/base/BaseButton.vue"
import BaseSpinner from "@/ui/base/BaseSpinner.vue"
import CalendarWeek from "@/ui/features/CalendarWeek"
import Logo from "@/ui/misc/Logo.vue"

defineProps<{
  dataLoaded: boolean
  contentHeight: number
}>()

const uiStore = useUIStore()
const {isDesktop} = useDevice()
</script>

<template>
  <aside :class="['border-base-300 bg-base-100 hidden shrink-0 border-r md:block', uiStore.isSidebarCollapsed ? 'w-sidebar-collapsed' : 'w-sidebar']">
    <div class="border-base-300 h-header flex items-center justify-between border-b pr-4 pl-4 select-none" style="-webkit-app-region: drag">
      <Logo class="text-accent mx-auto h-5" />
    </div>

    <div :style="{height: contentHeight + 'px'}" class="hide-scrollbar overflow-y-auto">
      <BaseSpinner v-if="!dataLoaded" />

      <template v-else>
        <div class="text-base-content flex size-full flex-col pb-2">
          <div class="flex-1 py-4 px-1 overflow-y-auto hide-scrollbar">
            <CalendarWeek />
          </div>

          <div class="flex items-center gap-2 mx-auto flex-col">
            <BaseButton variant="ghost" icon="export" @click="uiStore.toggleIsExportTaskOpen()" />
            <BaseButton v-if="isDesktop" variant="ghost" icon="sidebar" @click="uiStore.toggleSidebarCollapse()" />
          </div>
        </div>
      </template>
    </div>
  </aside>
</template>
