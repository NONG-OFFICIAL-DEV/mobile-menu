<script setup>
  import { ref } from 'vue'

  const props = defineProps({
    cart: { type: Array, default: () => [] },
    total: { type: [Number, String], default: 0 },
    tableNumber: { type: Number, default: null },
    loading: { type: Boolean, default: false },
  })

  const emit = defineEmits(['back', 'update', 'submit', 'clear', 'update-note'])

  // Note editing
  const noteItemId = ref(null)
  const noteValue = ref('')

  function openNote(item) {
    noteItemId.value = item.id
    noteValue.value = item.note || ''
  }

  function saveNote() {
    emit('update-note', noteItemId.value, noteValue.value)
    noteItemId.value = null
  }

  function cancelNote() {
    noteItemId.value = null
  }

  // Clear confirm dialog
  const showClearDialog = ref(false)
  function confirmClear() {
    showClearDialog.value = false
    emit('clear')
  }

  const SERVICE_FEE = 0.5
  const computedTotal = () => Number(props.total) + SERVICE_FEE
</script>

<template>
  <div class="cart-page">

    <!-- ── HEADER ── -->
    <div class="cart-header px-4 py-3 d-flex align-center">
      <v-btn
        icon
        variant="flat"
        size="small"
        class="back-btn mr-3"
        @click="$emit('back')"
      >
        <v-icon size="20" color="#1C1C1E">mdi-arrow-left</v-icon>
      </v-btn>

      <div class="flex-grow-1">
        <div class="header-title">Your Cart</div>
        <div class="header-sub">Table {{ tableNumber }} · {{ cart.length }} item{{ cart.length !== 1 ? 's' : '' }}</div>
      </div>

      <v-btn
        v-if="cart.length"
        variant="text"
        size="small"
        color="error"
        class="clear-btn"
        @click="showClearDialog = true"
      >
        Clear all
      </v-btn>
    </div>

    <!-- ── CART ITEMS ── -->
    <div class="cart-content px-4 pb-36">

      <!-- Empty state -->
      <div v-if="cart.length === 0" class="empty-cart d-flex flex-column align-center justify-center py-20">
        <div class="empty-icon-wrap mb-5">
          <v-icon size="44" color="#2D7A6E" style="opacity:0.5">mdi-cart-outline</v-icon>
        </div>
        <p class="text-subtitle-1 font-weight-bold text-center mb-1">Your cart is empty</p>
        <p class="text-caption text-medium-emphasis text-center mb-5">Add some dishes from the menu</p>
        <v-btn
          color="#2D7A6E"
          variant="tonal"
          rounded="pill"
          prepend-icon="mdi-silverware-fork-knife"
          @click="$emit('back')"
        >
          Browse Menu
        </v-btn>
      </div>

      <!-- Item list -->
      <template v-else>
        <transition-group name="cart-item" tag="div">
          <div
            v-for="item in cart"
            :key="item.id"
            class="cart-item-card mb-3"
          >
            <!-- Image + Info -->
            <div class="d-flex align-start gap-3">
              <v-avatar
                size="68"
                rounded="xl"
                class="item-img flex-shrink-0"
              >
                <v-img
                  :src="item.image_url || item.image"
                  :alt="item.name"
                  cover
                >
                  <template #placeholder>
                    <div class="fill-height d-flex align-center justify-center" style="background:#EEF6F4">
                      <v-icon color="#2D7A6E" style="opacity:0.4">mdi-silverware-fork-knife</v-icon>
                    </div>
                  </template>
                </v-img>
              </v-avatar>

              <div class="flex-grow-1 item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-price mt-1">${{ Number(item.price).toFixed(2) }}</div>

                <!-- Note preview -->
                <div
                  v-if="item.note"
                  class="note-preview mt-1 d-flex align-center gap-1"
                  @click="openNote(item)"
                >
                  <v-icon size="12" color="#8E8E93">mdi-note-text-outline</v-icon>
                  <span class="note-text">{{ item.note }}</span>
                </div>
                <div v-else class="add-note mt-1" @click="openNote(item)">
                  + Add note
                </div>
              </div>

              <!-- QTY controls -->
              <div class="qty-col d-flex flex-column align-end justify-between">
                <div class="subtotal">${{ (Number(item.price) * item.qty).toFixed(2) }}</div>
                <div class="qty-ctrl d-flex align-center gap-1 mt-2">
                  <v-btn
                    icon
                    size="x-small"
                    variant="tonal"
                    color="grey"
                    class="qty-btn"
                    @click="$emit('update', { item, qty: item.qty - 1 })"
                  >
                    <v-icon size="13">{{ item.qty === 1 ? 'mdi-trash-can-outline' : 'mdi-minus' }}</v-icon>
                  </v-btn>
                  <span class="qty-num">{{ item.qty }}</span>
                  <v-btn
                    icon
                    size="x-small"
                    color="#2D7A6E"
                    variant="flat"
                    class="qty-btn"
                    @click="$emit('update', { item, qty: item.qty + 1 })"
                  >
                    <v-icon size="13">mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </transition-group>

        <!-- ── ORDER SUMMARY ── -->
        <div class="summary-card mt-4">
          <div class="summary-title mb-3">Order Summary</div>

          <div class="summary-row">
            <span class="summary-label">Subtotal</span>
            <span class="summary-value">${{ Number(total).toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Service fee</span>
            <span class="summary-value">${{ SERVICE_FEE.toFixed(2) }}</span>
          </div>
          <v-divider class="my-3" />
          <div class="summary-row total-row">
            <span>Total</span>
            <span class="total-price">${{ computedTotal().toFixed(2) }}</span>
          </div>
        </div>

        <!-- ── NOTICE ── -->
        <v-alert
          density="compact"
          variant="tonal"
          color="#2D7A6E"
          rounded="xl"
          class="mt-4"
          icon="mdi-information-outline"
        >
          <span class="text-caption">Your order will be sent to the kitchen. Please wait at your table.</span>
        </v-alert>
      </template>
    </div>

    <!-- ── PLACE ORDER BUTTON ── -->
    <div v-if="cart.length" class="order-bar px-4 py-4">
      <v-btn
        block
        size="large"
        rounded="xl"
        class="order-btn"
        :loading="loading"
        :disabled="loading"
        @click="$emit('submit')"
      >
        <template #prepend>
          <v-icon>mdi-silverware-fork-knife</v-icon>
        </template>
        Place Order · ${{ computedTotal().toFixed(2) }}
      </v-btn>
    </div>

    <!-- ── NOTE BOTTOM SHEET ── -->
    <v-bottom-sheet v-model="noteItemId" :close-on-content-click="false">
      <v-sheet rounded="t-xl" class="pb-safe">
        <!-- Handle -->
        <div class="d-flex justify-center pt-3 pb-1">
          <div class="bs-handle" />
        </div>

        <!-- Item context -->
        <div class="bs-item-context px-5 py-3 d-flex align-center gap-3">
          <div class="bs-icon-wrap">
            <v-icon size="18" color="#2D7A6E">mdi-note-edit-outline</v-icon>
          </div>
          <div>
            <div class="bs-title">Add a note</div>
            <div class="bs-item-name" v-if="noteItemId">
              {{ cart.find(i => i.id === noteItemId)?.name }}
            </div>
          </div>
        </div>

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
          <div class="d-flex flex-wrap gap-2 mt-3">
            <v-chip
              v-for="suggestion in ['No spicy 🌶️', 'Less salt', 'Extra sauce', 'No onion', 'Well done']"
              :key="suggestion"
              size="small"
              variant="tonal"
              color="#2D7A6E"
              class="suggestion-chip"
              @click="noteValue = suggestion"
            >
              {{ suggestion }}
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
            Cancel
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
            Save Note
          </v-btn>
        </div>
      </v-sheet>
    </v-bottom-sheet>

    <!-- ── CLEAR CONFIRM DIALOG ── -->
    <v-dialog v-model="showClearDialog" max-width="320">
      <v-card rounded="2xl" class="pa-2">
        <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-5">
          Clear cart?
        </v-card-title>
        <v-card-text class="text-body-2 text-medium-emphasis px-5 pt-1">
          All items will be removed from your cart. This cannot be undone.
        </v-card-text>
        <v-card-actions class="px-4 pb-4 gap-2 d-flex">
          <v-btn
            variant="tonal"
            color="grey"
            rounded="pill"
            class="flex-grow-1"
            @click="showClearDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            rounded="pill"
            class="flex-grow-1"
            @click="confirmClear"
          >
            Clear
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<style scoped>
  .cart-page {
    background: #FDF8F3;
    min-height: 100dvh;
    position: relative;
  }

  /* ─── HEADER ─── */
  .cart-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(253, 248, 243, 0.92);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }

  .back-btn {
    background: #ffffff !important;
    border: 1px solid rgba(0,0,0,0.07) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
    border-radius: 12px !important;
    width: 36px !important;
    height: 36px !important;
  }

  .header-title {
    font-size: 16px;
    font-weight: 700;
    color: #1C1C1E;
    line-height: 1.2;
  }

  .header-sub {
    font-size: 12px;
    color: #8E8E93;
    margin-top: 1px;
  }

  .clear-btn {
    font-size: 13px !important;
    font-weight: 500 !important;
    letter-spacing: 0 !important;
  }

  /* ─── CONTENT ─── */
  .cart-content {
    padding-top: 16px;
  }

  .pb-36 { padding-bottom: 140px; }

  /* ─── EMPTY STATE ─── */
  .empty-icon-wrap {
    width: 88px; height: 88px;
    border-radius: 50%;
    background: rgba(45,122,110,0.08);
    display: flex; align-items: center; justify-content: center;
  }

  /* ─── CART ITEM ─── */
  .cart-item-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 14px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    animation: fadeUp 0.3s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .item-img {
    border-radius: 14px !important;
    overflow: hidden;
  }

  .item-name {
    font-size: 14px;
    font-weight: 700;
    color: #1C1C1E;
    line-height: 1.3;
  }

  .item-price {
    font-size: 13px;
    color: #8E8E93;
    font-weight: 500;
  }

  .note-preview {
    cursor: pointer;
  }

  .note-text {
    font-size: 11px;
    color: #8E8E93;
    font-style: italic;
    max-width: 130px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .add-note {
    font-size: 12px;
    color: #2D7A6E;
    font-weight: 500;
    cursor: pointer;
    margin-top: 2px;
  }

  /* ─── QTY ─── */
  .qty-col { min-width: 90px; }

  .subtotal {
    font-size: 14px;
    font-weight: 800;
    color: #2D7A6E;
    text-align: right;
  }

  .gap-1 { gap: 4px; }
  .gap-3 { gap: 12px; }

  .qty-btn {
    width: 26px !important;
    height: 26px !important;
    min-width: 26px !important;
    border-radius: 9px !important;
  }

  .qty-num {
    font-size: 14px;
    font-weight: 700;
    color: #1C1C1E;
    min-width: 18px;
    text-align: center;
  }

  /* ─── SUMMARY ─── */
  .summary-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }

  .summary-title {
    font-size: 15px;
    font-weight: 700;
    color: #1C1C1E;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .summary-label { font-size: 13px; color: #8E8E93; }
  .summary-value { font-size: 13px; font-weight: 600; color: #1C1C1E; }

  .total-row {
    font-size: 15px;
    font-weight: 700;
    color: #1C1C1E;
    margin-bottom: 0;
  }

  .total-price {
    font-size: 18px;
    font-weight: 800;
    color: #2D7A6E;
  }

  /* ─── ORDER BAR ─── */
  .order-bar {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 420px;
    background: rgba(253, 248, 243, 0.95);
    backdrop-filter: blur(12px);
    border-top: 1px solid rgba(0,0,0,0.06);
    z-index: 100;
  }

  .order-btn {
    background: #1C1C1E !important;
    color: #ffffff !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    letter-spacing: 0 !important;
    height: 54px !important;
    box-shadow: 0 6px 24px rgba(0,0,0,0.18) !important;
  }

  /* ─── BOTTOM SHEET ─── */
  .pb-safe {
    padding-bottom: max(24px, env(safe-area-inset-bottom));
  }

  .bs-handle {
    width: 36px; height: 4px;
    border-radius: 100px;
    background: rgba(0,0,0,0.12);
  }

  .bs-item-context {
    background: rgba(45,122,110,0.04);
  }

  .bs-icon-wrap {
    width: 38px; height: 38px;
    border-radius: 12px;
    background: rgba(45,122,110,0.1);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .bs-title {
    font-size: 15px;
    font-weight: 700;
    color: #1C1C1E;
    line-height: 1.2;
  }

  .bs-item-name {
    font-size: 12px;
    color: #8E8E93;
    margin-top: 1px;
  }

  .suggestion-chip {
    font-size: 12px !important;
    cursor: pointer;
  }

  /* ─── TRANSITION ─── */
  .cart-item-enter-active,
  .cart-item-leave-active {
    transition: all 0.3s ease;
  }

  .cart-item-enter-from {
    opacity: 0;
    transform: translateX(-16px);
  }

  .cart-item-leave-to {
    opacity: 0;
    transform: translateX(16px);
    max-height: 0;
  }
</style>