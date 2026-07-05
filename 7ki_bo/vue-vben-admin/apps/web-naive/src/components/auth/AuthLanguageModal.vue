<script lang="ts" setup>
import type { SupportedLanguagesType } from '@vben/locales';

import { computed, ref, watch } from 'vue';

import { SUPPORT_LANGUAGES } from '@vben/constants';
import { Languages } from '@vben/icons';
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';
import { NButton, NModal, NRadio, NRadioGroup } from 'naive-ui';

import { switchAppLocale } from '#/locales';

defineOptions({ name: 'AuthLanguageModal' });

withDefaults(
  defineProps<{
    /** Show as text link inside login card; otherwise icon button for toolbar */
    inline?: boolean;
  }>(),
  {
    inline: false,
  },
);

const show = ref(false);
const selected = ref<SupportedLanguagesType>(preferences.app.locale);
const switching = ref(false);

const currentLabel = computed(
  () =>
    SUPPORT_LANGUAGES.find((item) => item.value === preferences.app.locale)
      ?.label ?? 'English',
);

function open() {
  selected.value = preferences.app.locale;
  show.value = true;
}

async function handleConfirm() {
  if (switching.value) return;

  const locale = selected.value;
  switching.value = true;
  try {
    await switchAppLocale(locale);
    show.value = false;
  } finally {
    switching.value = false;
  }
}

watch(
  () => preferences.app.locale,
  (locale) => {
    selected.value = locale;
  },
);
</script>

<template>
  <NButton
    v-if="inline"
    class="text-muted-foreground"
    quaternary
    size="small"
    @click="open"
  >
    <template #icon>
      <Languages class="size-4" />
    </template>
    {{ currentLabel }}
  </NButton>
  <NButton v-else circle quaternary @click="open">
    <template #icon>
      <Languages class="size-4" />
    </template>
  </NButton>

  <NModal
    v-model:show="show"
    preset="card"
    :title="$t('authentication.selectLanguage')"
    style="width: 400px"
    :mask-closable="true"
  >
    <NRadioGroup v-model:value="selected" class="w-full">
      <div class="flex flex-col gap-4 py-2">
        <NRadio
          v-for="lang in SUPPORT_LANGUAGES"
          :key="lang.value"
          :value="lang.value"
          class="!items-center"
        >
          {{ lang.label }}
        </NRadio>
      </div>
    </NRadioGroup>
    <template #footer>
      <div class="flex justify-end gap-2">
        <NButton @click="show = false">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="switching" @click="handleConfirm">
          {{ $t('common.confirm') }}
        </NButton>
      </div>
    </template>
  </NModal>
</template>
