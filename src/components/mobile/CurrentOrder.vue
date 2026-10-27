<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue'
  import CustomAppHeader from './CustomAppHeader.vue'
  import { useOrderStore } from '@/stores/orderStore'
  import { useI18n } from 'vue-i18n'
  import { formatDateText, formatCurrency } from '@nong-official-dev/core'
  import { Barcode } from 'lucide-vue-next'
  import BaseButton from '@/components/ui/BaseButton.vue'
  import { useMenuNav } from '../../composables/useMenuNav'

  interface OrderItem {
    id: string | number
    product_name: string
    variant_name?: string
    note?: string
    quantity: number
    unit_price: number
  }

  interface Order {
    order_date?: string
    order_number?: string | number
    items?: OrderItem[]
  }

  defineEmits<{ close: [] }>()

  const { t } = useI18n()
  const { tableId } = useMenuNav()
  const orderStore = useOrderStore()
  const order = ref<Order>({})
  const isLoading = ref(true)

  const totalAmount = computed(() =>
    (order.value.items ?? []).reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  )

  onMounted(async () => {
    try {
      const response = await orderStore.fetchOrderByTable(tableId.value)
      order.value = response.data
    } catch (err) {
      console.error('Error fetching table order details:', err)
    } finally {
      isLoading.value = false
    }
  })
</script>

<template>
  <div class="min-h-dvh bg-ivory">
    <CustomAppHeader :title="t('header.orderHistory')" live @back="$emit('close')" />

    <div class="mx-auto max-w-lg p-4">
      <div class="rounded-card border border-charcoal/[0.06] bg-white p-6 shadow-soft">
        <div class="mb-6 text-center">
          <h2 class="text-sm font-extrabold uppercase tracking-wide text-charcoal">
            {{ t('common.orderedItems') }}
          </h2>
          <div class="mt-1 text-xs text-charcoal/40">
            {{ t('common.date') }}: {{ order.order_date ? formatDateText(order.order_date) : '—' }}
          </div>
          <div class="text-xs text-charcoal/40">
            {{ t('common.orderId') }}: #{{ order.order_number ?? '—' }}
          </div>
        </div>

        <div class="border-t border-dashed border-charcoal/15" />

        <div v-if="isLoading" class="space-y-3 py-6">
          <div v-for="n in 4" :key="n" class="h-4 animate-pulse rounded bg-charcoal/[0.06]" />
        </div>

        <template v-else>
          <table class="my-4 w-full text-sm">
            <thead>
              <tr class="border-b border-charcoal/10 text-xs text-charcoal/40">
                <th class="py-2 text-left font-semibold">{{ t('common.items') }}</th>
                <th class="py-2 text-center font-semibold">{{ t('common.quantity') }}</th>
                <th class="py-2 text-right font-semibold">{{ t('common.total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.id">
                <td class="py-2 align-top">
                  <div class="text-charcoal">{{ item.product_name }}</div>
                  <div v-if="item.variant_name" class="text-xs text-charcoal/40">
                    {{ item.variant_name }}
                  </div>
                  <div v-if="item.note" class="text-xs italic text-olive">{{ item.note }}</div>
                </td>
                <td class="py-2 text-center align-top text-charcoal">{{ item.quantity }}</td>
                <td class="py-2 text-right align-top font-semibold text-charcoal">
                  {{ formatCurrency(item.unit_price * item.quantity) }}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="border-t border-dashed border-charcoal/15" />

          <div class="mt-4 flex justify-between text-sm text-charcoal/70">
            <span>{{ t('common.subtotal') }}</span>
            <span>{{ formatCurrency(totalAmount) }}</span>
          </div>
          <div class="mb-4 flex justify-between text-sm text-charcoal/70">
            <span>{{ t('common.discount') }}</span>
            <span>{{ formatCurrency(0) }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-base font-extrabold text-charcoal">{{ t('common.total') }}</span>
            <span class="text-lg font-extrabold text-olive">{{ formatCurrency(totalAmount) }}</span>
          </div>

          <div class="mt-6 border-t border-dashed border-charcoal/15 pt-6 text-center">
            <Barcode :size="48" class="mx-auto text-charcoal/15" />
            <div class="mt-2 text-xs uppercase tracking-wide text-charcoal/40">
              {{ t('message.thank') }}
            </div>
          </div>
        </template>
      </div>

      <BaseButton full-width size="lg" class="mt-8" @click="$emit('close')">
        {{ t('btn.done') }}
      </BaseButton>
    </div>
  </div>
</template>
