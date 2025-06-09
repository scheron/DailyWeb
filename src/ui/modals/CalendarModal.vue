<script setup lang="ts">
import {useUIStore} from "@/stores/ui.store"
import BaseModal from "@/ui/base/BaseModal.vue"
import Calendar from "@/ui/features/Calendar"

const uiStore = useUIStore()

function onClose() {
  uiStore.setIsCalendarOpen(false)
  uiStore.toggleIsInfoPanelOpen(false)
}
</script>

<template>
  <BaseModal :open="uiStore.isCalendarOpen" @close="onClose">
    <Calendar />
  </BaseModal>
</template>
