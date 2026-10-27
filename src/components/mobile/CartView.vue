<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { useI18n } from 'vue-i18n'
  import { ShoppingBag, Trash2, StickyNote, ChevronRight, ImageOff } from 'lucide-vue-next'
  import { formatCurrency } from '@nong-official-dev/core'
  import CustomAppHeader from './CustomAppHeader.vue'
  import QtyStepper from '../customs/QtyStepper.vue'
  import BaseButton from '@/components/ui/BaseButton.vue'
  import BaseIconButton from '@/components/ui/BaseIconButton.vue'
  import BaseBottomSheet from '@/components/ui/BaseBottomSheet.vue'
  import { useCartStore } from '@/stores/cartStore'
  import { useAppUtils } from '@/composables/useAppUtils'
  import type { CartItem } from '@/stores/cartStore'

  const { t, tm } = useI18n()
  const { confirm, notif } = useAppUtils()
  const cartStore = useCartStore()

  defineProps<{
    tableNumber?: number | string | null
    loading?: boolean
  }>()

  const emit = defineEmits<{
    back: []
    submit: []
  }>()

  const noteSheetOpen = ref(false)
  const selectedItem = ref<CartItem | null>(null)
  const noteDraft = ref('')

  const noteSuggestions = computed(() => {
    const notes = tm('quickNotes') as Record<string, unknown>
    return Object.keys(notes).map(key => ({ key, label: t(`quickNotes.${key}`) }))
  })

  function openNote(item: CartItem) {
    selectedItem.value = item
    noteDraft.value = item.note || ''
    noteSheetOpen.value = true
  }

  function saveNote() {
    if (!selectedItem.value) return
    cartStore.updateNote(selectedItem.value.id, noteDraft.value)
    noteSheetOpen.value = false
  }

  function confirmClear() {
    confirm({
      title: t('common.clearCartTitle'),
      message: t('common.clearCartMessage'),
      options: { type: 'error' },
      agree: () => {
        cartStore.clearCart()
        notif(t('message.clear'), { type: 'success' })
      }
    })
  }
</script>

<template>
  <div class="flex h-dvh flex-col bg-ivory">
    <CustomAppHeader :title="t('header.orderTitle')" @back="$emit('back')">
      <template #right>
        <BaseIconButton
          v-if="cartStore.items.length > 0"
          :icon="Trash2"
          :label="t('common.clearCart')"
          size="sm"
          @click="confirmClear"
        />
      </template>
    </CustomAppHeader>

    <main class="flex-1 overflow-y-auto px-4 pb-6 pt-4">
      <div v-if="cartStore.items.length === 0" class="flex flex-col items-center py-16 text-center">
        <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-charcoal/[0.04]">
          <ShoppingBag :size="32" class="text-charcoal/30" />
        </div>
        <p class="mb-5 text-sm text-charcoal/50">{{ t('common.emptyCart') }}</p>
        <BaseButton full-width @click="$emit('back')">{{ t('btn.order') }}</BaseButton>
      </div>

      <AnimatePresence v-else>
        <motion.div
          v-for="item in cartStore.items"
          :key="item.id"
          layout
          class="mb-3 flex gap-3 rounded-card border border-charcoal/[0.06] bg-white p-3 shadow-soft"
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }"
          :transition="{ duration: 0.2 }"
        >
          <div class="h-20 w-20 shrink-0 overflow-hidden rounded-card bg-ivory">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center text-charcoal/20">
              <ImageOff :size="20" />
            </div>
          </div>

          <div class="flex min-w-0 flex-1 flex-col">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="truncate text-[15px] font-bold text-charcoal">{{ item.name }}</div>
                <div v-if="item.has_variants" class="text-xs text-charcoal/50">
                  {{ (item.customizations as any)?.variant_name }}
                  <span v-if="(item.customizations as any)?.sugar !== undefined">
                    · {{ (item.customizations as any).sugar }}% sugar
                  </span>
                </div>
                <div v-if="item.note" class="mt-1 flex items-center gap-1 text-xs italic text-olive">
                  <StickyNote :size="12" />
                  <span class="truncate">{{ item.note }}</span>
                </div>
              </div>

              <BaseIconButton
                :icon="StickyNote"
                :label="t('common.editNote')"
                size="sm"
                :variant="item.note ? 'surface' : 'ghost'"
                @click="openNote(item)"
              />
            </div>

            <div class="mt-auto flex items-end justify-between pt-2">
              <div>
                <div class="text-[15px] font-extrabold text-charcoal">
                  {{ formatCurrency(item.base_price * item.qty) }}
                </div>
                <div class="text-xs text-charcoal/40">
                  {{ formatCurrency(item.base_price) }} / {{ t('common.items') }}
                </div>
              </div>
              <QtyStepper
                small
                strict
                :model-value="item.qty"
                :min="0"
                :max="5"
                @change="delta => cartStore.updateQty(item.id, delta)"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>

    <footer
      v-if="cartStore.items.length > 0"
      class="border-t border-charcoal/[0.06] bg-white px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-sheet"
    >
      <div class="mb-4 flex items-end justify-between">
        <div>
          <div class="text-xs text-charcoal/40">{{ t('common.total') }}</div>
          <div class="text-xl font-extrabold text-olive">{{ formatCurrency(cartStore.cartTotal) }}</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-charcoal/40">{{ cartStore.totalItems }} {{ t('common.items') }}</div>
          <div v-if="tableNumber" class="text-sm font-bold text-charcoal">
            {{ t('common.table') }} {{ tableNumber }}
          </div>
        </div>
      </div>

      <BaseButton full-width size="lg" :loading="loading" @click="$emit('submit')">
        {{ t('btn.placeOrder') }}
        <template #icon-right><ChevronRight :size="18" /></template>
      </BaseButton>
    </footer>

    <BaseBottomSheet v-model="noteSheetOpen">
      <div class="px-5 pb-2">
        <h2 class="text-lg font-bold text-charcoal">{{ t('common.noteFor') }}</h2>
        <p class="mb-4 text-sm text-charcoal/50">{{ selectedItem?.name }}</p>

        <textarea
          v-model="noteDraft"
          rows="3"
          maxlength="100"
          :placeholder="t('common.notePlaceholder')"
          class="mb-3 w-full resize-none rounded-card border border-charcoal/10 bg-ivory/60 p-3 text-sm text-charcoal outline-none focus:border-olive"
        />

        <div class="mb-6 flex flex-wrap gap-2">
          <button
            v-for="suggestion in noteSuggestions"
            :key="suggestion.key"
            type="button"
            class="rounded-pill bg-olive/10 px-3 py-1 text-xs font-semibold text-olive-dark"
            @click="noteDraft = suggestion.label"
          >
            {{ suggestion.label }}
          </button>
        </div>

        <div class="flex gap-3">
          <BaseButton variant="secondary" full-width @click="noteSheetOpen = false">
            {{ t('btn.cancel') }}
          </BaseButton>
          <BaseButton full-width @click="saveNote">{{ t('btn.save') }}</BaseButton>
        </div>
      </div>
    </BaseBottomSheet>
  </div>
</template>
