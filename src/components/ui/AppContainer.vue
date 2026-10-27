<script setup lang="ts">
  // Centers content and caps width on tablet/desktop so cards don't stretch
  // edge-to-edge once the grid grows past 2 columns.
  withDefaults(defineProps<{ padded?: boolean }>(), { padded: true })
</script>

<template>
  <div class="mx-auto w-full max-w-2xl" :class="padded ? 'px-4 sm:px-6' : ''">
    <slot />
  </div>
</template>
