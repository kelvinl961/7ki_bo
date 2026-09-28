<template>
  <div class="daily-task-manager space-y-3">
    <!-- Filters + actions -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <n-select
          v-model:value="filters.goalType"
          :options="goalFilterOptions"
          clearable
          placeholder="全部任务目标"
          style="width: 160px"
        />
        <n-select
          v-model:value="filters.isActive"
          :options="statusFilterOptions"
          clearable
          placeholder="全部状态"
          style="width: 140px"
        />
        <n-button type="primary" @click="applyFilters">搜索</n-button>
        <n-button @click="resetFilters">重置</n-button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-600">每日任务开关</span>
        <n-switch
          v-model:value="dailyEnabled"
          :loading="settingsLoading"
          @update:value="onToggleEnabled"
        />
        <n-button type="primary" @click="showSettings = true"
          >每日任务设置</n-button
        >
        <n-button
          type="info"
          secondary
          :disabled="!detailItem"
          @click="showDetail = true"
          >详情</n-button
        >
        <n-button type="primary" @click="openCreate">
          <template #icon><n-icon :component="AddOutline" /></template>
          新增每日任务
        </n-button>
      </div>
    </div>

    <n-alert type="warning" :bordered="false" class="!py-1">
      提示：每日任务00:00重置
    </n-alert>

    <n-data-table
      :columns="columns"
      :data="filteredRows"
      :loading="loading"
      :row-key="(r: PeriodicRow) => r.id"
      v-model:checked-row-keys="checkedKeys"
      :scroll-x="1800"
      size="small"
      striped
    />

    <div class="flex items-center justify-between text-sm text-gray-600">
      <div class="flex items-center gap-2">
        <n-checkbox
          :checked="allPageSelected"
          :indeterminate="somePageSelected"
          @update:checked="toggleSelectAll"
        >
          全选当前页
        </n-checkbox>
        <n-select
          v-model:value="batchAction"
          :options="batchOptions"
          placeholder="批量操作"
          style="width: 140px"
          clearable
          @update:value="runBatch"
        />
        <span>已选择 {{ checkedKeys.length }} 条数据</span>
      </div>
      <span># {{ filteredRows.length }} 条</span>
    </div>

    <PeriodicTaskFormModal
      v-model:show="showForm"
      category="DAILY_TASK"
      :edit-item="editItem"
      @saved="load"
    />

    <DailyTaskSettingsModal
      v-model:show="showSettings"
      @saved="loadSettings"
    />

    <n-modal
      v-model:show="showDetail"
      preset="card"
      title="任务详情"
      style="width: 640px"
      to="body"
    >
      <template v-if="detailItem">
        <n-descriptions :column="2" label-placement="left" size="small" bordered>
          <n-descriptions-item label="ID">{{ detailItem.id }}</n-descriptions-item>
          <n-descriptions-item label="标题">{{ detailItem.title }}</n-descriptions-item>
          <n-descriptions-item label="目标">{{
            goalLabel(detailItem.goalType)
          }}</n-descriptions-item>
          <n-descriptions-item label="奖励类型">{{
            detailItem.rewardMode === 'random' ? '随机' : '固定'
          }}</n-descriptions-item>
          <n-descriptions-item label="币种">{{
            formatCurrencies(detailItem.currencies)
          }}</n-descriptions-item>
          <n-descriptions-item label="启用">{{
            detailItem.isActive ? '是' : '否'
          }}</n-descriptions-item>
          <n-descriptions-item label="活动日期" :span="2">
            {{ formatDate(detailItem.startsAt) }} ~
            {{ formatDate(detailItem.endsAt) }}
          </n-descriptions-item>
        </n-descriptions>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import {
  NAlert,
  NButton,
  NCheckbox,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NIcon,
  NModal,
  NSelect,
  NSwitch,
  useMessage,
  type DataTableColumns,
  type DataTableRowKey,
} from 'naive-ui';
import { AddOutline } from '@vicons/ionicons5';
import {
  taskCenterPeriodicApi,
  type PeriodicCategory,
} from '#/api/taskCenterPeriodic';
import PeriodicTaskFormModal from './PeriodicTaskFormModal.vue';
import DailyTaskSettingsModal from './DailyTaskSettingsModal.vue';

interface PeriodicRow {
  id: number;
  title: string;
  goalType: string;
  currencies: string[] | unknown;
  depositMethods?: string[] | unknown;
  rewardMode?: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  sortOrder?: number;
  updatedAt?: string;
  tiers?: Array<{
    threshold: number | string;
    cashAmount: number | string;
    cashAmountMin?: number | string | null;
    cashAmountMax?: number | string | null;
    extraEnabled?: boolean;
    extraType?: string | null;
    extraAmount?: number | string | null;
  }>;
}

const message = useMessage();
const loading = ref(false);
const settingsLoading = ref(false);
const rows = ref<PeriodicRow[]>([]);
const checkedKeys = ref<DataTableRowKey[]>([]);
const showForm = ref(false);
const showSettings = ref(false);
const showDetail = ref(false);
const editItem = ref<PeriodicRow | null>(null);
const detailItem = ref<PeriodicRow | null>(null);
const dailyEnabled = ref(true);
const batchAction = ref<string | null>(null);

const filters = reactive<{
  goalType: string;
  isActive: string;
}>({
  goalType: '',
  isActive: 'all',
});

const applied = reactive({ ...filters });

const GOAL_MAP: Record<string, string> = {
  cum_recharge: '累计充值',
  single_recharge: '单笔充值',
  cum_valid_bet: '累计有效投注',
  single_valid_bet: '单笔有效投注',
  single_profit: '单笔盈利',
  single_loss: '单笔亏损',
  cum_profit: '累计盈利',
  cum_loss: '累计亏损',
  invite_friends: '邀请好友',
};

const EXTRA_MAP: Record<string, string> = {
  activity_points: '活跃度',
  luck_value: '幸运值',
  points: '积分',
  mystery_box: '盲盒抽奖',
  discount_coupon: '折扣券',
};

const goalFilterOptions = [
  { label: '全部任务目标', value: '' },
  ...Object.entries(GOAL_MAP).map(([value, label]) => ({ label, value })),
];

const statusFilterOptions = [
  { label: '全部状态', value: 'all' },
  { label: '开启', value: 'true' },
  { label: '关闭', value: 'false' },
];

const batchOptions = [
  { label: '批量开启', value: 'enable' },
  { label: '批量关闭', value: 'disable' },
];

function goalLabel(g: string) {
  return GOAL_MAP[g] || g;
}

function formatCurrencies(c: unknown) {
  if (Array.isArray(c)) return c.join(', ') || '-';
  return '-';
}

function formatDate(d: string) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

function asNum(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function firstTier(row: PeriodicRow) {
  return Array.isArray(row.tiers) && row.tiers.length ? row.tiers[0] : null;
}

function rewardAmountText(row: PeriodicRow) {
  const t = firstTier(row);
  if (!t) return '-';
  if (row.rewardMode === 'random' && t.cashAmountMin != null && t.cashAmountMax != null) {
    return `${asNum(t.cashAmountMin)} ~ ${asNum(t.cashAmountMax)}`;
  }
  return String(asNum(t.cashAmount));
}

function expectedBonus(row: PeriodicRow) {
  const t = firstTier(row);
  if (!t) return '-';
  if (row.rewardMode === 'random' && t.cashAmountMin != null && t.cashAmountMax != null) {
    return ((asNum(t.cashAmountMin) + asNum(t.cashAmountMax)) / 2).toFixed(2);
  }
  return String(asNum(t.cashAmount));
}

function conditionText(row: PeriodicRow) {
  const methods = Array.isArray(row.depositMethods)
    ? (row.depositMethods as string[]).join(',')
    : '';
  const t = firstTier(row);
  const thr = t ? asNum(t.threshold) : 0;
  return methods ? `${goalLabel(row.goalType)}≥${thr} (${methods})` : `${goalLabel(row.goalType)}≥${thr}`;
}

const filteredRows = computed(() => {
  return rows.value.filter((r) => {
    if (applied.goalType && r.goalType !== applied.goalType) return false;
    if (applied.isActive === 'true' && !r.isActive) return false;
    if (applied.isActive === 'false' && r.isActive) return false;
    return true;
  });
});

const allPageSelected = computed(
  () =>
    filteredRows.value.length > 0 &&
    filteredRows.value.every((r) => checkedKeys.value.includes(r.id)),
);
const somePageSelected = computed(
  () =>
    !allPageSelected.value &&
    filteredRows.value.some((r) => checkedKeys.value.includes(r.id)),
);

function toggleSelectAll(checked: boolean) {
  if (checked) {
    checkedKeys.value = filteredRows.value.map((r) => r.id);
  } else {
    checkedKeys.value = [];
  }
}

const columns: DataTableColumns<PeriodicRow> = [
  { type: 'selection', width: 40 },
  {
    title: '排序',
    key: 'sortOrder',
    width: 60,
    render: (r) => r.sortOrder ?? 0,
  },
  { title: 'ID', key: 'id', width: 70 },
  {
    title: '任务币种',
    key: 'currencies',
    width: 100,
    render: (r) => formatCurrencies(r.currencies),
  },
  {
    title: '任务日期',
    key: 'startsAt',
    width: 200,
    render: (r) => `${formatDate(r.startsAt)} ~ ${formatDate(r.endsAt)}`,
  },
  {
    title: '任务目标',
    key: 'goalType',
    width: 110,
    render: (r) => goalLabel(r.goalType),
  },
  {
    title: '任务条件',
    key: 'condition',
    width: 180,
    ellipsis: { tooltip: true },
    render: (r) => conditionText(r),
  },
  {
    title: '奖励类型',
    key: 'rewardMode',
    width: 80,
    render: (r) => (r.rewardMode === 'random' ? '随机' : '固定'),
  },
  {
    title: '奖励金额',
    key: 'rewardAmount',
    width: 100,
    render: (r) => rewardAmountText(r),
  },
  {
    title: '期望奖金 (平均金额)',
    key: 'expected',
    width: 140,
    render: (r) => expectedBonus(r),
  },
  {
    title: '展示金额',
    key: 'display',
    width: 100,
    render: (r) => rewardAmountText(r),
  },
  {
    title: '额外奖励类型',
    key: 'extraType',
    width: 110,
    render: (r) => {
      const t = firstTier(r);
      if (!t?.extraEnabled || !t.extraType) return '-';
      return EXTRA_MAP[t.extraType] || t.extraType;
    },
  },
  {
    title: '额外奖励',
    key: 'extraAmount',
    width: 90,
    render: (r) => {
      const t = firstTier(r);
      if (!t?.extraEnabled) return '-';
      return String(asNum(t.extraAmount));
    },
  },
  {
    title: '是否开启',
    key: 'isActive',
    width: 90,
    render: (row) =>
      h(NSwitch, {
        value: row.isActive,
        onUpdateValue: (v: boolean) => toggleRow(row, v),
      }),
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
    render: (row) =>
      h('div', { class: 'flex gap-1' }, [
        h(
          NButton,
          { size: 'tiny', onClick: () => openEdit(row) },
          { default: () => '编辑' },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            secondary: true,
            onClick: () => {
              detailItem.value = row;
              showDetail.value = true;
            },
          },
          { default: () => '详情' },
        ),
      ]),
  },
  {
    title: '操作时间',
    key: 'updatedAt',
    width: 160,
    render: (r) => formatDate(r.updatedAt || ''),
  },
];

async function load() {
  loading.value = true;
  try {
    const res = (await taskCenterPeriodicApi.list('DAILY_TASK' as PeriodicCategory)) as {
      data?: PeriodicRow[];
    };
    rows.value = (res?.data ?? res ?? []) as PeriodicRow[];
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载失败');
  } finally {
    loading.value = false;
  }
}

async function loadSettings() {
  settingsLoading.value = true;
  try {
    const res = await taskCenterPeriodicApi.getCategorySettings('DAILY_TASK');
    const data = (res as { data?: Record<string, unknown> })?.data ?? res;
    dailyEnabled.value = data?.enabled !== false;
  } catch {
    /* keep default */
  } finally {
    settingsLoading.value = false;
  }
}

async function onToggleEnabled(v: boolean) {
  settingsLoading.value = true;
  try {
    await taskCenterPeriodicApi.updateCategorySettings('DAILY_TASK', {
      enabled: v,
    });
    message.success(v ? '每日任务已开启' : '每日任务已关闭');
  } catch (e: unknown) {
    dailyEnabled.value = !v;
    message.error(e instanceof Error ? e.message : '更新开关失败');
  } finally {
    settingsLoading.value = false;
  }
}

function applyFilters() {
  applied.goalType = filters.goalType;
  applied.isActive = filters.isActive;
}

function resetFilters() {
  filters.goalType = '';
  filters.isActive = 'all';
  applyFilters();
}

function openCreate() {
  editItem.value = null;
  showForm.value = true;
}

function openEdit(row: PeriodicRow) {
  editItem.value = row;
  showForm.value = true;
}

async function toggleRow(row: PeriodicRow, isActive: boolean) {
  try {
    await taskCenterPeriodicApi.setStatus(row.id, isActive);
    row.isActive = isActive;
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '更新失败');
  }
}

async function runBatch(action: string | null) {
  if (!action || !checkedKeys.value.length) {
    batchAction.value = null;
    return;
  }
  const ids = checkedKeys.value.map(Number);
  try {
    await Promise.all(
      ids.map((id) =>
        taskCenterPeriodicApi.setStatus(id, action === 'enable'),
      ),
    );
    message.success('批量操作完成');
    checkedKeys.value = [];
    batchAction.value = null;
    await load();
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '批量操作失败');
    batchAction.value = null;
  }
}

onMounted(() => {
  void load();
  void loadSettings();
});
</script>
