<script setup>
  import { computed, ref } from 'vue'
  import { useCurrency } from '@/composables/useCurrency.js'
  import CustomAppHeader from './CustomAppHeader.vue'
  import { useI18n } from 'vue-i18n'
  import { useAppUtils } from '@/composables/useAppUtils'
  const { confirm, notif } = useAppUtils()

  const { t, tm } = useI18n()
  import QtyStepper from '../customs/QtyStepper.vue'
  const { formatCurrency } = useCurrency()

  const prop = defineProps({
    cart: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    tableNumber: Number,
    loading: Boolean
  })
  const emit = defineEmits(['back', 'update', 'submit', 'clear', 'update-note'])

  const totalItems = computed(() => {
    return prop.cart.length
  })
  const noteSuggestions = computed(() => {
    const notes = tm('quickNotes') // tm returns object (not translated string)
    return Object.keys(notes).map(key => ({
      key,
      label: t(`quickNotes.${key}`)
    }))
  })
  const noteDialog = ref(false)
  const selectedItem = ref(null)
  const noteValue = ref('')

  function openNote(item) {
    selectedItem.value = item
    noteValue.value = item.note || ''
    noteDialog.value = true
  }

  function saveNote() {
    if (!selectedItem.value) return

    // Emit to parent to update cart item note
    // We pass itemId + note
    emit('update-note', selectedItem.value.id, noteValue.value)

    noteDialog.value = false
  }

   function cancelNote() {
    noteDialog.value = false
  }

  function confirmClear() {
    confirm({
      title: 'Delete this item?',
      message: 'This action cannot be undone.',
      options: {
        type: 'error',
        color: 'error',
        width: 500
      },
      agree: async () => {
        emit('clear')
        notif(t('message.clear'), {
          type: 'success',
          color: 'primary'
        })
      }
    })
  }
</script>

<template>
  <div class="cart-page-wrapper">
    <CustomAppHeader
      :title="t('header.orderTitle')"
      :showBack="true"
      @back="$emit('back')"
    >
      <template #right>
        <v-btn
          v-if="cart.length > 0"
          icon="mdi-delete-outline"
          variant="text"
          color="error"
          size="32"
          class="action-btn"
          @click="confirmClear()"
        />
      </template>
    </CustomAppHeader>

    <main class="scroll-content pa-4">
      <v-fade-transition hide-on-leave>
        <div v-if="cart.length === 0" class="text-center py-12">
          <v-avatar color="grey-lighten-4" size="80" class="mb-4">
            <v-icon size="40" color="grey-lighten-1">mdi-cart-outline</v-icon>
          </v-avatar>
          <p class="text-body-2 text-medium-emphasis">
            {{ t('common.emptyCart') }}
          </p>
          <v-btn
            color="primary"
            class="mt-4"
            block
            rounded="pill"
            elevation="1"
            prepend-icon="mdi-silverware-fork-knife"
            @click="$emit('back')"
          >
            {{ t('btn.order') }}
          </v-btn>
        </div>
      </v-fade-transition>

      <div v-if="cart.length > 0">
        <v-card
          v-for="item in cart"
          :key="item.id"
          flat
          class="cart-card mb-4 border rounded-xl"
        >
          <div class="d-flex pa-3">
            <v-img
              :src="item.image_url"
              width="90"
              height="90"
              cover
              class="rounded-lg flex-grow-0 shadow-sm border"
            />

            <div class="ml-4 flex-grow-1 d-flex flex-column">
              <div class="d-flex justify-space-between align-start mb-1">
                <div class="pr-2">
                  <div class="font-weight-black text-body-1 line-height-tight">
                    {{ item.name }}
                  </div>

                  <div
                    class="text-caption text-grey-darken-1 mt-1"
                    v-if="item.has_variants"
                  >
                    {{ item.customizations.variant_name }}
                    <span v-if="item.customizations.sugar">
                      | {{ item.customizations.sugar }}% Sugar
                    </span>
                  </div>

                  <div
                    v-if="item.note"
                    class="text-caption text-primary font-italic mt-1 d-flex align-center"
                  >
                    <v-icon size="14" class="mr-1">
                      mdi-note-text-outline
                    </v-icon>
                    {{ item.note }}
                  </div>
                </div>

                <v-btn
                  icon="mdi-note-edit-outline"
                  variant="tonal"
                  :color="item.note ? 'primary' : 'grey-lighten'"
                  size="32"
                  class="rounded-lg flex-shrink-0"
                  @click="openNote(item)"
                ></v-btn>
              </div>

              <div class="mt-auto d-flex justify-space-between align-center">
                <div class="d-flex flex-column">
                  <span
                    class="text-teal-darken-3 font-weight-black text-subtitle-1"
                  >
                    {{ formatCurrency(item.price * item.qty) }}
                  </span>
                  <span class="text-caption text-grey-darken-1">
                    {{ formatCurrency(item.price) }} / {{ t('common.items') }}
                  </span>
                </div>

                <QtyStepper
                  :modelValue="item.qty"
                  small
                  strict
                  :max="5"
                  :min="0"
                  @change="delta => $emit('update', item.id, delta)"
                />
              </div>
            </div>
          </div>
        </v-card>
      </div>
    </main>

    <footer
      v-if="cart.length > 0"
      class="fixed-footer pa-4 rounded-t-xl shadow-top"
    >
      <div class="d-flex justify-space-between align-end mb-4 px-2">
        <div>
          <span class="text-caption text-medium-emphasis d-block">
            {{ t('common.total') }}
          </span>
          <span class="font-weight-black text-h5 text-primary">
            {{ formatCurrency(total) }}
          </span>
        </div>
        <div class="text-right">
          <span class="text-caption text-medium-emphasis d-block">
            {{ totalItems }} {{ t('common.items') }}
          </span>
          <span class="text-subtitle-2 font-weight-black">
            {{ t('common.table') }} {{ tableNumber }}
          </span>
        </div>
      </div>

      <v-btn
        block
        color="primary"
        size="large"
        rounded="pill"
        class="elevation-1 checkout-btn"
        :loading="loading"
        @click="$emit('submit')"
      >
        {{ t('btn.placeOrder') }}
        <v-icon end class="ml-2">mdi-chevron-right</v-icon>
      </v-btn>
    </footer>

    <v-bottom-sheet v-model="noteDialog" :close-on-content-click="false">
      <v-sheet rounded="t-xl" class="pb-safe">
        <!-- Handle -->
        <div class="d-flex justify-center pt-3 pb-1">
          <div class="bs-handle" />
        </div>

        <!-- Item context -->
        <v-card-title class="font-weight-black pt-2">
          {{ t('common.noteFor') }}
          <div class="text-caption text-grey-darken-1 mt-1">
            {{ selectedItem?.name }}
          </div>
        </v-card-title>

        <v-divider />

        <!-- Textarea -->
        <div class="px-5 pt-4 pb-3">
          <v-textarea
            v-model="noteValue"
            placeholder="e.g. No spicy, less salt, extra sauce..."
            variant="outlined"
            color="#2D7A6E"
            rounded="xl"
            rows="3"
            maxlength="100"
            counter="100"
            hide-details="auto"
            auto-grow
          />

          <!-- Quick suggestion chips -->
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="suggestion in noteSuggestions"
              :key="suggestion.key"
              size="small"
              variant="tonal"
              color="primary"
              class="me-1"
              @click="noteValue = suggestion.label"
            >
              {{ suggestion.label }}
            </v-chip>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex gap-3 px-5 pb-6">
          <v-btn
            variant="tonal"
            color="grey"
            rounded="pill"
            class="flex-grow-1"
            height="46"
            @click="cancelNote"
          >
            {{ t('btn.cancel') }}
          </v-btn>
          <v-btn
            color="#2D7A6E"
            variant="flat"
            rounded="pill"
            class="flex-grow-1"
            height="46"
            @click="saveNote"
          >
            <v-icon start size="16">mdi-check</v-icon>
            {{ t('btn.save') }}
          </v-btn>
        </div>
      </v-sheet>
    </v-bottom-sheet>
  </div>
</template>

<style scoped>
  .close-bar {
    width: 40px;
    height: 5px;
  }
  .cart-page-wrapper {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    overflow: hidden;
    background-color: #f8f9fa;
  }

  .scroll-content {
    flex-grow: 1;
    overflow-y: auto;
    padding-bottom: 150px !important;
    -webkit-overflow-scrolling: touch;
  }

  /* Improved Stepper Styling */
  .stepper-box {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    padding: 3px;
    border-radius: 50px;
  }

  .qty-display {
    min-width: 30px;
    text-align: center;
    font-weight: 800;
    font-size: 0.95rem;
  }

  .line-height-tight {
    line-height: 1.2;
  }

  .fixed-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    z-index: 1000;
    padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  .shadow-top {
    box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.05) !important;
  }

  .checkout-btn {
    transition: transform 0.1s;
  }

  .checkout-btn:active {
    transform: scale(0.97);
  }

  .cart-card {
    background: white !important;
    border: 1px solid rgba(0, 0, 0, 0.05) !important;
  }

  .action-btn {
    background: white !important;
    border: 1px solid rgba(0, 0, 0, 0.05) !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04) !important;
    border-radius: 12px !important;
  }
</style>
