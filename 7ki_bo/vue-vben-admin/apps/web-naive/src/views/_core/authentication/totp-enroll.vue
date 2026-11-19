<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { NAlert } from 'naive-ui';
import { useAccessStore } from '@vben/stores';

import BoTotpEnrollWizard from '#/components/auth/BoTotpEnrollWizard.vue';
import { useAuthStore } from '#/store';
import { decodeJwtClaims } from '#/utils/boAccessToken';
import { $t } from '#/locales';

defineOptions({ name: 'TotpEnroll' });

const router = useRouter();
const accessStore = useAccessStore();
const authStore = useAuthStore();

onMounted(() => {
  const token = accessStore.accessToken;
  if (!token) {
    void router.replace('/auth/login');
    return;
  }
  const claims = decodeJwtClaims(token) as { purpose?: string } | null;
  // enroll-only OR full session both allowed to set up when not yet enabled
  void claims;
});

async function onComplete() {
  // After enable with enroll-only JWT, must re-login for a full session
  await authStore.logout(false);
  await router.replace({
    path: '/auth/login',
    query: { totpReady: '1' },
  });
}

async function onCancel() {
  await authStore.logout(false);
  await router.replace('/auth/login');
}
</script>

<template>
  <div class="totp-enroll-page">
    <NAlert type="warning" class="mb-4" :bordered="false">
      {{ $t('authentication.totpEnrollRequired') }}
    </NAlert>
    <BoTotpEnrollWizard @complete="onComplete" @cancel="onCancel" />
  </div>
</template>

<style scoped>
.totp-enroll-page {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: 8px 0 24px;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>
