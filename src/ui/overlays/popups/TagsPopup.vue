<script setup lang="ts">
import {computed, onMounted, ref, useTemplateRef} from "vue"
import {toast} from "vue-sonner"

import {useProgressFill} from "@/composables/useProgressFill"
import {useTagsStore} from "@/stores/tags.store"
import {useTaskEditorStore} from "@/stores/taskEditor.store"
import {useTasksStore} from "@/stores/tasks.store"
import {useThemeStore} from "@/stores/theme.store"
import BaseButton from "@/ui/base/BaseButton.vue"
import BaseIcon from "@/ui/base/BaseIcon"
import BasePopup from "@/ui/base/BasePopup.vue"
import BaseTag from "@/ui/base/BaseTag.vue"
import {useRestoreTaskToast} from "../../model/useRestoreTaskToast"

import type {Tag, Task} from "@/types/tasks"

const VISIBLE_TAGS_COUNT = 3

const tagsStore = useTagsStore()
const props = defineProps<{
  title?: string
  hideCloseBtn?: boolean
  tags: Tag[]
}>()

const remainingTags = computed(() => tagsStore.tags.slice(VISIBLE_TAGS_COUNT))


const emit = defineEmits<{close: [], select: [tagId: Tag["id"]]}>()
</script>

<template>
      <BasePopup :title="title" :hide-close-btn="hideCloseBtn">
        <template #trigger="{toggle}">
          <BaseButton
            variant="outline"
            size="sm"
            class="px-2 rounded-md"
            :class="[hasSelectedInPopup ? 'bg-accent/10 border-accent text-accent' : 'opacity-70 hover:opacity-90']"
            icon="tags"
            icon-class="size-3.5"
            @click="toggle"
          >
            <span class="text-xs font-medium">{{ remainingTags.length }}</span>
          </BaseButton>
        </template>

        <BaseButton
          v-for="tag in tags"
          :key="tag.id"
          variant="ghost"
          size="sm"
          icon-class="size-3.5"
          class="w-full"
          :class="isActiveTag(tag.id) ? 'bg-accent/10 text-accent' : ''"
          @click="onSelectTag(tag.id)"
        >
          <span class="size-2.5 rounded-sm shrink-0" :style="{backgroundColor: tag.color}" />
          <span class="text-sm truncate">{{ tag.name }}</span>
          <BaseIcon
            name="check"
            class="size-3.5 ml-auto text-base-content shrink-0 transition-opacity duration-200"
            :class="isActiveTag(tag.id) ? 'opacity-100' : 'opacity-0'"
          />
        </BaseButton>
      </BasePopup>
</template>
