<script setup>
  import { onMounted, ref } from 'vue'

  defineEmits(['back', 'reset', 'view-history'])

  // Animate checkmark on mount
  const visible = ref(false)
  onMounted(() => {
    setTimeout(() => { visible.value = true }, 80)
  })

  // Fun order number
  const orderNum = Math.floor(1000 + Math.random() * 9000)
</script>

<template>
  <div class="success-page d-flex flex-column align-center">

    <!-- ── CONFETTI DOTS ── -->
    <div class="confetti-wrap" aria-hidden="true">
      <span v-for="n in 18" :key="n" class="dot" :class="`dot-${n}`" />
    </div>

    <!-- ── MAIN CONTENT ── -->
    <div class="content d-flex flex-column align-center px-6 text-center">

      <!-- Check circle -->
      <div class="check-ring" :class="{ show: visible }">
        <div class="check-inner">
          <svg viewBox="0 0 52 52" class="check-svg">
            <circle cx="26" cy="26" r="25" class="check-circle" />
            <path d="M14.5 26.5 L22 34 L37 19" class="check-tick" />
          </svg>
        </div>
      </div>

      <!-- Text -->
      <h1 class="success-title mt-6">Order Placed!</h1>
      <p class="success-sub mt-2">
        Your dishes are on their way to the kitchen.<br>
        Sit back and relax 🍽️
      </p>

      <!-- Order tag -->
      <div class="order-tag mt-5 d-flex align-center gap-2">
        <v-icon size="15" color="#2D7A6E">mdi-receipt-outline</v-icon>
        <span>Order <strong>#{{ orderNum }}</strong> confirmed</span>
      </div>

      <!-- Steps -->
      <div class="steps-card mt-6 w-100">
        <div class="step d-flex align-center gap-3">
          <div class="step-dot active" />
          <div class="step-info">
            <div class="step-title">Order received</div>
            <div class="step-sub">Just now</div>
          </div>
          <v-icon size="16" color="#2D7A6E" class="ml-auto">mdi-check-circle</v-icon>
        </div>
        <div class="step-line" />
        <div class="step d-flex align-center gap-3">
          <div class="step-dot pulse" />
          <div class="step-info">
            <div class="step-title">Kitchen preparing</div>
            <div class="step-sub">Estimated 15–20 min</div>
          </div>
        </div>
        <div class="step-line" />
        <div class="step d-flex align-center gap-3">
          <div class="step-dot inactive" />
          <div class="step-info">
            <div class="step-title">Ready to serve</div>
            <div class="step-sub">We'll bring it to your table</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── ACTIONS ── -->
    <div class="actions-bar px-6 pb-10 d-flex flex-column gap-3 w-100">
      <v-btn
        block
        size="large"
        rounded="xl"
        class="primary-btn"
        prepend-icon="mdi-history"
        @click="$emit('view-history')"
      >
        Track My Order
      </v-btn>

      <v-btn
        block
        size="large"
        rounded="xl"
        variant="tonal"
        color="#2D7A6E"
        prepend-icon="mdi-silverware-fork-knife"
        @click="$emit('reset')"
      >
        Order More
      </v-btn>
    </div>

  </div>
</template>

<style scoped>
  /* ─── PAGE ─── */
  .success-page {
    background: #FDF8F3;
    min-height: 100dvh;
    position: relative;
    overflow: hidden;
    padding-top: 70px;
  }

  .content {
    flex: 1;
    width: 100%;
    max-width: 420px;
    z-index: 1;
  }

  /* ─── CONFETTI ─── */
  .confetti-wrap {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .dot {
    position: absolute;
    border-radius: 50%;
    animation: confettiFall 2.6s ease-in-out both;
  }

  /* sizes & colors */
  .dot-1  { width:10px; height:10px; background:#2D7A6E; top:4%;  left:10%;  animation-delay:.1s; }
  .dot-2  { width:7px;  height:7px;  background:#E8A84A; top:6%;  left:25%;  animation-delay:.3s; }
  .dot-3  { width:12px; height:12px; background:#3b9285; top:3%;  left:42%;  animation-delay:.05s;}
  .dot-4  { width:8px;  height:8px;  background:#E8A84A; top:8%;  left:60%;  animation-delay:.25s;}
  .dot-5  { width:6px;  height:6px;  background:#2D7A6E; top:4%;  left:78%;  animation-delay:.15s;}
  .dot-6  { width:10px; height:10px; background:#E8A84A; top:12%; left:88%;  animation-delay:.4s; }
  .dot-7  { width:7px;  height:7px;  background:#3b9285; top:16%; left:5%;   animation-delay:.2s; }
  .dot-8  { width:9px;  height:9px;  background:#2D7A6E; top:2%;  left:55%;  animation-delay:.35s;}
  .dot-9  { width:6px;  height:6px;  background:#E8A84A; top:10%; left:35%;  animation-delay:.45s;}
  .dot-10 { width:11px; height:11px; background:#2D7A6E; top:18%; left:70%;  animation-delay:.1s; }
  .dot-11 { width:8px;  height:8px;  background:#3b9285; top:5%;  left:90%;  animation-delay:.55s;}
  .dot-12 { width:7px;  height:7px;  background:#E8A84A; top:14%; left:18%;  animation-delay:.3s; }
  .dot-13 { width:10px; height:10px; background:#2D7A6E; top:20%; left:48%;  animation-delay:.15s;}
  .dot-14 { width:6px;  height:6px;  background:#E8A84A; top:8%;  left:82%;  animation-delay:.5s; }
  .dot-15 { width:9px;  height:9px;  background:#3b9285; top:1%;  left:68%;  animation-delay:.2s; }
  .dot-16 { width:7px;  height:7px;  background:#2D7A6E; top:16%; left:30%;  animation-delay:.4s; }
  .dot-17 { width:8px;  height:8px;  background:#E8A84A; top:22%; left:58%;  animation-delay:.25s;}
  .dot-18 { width:6px;  height:6px;  background:#3b9285; top:12%; left:94%;  animation-delay:.6s; }

  @keyframes confettiFall {
    0%   { opacity: 0; transform: translateY(-20px) rotate(0deg); }
    20%  { opacity: 1; }
    80%  { opacity: 0.6; }
    100% { opacity: 0; transform: translateY(60px) rotate(180deg); }
  }

  /* ─── CHECK RING ─── */
  .check-ring {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: rgba(45, 122, 110, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(0.4);
    opacity: 0;
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
  }

  .check-ring.show {
    transform: scale(1);
    opacity: 1;
  }

  .check-inner {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #2D7A6E;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 28px rgba(45, 122, 110, 0.35);
  }

  .check-svg {
    width: 46px;
    height: 46px;
  }

  .check-circle {
    fill: none;
    stroke: none;
  }

  .check-tick {
    fill: none;
    stroke: #ffffff;
    stroke-width: 3.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 40;
    stroke-dashoffset: 40;
    animation: drawTick 0.5s ease 0.45s forwards;
  }

  @keyframes drawTick {
    to { stroke-dashoffset: 0; }
  }

  /* ─── TEXT ─── */
  .success-title {
    font-size: 26px;
    font-weight: 800;
    color: #1C1C1E;
    letter-spacing: -0.5px;
  }

  .success-sub {
    font-size: 14px;
    color: #8E8E93;
    line-height: 1.6;
  }

  /* ─── ORDER TAG ─── */
  .order-tag {
    background: rgba(45, 122, 110, 0.08);
    border: 1px solid rgba(45, 122, 110, 0.18);
    border-radius: 100px;
    padding: 7px 16px;
    font-size: 13px;
    color: #2D7A6E;
  }

  .gap-2 { gap: 8px; }

  /* ─── STEPS ─── */
  .steps-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 18px 20px;
    box-shadow: 0 2px 14px rgba(0,0,0,0.05);
    text-align: left;
  }

  .step {
    position: relative;
  }

  .gap-3 { gap: 12px; }

  .step-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .step-dot.active   { background: #2D7A6E; }
  .step-dot.inactive { background: #E0E0E0; }

  .step-dot.pulse {
    background: #E8A84A;
    box-shadow: 0 0 0 0 rgba(232,168,74,0.5);
    animation: pulseRing 1.5s ease-out infinite;
  }

  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0 rgba(232,168,74,0.5); }
    70%  { box-shadow: 0 0 0 8px rgba(232,168,74,0); }
    100% { box-shadow: 0 0 0 0 rgba(232,168,74,0); }
  }

  .step-line {
    width: 2px;
    height: 22px;
    background: #F0F0F0;
    margin: 4px 0 4px 5px;
  }

  .step-title {
    font-size: 13px;
    font-weight: 600;
    color: #1C1C1E;
  }

  .step-sub {
    font-size: 11px;
    color: #8E8E93;
    margin-top: 1px;
  }

  /* ─── ACTIONS ─── */
  .actions-bar {
    width: 100%;
    max-width: 420px;
    margin-top: 28px;
  }

  .gap-3 { gap: 12px; }

  .primary-btn {
    background: #1C1C1E !important;
    color: #ffffff !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    letter-spacing: 0 !important;
    height: 54px !important;
    box-shadow: 0 6px 20px rgba(0,0,0,0.16) !important;
  }
</style>