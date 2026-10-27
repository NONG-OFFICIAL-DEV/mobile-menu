<script setup lang="ts">
  import { Minus, Plus } from 'lucide-vue-next'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const props = withDefaults(
    defineProps<{
      modelValue: number
      min?: number
      max?: number
      small?: boolean
      strict?: boolean
    }>(),
    { min: 1, max: 5, small: false, strict: false }
  )

  const emit = defineEmits<{
    'update:modelValue': [value: number]
    change: [delta: number]
  }>()

  function updateQty(delta: number) {
    const newValue = props.modelValue + delta

    if (delta > 0 && newValue > props.max) {
      if (!props.strict) emit('change', delta)
      return
    }
    if (delta < 0 && newValue < props.min) return

    emit('update:modelValue', newValue)
    emit('change', delta)
  }
</script>

<template>
  <div
    class="inline-flex items-center gap-1 rounded-pill border border-charcoal/[0.06] bg-charcoal/[0.04] p-1"
  >
    <button
      type="button"
      :disabled="modelValue <= min"
      :class="small ? 'h-6 w-6' : 'h-8 w-8'"
      class="inline-flex items-center justify-center rounded-full bg-white text-charcoal shadow-soft transition-transform active:scale-90 disabled:opacity-40"
      :aria-label="t('common.decreaseQty')"
      @click="updateQty(-1)"
    >
      <Minus :size="small ? 12 : 14" />
    </button>

    <span
      class="select-none text-center font-bold text-charcoal"
      :class="small ? 'min-w-6 text-xs' : 'min-w-8 text-sm'"
    >
      {{ modelValue }}
    </span>

    <button
      type="button"
      :disabled="strict && modelValue >= max"
      :class="small ? 'h-6 w-6' : 'h-8 w-8'"
      class="inline-flex items-center justify-center rounded-full bg-olive text-white shadow-soft transition-transform active:scale-90 disabled:opacity-40"
      :aria-label="t('common.increaseQty')"
      @click="updateQty(1)"
    >
      <Plus :size="small ? 12 : 14" />
    </button>
  </div>
</template>
