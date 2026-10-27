import { useUiStore } from '@/stores/uiStore'

export function useAppUtils() {
  const ui = useUiStore()

  return {
    confirm: ui.confirm,
    notif: ui.notify
  }
}
