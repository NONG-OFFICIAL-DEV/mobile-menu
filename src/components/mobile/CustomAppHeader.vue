<script setup lang="ts">
  import { ChevronLeft } from 'lucide-vue-next'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  withDefaults(
    defineProps<{
      title?: string
      subtitle?: string
      showBack?: boolean
      live?: boolean
    }>(),
    { showBack: true, live: false }
  )

  defineEmits<{ back: [] }>()
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-charcoal/[0.06] bg-white/90 backdrop-blur-md">
    <div class="pt-[env(safe-area-inset-top)]" />
    <div class="flex items-center px-4 py-3">
      <div class="flex w-12 items-center">
        <button
          v-if="showBack && !$slots.left"
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-card border border-charcoal/10 bg-white shadow-soft"
          :aria-label="t('btn.back')"
          @click="$emit('back')"
        >
          <ChevronLeft :size="18" class="text-charcoal" />
        </button>
        <slot name="left" />
      </div>

      <div class="flex-1 text-center">
        <div class="text-[15px] font-extrabold text-charcoal">{{ title }}</div>
        <div v-if="subtitle || $slots.subtitle" class="mt-0.5">
          <slot name="subtitle">
            <div class="flex items-center justify-center gap-1.5">
              <span v-if="live" class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span class="text-xs text-charcoal/40">{{ subtitle }}</span>
            </div>
          </slot>
        </div>
      </div>

      <div class="flex w-12 justify-end">
        <slot name="right" />
      </div>
    </div>
  </header>
</template>
