<script setup>
  import { computed, ref, onMounted } from 'vue'
  import CustomAppHeader from './CustomAppHeader.vue'
  import { useOrderStore } from '@/stores/orderStore'
  import { useDiningTableStore } from '../../stores/diningTableStore'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { useDate } from '@/composables/useDate'
  import { useLoadingStore } from '@/stores/loadingStore'
  import { useCurrency } from '@/composables/useCurrency.js'

  const loadingStore = useLoadingStore()
  const { formatCurrency } = useCurrency()

  defineEmits(['close'])
  const { t } = useI18n()
  const orderStore = useOrderStore()
  const diningTableStore = useDiningTableStore()
  const { formatDateText } = useDate()
  const route = useRoute()
  const token = route.params.token
  const order = ref({})

  const SERVICE_FEE = 0.5

  const totalAmount = computed(() =>
    (order.value.items ?? []).reduce((sum, item) => sum + item.price * item.qty, 0)
  )

  const grandTotal = computed(() => totalAmount.value + SERVICE_FEE)

  onMounted(async () => {
    try {
      const res = await diningTableStore.getTableNumberByToken(token)
      order.value = await orderStore.fetchOrderByTable(res.table.id)
    } catch (err) {
      console.error('Error fetching table or order details:', err)
    }
  })
</script>

<template>
  <div class="history-page">

    <!-- HEADER -->
    <CustomAppHeader
      :title="t('header.orderHistory')"
      live
      @back="$emit('close')"
    />

    <div class="page-content px-4 pb-10 pt-4">

      <!-- ── RECEIPT CARD ── -->
      <div class="receipt-card">

        <!-- Restaurant info -->
        <div class="receipt-top text-center px-6 pt-6 pb-4">
          <div class="restaurant-logo mx-auto mb-3">
            <v-avatar size="52" rounded="xl">
              <v-img
                src="https://i.pinimg.com/736x/24/35/1f/24351fd9348c232ffb57e24fc809d5a2.jpg"
                cover
              />
            </v-avatar>
          </div>
          <h2 class="receipt-restaurant">Siem Reap Kitchen</h2>
          <p class="receipt-meta mt-1">{{ t('common.orderedItems') }}</p>

          <!-- Order info pills -->
          <div class="d-flex align-center justify-center gap-2 mt-3 flex-wrap">
            <div class="info-pill">
              <v-icon size="12">mdi-calendar-outline</v-icon>
              {{ formatDateText(order.order_date) }}
            </div>
            <div class="info-pill">
              <v-icon size="12">mdi-pound</v-icon>
              {{ order.order_no }}
            </div>
          </div>
        </div>

        <!-- Tear edge -->
        <div class="tear-edge">
          <span v-for="n in 22" :key="n" class="tear-hole" />
        </div>

        <!-- Items -->
        <div class="receipt-body px-5 py-4">

          <!-- Header row -->
          <div class="item-header d-flex align-center mb-2">
            <span class="col-name">{{ t('common.items') }}</span>
            <span class="col-qty">{{ t('common.quantity') }}</span>
            <span class="col-price">{{ t('common.total') }}</span>
          </div>

          <div class="divider mb-3" />

          <!-- Skeleton -->
          <template v-if="loadingStore.isLoading">
            <div v-for="n in 4" :key="n" class="item-row mb-3 d-flex align-center">
              <v-skeleton-loader type="text" width="55%" />
              <v-skeleton-loader type="text" width="15%" class="mx-auto" />
              <v-skeleton-loader type="text" width="20%" />
            </div>
          </template>

          <!-- Items list -->
          <template v-else>
            <div
              v-for="item in order.items"
              :key="item.id"
              class="item-row d-flex align-start mb-3"
            >
              <div class="col-name">
                <div class="item-name">{{ item.name }}</div>
                <div v-if="item.variant_name" class="item-variant">{{ item.variant_name }}</div>
                <div v-if="item.note" class="item-note">
                  <v-icon size="10" color="#2D7A6E">mdi-note-text-outline</v-icon>
                  {{ item.note }}
                </div>
              </div>
              <div class="col-qty item-qty">× {{ item.qty }}</div>
              <div class="col-price item-total">{{ formatCurrency(item.price * item.qty) }}</div>
            </div>
          </template>

          <div class="divider mt-1 mb-4" />

          <!-- Subtotals -->
          <div class="summary-row mb-2">
            <span class="summary-label">{{ t('common.subtotal') }}</span>
            <span class="summary-value">{{ formatCurrency(totalAmount) }}</span>
          </div>
          <div class="summary-row mb-2">
            <span class="summary-label">{{ t('common.discount') }}</span>
            <span class="summary-value">$0.00</span>
          </div>
          <div class="summary-row mb-2">
            <span class="summary-label">Service fee</span>
            <span class="summary-value">{{ formatCurrency(SERVICE_FEE) }}</span>
          </div>

          <div class="divider mb-4" />

          <!-- Grand total -->
          <div class="total-row d-flex justify-space-between align-center">
            <span class="total-label">{{ t('common.total') }}</span>
            <span class="total-amount">{{ formatCurrency(grandTotal) }}</span>
          </div>
        </div>

        <!-- Tear edge bottom -->
        <div class="tear-edge tear-edge-bottom">
          <span v-for="n in 22" :key="n" class="tear-hole" />
        </div>

        <!-- Barcode footer -->
        <div class="receipt-footer text-center px-6 pt-4 pb-6">
          <div class="barcode-wrap mx-auto mb-3">
            <div
              v-for="n in 32"
              :key="n"
              class="barcode-bar"
              :style="{ height: `${28 + Math.sin(n * 1.8) * 10}px`, opacity: n % 3 === 0 ? 0.3 : 1 }"
            />
          </div>
          <p class="thank-you">✦ {{ t('message.thank') }} ✦</p>
        </div>
      </div>

      <!-- ── DONE BUTTON ── -->
      <v-btn
        block
        size="large"
        rounded="xl"
        class="done-btn mt-6"
        @click="$emit('close')"
      >
        <v-icon start>mdi-check</v-icon>
        {{ t('btn.done') }}
      </v-btn>

    </div>
  </div>
</template>

<style scoped>
  .history-page {
    background: #F0EDE8;
    min-height: 100dvh;
  }

  .page-content {
    max-width: 460px;
    margin: 0 auto;
  }

  /* ─── RECEIPT CARD ─── */
  .receipt-card {
    background: #FAFAF8;
    border-radius: 4px;
    box-shadow:
      0 4px 6px rgba(0,0,0,0.04),
      0 10px 40px rgba(0,0,0,0.08),
      0 2px 0 rgba(0,0,0,0.03);
    overflow: hidden;
    animation: slideUp 0.45s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─── RECEIPT TOP ─── */
  .receipt-restaurant {
    font-size: 18px;
    font-weight: 800;
    color: #1C1C1E;
    letter-spacing: -0.3px;
  }

  .receipt-meta {
    font-size: 12px;
    color: #8E8E93;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .info-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 100px;
    background: rgba(45, 122, 110, 0.08);
    border: 1px solid rgba(45, 122, 110, 0.15);
    font-size: 12px;
    color: #2D7A6E;
    font-weight: 500;
  }

  .gap-2 { gap: 8px; }

  /* ─── TEAR EDGE ─── */
  .tear-edge {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 -6px;
    margin: 0 -1px;
    background: #F0EDE8;
    position: relative;
    height: 16px;
    overflow: hidden;
  }

  .tear-edge-bottom {
    transform: scaleY(-1);
  }

  .tear-hole {
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #F0EDE8;
    flex-shrink: 0;
    margin: 0 1px;
  }

  /* ─── RECEIPT BODY ─── */
  .item-header {
    font-size: 11px;
    font-weight: 700;
    color: #8E8E93;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  .col-name  { flex: 1; padding-right: 8px; }
  .col-qty   { width: 48px; text-align: center; flex-shrink: 0; }
  .col-price { width: 72px; text-align: right; flex-shrink: 0; }

  .divider {
    border-top: 1.5px dashed #E0DDD8;
  }

  .item-row { align-items: flex-start; }

  .item-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #1C1C1E;
    line-height: 1.3;
  }

  .item-variant {
    font-size: 11px;
    color: #8E8E93;
    margin-top: 1px;
  }

  .item-note {
    font-size: 11px;
    color: #2D7A6E;
    font-style: italic;
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .item-qty {
    font-size: 13px;
    color: #8E8E93;
    font-weight: 500;
    padding-top: 2px;
  }

  .item-total {
    font-size: 13px;
    font-weight: 700;
    color: #1C1C1E;
    padding-top: 2px;
  }

  /* ─── SUMMARY ─── */
  .summary-row {
    display: flex;
    justify-content: space-between;
  }

  .summary-label {
    font-size: 13px;
    color: #8E8E93;
  }

  .summary-value {
    font-size: 13px;
    font-weight: 600;
    color: #1C1C1E;
  }

  /* ─── TOTAL ─── */
  .total-label {
    font-size: 17px;
    font-weight: 800;
    color: #1C1C1E;
  }

  .total-amount {
    font-size: 20px;
    font-weight: 800;
    color: #2D7A6E;
    letter-spacing: -0.5px;
  }

  /* ─── BARCODE ─── */
  .barcode-wrap {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 2px;
    height: 44px;
    width: 180px;
  }

  .barcode-bar {
    width: 3px;
    background: #1C1C1E;
    border-radius: 1px;
    flex-shrink: 0;
  }

  .thank-you {
    font-size: 11px;
    color: #8E8E93;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 4px;
  }

  /* ─── DONE BTN ─── */
  .done-btn {
    background: #1C1C1E !important;
    color: #ffffff !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    letter-spacing: 0 !important;
    height: 54px !important;
    box-shadow: 0 6px 20px rgba(0,0,0,0.14) !important;
  }
</style>