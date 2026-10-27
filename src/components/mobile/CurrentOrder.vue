<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import CustomAppHeader from './CustomAppHeader.vue'
  import { useOrderStore } from '@/stores/orderStore'
  import { useDigitalMenuStore } from '@/stores/digitalMenuStore'
  import { useI18n } from 'vue-i18n'
  import { formatDateText } from '@nong-official-dev/core'
  import { Barcode } from 'lucide-vue-next'
  import BaseButton from '@/components/ui/BaseButton.vue'
  import BaseBadge from '@/components/ui/BaseBadge.vue'
  import { useMoney } from '@/composables/useMoney'
  import { useMenuNav } from '../../composables/useMenuNav'

  interface OrderItemModifier {
    name: string
    price: number
  }

  interface OrderItem {
    id: string | number
    product_name: string
    variant_name?: string | null
    notes?: string | null
    quantity: number
    unit_price: number
    total_price: number
    modifiers?: OrderItemModifier[]
  }

  interface Order {
    id: string
    order_number: string
    status: string
    created_at: string
    order_date?: string | null
    subtotal: number
    discount_amount: number
    tax_amount: number
    service_charge_amount: number
    total_amount: number
    items: OrderItem[]
  }

  defineEmits<{ close: [] }>()

  const { t } = useI18n()
  const { tableId } = useMenuNav()
  const orderStore = useOrderStore()
  const digitalMenuStore = useDigitalMenuStore()
  const { formatMoney } = useMoney()
  const orders = ref<Order[]>([])
  const isLoading = ref(true)

  function currency(value: number) {
    return formatMoney(value, digitalMenuStore.currency)
  }

  // `order_date` is unreliable (comes back null even for real orders) —
  // `created_at` is always populated, so it's the real source of truth.
  function orderDate(order: Order) {
    return formatDateText(order.order_date || order.created_at)
  }

  const statusTone: Record<string, 'neutral' | 'olive' | 'warning' | 'danger'> = {
    pending: 'warning',
    in_progress: 'warning',
    completed: 'olive',
    cancelled: 'danger',
    refunded: 'danger'
  }

  function statusLabel(status: string) {
    return status.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
  }

  const summary = computed(() => ({
    orderCount: orders.value.length,
    itemCount: orders.value.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    ),
    grandTotal: orders.value.reduce((sum, o) => sum + o.total_amount, 0)
  }))

  onMounted(async () => {
    try {
      const response = await orderStore.fetchSessionHistory(tableId.value)
      orders.value = response.data ?? []
    } catch (err) {
      console.error('Error fetching table order history:', err)
    } finally {
      isLoading.value = false
    }
  })
</script>

<template>
  <div class="min-h-dvh bg-ivory">
    <CustomAppHeader :title="t('header.orderHistory')" live @back="$emit('close')" />

    <div class="mx-auto max-w-lg space-y-4 p-4">
      <div v-if="isLoading" class="space-y-3 py-6">
        <div v-for="n in 4" :key="n" class="h-20 animate-pulse rounded-card bg-charcoal/[0.06]" />
      </div>

      <div
        v-else-if="orders.length === 0"
        class="flex flex-col items-center py-16 text-center text-charcoal/50"
      >
        <Barcode :size="40" class="mb-3 text-charcoal/20" />
        <p class="text-sm">{{ t('common.emptyCart') }}</p>
      </div>

      <div
        v-else
        class="grid grid-cols-3 divide-x divide-charcoal/10 rounded-card border border-charcoal/[0.06] bg-white p-4 shadow-soft"
      >
        <div class="text-center">
          <div class="text-lg font-extrabold text-charcoal">{{ summary.orderCount }}</div>
          <div class="text-xs text-charcoal/40">{{ t('common.totalOrders') }}</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-extrabold text-charcoal">{{ summary.itemCount }}</div>
          <div class="text-xs text-charcoal/40">{{ t('common.totalItems') }}</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-extrabold text-olive">{{ currency(summary.grandTotal) }}</div>
          <div class="text-xs text-charcoal/40">{{ t('common.grandTotal') }}</div>
        </div>
      </div>

      <div
        v-for="order in orders"
        :key="order.id"
        class="rounded-card border border-charcoal/[0.06] bg-white p-6 shadow-soft"
      >
        <div class="mb-6 flex items-start justify-between">
          <div class="text-left">
            <h2 class="text-sm font-extrabold uppercase tracking-wide text-charcoal">
              {{ t('common.orderId') }}: #{{ order.order_number }}
            </h2>
            <div class="mt-1 text-xs text-charcoal/40">
              {{ t('common.date') }}: {{ orderDate(order) }}
            </div>
          </div>
          <BaseBadge :tone="statusTone[order.status] ?? 'neutral'">
            {{ statusLabel(order.status) }}
          </BaseBadge>
        </div>

        <div class="border-t border-dashed border-charcoal/15" />

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
                <div v-if="item.modifiers?.length" class="text-xs text-charcoal/40">
                  {{ item.modifiers.map(m => m.name).join(', ') }}
                </div>
                <div v-if="item.notes" class="text-xs italic text-olive">{{ item.notes }}</div>
              </td>
              <td class="py-2 text-center align-top text-charcoal">{{ item.quantity }}</td>
              <td class="py-2 text-right align-top font-semibold text-charcoal">
                {{ currency(item.total_price) }}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="border-t border-dashed border-charcoal/15" />

        <div class="mt-4 flex justify-between text-sm text-charcoal/70">
          <span>{{ t('common.subtotal') }}</span>
          <span>{{ currency(order.subtotal) }}</span>
        </div>
        <div v-if="order.discount_amount" class="flex justify-between text-sm text-charcoal/70">
          <span>{{ t('common.discount') }}</span>
          <span>-{{ currency(order.discount_amount) }}</span>
        </div>
        <div v-if="order.tax_amount" class="flex justify-between text-sm text-charcoal/70">
          <span>{{ t('common.tax') }}</span>
          <span>{{ currency(order.tax_amount) }}</span>
        </div>
        <div v-if="order.service_charge_amount" class="mb-4 flex justify-between text-sm text-charcoal/70">
          <span>{{ t('common.serviceCharge') }}</span>
          <span>{{ currency(order.service_charge_amount) }}</span>
        </div>

        <div class="mt-2 flex items-center justify-between">
          <span class="text-base font-extrabold text-charcoal">{{ t('common.total') }}</span>
          <span class="text-lg font-extrabold text-olive">{{ currency(order.total_amount) }}</span>
        </div>
      </div>

      <div v-if="orders.length" class="pt-2 text-center text-xs uppercase tracking-wide text-charcoal/40">
        {{ t('message.thank') }}
      </div>

      <BaseButton full-width size="lg" class="mt-4" @click="$emit('close')">
        {{ t('btn.done') }}
      </BaseButton>
    </div>
  </div>
</template>
