import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  type?: ToastType
  timeout?: number
  dismissible?: boolean
}

export interface Toast {
  id: number
  message: string
  type: ToastType
  timeout: number
  dismissible: boolean
}

export interface ConfirmOptions {
  type?: 'error' | 'warning' | 'info'
  agreeBtnText?: string
  denyBtnText?: string
}

export interface ConfirmPayload {
  title: string
  message?: string
  options?: ConfirmOptions
  agree?: () => void | Promise<void>
  cancel?: () => void | Promise<void>
}

// Shared app-wide UI feedback (toasts + confirm dialog). Replaces the old
// `app.config.globalProperties.$notif/$confirm` + getCurrentInstance() pattern,
// which didn't type well under <script setup lang="ts"> and coupled every
// caller to being rendered inside a component tree with App.vue's refs wired up.
export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])
  let toastSeq = 0

  function notify(message: string, opts: ToastOptions = {}) {
    const id = ++toastSeq
    const toast: Toast = {
      id,
      message,
      type: opts.type ?? 'success',
      timeout: opts.timeout ?? 3000,
      dismissible: opts.dismissible ?? true
    }
    toasts.value.push(toast)
    if (toast.timeout) {
      setTimeout(() => dismissToast(id), toast.timeout)
    }
  }

  function dismissToast(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const confirmState = ref<ConfirmPayload | null>(null)

  function confirm(payload: ConfirmPayload) {
    confirmState.value = payload
  }

  async function agreeConfirm() {
    const payload = confirmState.value
    confirmState.value = null
    await payload?.agree?.()
  }

  async function cancelConfirm() {
    const payload = confirmState.value
    confirmState.value = null
    await payload?.cancel?.()
  }

  return { toasts, notify, dismissToast, confirmState, confirm, agreeConfirm, cancelConfirm }
})
