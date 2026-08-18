<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="$t('user.manualPullback.title')"
    :style="{ width: '640px' }"
    @after-leave="resetState"
  >
    <div class="space-y-4">
      <div class="grid grid-cols-3 gap-4 rounded bg-gray-50 p-4">
        <div>
          <span class="text-sm text-gray-600">{{ $t('user.manualDebit.memberId') }}:</span>
          <span class="ml-2 font-medium">{{ userId }}</span>
        </div>
        <div>
          <span class="text-sm text-gray-600">{{ $t('user.manualDebit.memberAccount') }}:</span>
          <span class="ml-2 font-medium">{{ account }}</span>
        </div>
        <div class="flex justify-end">
          <n-button size="small" :loading="loadingStatus" @click="loadStatus">
            {{ $t('common.refresh') }}
          </n-button>
        </div>
      </div>

      <n-spin :show="loadingStatus">
        <n-alert
          v-if="status"
          :type="status.canPullBack ? 'warning' : status.needsProviderRecall ? 'error' : 'info'"
          :title="previewTitle"
          class="mb-3"
        >
          {{ previewHint }}
        </n-alert>

        <div v-if="status" class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">{{ $t('user.manualPullback.mainBalance') }}</span>
            <span class="font-medium">{{ formatMoney(status.mainAvailableBalance) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ $t('user.manualPullback.stuckBalance') }}</span>
            <span class="font-semibold text-orange-600">{{
              formatMoney(status.stuckInGameBalance)
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ $t('user.manualPullback.activeSessions') }}</span>
            <span>{{ status.activeSessions?.length || 0 }}</span>
          </div>
        </div>

        <n-data-table
          v-if="status?.activeSessions?.length"
          class="mt-3"
          size="small"
          :columns="sessionColumns"
          :data="status.activeSessions"
          :bordered="true"
          :pagination="false"
        />

        <n-empty
          v-else-if="status && !loadingStatus"
          class="py-4"
          :description="$t('user.manualPullback.noActiveSession')"
        />
      </n-spin>

      <n-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-placement="left"
        label-width="100"
      >
        <n-form-item :label="$t('user.manualPullback.reason')" path="reason">
          <n-input
            v-model:value="form.reason"
            type="textarea"
            :placeholder="$t('user.manualPullback.reasonPlaceholder')"
            :maxlength="200"
            show-count
            :rows="3"
          />
        </n-form-item>
      </n-form>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <n-button @click="close">{{ $t('common.cancel') }}</n-button>
        <n-button
          type="warning"
          :loading="submitting"
          :disabled="!status?.canPullBack"
          @click="handleConfirm"
        >
          {{ $t('user.manualPullback.confirm') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';
import { computed, h, reactive, ref } from 'vue';
import {
  NAlert,
  NButton,
  NDataTable,
  NEmpty,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSpin,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import { notification } from '#/adapter/naive';
import {
  getGameWalletStatusApi,
  pullBackGameWalletApi,
  type GameWalletStatusData,
} from '#/api/core/user-detail';

const props = defineProps<{
  userId?: number | string | null;
  account?: string;
}>();

const emit = defineEmits<{
  success: [payload?: unknown];
}>();

const visible = ref(false);
const loadingStatus = ref(false);
const submitting = ref(false);
const status = ref<GameWalletStatusData | null>(null);
const formRef = ref<FormInst | null>(null);
const form = reactive({ reason: '' });

const userId = computed(() => Number(props.userId));
const account = computed(() => props.account || '--');

const rules = computed<FormRules>(() => ({
  reason: {
    required: true,
    trigger: ['blur', 'input'],
    validator: (_rule, value: string) => {
      if (!value || String(value).trim().length < 3) {
        return new Error($t('user.manualPullback.reasonRequired'));
      }
      return true;
    },
  },
}));

const previewTitle = computed(() => {
  if (!status.value) return '';
  if (status.value.canPullBack) return $t('user.manualPullback.previewStuck');
  if (status.value.needsProviderRecall) return $t('user.manualPullback.previewProviderRecall');
  return $t('user.manualPullback.previewNone');
});

const previewHint = computed(() => {
  if (!status.value) return '';
  if (status.value.canPullBack) return $t('user.manualPullback.previewStuckHint');
  if (status.value.needsProviderRecall) return $t('user.manualPullback.previewProviderRecallHint');
  return $t('user.manualPullback.previewNoneHint');
});

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(amount) || 0,
  );

const sessionColumns = computed<DataTableColumns<GameWalletStatusData['activeSessions'][number]>>(
  () => [
    {
      title: $t('user.manualPullback.provider'),
      key: 'gameProvider',
      width: 100,
    },
    {
      title: $t('user.manualPullback.gameId'),
      key: 'gameId',
      ellipsis: { tooltip: true },
      render: (row) => row.gameId || '--',
    },
    {
      title: $t('user.manualPullback.sessionBalance'),
      key: 'sessionBalance',
      width: 120,
      render: (row) =>
        h('span', { class: 'font-medium text-orange-600' }, formatMoney(row.sessionBalance)),
    },
    {
      title: $t('user.manualPullback.sessionStart'),
      key: 'sessionStart',
      width: 160,
      render: (row) =>
        row.sessionStart ? new Date(row.sessionStart).toLocaleString() : '--',
    },
  ],
);

async function loadStatus() {
  if (!userId.value) return;
  loadingStatus.value = true;
  try {
    const res = await getGameWalletStatusApi(userId.value);
    const data = (res as any)?.data?.data ?? (res as any)?.data ?? res;
    status.value = data as GameWalletStatusData;
  } catch (error) {
    console.error('Failed to load game wallet status:', error);
    status.value = null;
    notification.error({
      content: $t('user.manualPullback.loadFailed'),
      duration: 4000,
    });
  } finally {
    loadingStatus.value = false;
  }
}

async function handleConfirm() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  if (!status.value?.canPullBack || !userId.value) return;

  submitting.value = true;
  try {
    const res = await pullBackGameWalletApi(userId.value, {
      reason: form.reason.trim(),
    });
    const data = (res as any)?.data?.data ?? (res as any)?.data ?? res;
    notification.success({
      content: $t('user.manualPullback.success', [
        formatMoney(data?.walletAfter?.availableBalance ?? 0),
      ]),
      duration: 4000,
    });
    visible.value = false;
    emit('success', data);
  } catch (error) {
    console.error('Pull-back failed:', error);
    notification.error({
      content: $t('user.manualPullback.failed'),
      duration: 4000,
    });
  } finally {
    submitting.value = false;
  }
}

function resetState() {
  status.value = null;
  form.reason = '';
  submitting.value = false;
  loadingStatus.value = false;
}

async function open() {
  visible.value = true;
  form.reason = '';
  status.value = null;
  await loadStatus();
}

function close() {
  visible.value = false;
}

defineExpose({ open, close });
</script>
