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

  const totalAmount = computed(() => {
    return (order.value.items ?? []).reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    )
  })

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
  <CustomAppHeader
    :title="t('header.orderHistory')"
    live
    @back="$emit('close')"
  />
  <v-container class="max-width-500 pa-4">
    <v-card variant="flat" class="receipt-paper pa-6 rounded-0 shadow-lg">
      <div class="text-center mb-6">
        <h2 class="text-h6 font-weight-black text-uppercase">
          {{ t('common.orderedItems') }}
        </h2>
        <div class="text-caption">
          {{ t('common.date') }}: {{ formatDateText(order.order_date) }}
        </div>
        <div class="text-caption">
          {{ t('common.orderId') }}: #{{ order.order_no }}
        </div>
      </div>
      <div class="receipt-divider mb-4"></div>
      <v-table density="compact" class="bg-transparent mb-4">
        <thead>
          <tr>
            <th class="text-left text-caption px-0" width="150">
              {{ t('common.items') }}
            </th>
            <th class="text-center text-caption px-0">
              {{ t('common.quantity') }}
            </th>
            <th class="text-right text-caption px-0">
              {{ t('common.total') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.items" :key="item.id">
            <td class="text-body-2 font-weight-bold px-0" width="150">
              {{ item.name }}
              <div
                v-if="item.variant_name"
                class="text-caption text-grey-darken-1"
              >
                {{ item.variant_name }}
              </div>

              <div
                v-if="item.note"
                class="text-caption text-primary italic-note"
              >
                {{ item.note }}
              </div>
            </td>
            <td class="text-center text-body-2 px-0">{{ item.qty }}</td>
            <td class="text-right text-body-2 px-0">
              {{ formatCurrency(item.price * item.qty) }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-skeleton-loader
        v-if="loadingStore.isLoading"
        class="bg-transparent mb-4"
        type="table-row@4"
      ></v-skeleton-loader>

      <div class="receipt-divider mb-4"></div>

      <div class="d-flex justify-space-between mb-1">
        <span class="text-body-2">{{ t('common.subtotal') }}</span>
        <span class="text-body-2">{{ formatCurrency(totalAmount) }}</span>
      </div>
      <div class="d-flex justify-space-between mb-4">
        <span class="text-body-2">{{ t('common.discount') }}</span>
        <span class="text-body-2">$0.00</span>
      </div>

      <div class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-black">{{ t('common.total') }}</span>
        <span class="text-h6 font-weight-black text-primary">
          {{ formatCurrency(totalAmount) }}
        </span>
      </div>

      <div class="receipt-divider mt-6 mb-4"></div>

      <div class="text-center">
        <v-icon size="64" color="grey-lighten-2">mdi-barcode</v-icon>
        <div class="text-caption text-grey mt-2 text-uppercase">
          {{ t('message.thank') }}
        </div>
      </div>
    </v-card>

    <v-btn
      block
      class="mt-8 rounded-pill"
      color="primary"
      size="large"
      @click="$emit('close')"
    >
      {{ t('btn.done') }}
    </v-btn>
  </v-container>
</template>

<style scoped>
  .max-width-500 {
    max-width: 500px;
    margin: 0 auto;
  }

  /* Make it look like paper */
  .receipt-paper {
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    position: relative;
  }

  /* Dashed line effect */
  .receipt-divider {
    border-top: 2px dashed #e0e0e0;
    height: 1px;
    width: 100%;
  }

  /* Table styling for receipt look */
  :deep(.v-table .v-table__wrapper > table > thead > tr > th) {
    border-bottom: 1px solid #eeeeee !important;
    height: 30px !important;
  }
  :deep(.v-table .v-table__wrapper > table > tbody > tr > td) {
    border-bottom: none !important;
    height: 40px !important;
  }
</style>
