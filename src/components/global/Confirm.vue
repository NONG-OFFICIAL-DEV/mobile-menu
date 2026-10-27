<script setup lang="ts">
  import { computed } from 'vue'
  import { Trash2, AlertTriangle, Info, Check } from 'lucide-vue-next'
  import { useI18n } from 'vue-i18n'
  import { useUiStore } from '@/stores/uiStore'
  import BaseBottomSheet from '@/components/ui/BaseBottomSheet.vue'
  import BaseButton from '@/components/ui/BaseButton.vue'

  const { t } = useI18n()
  const ui = useUiStore()

  const open = computed({
    get: () => !!ui.confirmState,
    set: value => {
      if (!value) ui.cancelConfirm()
    }
  })

  const type = computed(() => ui.confirmState?.options?.type ?? 'error')

  const icon = computed(() => ({ error: Trash2, warning: AlertTriangle, info: Info }[type.value]))

  const ringClasses: Record<string, string> = {
    error: 'bg-red-50 text-red-600',
    warning: 'bg-amber-50 text-amber-600',
    info: 'bg-olive/10 text-olive'
  }
</script>

<template>
  <BaseBottomSheet v-model="open">
    <div v-if="ui.confirmState" class="flex flex-col items-center px-6 pb-6 pt-2 text-center">
      <div class="mb-4 flex h-15 w-15 items-center justify-center rounded-full" :class="ringClasses[type]">
        <component :is="icon" :size="26" aria-hidden="true" />
      </div>

      <h2 class="text-[17px] font-extrabold text-charcoal">{{ ui.confirmState.title }}</h2>
      <p v-if="ui.confirmState.message" class="mt-2 text-[13px] text-charcoal/50">
        {{ ui.confirmState.message }}
      </p>

      <div class="mt-6 flex w-full gap-3">
        <BaseButton variant="secondary" full-width @click="ui.cancelConfirm()">
          {{ ui.confirmState.options?.denyBtnText || t('btn.cancel') }}
        </BaseButton>
        <BaseButton :variant="type === 'error' ? 'danger' : 'primary'" full-width @click="ui.agreeConfirm()">
          <template #icon-left><Check :size="16" /></template>
          {{ ui.confirmState.options?.agreeBtnText || t('btn.yes') }}
        </BaseButton>
      </div>
    </div>
  </BaseBottomSheet>
</template>
