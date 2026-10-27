import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface CartItemModifier {
  id: string | number
  name: string
  price: number
}

export interface CartItem {
  id: string | number
  menu_id: string | number
  variant_id?: string | number | null
  name: string
  image_url?: string
  // Resolved absolute unit price for this exact configuration
  // (product.base_price + variant.price_adjustment + sum of modifier prices).
  base_price: number
  qty: number
  size?: string
  modifiers?: CartItemModifier[]
  note?: string
}

const STORAGE_KEY = 'coffee_shop_cart'

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    ('id' in v && (typeof v.id === 'string' || typeof v.id === 'number')) &&
    typeof v.qty === 'number' &&
    typeof v.base_price === 'number' &&
    typeof v.name === 'string'
  )
}

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCartItem)
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadFromStorage())

  watch(
    items,
    newItems => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
    },
    { deep: true }
  )

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))
  const cartTotal = computed(() => items.value.reduce((sum, i) => sum + i.base_price * i.qty, 0))

  // `item.qty` is the quantity to ADD (defaults to 1), not the final total —
  // lets a single call add N units of one configuration at once.
  function addToCart(item: CartItem) {
    const qty = item.qty ?? 1
    const existing = items.value.find(i => i.id === item.id)
    if (existing) {
      existing.qty += qty
    } else {
      items.value.push({ ...item, qty })
    }
  }

  function updateQty(id: string | number, delta: number) {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    item.qty += delta
    if (item.qty <= 0) {
      items.value = items.value.filter(i => i.id !== id)
    }
  }

  function updateNote(id: string | number, note: string) {
    const item = items.value.find(i => i.id === id)
    if (item) item.note = note
  }

  function clearCart() {
    items.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  return { items, totalItems, cartTotal, addToCart, updateQty, updateNote, clearCart }
})
