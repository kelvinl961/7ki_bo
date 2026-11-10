<template>
  <div class="activity-grid">
    <div class="toolbar">
      <div class="filters">
        <n-select
          v-model:value="currency"
          :options="currencyOptions"
          style="width: 110px"
        />
        <n-input
          v-model:value="memberId"
          placeholder="账号ID"
          clearable
          style="width: 160px"
          @keyup.enter="reload"
        />
        <n-input
          v-model:value="account"
          placeholder="请输入会员账号"
          clearable
          style="width: 180px"
          @keyup.enter="reload"
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
      :data="displayRows"
      :loading="loading"
      :pagination="pagination"
      :scroll-x="1600"
      size="small"
      @update:page="onPage"
      @update:sorter="onSort"
    >
      <template #empty>
        <n-empty description="暂无数据" />
      </template>
    </n-data-table>

    <AddActivityPointsModal v-if="showAdd" v-model:show="showAdd" @done="reload" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  NButton,
  NDataTable,
  NEmpty,
  NInput,
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
const memberId = ref('');
const account = ref('');
const currency = ref('BRL');
const sortKey = ref<string | null>(null);
const sortOrder = ref<'ascend' | 'descend' | false>(false);

const currencyOptions = [{ label: 'BRL', value: 'BRL' }];

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  prefix: (info: { itemCount?: number }) => `共 ${info.itemCount ?? 0} 条`,
});

const numericKeys = ['totalEarned', 'totalSpent', 'totalExpired', 'balance'] as const;

function numCol(title: string, key: (typeof numericKeys)[number]): DataTableColumns<any>[number] {
  return {
    title,
    key,
    sorter: true,
    render: (r) => String(r[key] ?? '0'),
  };
}

const columns: DataTableColumns<any> = [
  { title: '会员币种', key: 'currency', width: 90 },
  { title: '账号类型', key: 'accountType', width: 90 },
  { title: '会员ID', key: 'memberId', width: 140, render: (r) => r.memberId || '--' },
  { title: '会员账号', key: 'account', width: 160, ellipsis: { tooltip: true } },
  numCol('总获得活跃度', 'totalEarned'),
  numCol('总消耗活跃度', 'totalSpent'),
  numCol('总过期活跃度', 'totalExpired'),
  numCol('剩余活跃度', 'balance'),
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 180,
    render: (r) =>
      r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '--',
  },
];

const displayRows = computed(() => {
  if (!sortKey.value || !sortOrder.value) return rows.value;
  const key = sortKey.value;
  const dir = sortOrder.value === 'ascend' ? 1 : -1;
  return [...rows.value].sort(
    (a, b) => (Number(a[key]) - Number(b[key])) * dir,
  );
});

function onSort(sorter: { columnKey?: string; order?: 'ascend' | 'descend' | false }) {
  sortKey.value = sorter?.columnKey ?? null;
  sortOrder.value = sorter?.order ?? false;
}

async function load() {
  loading.value = true;
  try {
    const skip = (pagination.page - 1) * pagination.pageSize;
    const res: any = await taskCenterPeriodicApi.listBalances({
      take: pagination.pageSize,
      skip,
      memberId: memberId.value.trim() || undefined,
      account: account.value.trim() || undefined,
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
  memberId.value = '';
  account.value = '';
  sortKey.value = null;
  sortOrder.value = false;
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
    '总获得活跃度',
    '总消耗活跃度',
    '总过期活跃度',
    '剩余活跃度',
    '更新时间',
  ];
  const lines = displayRows.value.map((r) =>
    [
      r.currency,
      r.accountType,
      r.memberId,
      r.account,
      r.totalEarned,
      r.totalSpent,
      r.totalExpired,
      r.balance,
      r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '',
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
  a.download = 'activity_points_balance.csv';
  a.click();
  URL.revokeObjectURL(url);
}

onMounted(load);
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
