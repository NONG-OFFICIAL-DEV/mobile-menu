<script setup>
  defineProps({
    totalItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: [Number, String],
      default: 0,
    },
  })

  defineEmits(['open'])
</script>

<template>
  <div class="cart-float-wrap" @click="$emit('open')">
    <v-card flat class="cart-float-card d-flex align-center px-4 py-3">

      <!-- Item count badge -->
      <div class="cart-count-badge mr-3 d-flex align-center justify-center">
        <span>{{ totalItems }}</span>
      </div>

      <!-- Label -->
      <div class="flex-grow-1">
        <div class="cart-label">View Cart</div>
        <div class="cart-sub">Tap to review your order</div>
      </div>

      <!-- Price + Arrow -->
      <div class="d-flex align-center gap-1">
        <span class="cart-price">${{ Number(totalPrice).toFixed(2) }}</span>
        <v-icon size="18" color="#E8A84A">mdi-chevron-right</v-icon>
      </div>

    </v-card>
  </div>
</template>

<style scoped>
  .cart-float-wrap {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    max-width: 420px;
    z-index: 200;
    cursor: pointer;
  }

  .cart-float-card {
    background: #1C1C1E !important;
    border-radius: 20px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.22) !important;
    min-height: 62px;
    transition: transform 0.15s;
  }

  .cart-float-wrap:active .cart-float-card {
    transform: scale(0.97);
  }

  /* Badge */
  .cart-count-badge {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: #2D7A6E;
    flex-shrink: 0;
  }

  .cart-count-badge span {
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
  }

  /* Text */
  .cart-label {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.2;
  }

  .cart-sub {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    margin-top: 1px;
  }

  /* Price */
  .cart-price {
    font-size: 15px;
    font-weight: 800;
    color: #E8A84A;
    letter-spacing: -0.3px;
  }

  .gap-1 { gap: 4px; }
</style>