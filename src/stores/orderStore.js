import { defineStore } from 'pinia'
import orderService from '@/api/order'
import { isRef, toValue } from 'vue'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: []
  }),

  actions: {
    async createOrder(payload, loading) {
      const res = await orderService.createOrder(payload, loading)
      this.orders = res
      return res
    },
    async fetchOrderByTable(tableNumber) {
      const table = toValue(tableNumber)
      const { data } = await orderService.getOrderByTable(table)
      return data
    },
    async fetchAllOrders() {
      const { data } = await orderService.getAllOrder()
      this.orders = data
      return data
    },
    async placeOrder(payload) {
      const { data } = await orderService.placeOrder(payload)
      this.orders = data
      return data
    }
  }
})
