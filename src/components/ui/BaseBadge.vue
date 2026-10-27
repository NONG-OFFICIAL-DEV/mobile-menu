<script setup lang="ts">
  import { computed } from 'vue'

  type Tone = 'neutral' | 'olive' | 'warning' | 'danger'

  const props = withDefaults(defineProps<{ tone?: Tone }>(), { tone: 'neutral' })

  const tones: Record<Tone, string> = {
    neutral: 'bg-charcoal/[0.06] text-charcoal',
    olive: 'bg-olive/10 text-olive-dark',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-700'
  }

  const classes = computed(() => [
    'inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold',
    tones[props.tone]
  ])
</script>

<template>
  <span :class="classes"><slot /></span>
</template>
