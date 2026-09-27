<template>
  <n-card title="活跃度记录">
    <div class="mb-3 flex flex-wrap items-center gap-2 justify-between">
      <div class="flex items-center gap-2">
        <n-input
          v-model:value="filterUserId"
          placeholder="用户ID"
          clearable
          style="width: 140px"
          @keyup.enter="reload"
        />
        <n-select
          v-model:value="filterSource"
          :options="sourceOptions"
          clearable
          placeholder="变动类型"
          style="width: 180px"
        />
        <n-button @click="reload">查询</n-button>
      </div>
      <div class="flex gap-2">
        <n-button type="primary" @click="showAdd = true">新增活跃度</n-button>
        <n-button @click="load">刷新</n-button>
      </div>
    </div>
    <n-data-table
      :columns="columns"
      :data="rows"
      :loading="loading"
      :pagination="pagination"
      size="small"
      @update:page="onPage"
    />
    <AddActivityPointsModal v-model:show="showAdd" @done="reload" />
  </n-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useMessage, type DataTableColumns } from 'naive-ui';
import { taskCenterPeriodicApi } from '#/api/taskCenterPeriodic';
import AddActivityPointsModal from './AddActivityPointsModal.vue';

const message = useMessage();
const loading = ref(false);
const rows = ref<any[]>([]);
const showAdd = ref(false);
const filterUserId = ref('');
const filterSource = ref<string | null>(null);

const sourceOptions = [
  { label: '已获得', value: 'task_tier' },
  { label: '系统添加', value: 'admin' },
  { label: '活跃度宝箱消耗', value: 'chest_open' },
  { label: '过期', value: 'expire' },
  { label: '商城兑换消耗', value: 'mall_exchange' },
  { label: '兑换失败(已退回)', value: 'mall_refund' },
];

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  onChange: (page: number) => onPage(page),
});

const columns: DataTableColumns<any> = [
  { title: 'ID', key: 'id', width: 90 },
  { title: '用户ID', key: 'userId', width: 100 },
  {
    title: '变动类型',
    key: 'changeTypeLabel',
    width: 140,
    render: (r) => r.changeTypeLabel || r.source,
  },
  {
    title: '变动量',
    key: 'amount',
    width: 110,
    render: (r) => String(r.amount),
  },
  {
    title: '前台备注',
    key: 'frontRemark',
    ellipsis: { tooltip: true },
    render: (r) => r.frontRemark || '--',
  },
  {
    title: '过期时间',
    key: 'expiresAt',
    width: 160,
    render: (r) =>
      r.expiresAt ? new Date(r.expiresAt).toLocaleString() : '--',
  },
  {
    title: '时间',
    key: 'createdAt',
    width: 160,
    render: (r) =>
      r.createdAt ? new Date(r.createdAt).toLocaleString() : '--',
  },
];

async function load() {
  loading.value = true;
  try {
    const skip = (pagination.page - 1) * pagination.pageSize;
    const res: any = await taskCenterPeriodicApi.listLedger({
      take: pagination.pageSize,
      skip,
      userId: filterUserId.value ? Number(filterUserId.value) : undefined,
      source: filterSource.value || undefined,
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

function onPage(page: number) {
  pagination.page = page;
  void load();
}

onMounted(load);
</script>
