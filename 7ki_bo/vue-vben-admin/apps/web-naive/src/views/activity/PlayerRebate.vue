<template>
  <div class="player-rebate-page">
    <Page
      :title="$t('activity.playerRebate.title')"
      :description="$t('activity.playerRebate.desc')"
    >
      <n-card>
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <n-space align="center" wrap>
            <span class="text-sm text-gray-600">{{ $t('activity.playerRebate.switch') }}</span>
            <n-switch
              :value="settingsEnabled"
              :loading="switchLoading"
              @update:value="onToggleEnabled"
            />
            <n-select
              v-model:value="filterCurrency"
              clearable
              :placeholder="$t('activity.playerRebate.allCurrency')"
              :options="currencyOptions"
              style="width: 160px"
              @update:value="loadRules"
            />
          </n-space>
          <n-space>
            <n-button @click="showSettings = true">
              {{ $t('activity.playerRebate.settings') }}
            </n-button>
            <n-button type="primary" @click="openCreate">
              {{ $t('activity.playerRebate.addRule') }}
            </n-button>
          </n-space>
        </div>

        <n-data-table
          :columns="columns"
          :data="rows"
          :loading="loading"
          :scroll-x="1100"
          striped
          size="small"
        />
      </n-card>

      <PlayerRebateSettingsModal
        v-model:show="showSettings"
        @saved="loadSettings"
      />
      <PlayerRebateRuleModal
        v-model:show="showRuleModal"
        :edit-rule="editingRule"
        @saved="loadRules"
      />
    </Page>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';
import { h, onMounted, ref } from 'vue';
import {
  NCard,
  NSpace,
  NButton,
  NSwitch,
  NSelect,
  NDataTable,
  NTag,
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import PlayerRebateSettingsModal from './components/PlayerRebateSettingsModal.vue';
import PlayerRebateRuleModal from './components/PlayerRebateRuleModal.vue';
import {
  playerRebateApi,
  type PlayerRebateRule,
  type PlayerRebateSettings,
} from '#/api/playerRebate';

const message = useMessage();
const dialog = useDialog();

const loading = ref(false);
const switchLoading = ref(false);
const showSettings = ref(false);
const showRuleModal = ref(false);
const editingRule = ref<PlayerRebateRule | null>(null);
const settingsEnabled = ref(false);
const filterCurrency = ref<string | null>(null);
const rows = ref<PlayerRebateRule[]>([]);

const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'GHS', value: 'GHS' },
  { label: 'XAF', value: 'XAF' },
  { label: 'LAK', value: 'LAK' },
  { label: 'KHR', value: 'KHR' },
];

const columns: DataTableColumns<PlayerRebateRule> = [
  { title: 'ID', key: 'id', width: 70 },
  { title: $t('activity.playerRebate.currency'), key: 'currency', width: 90 },
  {
    title: $t('activity.playerRebate.name'),
    key: 'name',
    ellipsis: { tooltip: true },
    render: (r) => r.name || '—',
  },
  {
    title: $t('activity.playerRebate.memberTiers'),
    key: 'memberTierIds',
    width: 160,
    render: (r) => (r.memberTierIds || []).join(', ') || '—',
  },
  {
    title: $t('activity.playerRebate.rateMode'),
    key: 'rateMode',
    width: 110,
    render: (r) =>
      r.rateMode === 'vip'
        ? $t('activity.playerRebate.rateVip')
        : $t('activity.playerRebate.rateLadder'),
  },
  {
    title: $t('activity.playerRebate.auditMultiplier'),
    key: 'auditMultiplier',
    width: 100,
  },
  {
    title: $t('activity.playerRebate.status'),
    key: 'isActive',
    width: 90,
    render: (r) =>
      h(
        NTag,
        { type: r.isActive ? 'success' : 'default', size: 'small' },
        {
          default: () =>
            r.isActive
              ? $t('activity.playerRebate.active')
              : $t('activity.playerRebate.inactive'),
        },
      ),
  },
  {
    title: $t('activity.playerRebate.actions'),
    key: 'actions',
    width: 220,
    fixed: 'right',
    render: (r) =>
      h(NSpace, { size: 8 }, {
        default: () => [
          h(
            NButton,
            {
              size: 'tiny',
              onClick: () => {
                editingRule.value = r;
                showRuleModal.value = true;
              },
            },
            { default: () => $t('activity.playerRebate.edit') },
          ),
          h(
            NButton,
            {
              size: 'tiny',
              secondary: true,
              onClick: () => toggleStatus(r),
            },
            {
              default: () =>
                r.isActive
                  ? $t('activity.playerRebate.inactive')
                  : $t('activity.playerRebate.active'),
            },
          ),
          h(
            NButton,
            {
              size: 'tiny',
              type: 'error',
              quaternary: true,
              onClick: () => confirmDelete(r),
            },
            { default: () => $t('activity.playerRebate.delete') },
          ),
        ],
      }),
  },
];

function unwrap<T>(res: any): T {
  if (res?.data !== undefined && res?.success !== undefined) return res.data as T;
  return res as T;
}

async function loadSettings() {
  try {
    const data = unwrap<PlayerRebateSettings>(
      await playerRebateApi.getSettings(),
    );
    settingsEnabled.value = Boolean(data?.isEnabled);
  } catch (e: any) {
    message.error(e?.message || $t('activity.playerRebate.loadFailed'));
  }
}

async function loadRules() {
  loading.value = true;
  try {
    const data = unwrap<PlayerRebateRule[]>(
      await playerRebateApi.listRules(filterCurrency.value || undefined),
    );
    rows.value = Array.isArray(data) ? data : [];
  } catch (e: any) {
    message.error(e?.message || $t('activity.playerRebate.loadFailed'));
  } finally {
    loading.value = false;
  }
}

async function onToggleEnabled(v: boolean) {
  switchLoading.value = true;
  try {
    await playerRebateApi.updateSettings({ isEnabled: v });
    settingsEnabled.value = v;
    message.success($t('activity.playerRebate.saveSuccess'));
  } catch (e: any) {
    message.error(e?.message || $t('activity.playerRebate.saveFailed'));
  } finally {
    switchLoading.value = false;
  }
}

function openCreate() {
  editingRule.value = null;
  showRuleModal.value = true;
}

async function toggleStatus(r: PlayerRebateRule) {
  try {
    await playerRebateApi.setRuleStatus(r.id, !r.isActive);
    message.success($t('activity.playerRebate.saveSuccess'));
    await loadRules();
  } catch (e: any) {
    message.error(
      e?.response?.data?.message ||
        e?.message ||
        $t('activity.playerRebate.saveFailed'),
    );
  }
}

function confirmDelete(r: PlayerRebateRule) {
  dialog.warning({
    title: $t('activity.playerRebate.delete'),
    content: $t('activity.playerRebate.deleteConfirm'),
    positiveText: $t('activity.playerRebate.delete'),
    negativeText: $t('activity.playerRebate.cancel'),
    onPositiveClick: async () => {
      try {
        await playerRebateApi.deleteRule(r.id);
        message.success($t('activity.playerRebate.saveSuccess'));
        await loadRules();
      } catch (e: any) {
        message.error(e?.message || $t('activity.playerRebate.saveFailed'));
      }
    },
  });
}

onMounted(async () => {
  await Promise.all([loadSettings(), loadRules()]);
});
</script>
