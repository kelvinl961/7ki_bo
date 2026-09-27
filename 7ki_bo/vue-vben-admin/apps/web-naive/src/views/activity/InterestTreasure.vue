<template>
  <div class="interest-treasure-page">
    <Page :title="$t('activity.interestTreasure.title')" :description="$t('activity.interestTreasure.desc')">
      <n-card>
        <n-tabs v-model:value="activeTab" type="line" class="mb-4">
          <n-tab-pane name="config" :tab="$t('activity.interestTreasure.title')" />
          <n-tab-pane name="ledger" :tab="$t('activity.interestTreasure.ledgerTab')" />
        </n-tabs>

        <template v-if="activeTab === 'config'">
          <n-space class="mb-3" wrap>
            <n-select
              v-model:value="configFilters.isEnabled"
              clearable
              :placeholder="$t('activity.interestTreasure.allStatus')"
              :options="statusOptions"
              style="width: 140px"
              @update:value="loadConfigs"
            />
            <n-select
              v-model:value="configFilters.currency"
              clearable
              :placeholder="$t('activity.interestTreasure.allCurrency')"
              :options="currencyOptions"
              style="width: 140px"
              @update:value="loadConfigs"
            />
          </n-space>
          <n-data-table
            :columns="configColumns"
            :data="configs"
            :loading="configLoading"
            :scroll-x="1400"
            striped
            size="small"
          />
        </template>

        <template v-else>
          <n-form class="mb-3" :show-feedback="false" label-placement="left">
            <n-space wrap align="center">
              <n-button size="small" @click="setQuickRange('day')">{{ $t('activity.interestTreasure.day') }}</n-button>
              <n-button size="small" @click="setQuickRange('week')">{{ $t('activity.interestTreasure.week') }}</n-button>
              <n-button size="small" @click="setQuickRange('month')">{{ $t('activity.interestTreasure.month') }}</n-button>
              <n-date-picker v-model:value="dateRange" type="datetimerange" clearable style="width: 340px" />
              <n-input v-model:value="ledgerFilters.userId" clearable :placeholder="$t('activity.interestTreasure.memberId')" style="width: 140px" />
              <n-select
                v-model:value="ledgerFilters.changeType"
                clearable
                :placeholder="$t('activity.interestTreasure.changeType')"
                :options="changeTypeOptions"
                style="width: 160px"
              />
              <n-select
                v-model:value="ledgerFilters.currency"
                clearable
                :placeholder="$t('activity.interestTreasure.allCurrency')"
                :options="currencyOptions"
                style="width: 120px"
              />
              <n-button type="primary" @click="loadLedger">{{ $t('activity.interestTreasure.search') }}</n-button>
              <n-button @click="resetLedger">{{ $t('activity.interestTreasure.reset') }}</n-button>
            </n-space>
          </n-form>
          <n-data-table
            :columns="ledgerColumns"
            :data="ledgerRows"
            :loading="ledgerLoading"
            :scroll-x="1200"
            striped
            size="small"
            remote
            :pagination="pagination"
            @update:page="onPage"
            @update:page-size="onPageSize"
          />
        </template>
      </n-card>

      <InterestTreasureEditModal
        v-model:show="showEdit"
        :config="editing"
        @saved="loadConfigs"
      />
      <InterestTreasureClaimDetailModal
        v-model:show="showDetail"
        :ledger-id="detailLedgerId"
      />
    </Page>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';
import { h, onMounted, reactive, ref, watch } from 'vue';
import {
  NCard, NTabs, NTabPane, NSpace, NSelect, NButton, NDataTable, NSwitch,
  NForm, NInput, NDatePicker, useMessage, type DataTableColumns,
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import InterestTreasureEditModal from './components/InterestTreasureEditModal.vue';
import InterestTreasureClaimDetailModal from './components/InterestTreasureClaimDetailModal.vue';
import {
  interestTreasureApi,
  type InterestTreasureConfig,
  type InterestTreasureLedgerRow,
} from '#/api/interestTreasure';

const message = useMessage();
const activeTab = ref<'config' | 'ledger'>('config');
const configLoading = ref(false);
const ledgerLoading = ref(false);
const configs = ref<InterestTreasureConfig[]>([]);
const ledgerRows = ref<InterestTreasureLedgerRow[]>([]);
const showEdit = ref(false);
const editing = ref<InterestTreasureConfig | null>(null);
const showDetail = ref(false);
const detailLedgerId = ref<number | null>(null);
const dateRange = ref<[number, number] | null>(null);

const configFilters = reactive<{ currency: string | null; isEnabled: boolean | null }>({
  currency: null,
  isEnabled: null,
});
const ledgerFilters = reactive<{
  userId: string;
  changeType: string | null;
  currency: string | null;
}>({
  userId: '',
  changeType: null,
  currency: null,
});

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [20, 50, 100],
});

const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'USDT', value: 'USDT' },
  { label: 'CNY', value: 'CNY' },
  { label: 'GHS', value: 'GHS' },
];
const statusOptions = [
  { label: $t('activity.interestTreasure.active'), value: true },
  { label: $t('activity.interestTreasure.inactive'), value: false },
];
const changeTypeOptions = [
  { label: $t('activity.interestTreasure.all'), value: 'all' },
  { label: $t('activity.interestTreasure.transferIn'), value: 'transfer_in' },
  { label: $t('activity.interestTreasure.transferOut'), value: 'transfer_out' },
  { label: $t('activity.interestTreasure.claimInterest'), value: 'claim_interest' },
];

function unwrap<T>(res: any): T {
  if (res?.data !== undefined && res?.success !== undefined) return res.data as T;
  return res as T;
}

const configColumns: DataTableColumns<InterestTreasureConfig> = [
  { title: $t('activity.interestTreasure.currency'), key: 'currency', width: 90 },
  {
    title: $t('activity.interestTreasure.memberTiers'),
    key: 'memberTierLabel',
    width: 120,
    render: (r) =>
      r.memberTierIds?.length
        ? r.memberTierIds.join(',')
        : $t('activity.interestTreasure.allTiers'),
  },
  {
    title: $t('activity.interestTreasure.annualRate'),
    key: 'annualRatePercent',
    width: 110,
    render: (r) => `${Number(r.annualRatePercent).toFixed(2)}%`,
  },
  {
    title: $t('activity.interestTreasure.settleCycle'),
    key: 'settleCycleMinutes',
    width: 100,
    render: (r) => `${r.settleCycleMinutes}${$t('activity.interestTreasure.minutes')}`,
  },
  { title: $t('activity.interestTreasure.minDeposit'), key: 'minDeposit', width: 110 },
  { title: $t('activity.interestTreasure.auditMultiplier'), key: 'auditMultiplier', width: 110 },
  {
    title: $t('activity.interestTreasure.claimTiming'),
    key: 'claimTiming',
    width: 110,
    render: (r) =>
      r.claimTiming === 'realtime'
        ? $t('activity.interestTreasure.claimRealtime')
        : $t('activity.interestTreasure.claimNextDay'),
  },
  {
    title: $t('activity.interestTreasure.interestCap'),
    key: 'interestCapCycles',
    width: 100,
    render: (r) =>
      r.interestCapCycles === 0
        ? $t('activity.interestTreasure.unlimited')
        : `${r.interestCapCycles}${$t('activity.interestTreasure.cycles')}`,
  },
  {
    title: $t('activity.interestTreasure.showTooltip'),
    key: 'showTooltip',
    width: 100,
    render: (r) =>
      h(NSwitch, {
        value: r.showTooltip,
        onUpdateValue: async (v: boolean) => {
          try {
            await interestTreasureApi.updateStatus(r.id, { showTooltip: v });
            r.showTooltip = v;
          } catch (e: any) {
            message.error(e?.message || $t('activity.interestTreasure.saveFailed'));
          }
        },
      }),
  },
  {
    title: $t('activity.interestTreasure.switch'),
    key: 'isEnabled',
    width: 100,
    render: (r) =>
      h(NSwitch, {
        value: r.isEnabled,
        onUpdateValue: async (v: boolean) => {
          try {
            await interestTreasureApi.updateStatus(r.id, { isEnabled: v });
            r.isEnabled = v;
          } catch (e: any) {
            message.error(e?.message || $t('activity.interestTreasure.saveFailed'));
          }
        },
      }),
  },
  {
    title: $t('activity.interestTreasure.actions'),
    key: 'actions',
    width: 80,
    fixed: 'right',
    render: (r) =>
      h(
        NButton,
        {
          text: true,
          type: 'primary',
          onClick: () => {
            editing.value = r;
            showEdit.value = true;
          },
        },
        { default: () => $t('activity.interestTreasure.edit') },
      ),
  },
];

const ledgerColumns: DataTableColumns<InterestTreasureLedgerRow> = [
  { title: $t('activity.interestTreasure.orderNo'), key: 'orderNo', width: 160 },
  { title: $t('activity.interestTreasure.currency'), key: 'currency', width: 80 },
  { title: $t('activity.interestTreasure.memberId'), key: 'userId', width: 90 },
  {
    title: $t('activity.interestTreasure.changeType'),
    key: 'changeType',
    width: 110,
    render: (r) => {
      const map: Record<string, string> = {
        transfer_in: $t('activity.interestTreasure.transferIn'),
        transfer_out: $t('activity.interestTreasure.transferOut'),
        claim_interest: $t('activity.interestTreasure.claimInterest'),
      };
      return map[r.changeType] || r.changeType;
    },
  },
  { title: $t('activity.interestTreasure.balanceBefore'), key: 'balanceBefore', width: 120 },
  {
    title: $t('activity.interestTreasure.amount'),
    key: 'amount',
    width: 110,
    render: (r) => {
      const color = r.amount < 0 ? '#18a058' : '#d03050';
      return h('span', { style: { color } }, String(r.amount));
    },
  },
  { title: $t('activity.interestTreasure.balanceAfter'), key: 'balanceAfter', width: 120 },
  {
    title: $t('activity.interestTreasure.txTime'),
    key: 'createdAt',
    width: 170,
    render: (r) => new Date(r.createdAt).toLocaleString(),
  },
  {
    title: $t('activity.interestTreasure.actions'),
    key: 'actions',
    width: 80,
    render: (r) =>
      r.changeType === 'claim_interest' && r.hasClaimDetail
        ? h(
            NButton,
            {
              text: true,
              type: 'primary',
              onClick: () => {
                detailLedgerId.value = r.id;
                showDetail.value = true;
              },
            },
            { default: () => $t('activity.interestTreasure.detail') },
          )
        : null,
  },
];

async function loadConfigs() {
  configLoading.value = true;
  try {
    const data = unwrap<InterestTreasureConfig[]>(
      await interestTreasureApi.listConfigs({
        currency: configFilters.currency || undefined,
        isEnabled:
          configFilters.isEnabled == null
            ? undefined
            : configFilters.isEnabled,
      }),
    );
    configs.value = Array.isArray(data) ? data : [];
  } catch (e: any) {
    message.error(e?.message || $t('activity.interestTreasure.loadFailed'));
  } finally {
    configLoading.value = false;
  }
}

async function loadLedger() {
  ledgerLoading.value = true;
  try {
    const params: Record<string, unknown> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      currency: ledgerFilters.currency || undefined,
      changeType: ledgerFilters.changeType || undefined,
      userId: ledgerFilters.userId ? Number(ledgerFilters.userId) : undefined,
    };
    if (dateRange.value) {
      params.dateFrom = new Date(dateRange.value[0]).toISOString();
      params.dateTo = new Date(dateRange.value[1]).toISOString();
    }
    const data = unwrap<{ list: InterestTreasureLedgerRow[]; pagination: { total: number } }>(
      await interestTreasureApi.listLedger(params),
    );
    ledgerRows.value = data?.list || [];
    pagination.itemCount = data?.pagination?.total || 0;
  } catch (e: any) {
    message.error(e?.message || $t('activity.interestTreasure.loadFailed'));
  } finally {
    ledgerLoading.value = false;
  }
}

function setQuickRange(kind: 'day' | 'week' | 'month') {
  const end = Date.now();
  const start =
    kind === 'day'
      ? end - 86400000
      : kind === 'week'
        ? end - 7 * 86400000
        : end - 30 * 86400000;
  dateRange.value = [start, end];
}

function resetLedger() {
  ledgerFilters.userId = '';
  ledgerFilters.changeType = null;
  ledgerFilters.currency = null;
  dateRange.value = null;
  pagination.page = 1;
  loadLedger();
}

function onPage(p: number) {
  pagination.page = p;
  loadLedger();
}
function onPageSize(s: number) {
  pagination.pageSize = s;
  pagination.page = 1;
  loadLedger();
}

watch(activeTab, (t) => {
  if (t === 'ledger') loadLedger();
});

onMounted(loadConfigs);
</script>
