<template>
  <div class="provident-fund-page">
    <Page title="公积金" description="可配置多条公积金规则，添加或编辑单条规则请在弹窗中完成">
      <n-card>
        <n-form
          class="mb-4"
          :show-feedback="false"
          label-placement="left"
          label-width="auto"
        >
          <n-grid :cols="24" :x-gap="16" :y-gap="12">
            <n-gi :span="6">
              <n-form-item label="名称">
                <n-input
                  v-model:value="filters.keyword"
                  clearable
                  placeholder="公积金名称关键词"
                  @keyup.enter="applyFilters"
                />
              </n-form-item>
            </n-gi>
            <n-gi :span="5">
              <n-form-item label="币种">
                <n-select
                  v-model:value="filters.currency"
                  clearable
                  placeholder="全部"
                  :options="currencyFilterOptions"
                />
              </n-form-item>
            </n-gi>
            <n-gi :span="6">
              <n-form-item label="打码平台">
                <n-select
                  v-model:value="filters.platform"
                  clearable
                  placeholder="全部"
                  :options="platformFilterOptions"
                />
              </n-form-item>
            </n-gi>
            <n-gi :span="7">
              <n-form-item :show-label="false">
                <n-space>
                  <n-button type="primary" @click="applyFilters">搜索</n-button>
                  <n-button @click="resetFilters">重置</n-button>
                </n-space>
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-form>

        <n-space justify="space-between" align="center" class="mb-4" wrap>
          <n-text depth="3">
            共 {{ filteredList.length }} 条
            <span v-if="hasActiveFilters">（全部 {{ list.length }} 条）</span>
          </n-text>
          <n-button type="primary" @click="openCreate">添加</n-button>
        </n-space>

        <n-data-table
          :columns="columns"
          :data="filteredList"
          :scroll-x="tableScrollX"
          striped
          size="small"
          :bordered="false"
          :pagination="false"
        >
          <template #empty>
            <n-empty :description="emptyDescription" />
          </template>
        </n-data-table>
      </n-card>

      <ProvidentFundSettingModal
        :key="modalInstanceKey"
        v-model:show="showModal"
        :mode="modalMode"
        :initial-snapshot="editingSnapshot"
        @saved="onSaved"
      />
    </Page>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue';
import {
  NCard,
  NSpace,
  NButton,
  NText,
  NDataTable,
  NEmpty,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NGrid,
  NGi,
  useDialog,
  type DataTableColumns,
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import ProvidentFundSettingModal from './components/ProvidentFundSettingModal.vue';
import {
  type ProvidentFundFormSnapshot,
  type ProvidentFundListItem,
  cloneSnapshot,
} from './components/providentFundTypes';

const dialog = useDialog();

const list = ref<ProvidentFundListItem[]>([]);

/** 筛选：与列表字段对应，提交后写入 applied* 再过滤 */
const filters = reactive({
  keyword: '',
  currency: null as string | null,
  platform: null as ProvidentFundFormSnapshot['platformRestriction'] | null,
});

const appliedKeyword = ref('');
const appliedCurrency = ref<string | null>(null);
const appliedPlatform = ref<
  ProvidentFundFormSnapshot['platformRestriction'] | null
>(null);

const currencyFilterOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'CNY', value: 'CNY' },
];

const platformFilterOptions = [
  { label: '不限制', value: 'all_platforms' },
  { label: '指定平台', value: 'specific_platforms' },
  { label: '排除勾选', value: 'exclude_platforms' },
];

const hasActiveFilters = computed(
  () =>
    !!appliedKeyword.value.trim() ||
    appliedCurrency.value != null ||
    appliedPlatform.value != null,
);

const filteredList = computed(() => {
  const kw = appliedKeyword.value.trim().toLowerCase();
  const cur = appliedCurrency.value;
  const plat = appliedPlatform.value;

  return list.value.filter((row) => {
    const snap = row.snapshot;
    if (kw && !snap.displayName.toLowerCase().includes(kw)) {
      return false;
    }
    if (cur && !snap.currencies.includes(cur)) {
      return false;
    }
    if (plat && snap.platformRestriction !== plat) {
      return false;
    }
    return true;
  });
});

const emptyDescription = computed(() =>
  list.value.length === 0
    ? '暂无数据，请点击「添加」创建公积金规则'
    : '没有符合筛选条件的数据，请调整筛选项或点击「重置」',
);

function applyFilters() {
  appliedKeyword.value = filters.keyword;
  appliedCurrency.value = filters.currency;
  appliedPlatform.value = filters.platform;
}

function resetFilters() {
  filters.keyword = '';
  filters.currency = null;
  filters.platform = null;
  appliedKeyword.value = '';
  appliedCurrency.value = null;
  appliedPlatform.value = null;
}

const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const editingId = ref<string | null>(null);
const editingSnapshot = ref<ProvidentFundFormSnapshot | null>(null);

/** 避免编辑同一条时弹窗不刷新初始数据 */
const modalInstanceKey = computed(
  () => `${modalMode.value}-${editingId.value ?? 'new'}`,
);

const tableScrollX = 900;

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function platformLabel(
  mode: ProvidentFundFormSnapshot['platformRestriction'],
) {
  if (mode === 'all_platforms') return '不限制';
  if (mode === 'specific_platforms') return '指定平台';
  return '排除勾选';
}

function openCreate() {
  modalMode.value = 'create';
  editingId.value = null;
  editingSnapshot.value = null;
  showModal.value = true;
}

function openEdit(row: ProvidentFundListItem) {
  modalMode.value = 'edit';
  editingId.value = row.id;
  editingSnapshot.value = cloneSnapshot(row.snapshot);
  showModal.value = true;
}

function confirmDelete(row: ProvidentFundListItem) {
  dialog.warning({
    title: '删除确认',
    content: `确定删除「${row.snapshot.displayName}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      list.value = list.value.filter((x) => x.id !== row.id);
      return true;
    },
  });
}

function onSaved(snapshot: ProvidentFundFormSnapshot) {
  const now = Date.now();
  const snap = cloneSnapshot(snapshot);
  if (editingId.value) {
    const idx = list.value.findIndex((x) => x.id === editingId.value);
    if (idx >= 0) {
      list.value[idx] = {
        ...list.value[idx],
        snapshot: snap,
        updatedAt: now,
      };
    }
  } else {
    list.value.push({
      id: crypto.randomUUID(),
      snapshot: snap,
      updatedAt: now,
    });
  }
  editingId.value = null;
  editingSnapshot.value = null;
}

const columns: DataTableColumns<ProvidentFundListItem> = [
  {
    title: '公积金名称',
    key: 'displayName',
    width: 140,
    ellipsis: { tooltip: true },
    render: (row) => row.snapshot.displayName,
  },
  {
    title: '适用币种',
    key: 'currencies',
    width: 160,
    ellipsis: { tooltip: true },
    render: (row) => row.snapshot.currencies.join('、') || '-',
  },
  {
    title: '赠送比例',
    key: 'giftRatio',
    width: 100,
    render: (row) => `${row.snapshot.giftRatioPercent}%`,
  },
  {
    title: '打码平台',
    key: 'platform',
    width: 120,
    render: (row) => platformLabel(row.snapshot.platformRestriction),
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 170,
    render: (row) => formatTime(row.updatedAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              { size: 'small', onClick: () => openEdit(row) },
              { default: () => '编辑' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                secondary: true,
                onClick: () => confirmDelete(row),
              },
              { default: () => '删除' },
            ),
          ],
        },
      ),
  },
];
</script>
