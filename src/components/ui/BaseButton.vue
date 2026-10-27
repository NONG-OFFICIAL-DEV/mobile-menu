<script setup lang="ts">
  import { computed } from 'vue'

  type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
  type Size = 'sm' | 'md' | 'lg'

  const props = withDefaults(
    defineProps<{
      variant?: Variant
      size?: Size
      fullWidth?: boolean
      disabled?: boolean
      loading?: boolean
      type?: 'button' | 'submit'
    }>(),
    {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      disabled: false,
      loading: false,
      type: 'button'
    }
  )

  defineEmits<{ click: [MouseEvent] }>()

  const base =
    'inline-flex items-center justify-center gap-2 rounded-pill font-semibold ' +
    'transition-transform duration-150 active:scale-[0.97] ' +
    'disabled:opacity-40 disabled:pointer-events-none ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive'

  const variants: Record<Variant, string> = {
    primary: 'bg-olive text-white hover:bg-olive-dark',
    secondary: 'bg-white text-charcoal border border-charcoal/10 hover:border-olive/40',
    ghost: 'bg-transparent text-charcoal hover:bg-charcoal/5',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }

  const sizes: Record<Size, string> = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-5 text-[15px]',
    lg: 'h-13 px-6 text-base'
  }

  const classes = computed(() => [
    base,
    variants[props.variant],
    sizes[props.size],
    props.fullWidth ? 'w-full' : ''
  ])
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span
      v-if="loading"
      class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot name="icon-left" />
    <span v-if="$slots.default"><slot /></span>
    <slot name="icon-right" />
  </button>
</template>
