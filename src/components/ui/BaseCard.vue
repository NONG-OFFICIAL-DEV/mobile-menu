<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      padding?: 'none' | 'sm' | 'md' | 'lg'
      interactive?: boolean
    }>(),
    {
      padding: 'md',
      interactive: false
    }
  )

  const paddings: Record<string, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  const classes = computed(() => [
    'rounded-card bg-surface border border-charcoal/[0.06] shadow-soft',
    paddings[props.padding],
    props.interactive ? 'transition-transform duration-150 active:scale-[0.98]' : ''
  ])
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
