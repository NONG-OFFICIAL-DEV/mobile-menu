// composables/useNotif.js
import { useUiStore } from '@/stores/uiStore'

export function useNotif() {
  const ui = useUiStore()
  return ui.notify
}
