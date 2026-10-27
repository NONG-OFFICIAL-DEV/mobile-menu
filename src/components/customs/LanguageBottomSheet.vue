<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { Check } from 'lucide-vue-next'
  import BaseBottomSheet from '@/components/ui/BaseBottomSheet.vue'

  withDefaults(
    defineProps<{
      stackedBtn?: boolean
      iconBtn?: boolean
    }>(),
    { stackedBtn: true, iconBtn: true }
  )

  const { locale, t } = useI18n()

  const sheetOpen = ref(false)

  const languages = computed(() => [
    { lang: 'km', imgSrc: 'https://flagcdn.com/w80/kh.png', alt: 'Khmer flag', label: t('lang.km') },
    { lang: 'en', imgSrc: 'https://flagcdn.com/w80/gb.png', alt: 'English flag', label: t('lang.en') }
  ])

  const currentLanguageImage = computed(() =>
    locale.value === 'en' ? 'https://flagcdn.com/w80/gb.png' : 'https://flagcdn.com/w80/kh.png'
  )

  function switchLanguage(lang: string) {
    sheetOpen.value = false
    locale.value = lang
    localStorage.setItem('lang', lang)
  }

  onMounted(() => {
    const savedLang = localStorage.getItem('lang')
    if (savedLang) locale.value = savedLang
  })
</script>

<template>
  <button
    v-if="iconBtn"
    type="button"
    class="inline-flex h-9 w-9 items-center justify-center rounded-card border border-charcoal/10 bg-white shadow-soft transition-transform active:scale-90"
    :title="locale"
    :aria-label="t('common.selectLanguage')"
    @click="sheetOpen = true"
  >
    <img :src="currentLanguageImage" alt="" class="h-6 w-6 rounded-full object-cover" />
  </button>

  <button
    v-if="stackedBtn"
    type="button"
    class="inline-flex items-center gap-2 rounded-pill border border-charcoal/10 bg-white px-3 py-1.5"
    :aria-label="t('common.selectLanguage')"
    @click="sheetOpen = true"
  >
    <img :src="currentLanguageImage" alt="" class="h-6 w-6 rounded-full object-cover" />
    <span class="text-sm font-semibold uppercase">{{ locale }}</span>
  </button>

  <BaseBottomSheet v-model="sheetOpen">
    <div class="px-5 pb-2">
      <h2 class="mb-4 text-lg font-bold text-charcoal">{{ t('common.selectLanguage') }}</h2>
      <ul class="flex flex-col gap-2">
        <li v-for="item in languages" :key="item.lang">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-pill border px-4 py-3 text-left transition-colors"
            :class="locale === item.lang ? 'border-olive bg-olive/5' : 'border-charcoal/10'"
            @click="switchLanguage(item.lang)"
          >
            <img :src="item.imgSrc" :alt="item.alt" class="h-7 w-7 rounded-full object-cover" />
            <span class="flex-1 font-semibold text-charcoal">{{ item.label }}</span>
            <Check v-if="locale === item.lang" :size="18" class="text-olive" />
          </button>
        </li>
      </ul>
    </div>
  </BaseBottomSheet>
</template>
