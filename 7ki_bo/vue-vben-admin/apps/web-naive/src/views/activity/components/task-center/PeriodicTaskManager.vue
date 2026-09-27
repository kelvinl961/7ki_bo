<template>
  <div class="periodic-task-manager space-y-4">
    <n-card :bordered="false">
      <div class="mb-3 flex items-center justify-between">
        <div class="text-sm text-gray-600">{{ title }}</div>
        <div class="flex gap-2">
          <n-button type="primary" @click="openCreate">新增任务</n-button>
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
    </n-card>

    <PeriodicTaskFormModal
      v-model:show="showForm"
      :category="category"
      :edit-item="editItem"
      @saved="load"
    />
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import { NButton, NSwitch, useMessage, type DataTableColumns } from 'naive-ui';
import {
  taskCenterPeriodicApi,
  type PeriodicCategory,
} from '#/api/taskCenterPeriodic';
import PeriodicTaskFormModal from './PeriodicTaskFormModal.vue';

const props = defineProps<{
  category: PeriodicCategory;
  title: string;
}>();

const message = useMessage();
const loading = ref(false);
const rows = ref<any[]>([]);
const showForm = ref(false);
const editItem = ref<any | null>(null);
const pagination = reactive({ pageSize: 20 });

const columns: DataTableColumns<any> = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '目标', key: 'goalType', width: 140 },
  {
    title: '阶梯数',
    key: 'tiers',
    width: 80,
    render: (r) => (Array.isArray(r.tiers) ? r.tiers.length : 0),
  },
  {
    title: '启用',
    key: 'isActive',
    width: 90,
    render: (row) =>
      h(NSwitch, {
        value: row.isActive,
        onUpdateValue: (v: boolean) => toggle(row, v),
      }),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (row) =>
      h(
        NButton,
        { size: 'small', onClick: () => openEdit(row) },
        { default: () => '编辑' },
      ),
  },
];

async function load() {
  loading.value = true;
  try {
    const res: any = await taskCenterPeriodicApi.list(props.category);
    rows.value = res?.data ?? res ?? [];
  } catch (e: any) {
    message.error(e?.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editItem.value = null;
  showForm.value = true;
}
function openEdit(row: any) {
  editItem.value = row;
  showForm.value = true;
}
async function toggle(row: any, isActive: boolean) {
  try {
    await taskCenterPeriodicApi.setStatus(row.id, isActive);
    row.isActive = isActive;
  } catch (e: any) {
    message.error(e?.message || '更新失败');
  }
}

onMounted(load);
</script>
