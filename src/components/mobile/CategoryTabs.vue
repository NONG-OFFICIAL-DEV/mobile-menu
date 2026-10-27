<script setup lang="ts">
  import { Search, X } from 'lucide-vue-next'
  import { motion } from 'motion-v'
  import { useI18n } from 'vue-i18n'

  interface Category {
    id: number | string
    name: string
  }

  defineProps<{
    categories: Category[]
    modelValue: number | string
    search: string
    isLoading?: boolean
  }>()

  defineEmits<{
    'update:modelValue': [value: number | string]
    'update:search': [value: string]
  }>()

  const { t } = useI18n()
</script>

<template>
  <div class="bg-ivory/90 backdrop-blur-sm">
    <!-- Search -->
    <div class="px-4 pt-3 pb-2">
      <div class="relative">
        <Search
          :size="18"
          class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40"
          aria-hidden="true"
        />
        <input
          :value="search"
          type="search"
          :placeholder="t('common.search')"
          class="h-11 w-full rounded-pill border border-charcoal/10 bg-white pl-10 pr-10 text-[15px] text-charcoal placeholder:text-charcoal/40 outline-none transition-colors focus:border-olive"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        />
        <button
          v-if="search"
          type="button"
          :aria-label="t('common.clearSearch')"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
          @click="$emit('update:search', '')"
        >
          <X :size="16" />
        </button>
      </div>
    </div>

    <!-- Categories -->
    <div class="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-3">
      <template v-if="isLoading">
        <div
          v-for="n in 5"
          :key="n"
          class="h-9 w-20 shrink-0 animate-pulse rounded-pill bg-charcoal/10"
        />
      </template>

      <template v-else>
        <button
          type="button"
          class="relative shrink-0 rounded-pill px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors"
          :class="modelValue === 'All' ? 'text-white' : 'text-charcoal/70 border border-charcoal/10 hover:border-olive/40'"
          @click="$emit('update:modelValue', 'All')"
        >
          <motion.div
            v-if="modelValue === 'All'"
            layout-id="category-pill"
            class="absolute inset-0 rounded-pill bg-olive"
            :transition="{ type: 'spring', stiffness: 450, damping: 32 }"
          />
          <span class="relative">{{ t('common.all') }}</span>
        </button>

        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="relative shrink-0 rounded-pill px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors"
          :class="modelValue === cat.id ? 'text-white' : 'text-charcoal/70 border border-charcoal/10 hover:border-olive/40'"
          @click="$emit('update:modelValue', cat.id)"
        >
          <motion.div
            v-if="modelValue === cat.id"
            layout-id="category-pill"
            class="absolute inset-0 rounded-pill bg-olive"
            :transition="{ type: 'spring', stiffness: 450, damping: 32 }"
          />
          <span class="relative">{{ cat.name }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
  .scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
</style>
