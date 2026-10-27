<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
  import { useI18n } from 'vue-i18n'
  import { useUiStore } from '@/stores/uiStore'
  import type { ToastType } from '@/stores/uiStore'

  const { t } = useI18n()
  const ui = useUiStore()

  const icons: Record<ToastType, unknown> = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  }

  const iconClasses: Record<ToastType, string> = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-sky-400'
  }
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        <motion.div
          v-for="toast in ui.toasts"
          :key="toast.id"
          class="pointer-events-auto flex max-w-full items-center gap-2 rounded-pill bg-charcoal px-4 py-2.5 text-white shadow-sheet"
          :initial="{ opacity: 0, y: 12, scale: 0.95 }"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.95 }"
          :transition="{ duration: 0.2 }"
        >
          <component :is="icons[toast.type]" :size="17" :class="iconClasses[toast.type]" aria-hidden="true" />
          <span class="text-[13px] font-semibold">{{ toast.message }}</span>
          <button
            v-if="toast.dismissible"
            type="button"
            class="ml-1 text-white/60 hover:text-white"
            :aria-label="t('common.dismiss')"
            @click="ui.dismissToast(toast.id)"
          >
            <X :size="15" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  </Teleport>
</template>
