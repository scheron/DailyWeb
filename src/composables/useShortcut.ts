import {computed} from "vue"
import {useActiveElement, useMagicKeys, whenever} from "@vueuse/core"

import {useDevice} from "./useDevice"

type Shortcut = string[]

export function useShortcut(keys: Shortcut, onTrigger: () => void | Promise<void>) {
  const {isDesktop} = useDevice()
  const activeElement = useActiveElement()
  const magicKeys = useMagicKeys()

  const shortcutKeys = magicKeys[keys.join("+")]
  const isEnabled = computed(() => isDesktop.value)

  const shouldPreventTriggerInputs = computed(() => {
    return activeElement.value?.tagName === "INPUT" || activeElement.value?.tagName === "TEXTAREA" || activeElement.value?.contentEditable === "true"
  })

  whenever(
    () => shortcutKeys.value && !shouldPreventTriggerInputs.value && isEnabled.value,
    () => onTrigger?.(),
  )
}
