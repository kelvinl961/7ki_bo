<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import {
  NAlert,
  NButton,
  NCard,
  NInput,
  NSpace,
  NSpin,
  NStep,
  NSteps,
  NTag,
  useMessage,
} from 'naive-ui';

import {
  boTotpEnableApi,
  boTotpSetupApi,
  boTotpStatusApi,
  type BoTotpSetup,
} from '#/api/core/boTotp';
import { $t } from '#/locales';

const emit = defineEmits<{
  complete: [backupCodes: string[]];
  cancel: [];
}>();

const message = useMessage();
const loading = ref(false);
const enabling = ref(false);
const setup = ref<null | BoTotpSetup>(null);
const totpCode = ref('');
const sponsorAdminId = ref('');
const sponsorTotpCode = ref('');
const sponsorRequired = ref(false);
const backupCodes = ref<string[]>([]);
const step = ref(1); // 1 setup QR, 2 confirm code, 3 backup codes
const copied = ref(false);

const canEnable = computed(() => {
  if (totpCode.value.replace(/\s/g, '').length < 6 || enabling.value) return false;
  if (!sponsorRequired.value) return true;
  return (
    Number(sponsorAdminId.value) > 0 &&
    sponsorTotpCode.value.replace(/\s/g, '').length >= 6
  );
});

async function loadSetup() {
  loading.value = true;
  try {
    try {
      const st = await boTotpStatusApi();
      sponsorRequired.value = Boolean(st?.sponsorRequiredForEnable);
    } catch {
      sponsorRequired.value = false;
    }
    setup.value = await boTotpSetupApi();
    step.value = 1;
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      $t('authentication.totpSetupFailed');
    message.error(String(msg));
  } finally {
    loading.value = false;
  }
}

async function enable() {
  const code = totpCode.value.replace(/\s/g, '').trim();
  if (code.length < 6) {
    message.warning($t('authentication.totpCodeTip'));
    return;
  }
  if (sponsorRequired.value) {
    const sid = Number(sponsorAdminId.value);
    const scode = sponsorTotpCode.value.replace(/\s/g, '').trim();
    if (!sid || scode.length < 6) {
      message.warning($t('authentication.totpSponsorTip'));
      return;
    }
  }
  enabling.value = true;
  try {
    const payload: {
      sponsorAdminId?: number;
      sponsorTotpCode?: string;
      totpCode: string;
    } = { totpCode: code };
    if (sponsorRequired.value) {
      payload.sponsorAdminId = Number(sponsorAdminId.value);
      payload.sponsorTotpCode = sponsorTotpCode.value.replace(/\s/g, '').trim();
    }
    const res = await boTotpEnableApi(payload);
    backupCodes.value = res?.backupCodes || [];
    step.value = 3;
    message.success($t('authentication.totpEnabled'));
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      $t('authentication.totpInvalid');
    message.error(String(msg));
  } finally {
    enabling.value = false;
  }
}

async function copyBackupCodes() {
  const text = backupCodes.value.join('\n');
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    message.success($t('authentication.totpBackupCopied'));
  } catch {
    message.error($t('authentication.totpBackupCopyFailed'));
  }
}

function finish() {
  emit('complete', backupCodes.value);
}

onMounted(() => {
  void loadSetup();
});
</script>

<template>
  <NSpin :show="loading">
    <NCard
      :title="$t('authentication.totpSetupTitle')"
      :bordered="false"
      class="bo-totp-wizard"
    >
      <NSteps :current="step" size="small" class="mb-6">
        <NStep :title="$t('authentication.totpStepScan')" />
        <NStep :title="$t('authentication.totpStepVerify')" />
        <NStep :title="$t('authentication.totpStepBackup')" />
      </NSteps>

      <template v-if="step === 1 && setup">
        <NAlert type="info" class="mb-4" :bordered="false">
          {{ $t('authentication.totpScanHint') }}
        </NAlert>
        <div class="flex flex-col items-center gap-4">
          <img
            v-if="setup.qrCodeDataUrl"
            :src="setup.qrCodeDataUrl"
            alt="Google Authenticator QR"
            class="qr-img"
          />
          <div class="w-full max-w-md text-center">
            <div class="mb-1 text-xs opacity-60">
              {{ $t('authentication.totpManualSecret') }}
            </div>
            <code class="secret-box">{{ setup.secret }}</code>
          </div>
          <NButton type="primary" @click="step = 2">
            {{ $t('authentication.totpNextVerify') }}
          </NButton>
        </div>
      </template>

      <template v-else-if="step === 2">
        <NAlert type="warning" class="mb-4" :bordered="false">
          {{ $t('authentication.totpVerifyHint') }}
        </NAlert>
        <NAlert
          v-if="sponsorRequired"
          type="error"
          class="mb-4"
          :bordered="false"
        >
          {{ $t('authentication.totpSponsorHint') }}
        </NAlert>
        <NSpace vertical>
          <NInput
            v-model:value="totpCode"
            maxlength="12"
            size="large"
            :placeholder="$t('authentication.totpCodePlaceholder')"
            style="letter-spacing: 0.25em; text-align: center; font-size: 20px"
            @keydown.enter="enable"
          />
          <template v-if="sponsorRequired">
            <NInput
              v-model:value="sponsorAdminId"
              maxlength="12"
              :placeholder="$t('authentication.totpSponsorIdPlaceholder')"
            />
            <NInput
              v-model:value="sponsorTotpCode"
              maxlength="12"
              :placeholder="$t('authentication.totpSponsorCodePlaceholder')"
              style="letter-spacing: 0.2em; text-align: center"
            />
          </template>
          <NSpace justify="space-between">
            <NButton @click="step = 1">{{ $t('authentication.totpBack') }}</NButton>
            <NButton type="primary" :disabled="!canEnable" :loading="enabling" @click="enable">
              {{ $t('authentication.totpEnable') }}
            </NButton>
          </NSpace>
        </NSpace>
      </template>

      <template v-else-if="step === 3">
        <NAlert type="success" class="mb-4" :bordered="false">
          {{ $t('authentication.totpBackupHint') }}
        </NAlert>
        <div class="backup-grid mb-4">
          <NTag
            v-for="code in backupCodes"
            :key="code"
            size="large"
            type="default"
            class="backup-tag"
          >
            {{ code }}
          </NTag>
        </div>
        <NSpace justify="space-between">
          <NButton @click="copyBackupCodes">
            {{
              copied
                ? $t('authentication.totpBackupCopied')
                : $t('authentication.totpCopyBackup')
            }}
          </NButton>
          <NButton type="primary" @click="finish">
            {{ $t('authentication.totpFinish') }}
          </NButton>
        </NSpace>
      </template>
    </NCard>
  </NSpin>
</template>

<style scoped>
.bo-totp-wizard {
  max-width: 520px;
  margin: 0 auto;
}
.qr-img {
  width: 220px;
  height: 220px;
  border-radius: 12px;
  background: #fff;
  padding: 8px;
  box-shadow: 0 1px 8px rgb(0 0 0 / 8%);
}
.secret-box {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  letter-spacing: 0.08em;
  word-break: break-all;
  background: rgb(0 0 0 / 4%);
}
.backup-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.backup-tag {
  justify-content: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.08em;
}
.mb-1 {
  margin-bottom: 4px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mb-6 {
  margin-bottom: 24px;
}
</style>
