<script setup lang="ts">
import { useLabelsStore } from '@/stores/labels.store';
import { computed } from 'vue';

const labelsStore = useLabelsStore()

const labels = computed(() => labelsStore.labels)
</script>

<template>
  <div>
    <div v-for="label in labels" :key="label.name">
      {{ label.name }}
    </div>
  </div>
</template>