<template>
  <MotionConfig :reduced-motion="'user'">
    <div class="min-h-dvh bg-ivory">
      <Notif />
      <Confirm />
      <router-view />
    </div>
  </MotionConfig>
</template>

<script setup>
  import { MotionConfig } from 'motion-v'
  import Notif from '@/components/global/Notification.vue'
  import Confirm from '@/components/global/Confirm.vue'
</script>

<style>
  html,
  body {
    overflow-y: auto;
    width: 100%;
    overflow-x: hidden;
    overscroll-behavior-x: none;
    height: 100%;
  }

  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #292720;
    -webkit-text-size-adjust: 100%;
  }

  ::-webkit-scrollbar {
    display: none;
  }
</style>
