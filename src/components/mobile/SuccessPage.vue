<script setup>
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
</script>
<template>
  <v-container class="px-5 pt-4 pb-16 mb-5">
    <v-row justify="center" align="center">
      <v-col cols="12" class="text-center">
        <v-icon size="100" color="success" class="mb-4">mdi-chef-hat</v-icon>

        <h1 class="text-h5 font-weight-bold mb-2">
          {{ t('message.confirmed') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-6">
          {{ t('message.wating') }}
          <br />
          {{ t('message.ready') }}
        </p>

        <!-- <v-card
          variant="outlined"
          class="mx-auto mb-8 rounded-lg"
          max-width="300"
        >
          <v-card-text class="d-flex justify-space-between">
            <span>Order Number:</span>
            <span class="font-weight-black">#4402</span>
          </v-card-text>
        </v-card> -->

        <v-btn
          color="primary"
          variant="flat"
          size="large"
          rounded="pill"
          block
          class="mb-3"
          @click="$emit('reset')"
        >
          {{ t('btn.orderMore') }}
        </v-btn>

        <v-btn
          variant="text"
          color="grey"
          rounded="pill"
          @click="$emit('view-history')"
        >
          {{ t('btn.viewHistory') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
