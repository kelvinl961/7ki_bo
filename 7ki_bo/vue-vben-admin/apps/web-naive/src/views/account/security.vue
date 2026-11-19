<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  NAlert,
  NButton,
  NCard,
  NSpace,
  NTag,
  useMessage,
} from 'naive-ui';

import {
  boTotpDisableApi,
  boTotpStatusApi,
  type BoTotpStatus,
} from '#/api/core/boTotp';
import BoTotpEnrollWizard from '#/components/auth/BoTotpEnrollWizard.vue';
import { promptBoTotpCode } from '#/utils/boTotpPrompt';
import { $t } from '#/locales';

defineOptions({ name: 'AccountSecurity' });

const message = useMessage();
const loading = ref(false);
const status = ref<null | BoTotpStatus>(null);
const showSetup = ref(false);

async function refresh() {
  loading.value = true;
  try {
    status.value = await boTotpStatusApi();
    if (!status.value?.totpEnabled) {
      // keep setup available
    } else {
      showSetup.value = false;
    }
  } catch (e: any) {
    message.error(
      e?.response?.data?.message ||
        e?.message ||
        $t('authentication.totpStatusFailed'),
    );
  } finally {
    loading.value = false;
  }
}

async function disableTotp() {
  const code = await promptBoTotpCode({
    title: $t('authentication.totpDisableTitle'),
    content: $t('authentication.totpDisableHint'),
  });
  if (!code) return;
  try {
    await boTotpDisableApi({ totpCode: code });
    message.success($t('authentication.totpDisabled'));
    showSetup.value = false;
    await refresh();
  } catch (e: any) {
    message.error(
      e?.response?.data?.message ||
        e?.message ||
        $t('authentication.totpDisableFailed'),
    );
  }
}

function onSetupComplete() {
  showSetup.value = false;
  void refresh();
  message.success($t('authentication.totpEnabled'));
}

onMounted(() => {
  void refresh();
});
</script>

<template>
  <div class="p-4">
    <NCard :title="$t('authentication.totpSecurityTitle')" :bordered="false">
      <NAlert v-if="status?.totpRequired && !status?.totpEnabled" type="error" class="mb-4">
        {{ $t('authentication.totpRequiredBanner') }}
      </NAlert>

      <div class="mb-4 flex items-center gap-3">
        <span class="text-sm opacity-70">{{ $t('authentication.totpStatus') }}</span>
        <NTag :type="status?.totpEnabled ? 'success' : 'warning'">
          {{
            status?.totpEnabled
              ? $t('authentication.totpOn')
              : $t('authentication.totpOff')
          }}
        </NTag>
        <span v-if="status?.totpEnabledAt" class="text-xs opacity-50">
          {{ status.totpEnabledAt }}
        </span>
      </div>

      <NSpace v-if="!showSetup">
        <NButton
          v-if="!status?.totpEnabled"
          type="primary"
          :loading="loading"
          @click="showSetup = true"
        >
          {{ $t('authentication.totpSetupNow') }}
        </NButton>
        <NButton
          v-else
          type="error"
          secondary
          :loading="loading"
          @click="disableTotp"
        >
          {{ $t('authentication.totpDisable') }}
        </NButton>
        <NButton quaternary :loading="loading" @click="refresh">
          {{ $t('authentication.totpRefresh') }}
        </NButton>
      </NSpace>

      <div v-if="showSetup" class="mt-6">
        <BoTotpEnrollWizard @complete="onSetupComplete" @cancel="showSetup = false" />
      </div>
    </NCard>
  </div>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.mt-6 {
  margin-top: 24px;
}
.p-4 {
  padding: 16px;
}
</style>
