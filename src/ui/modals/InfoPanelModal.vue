<script setup lang="ts">
import {useUIStore} from "@/stores/ui.store"
import BaseModal from "@/ui/base/BaseModal.vue"
// import InfoPanel from "@/ui/features/InfoPanel"

const uiStore = useUIStore()

function onClose() {
  uiStore.toggleIsInfoPanelOpen(false)
  uiStore.setIsCalendarOpen(false)
}
</script>

<template>
  <BaseModal :open="uiStore.isInfoPanelOpen" @close="onClose">
    <!-- <InfoPanel mobile /> -->
  </BaseModal>
</template>
