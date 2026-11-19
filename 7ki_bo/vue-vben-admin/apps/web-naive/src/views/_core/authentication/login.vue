<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, markRaw, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { useI18n } from '@vben/locales';

import { NAlert, NButton, NInput, NSpace } from 'naive-ui';

import AuthLanguageModal from '#/components/auth/AuthLanguageModal.vue';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const { locale, t } = useI18n();
const route = useRoute();

/** credentials | totp */
const step = ref<'credentials' | 'totp'>('credentials');
const pendingUser = ref('');
const pendingPass = ref('');
const totpCode = ref('');
const totpReadyBanner = ref(false);

const formSchema = computed((): VbenFormSchema[] => {
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

onMounted(() => {
  if (route.query.totpReady === '1') {
    totpReadyBanner.value = true;
  }
});

async function onCredentialsSubmit(values: Recordable<any>) {
  pendingUser.value = String(values.username || '');
  pendingPass.value = String(values.password || '');
  totpCode.value = '';

  const result = await authStore.authLogin({
    username: pendingUser.value,
    password: pendingPass.value,
  });

  if (result?.needsTotp) {
    step.value = 'totp';
    return;
  }
  // enroll redirect / success handled inside authStore
}

async function onTotpSubmit() {
  const code = totpCode.value.replace(/\s/g, '').trim();
  if (code.length < 6) return;

  await authStore.authLogin({
    username: pendingUser.value,
    password: pendingPass.value,
    totpCode: code,
  });
}

function backToCredentials() {
  step.value = 'credentials';
  totpCode.value = '';
}
</script>

<template>
  <div>
    <NAlert
      v-if="totpReadyBanner && step === 'credentials'"
      type="success"
      class="mb-4"
      :bordered="false"
    >
      {{ t('authentication.totpReadyRelogin') }}
    </NAlert>

    <template v-if="step === 'credentials'">
      <AuthenticationLogin
        :key="locale"
        :form-schema="formSchema"
        :loading="authStore.loginLoading"
        @submit="onCredentialsSubmit"
      />
    </template>

    <template v-else>
      <div class="totp-login-step">
        <h2 class="totp-title">{{ t('authentication.totpLoginTitle') }}</h2>
        <p class="totp-sub">{{ t('authentication.totpLoginHint') }}</p>
        <NInput
          v-model:value="totpCode"
          maxlength="12"
          size="large"
          :placeholder="t('authentication.totpCodePlaceholder')"
          style="letter-spacing: 0.25em; text-align: center; font-size: 20px"
          :disabled="authStore.loginLoading"
          @keydown.enter="onTotpSubmit"
        />
        <NSpace class="mt-4" justify="space-between">
          <NButton quaternary :disabled="authStore.loginLoading" @click="backToCredentials">
            {{ t('authentication.totpBack') }}
          </NButton>
          <NButton
            type="primary"
            :loading="authStore.loginLoading"
            :disabled="totpCode.replace(/\s/g, '').length < 6"
            @click="onTotpSubmit"
          >
            {{ t('authentication.login') || 'Login' }}
          </NButton>
        </NSpace>
      </div>
    </template>

    <div class="mt-4 flex justify-center">
      <AuthLanguageModal inline />
    </div>
  </div>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
.totp-login-step {
  max-width: 360px;
  margin: 0 auto;
  padding: 8px 0;
}
.totp-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
}
.totp-sub {
  margin: 0 0 16px;
  font-size: 13px;
  opacity: 0.7;
  line-height: 1.5;
}
</style>
