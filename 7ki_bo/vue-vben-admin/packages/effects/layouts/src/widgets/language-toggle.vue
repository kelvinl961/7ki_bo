<script setup lang="ts">
import type { SupportedLanguagesType } from '@vben/locales';

import { SUPPORT_LANGUAGES } from '@vben/constants';
import { Languages } from '@vben/icons';
import { changeAppLocale } from '@vben/locales';
import { preferences } from '@vben/preferences';

import { VbenDropdownRadioMenu, VbenIconButton } from '@vben-core/shadcn-ui';

defineOptions({
  name: 'LanguageToggle',
});

async function handleUpdate(value: string | undefined) {
  if (!value) return;
  const locale = value as SupportedLanguagesType;
  if (locale === preferences.app.locale) return;
  await changeAppLocale(locale);
}
</script>

<template>
  <div>
    <VbenDropdownRadioMenu
      :menus="SUPPORT_LANGUAGES"
      :model-value="preferences.app.locale"
      @update:model-value="handleUpdate"
    >
      <VbenIconButton>
        <Languages class="text-foreground size-4" />
      </VbenIconButton>
    </VbenDropdownRadioMenu>
  </div>
</template>
