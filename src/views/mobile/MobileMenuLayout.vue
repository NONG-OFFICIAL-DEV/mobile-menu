<script setup></script>

<template>
  <v-app class="bg-grey-lighten-5">
    <v-main>
      <router-view v-slot="{ Component, route }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </v-main>
  </v-app>
</template>
<style>
  /* Ensure the main area has enough space for the floating cart button */
  .pb-16 {
    padding-bottom: 120px !important;
  }
  /* 1. Page Switch: Fade and Slight Slide */
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.3s ease;
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateX(20px); /* Slides in from right */
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-20px); /* Slides out to left */
  }

  /* 2. List Filtering: Smooth items sliding */
  .list-stagger-enter-active,
  .list-stagger-leave-active {
    transition: all 0.4s ease;
  }

  .list-stagger-enter-from {
    opacity: 0;
    transform: translateY(15px);
  }

  .list-stagger-leave-to {
    opacity: 0;
    transform: scale(0.9);
  }

  /* 3. Floating Cart Button: Pop up effect */
  .pop-enter-active {
    animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .pop-leave-active {
    animation: pop-in 0.2s reverse;
  }

  @keyframes pop-in {
    0% {
      transform: scale(0.5) translateY(100px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  /* Ensures list items move smoothly when one is removed */
  .list-stagger-move {
    transition: transform 0.4s ease;
  }
</style>
