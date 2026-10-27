<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import { watch } from 'vue'

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      closeOnBackdrop?: boolean
    }>(),
    { closeOnBackdrop: true }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

  function close() {
    emit('update:modelValue', false)
  }

  function onBackdropClick() {
    if (props.closeOnBackdrop) close()
  }

  watch(
    () => props.modelValue,
    open => {
      document.documentElement.style.overflow = open ? 'hidden' : ''
    }
  )
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <div v-if="modelValue" class="fixed inset-0 z-50" role="dialog" aria-modal="true">
        <motion.div
          class="absolute inset-0 bg-charcoal/40"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.2 }"
          @click="onBackdropClick"
          @keydown.esc="close"
        />
        <motion.div
          class="absolute inset-x-0 bottom-0 mx-auto max-h-[85vh] w-full overflow-y-auto rounded-t-sheet bg-white pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-sheet sm:bottom-6 sm:max-w-lg sm:rounded-sheet"
          :initial="{ y: '100%' }"
          :animate="{ y: 0 }"
          :exit="{ y: '100%' }"
          :transition="{ type: 'spring', stiffness: 380, damping: 38 }"
        >
          <div class="flex justify-center pt-3 pb-1">
            <div class="h-1 w-9 rounded-pill bg-charcoal/15" />
          </div>
          <slot :close="close" />
        </motion.div>
      </div>
    </AnimatePresence>
  </Teleport>
</template>
