<template>
  <div class="category-management">
    <n-card :title="$t('activity.center.k5206') || '分类管理'">
      <div class="mb-4 flex gap-2">
        <n-input
          v-model:value="newName"
          placeholder="分类名称"
          style="max-width: 240px"
        />
        <n-button type="primary" :loading="saving" @click="handleCreate">
          新增分类
        </n-button>
        <n-button @click="loadCategories">刷新</n-button>
      </div>

      <n-data-table
        :columns="columns"
        :data="categories"
        :loading="loading"
        :bordered="false"
        size="small"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';
import { h, onMounted, ref } from 'vue';
import {
  NButton,
  NCard,
  NDataTable,
  NInput,
  NSpace,
  NSwitch,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  createActivityCategory,
  deleteActivityCategory,
  getActivityCategories,
  updateActivityCategory,
  type ActivityCategoryItem,
} from '#/api/activity';

const message = useMessage();
const loading = ref(false);
const saving = ref(false);
const categories = ref<ActivityCategoryItem[]>([]);
const newName = ref('');

const loadCategories = async () => {
  loading.value = true;
  try {
    const res = await getActivityCategories();
    categories.value = res.data ?? [];
  } catch (e) {
    message.error(e instanceof Error ? e.message : '加载分类失败');
  } finally {
    loading.value = false;
  }
};

const handleCreate = async () => {
  if (!newName.value.trim()) {
    message.warning('请输入分类名称');
    return;
  }
  saving.value = true;
  try {
    await createActivityCategory({ name: newName.value.trim() });
    newName.value = '';
    message.success('创建成功');
    await loadCategories();
  } catch (e) {
    message.error(e instanceof Error ? e.message : '创建失败');
  } finally {
    saving.value = false;
  }
};

const columns: DataTableColumns<ActivityCategoryItem> = [
  { title: 'ID', key: 'id', width: 160 },
  { title: '名称', key: 'name', width: 160 },
  {
    title: '系统',
    key: 'isSystem',
    width: 80,
    render: (row) =>
      h(NTag, { type: row.isSystem ? 'info' : 'default', size: 'small' }, {
        default: () => (row.isSystem ? '系统' : '自定义'),
      }),
  },
  { title: '排序', key: 'sortOrder', width: 80 },
  {
    title: '启用',
    key: 'enabled',
    width: 100,
    render: (row) =>
      h(NSwitch, {
        value: row.enabled,
        onUpdateValue: async (v: boolean) => {
          try {
            await updateActivityCategory(row.id, { enabled: v });
            row.enabled = v;
          } catch (e) {
            message.error(e instanceof Error ? e.message : '更新失败');
          }
        },
      }),
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) =>
      h(NSpace, null, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              disabled: row.isSystem,
              onClick: async () => {
                try {
                  await deleteActivityCategory(row.id);
                  message.success('已删除');
                  await loadCategories();
                } catch (e) {
                  message.error(e instanceof Error ? e.message : '删除失败');
                }
              },
            },
            { default: () => '删除' },
          ),
        ],
      }),
  },
];

onMounted(loadCategories);
</script>

<style scoped>
.category-management {
  min-height: 320px;
}
</style>
