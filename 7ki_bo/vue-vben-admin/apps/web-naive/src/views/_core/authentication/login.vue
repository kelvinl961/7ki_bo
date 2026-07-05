<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, markRaw } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { useI18n } from '@vben/locales';

import { useAuthStore } from '#/store';

import AuthLanguageModal from '#/components/auth/AuthLanguageModal.vue';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const { locale, t } = useI18n();

const formSchema = computed((): VbenFormSchema[] => {
  // Track locale so labels/placeholders update immediately after language change.
  void locale.value;

  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: t('authentication.username'),
      rules: z.string().min(1, { message: t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: t('authentication.password'),
      },
      fieldName: 'password',
      label: t('authentication.password'),
      rules: z.string().min(1, { message: t('authentication.passwordTip') }),
    },
    {
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: t('authentication.verifyRequiredTip'),
      }),
    },
  ];
});
</script>

<template>
  <div>
    <AuthenticationLogin
      :key="locale"
      :form-schema="formSchema"
      :loading="authStore.loginLoading"
      @submit="authStore.authLogin"
    />
    <div class="mt-4 flex justify-center">
      <AuthLanguageModal inline />
    </div>
  </div>
</template>
