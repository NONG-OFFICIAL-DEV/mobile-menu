<script setup lang="ts">
  import { ChevronRight } from 'lucide-vue-next'
  import { motion } from 'motion-v'
  import { useI18n } from 'vue-i18n'
  import { useMoney } from '@/composables/useMoney'
  import { useDigitalMenuStore } from '@/stores/digitalMenuStore'

  const { t } = useI18n()
  const { formatMoney } = useMoney()
  const digitalMenuStore = useDigitalMenuStore()

  defineProps<{
    totalItems: number
    totalPrice: number
  }>()

  defineEmits<{ open: [] }>()
</script>

<template>
  <div class="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
    <motion.button
      type="button"
      class="flex w-full items-center gap-3 rounded-pill bg-olive px-5 py-3.5 text-white shadow-[0_10px_30px_rgba(104,118,83,0.4)]"
      :while-press="{ scale: 0.97 }"
      @click="$emit('open')"
    >
      <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
        {{ totalItems }}
      </span>
      <span class="font-semibold">{{ t('btn.yourOrder') }}</span>
      <span class="ml-auto font-bold">
        {{ formatMoney(totalPrice, digitalMenuStore.currency) }}
      </span>
      <ChevronRight :size="18" />
    </motion.button>
  </div>
</template>
