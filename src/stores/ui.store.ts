import {ref} from "vue"
import {useLocalStorage} from "@vueuse/core"
import {defineStore} from "pinia"

import {STORAGE_KEY_SIDEBAR} from "@/constants/persist"
import {useDevice} from "@/composables/useDevice"

export const useUIStore = defineStore("ui", () => {
  const isSidebarCollapsed = useLocalStorage(STORAGE_KEY_SIDEBAR, false)
  const {isDesktop} = useDevice()

  const isExportTaskOpen = ref(false)
  const isMobileSidebarOpen = ref(false)

  function toggleSidebarCollapse(isOpen?: boolean) {
    if (isDesktop.value) {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    } else {
      isMobileSidebarOpen.value = isOpen ?? !isMobileSidebarOpen.value
    }
  }

  function toggleIsExportTaskOpen(isOpen?: boolean) {
    isExportTaskOpen.value = isOpen ?? !isExportTaskOpen.value
  }

  return {
    isExportTaskOpen,
    isSidebarCollapsed,
    isMobileSidebarOpen,

    toggleSidebarCollapse,
    toggleIsExportTaskOpen,
  }
})
