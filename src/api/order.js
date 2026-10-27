import http from './api'

export default {
  getAllOrder() {
    return http.get('/orders')
  },
  createOrder(payload, loading) {
    return http.post('/orders', payload, {
      meta: { loader: loading }
    })
  },
  getOrderByTable(tableNumber) {
    return http.get(`v1/public/orders/table/${tableNumber}`)
  },
  getSessionHistory(tableId) {
    return http.get(`v1/public/orders/table/${tableId}/history`)
  },
  placeOrder(payload) {
    return http.post(`v1/public/orders`, payload)
  }
}
