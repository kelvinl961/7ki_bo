<template>
  <div class="provident-fund-page">
    <Page title="公积金" description="用户每次充值后获得对应比例的公积金奖励，需完成对应倍数的打码后才可取出领取；仅统计公积金开关开启后的充值。">
      <n-card>
        <n-tabs v-model:value="activeTab" type="line" class="mb-4">
          <n-tab-pane name="details" tab="公积金明细" />
          <n-tab-pane name="wagering" tab="投注要求" />
          <n-tab-pane name="withdrawals" tab="取出记录" />
        </n-tabs>

        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <n-space align="center" wrap>
            <span class="text-sm text-gray-600">公积金开关</span>
            <n-switch
              :value="pfEnabled"
              :loading="switchLoading"
              @update:value="onSwitch"
            />
            <n-text v-if="pfEnabledAt" depth="3" class="text-xs">
              开启时间：{{ formatTs(pfEnabledAt) }}
            </n-text>
          </n-space>
          <n-space>
            <n-button type="primary" @click="showSettings = true">公积金设置</n-button>
            <n-button v-if="activeTab === 'details'" secondary @click="exportDetails">
              导出报表
            </n-button>
          </n-space>
        </div>

        <n-form class="mb-4" :show-feedback="false" label-placement="left" label-width="auto">
          <n-grid :cols="24" :x-gap="12" :y-gap="8">
            <n-gi :span="6">
              <n-form-item label="时间">
                <n-space>
                  <n-button size="small" @click="setQuickRange('day')">日</n-button>
                  <n-button size="small" @click="setQuickRange('week')">周</n-button>
                  <n-button size="small" @click="setQuickRange('month')">月</n-button>
                </n-space>
              </n-form-item>
            </n-gi>
            <n-gi :span="12">
              <n-form-item label="范围">
                <n-date-picker
                  v-model:value="dateRange"
                  type="datetimerange"
                  clearable
                  style="width: 100%"
                />
              </n-form-item>
            </n-gi>
            <n-gi :span="6">
              <n-form-item label="会员账号">
                <n-input v-model:value="filters.account" clearable placeholder="请输入会员账号" />
              </n-form-item>
            </n-gi>
            <n-gi :span="6">
              <n-form-item label="活动币种">
                <n-select
                  v-model:value="filters.currency"
                  clearable
                  placeholder="全部"
                  :options="currencyOptions"
                />
              </n-form-item>
            </n-gi>
            <n-gi :span="6" v-if="activeTab === 'wagering'">
              <n-form-item label="投注状态">
                <n-select
                  v-model:value="filters.status"
                  clearable
                  placeholder="全部"
                  :options="statusOptions"
                />
              </n-form-item>
            </n-gi>
            <n-gi :span="6">
              <n-form-item :show-label="false">
                <n-space>
                  <n-button type="primary" @click="reloadActive">搜索</n-button>
                  <n-button @click="resetFilters">重置</n-button>
                </n-space>
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-form>

        <n-data-table
          :key="activeTab"
          :columns="activeColumns"
          :data="tableRows"
          :loading="loading"
          :scroll-x="1200"
          striped
          size="small"
          remote
          :pagination="pagination"
          @update:page="onPage"
          @update:page-size="onPageSize"
        />
      </n-card>

      <ProvidentFundSettingModal
        v-model:show="showSettings"
        mode="edit"
        title-text="公积金设置"
        :initial-snapshot="settingsSnapshot ?? defaultProvidentFundSnapshot()"
        @saved="onSettingsSaved"
      />
    </Page>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, h } from 'vue';
import {
  NCard,
  NTabs,
  NTabPane,
  NSpace,
  NButton,
  NText,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NGrid,
  NGi,
  NDataTable,
  NSwitch,
  NDatePicker,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import ProvidentFundSettingModal from './components/ProvidentFundSettingModal.vue';
import {
  type ProvidentFundFormSnapshot,
  defaultProvidentFundSnapshot,
  normalizeProvidentFundSettings,
} from './components/providentFundTypes';
import {
  exportProvidentFundDetailsCsvApi,
  forceReleaseProvidentFundWageringApi,
  getProvidentFundAdminConfigApi,
  listProvidentFundDetailsApi,
  listProvidentFundWageringApi,
  listProvidentFundWithdrawalsApi,
  putProvidentFundAdminSwitchApi,
} from '#/api/core/provident-fund-admin';

const message = useMessage();
const activeTab = ref<'details' | 'wagering' | 'withdrawals'>('details');
const pfEnabled = ref(false);
const pfEnabledAt = ref<string | null>(null);
const settingsSnapshot = ref<ProvidentFundFormSnapshot | null>(null);
const switchLoading = ref(false);
const showSettings = ref(false);

const dateRange = ref<[number, number] | null>(null);
const filters = reactive({
  account: '',
  currency: null as string | null,
  status: null as string | null,
});

const currencyOptions = [{ label: 'BRL', value: 'BRL' }];

const statusOptions = [
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
];

const loading = ref(false);
const tableRows = ref<any[]>([]);
const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: any) => `共 ${info.itemCount} 条`,
});

function formatTs(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('zh-CN');
}

function rangeParams() {
  if (!dateRange.value) return {};
  const [a, b] = dateRange.value;
  return { from: new Date(a).toISOString(), to: new Date(b).toISOString() };
}

function setQuickRange(kind: 'day' | 'week' | 'month') {
  const end = new Date();
  const start = new Date(end);
  if (kind === 'day') start.setHours(0, 0, 0, 0);
  if (kind === 'week') start.setDate(start.getDate() - 7);
  if (kind === 'month') start.setMonth(start.getMonth() - 1);
  dateRange.value = [start.getTime(), end.getTime()];
}

async function loadConfig() {
  const cfg = await getProvidentFundAdminConfigApi();
  pfEnabled.value = cfg.enabled;
  pfEnabledAt.value = cfg.enabledAt;
  settingsSnapshot.value = normalizeProvidentFundSettings(
    cfg.settings as Record<string, unknown>,
  );
}

async function onSwitch(v: boolean) {
  switchLoading.value = true;
  try {
    const r = await putProvidentFundAdminSwitchApi(v);
    pfEnabled.value = r.enabled;
    pfEnabledAt.value = r.enabledAt;
    message.success(v ? '已开启公积金统计' : '已关闭公积金');
  } catch {
    message.error('开关更新失败');
  } finally {
    switchLoading.value = false;
  }
}

function resetFilters() {
  filters.account = '';
  filters.currency = null;
  filters.status = null;
  dateRange.value = null;
  pagination.page = 1;
  reloadActive();
}

async function reloadActive() {
  loading.value = true;
  try {
    const rp = rangeParams();
    if (activeTab.value === 'details') {
      const res = await listProvidentFundDetailsApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        account: filters.account || undefined,
        currency: filters.currency || undefined,
        ...rp,
      });
      tableRows.value = res.list;
      pagination.itemCount = res.pagination.total;
    } else if (activeTab.value === 'wagering') {
      const res = await listProvidentFundWageringApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        account: filters.account || undefined,
        currency: filters.currency || undefined,
        status: filters.status || undefined,
        ...rp,
      });
      tableRows.value = res.list;
      pagination.itemCount = res.pagination.total;
    } else {
      const res = await listProvidentFundWithdrawalsApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        account: filters.account || undefined,
        currency: filters.currency || undefined,
        ...rp,
      });
      tableRows.value = res.list;
      pagination.itemCount = res.pagination.total;
    }
  } catch (e) {
    console.error(e);
    message.error('加载失败');
  } finally {
    loading.value = false;
  }
}

function onPage(p: number) {
  pagination.page = p;
  reloadActive();
}
function onPageSize(s: number) {
  pagination.pageSize = s;
  pagination.page = 1;
  reloadActive();
}

watch(activeTab, () => {
  pagination.page = 1;
  reloadActive();
});

async function exportDetails() {
  try {
    const blob = await exportProvidentFundDetailsCsvApi({
      account: filters.account || undefined,
      currency: filters.currency || undefined,
      ...rangeParams(),
    } as any);
    const url = URL.createObjectURL(blob as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'provident-fund-details.csv';
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出已开始');
  } catch {
    message.error('导出失败');
  }
}

async function onSettingsSaved() {
  await loadConfig();
}

function resetCycleLabel(v: string) {
  const m: Record<string, string> = {
    none: '不限制',
    monthly: '每月',
    quarterly: '每季度',
    semi_annual: '每半年',
    annual: '每年',
  };
  return m[v] || v || '--';
}

const detailColumns: DataTableColumns<any> = [
  {
    title: '会员ID',
    key: 'userId',
    width: 100,
    render: (row) =>
      h('span', { style: 'color:#2080f0;cursor:pointer' }, String(row.userId)),
  },
  { title: '会员账号', key: 'memberAccount', width: 120, ellipsis: { tooltip: true } },
  { title: '币种', key: 'currency', width: 80 },
  { title: '充值金额', key: 'rechargeAmount', width: 100 },
  { title: '赠送比例', key: 'giftRatioPercent', width: 90, render: (r) => `${r.giftRatioPercent}%` },
  { title: '赠送前公积金', key: 'balanceBefore', width: 120 },
  { title: '赠送公积金', key: 'giftAmount', width: 110 },
  { title: '赠送后公积金', key: 'balanceAfter', width: 120 },
  {
    title: '已赠送/封顶次数',
    key: 'times',
    width: 130,
    render: (r) =>
      r.giftTimesCap != null ? `${r.giftTimesCurrent ?? ''}/${r.giftTimesCap}` : '--',
  },
  {
    title: '公积金封顶',
    key: 'cumulativeCap',
    width: 110,
    render: (r) => (r.cumulativeCap != null ? r.cumulativeCap : '--'),
  },
  { title: '投注倍数', key: 'betMultiple', width: 90 },
  { title: '新增投注量', key: 'newBetRequirement', width: 110 },
  {
    title: '更新时间',
    key: 'createdAt',
    width: 170,
    render: (r) => formatTs(r.createdAt),
  },
];

const wageringColumns: DataTableColumns<any> = [
  {
    title: '会员ID',
    key: 'userId',
    width: 90,
    render: (row) => h('span', { style: 'color:#2080f0' }, String(row.userId)),
  },
  { title: '会员账号', key: 'memberAccount', width: 120, ellipsis: { tooltip: true } },
  { title: '币种', key: 'currency', width: 70 },
  { title: '重置周期', key: 'resetCycle', width: 100, render: (r) => resetCycleLabel(r.resetCycle) },
  { title: '公积金奖金', key: 'bonusAmount', width: 110 },
  { title: '总要求投注', key: 'totalRequiredBet', width: 110 },
  { title: '已投注', key: 'wageredBet', width: 90 },
  { title: '剩余投注', key: 'remainingBet', width: 90 },
  {
    title: '限制平台',
    key: 'platformLabels',
    width: 120,
    ellipsis: { tooltip: true },
    render: (r) => {
      const v = r.platformLabels;
      if (v == null) return '--';
      if (Array.isArray(v)) return v.join('、') || '--';
      return String(v);
    },
  },
  {
    title: '投注状态',
    key: 'bettingStatus',
    width: 100,
    render: (r) =>
      h(
        'span',
        { style: { color: r.bettingStatus === 'COMPLETED' ? '#18a058' : '#2080f0' } },
        r.bettingStatus === 'COMPLETED' ? '已完成' : '进行中',
      ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (r) =>
      h(
        NButton,
        {
          size: 'small',
          type: 'info',
          text: true,
          disabled: r.bettingStatus === 'COMPLETED',
          onClick: () => doForce(r),
        },
        { default: () => '强制解除' },
      ),
  },
  {
    title: '创建时间',
    key: 'firstOccurrenceAt',
    width: 170,
    render: (r) => formatTs(r.firstOccurrenceAt),
  },
];

const withdrawalColumns: DataTableColumns<any> = [
  { title: '会员ID', key: 'userId', width: 90 },
  { title: '会员账号', key: 'memberAccount', width: 140, ellipsis: { tooltip: true } },
  { title: '币种', key: 'currency', width: 80 },
  { title: '取出金额', key: 'amount', width: 110 },
  { title: '领取时间', key: 'claimedAt', width: 180, render: (r) => formatTs(r.claimedAt) },
];

const activeColumns = computed(() => {
  if (activeTab.value === 'details') return detailColumns;
  if (activeTab.value === 'wagering') return wageringColumns;
  return withdrawalColumns;
});

async function doForce(row: any) {
  try {
    await forceReleaseProvidentFundWageringApi(row.id);
    message.success('已强制解除');
    reloadActive();
  } catch {
    message.error('操作失败');
  }
}

loadConfig().then(() => reloadActive());
</script>
