<script setup lang="ts">
  import { computed, type Component } from 'vue'

  type Size = 'sm' | 'md' | 'lg'

  const props = withDefaults(
    defineProps<{
      icon: Component
      label: string
      size?: Size
      variant?: 'surface' | 'ghost'
    }>(),
    {
      size: 'md',
      variant: 'surface'
    }
  )

  defineEmits<{ click: [MouseEvent] }>()

  const sizes: Record<Size, { box: string; icon: number }> = {
    sm: { box: 'h-8 w-8', icon: 16 },
    md: { box: 'h-10 w-10', icon: 18 },
    lg: { box: 'h-12 w-12', icon: 20 }
  }

  const classes = computed(() => [
    'inline-flex items-center justify-center rounded-card transition-transform duration-150 active:scale-90',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive',
    sizes[props.size].box,
    props.variant === 'surface'
      ? 'bg-white border border-charcoal/10 shadow-soft text-charcoal'
      : 'bg-transparent text-charcoal hover:bg-charcoal/5'
  ])
</script>

<template>
  <button type="button" :class="classes" :aria-label="label" @click="$emit('click', $event)">
    <component :is="icon" :size="sizes[size].icon" aria-hidden="true" />
  </button>
</template>
