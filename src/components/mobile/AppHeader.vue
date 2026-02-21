<script setup>
  import LanguageBottomSheet from '../customs/LanguageBottomSheet.vue'
  import { useI18n } from 'vue-i18n'
  import { useCart } from '@/composables/useCart'

  const { t } = useI18n()
  const { totalItems } = useCart()

  defineProps({
    tableNumber: String,
    search: String,
    isOrder: Object,
  })

  defineEmits(['view-process', 'view-cart', 'view-history', 'update:search'])
</script>

<template>
  <div class="app-header">
    <div class="header-inner px-4 py-2">

      <!-- LEFT: Brand -->
      <div class="brand d-flex align-center gap-3">
        <v-avatar size="40" rounded="lg" class="brand-avatar">
          <v-img
            src="https://i.pinimg.com/736x/24/35/1f/24351fd9348c232ffb57e24fc809d5a2.jpg"
            cover
            alt="Restaurant logo"
          />
        </v-avatar>
        <div>
          <div class="brand-name">Siem Reap Kitchen</div>
          <div class="brand-sub d-flex align-center gap-1">
            <v-icon size="10" color="success">mdi-circle</v-icon>
            <span>Open · Table {{ tableNumber ?? '–' }}</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Actions -->
      <div class="actions d-flex align-center gap-2">

        <!-- Cart icon (only when items exist) -->
        <v-btn
          v-if="totalItems"
          icon
          variant="flat"
          size="small"
          class="action-icon-btn"
          @click="$emit('view-cart')"
        >
          <v-badge
            :content="totalItems"
            color="#E8A84A"
            floating
          >
            <v-icon size="20" color="#2D7A6E">mdi-cart-outline</v-icon>
          </v-badge>
        </v-btn>

        <!-- Order history (only when there is an order) -->
        <v-btn
          v-if="isOrder?.items?.length > 0"
          icon
          variant="flat"
          size="small"
          class="action-icon-btn"
          @click="$emit('view-history')"
        >
          <v-icon size="20" color="#2D7A6E">mdi-receipt-clock-outline</v-icon>
        </v-btn>

        <!-- Language switcher -->
        <div class="action-icon-btn d-flex align-center justify-center">
          <LanguageBottomSheet :stackedBtn="false" :iconBtn="true" />
        </div>

      </div>
    </div>

    <!-- SEARCH (only when prop is passed) -->
    <div v-if="search !== undefined" class="search-area px-4 pb-3">
      <v-text-field
        :model-value="search"
        @update:model-value="$emit('update:search', $event)"
        :placeholder="t('common.search')"
        variant="solo"
        density="compact"
        hide-details
        flat
        bg-color="rgba(0,0,0,0.05)"
        prepend-inner-icon="mdi-magnify"
        rounded="xl"
        class="search-field"
      >
        <template #append-inner>
          <v-fade-transition>
            <v-icon
              v-if="search"
              size="16"
              color="grey"
              style="cursor:pointer"
              @click="$emit('update:search', '')"
            >
              mdi-close-circle
            </v-icon>
          </v-fade-transition>
        </template>
      </v-text-field>
    </div>
  </div>
</template>

<style scoped>
  .app-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(253, 248, 243, 0.9);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Brand */
  .brand-avatar {
    border: 2px solid #2D7A6E !important;
    flex-shrink: 0;
  }

  .brand-name {
    font-size: 15px;
    font-weight: 700;
    color: #1C1C1E;
    line-height: 1.2;
  }

  .brand-sub {
    font-size: 11px;
    color: #8E8E93;
    font-weight: 400;
    margin-top: 1px;
  }

  /* Action buttons */
  .action-icon-btn {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    border-radius: 12px !important;
    background: #FFFFFF !important;
    border: 1px solid rgba(0, 0, 0, 0.07) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06) !important;
    transition: transform 0.15s;
  }

  .action-icon-btn:active {
    transform: scale(0.9);
  }

  /* Gap utility (for older Vuetify that might not support gap on d-flex) */
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .gap-1 { gap: 4px; }

  /* Search */
  .search-area {
    margin-top: 6px;
  }

  :deep(.search-field .v-field) {
    border-radius: 14px !important;
    font-size: 14px;
    background: rgba(0,0,0,0.05) !important;
  }

  :deep(.search-field .v-field--focused) {
    background: #fff !important;
    outline: 1.5px solid #2D7A6E;
  }

  :deep(.search-field .v-field__input) {
    min-height: 42px !important;
    padding-top: 0;
    padding-bottom: 0;
  }
</style>