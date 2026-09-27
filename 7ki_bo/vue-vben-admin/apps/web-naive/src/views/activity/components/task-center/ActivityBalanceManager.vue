<template>
  <n-card title="剩余活跃度">
    <div class="mb-3 flex flex-wrap items-center gap-2 justify-between">
      <div class="flex items-center gap-2">
        <n-input
          v-model:value="filterUserId"
          placeholder="用户ID"
          clearable
          style="width: 140px"
          @keyup.enter="reload"
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

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  onChange: (page: number) => {
    pagination.page = page;
    void load();
  },
});

const columns: DataTableColumns<any> = [
  { title: '用户ID', key: 'userId', width: 120 },
  {
    title: '总获得',
    key: 'totalEarned',
    render: (r) => String(r.totalEarned ?? '0'),
  },
  {
    title: '总消耗',
    key: 'totalSpent',
    render: (r) => String(r.totalSpent ?? '0'),
  },
  {
    title: '总过期',
    key: 'totalExpired',
    render: (r) => String(r.totalExpired ?? '0'),
  },
  {
    title: '剩余活跃度',
    key: 'balance',
    render: (r) => String(r.balance),
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 170,
    render: (r) =>
      r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '--',
  },
];

async function load() {
  loading.value = true;
  try {
    const skip = (pagination.page - 1) * pagination.pageSize;
    const res: any = await taskCenterPeriodicApi.listBalances({
      take: pagination.pageSize,
      skip,
      userId: filterUserId.value ? Number(filterUserId.value) : undefined,
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

onMounted(load);
</script>
