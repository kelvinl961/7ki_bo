<template>
  <div class="activity-grid">
    <div class="toolbar">
      <div class="filters">
        <n-radio-group v-model:value="preset" size="small" @update:value="applyPreset">
          <n-radio-button value="day">日</n-radio-button>
          <n-radio-button value="week">周</n-radio-button>
          <n-radio-button value="month">月</n-radio-button>
        </n-radio-group>
        <n-date-picker
          v-model:value="range"
          type="datetimerange"
          clearable
          style="width: 340px"
          @update:value="preset = null"
        />
        <n-select
          v-model:value="currency"
          :options="currencyOptions"
          style="width: 110px"
        />
        <n-select
          v-model:value="accountType"
          :options="accountTypeOptions"
          style="width: 110px"
        />
        <n-input
          v-model:value="keyword"
          placeholder="请输入会员ID"
          clearable
          style="width: 160px"
          @keyup.enter="reload"
        />
        <n-select
          v-model:value="origin"
          :options="originOptions"
          clearable
          placeholder="变动来源"
          style="width: 140px"
        />
        <n-select
          v-model:value="source"
          :options="sourceOptions"
          clearable
          placeholder="全部类型"
          style="width: 160px"
        />
        <n-button type="primary" @click="reload">搜索</n-button>
        <n-button @click="reset">重置</n-button>
      </div>
      <div class="actions">
        <n-button type="primary" @click="showAdd = true">新增活跃度</n-button>
        <n-button @click="exportCsv">导出报表</n-button>
      </div>
    </div>

    <n-data-table
      remote
      :columns="columns"
      :data="rows"
      :loading="loading"
      :pagination="pagination"
      :scroll-x="2200"
      size="small"
      @update:page="onPage"
    >
      <template #empty>
        <n-empty description="暂无数据" />
      </template>
    </n-data-table>

    <AddActivityPointsModal v-if="showAdd" v-model:show="showAdd" @done="reload" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import {
  NButton,
  NDataTable,
  NDatePicker,
  NEmpty,
  NInput,
  NRadioButton,
  NRadioGroup,
  NSelect,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import { taskCenterPeriodicApi } from '#/api/taskCenterPeriodic';
import AddActivityPointsModal from './AddActivityPointsModal.vue';

const message = useMessage();
const loading = ref(false);
const rows = ref<any[]>([]);
const showAdd = ref(false);
const keyword = ref('');
const source = ref<string | null>(null);
const origin = ref<string | null>(null);
const currency = ref('BRL');
const accountType = ref('member');
const preset = ref<'day' | 'week' | 'month' | null>('day');
const range = ref<[number, number] | null>(null);

const currencyOptions = [{ label: 'BRL', value: 'BRL' }];
const accountTypeOptions = [{ label: '会员', value: 'member' }];
const originOptions = [
  { label: '任务', value: 'task' },
  { label: '系统', value: 'system' },
  { label: '活跃度宝箱', value: 'chest' },
  { label: '商城', value: 'mall' },
  { label: '过期', value: 'expire' },
];
const sourceOptions = [
  { label: '已获得', value: 'earned' },
  { label: '系统添加', value: 'admin' },
  { label: '活跃度宝箱消耗', value: 'chest_open' },
  { label: '过期', value: 'expire' },
  { label: '商城兑换消耗', value: 'mall_exchange' },
  { label: '兑换失败(已退回)', value: 'refund' },
];

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  prefix: (info: { itemCount?: number }) => `共 ${info.itemCount ?? 0} 条`,
});

function fmt(v: unknown) {
  if (!v) return '--';
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? '--' : d.toLocaleString();
}

const columns: DataTableColumns<any> = [
  { title: '会员币种', key: 'currency', width: 90 },
  { title: '账号类型', key: 'accountType', width: 90 },
  { title: '会员ID', key: 'memberId', width: 120, render: (r) => r.memberId || '--' },
  { title: '会员账号', key: 'account', width: 140, ellipsis: { tooltip: true } },
  { title: '变动来源', key: 'originLabel', width: 120 },
  { title: '来源类型', key: 'sourceTypeLabel', width: 140 },
  { title: '变动类型', key: 'changeTypeLabel', width: 140 },
  {
    title: '变动前',
    key: 'balanceBefore',
    width: 100,
    render: (r) => (r.balanceBefore ? String(r.balanceBefore) : '--'),
  },
  {
    title: '变动活跃度',
    key: 'amount',
    width: 110,
    render: (r) => {
      const n = Number(r.amount);
      if (!Number.isFinite(n) || n === 0) return '0';
      return n > 0 ? `+${n}` : String(n);
    },
  },
  {
    title: '变动后',
    key: 'balanceAfter',
    width: 100,
    render: (r) => (r.balanceAfter ? String(r.balanceAfter) : '--'),
  },
  { title: '创建时间', key: 'createdAt', width: 170, render: (r) => fmt(r.createdAt) },
  {
    title: '前台备注',
    key: 'frontRemark',
    ellipsis: { tooltip: true },
    render: (r) => r.frontRemark || '--',
  },
  {
    title: '后台备注',
    key: 'backRemark',
    ellipsis: { tooltip: true },
    render: (r) => r.backRemark || '--',
  },
  { title: '变动时间', key: 'createdAt2', width: 170, render: (r) => fmt(r.createdAt) },
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function applyPreset(value: 'day' | 'week' | 'month') {
  const now = new Date();
  const end = now.getTime();
  if (value === 'day') {
    range.value = [startOfDay(now).getTime(), end];
    return;
  }
  if (value === 'week') {
    const start = startOfDay(now);
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    range.value = [start.getTime(), end];
    return;
  }
  const start = startOfDay(now);
  start.setDate(1);
  range.value = [start.getTime(), end];
}

async function load() {
  loading.value = true;
  try {
    const skip = (pagination.page - 1) * pagination.pageSize;
    const res: any = await taskCenterPeriodicApi.listLedger({
      take: pagination.pageSize,
      skip,
      keyword: keyword.value.trim() || undefined,
      source: source.value || undefined,
      origin: origin.value || undefined,
      from: range.value ? new Date(range.value[0]).toISOString() : undefined,
      to: range.value ? new Date(range.value[1]).toISOString() : undefined,
    });
    const data = res?.data ?? res;
    rows.value = data?.rows ?? [];
    pagination.itemCount = data?.total ?? 0;
  } catch (e: any) {
    message.error(e?.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function reload() {
  pagination.page = 1;
  void load();
}

function reset() {
  keyword.value = '';
  source.value = null;
  origin.value = null;
  preset.value = 'day';
  applyPreset('day');
  reload();
}

function onPage(page: number) {
  pagination.page = page;
  void load();
}

function exportCsv() {
  const header = [
    '会员币种',
    '账号类型',
    '会员ID',
    '会员账号',
    '变动来源',
    '来源类型',
    '变动类型',
    '变动前',
    '变动活跃度',
    '变动后',
    '创建时间',
    '前台备注',
    '后台备注',
    '变动时间',
  ];
  const lines = rows.value.map((r) =>
    [
      r.currency,
      r.accountType,
      r.memberId,
      r.account,
      r.originLabel,
      r.sourceTypeLabel,
      r.changeTypeLabel,
      r.balanceBefore || '',
      r.amount,
      r.balanceAfter || '',
      fmt(r.createdAt),
      r.frontRemark || '',
      r.backRemark || '',
      fmt(r.createdAt),
    ]
      .map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`)
      .join(','),
  );
  const blob = new Blob(['\uFEFF' + [header.join(','), ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'activity_points_ledger.csv';
  a.click();
  URL.revokeObjectURL(url);
}

onMounted(() => {
  applyPreset('day');
  void load();
});
</script>

<style scoped>
.activity-grid {
  background: #fff;
  padding: 12px 8px 8px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.filters,
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
</style>
