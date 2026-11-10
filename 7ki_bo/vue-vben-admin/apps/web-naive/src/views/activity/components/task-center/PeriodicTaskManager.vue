<template>
  <div class="periodic-task-manager">
    <n-card :bordered="false">
      <div v-if="isThreeDay" class="toolbar">
        <span>{{ title }}</span>
        <div class="toolbar-group">
          <n-button @click="openSettings">三日任务设置</n-button>
          <n-button type="primary" @click="openCreate">新增任务</n-button>
        </div>
      </div>
      <div v-else class="toolbar">
        <div class="toolbar-group">
          <n-select
            v-model:value="filters.goalType"
            :options="goalFilterOptions"
            style="width: 180px"
          />
          <n-select
            v-model:value="filters.status"
            :options="statusOptions"
            style="width: 140px"
          />
          <n-button type="primary" @click="load">搜索</n-button>
          <n-button @click="resetFilters">重置</n-button>
        </div>
        <div class="toolbar-group">
          <span>{{ switchLabel }}</span>
          <n-switch :value="categoryEnabled" @update:value="onToggleCategory" />
          <n-button @click="openSettings">{{ settingsLabel }}</n-button>
          <n-button @click="openRules">详情</n-button>
          <n-button type="primary" @click="openCreate">{{ createLabel }}</n-button>
        </div>
      </div>

      <n-alert v-if="isThreeDay" type="info" :show-icon="true" style="margin-bottom: 12px">
        建议至少配置 5 条任务，同币种每日抽取 3 条，连续三日不重复。
      </n-alert>
      <n-alert v-if="!isThreeDay" type="warning" :show-icon="true" style="margin-bottom: 12px">
        {{ banner }}
      </n-alert>

      <n-data-table
        :columns="columns"
        :data="rows"
        :loading="loading"
        :row-key="(row) => row.id"
        v-model:checked-row-keys="checkedIds"
        :pagination="pagination"
        size="small"
        :scroll-x="1800"
      />

      <div v-if="!isThreeDay" class="batch-bar">
        <n-checkbox
          :checked="allChecked"
          :indeterminate="someChecked"
          @update:checked="togglePage"
        >
          全选当前页
        </n-checkbox>
        <n-select
          v-model:value="batchAction"
          :options="batchOptions"
          placeholder="批量操作"
          style="width: 140px"
        />
        <n-button
          size="small"
          :disabled="!checkedIds.length || !batchAction"
          @click="runBatch"
        >
          执行
        </n-button>
        <span>已选择 {{ checkedIds.length }} 条数据</span>
        <span>共 {{ rows.length }} 条</span>
      </div>
    </n-card>

    <PeriodicTaskFormModal
      v-model:show="showForm"
      :category="category"
      :edit-item="editItem"
      @saved="load"
    />
    <PeriodicTaskSettingsModal
      v-model:show="showSettings"
      :category="settingsCategory"
      @saved="loadSettings"
    />
    <n-modal
      v-model:show="showRules"
      preset="card"
      title="规则说明"
      :style="{ width: '640px' }"
      :mask-closable="true"
    >
      <pre class="rule-preview">{{ rulesText }}</pre>
    </n-modal>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.toolbar-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.batch-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  color: #4b5563;
  font-size: 13px;
}
.rule-preview {
  white-space: pre-wrap;
  line-height: 1.7;
  font-size: 13px;
  color: #374151;
}
</style>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import {
  NAlert,
  NButton,
  NCard,
  NCheckbox,
  NDataTable,
  NModal,
  NSelect,
  NSwitch,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  EXTRA_REWARD_OPTIONS,
  PERIODIC_GOAL_OPTIONS,
  taskCenterPeriodicApi,
  type PeriodicCategory,
} from '#/api/taskCenterPeriodic';
import PeriodicTaskFormModal from './PeriodicTaskFormModal.vue';
import PeriodicTaskSettingsModal from './PeriodicTaskSettingsModal.vue';
import { systemRuleText, threeDaySystemRuleText } from './periodicTaskRules';

const props = defineProps<{
  category: PeriodicCategory;
  title: string;
}>();

const message = useMessage();
const loading = ref(false);
const rows = ref<any[]>([]);
const showForm = ref(false);
const showSettings = ref(false);
const showRules = ref(false);
const editItem = ref<any | null>(null);
const checkedIds = ref<Array<string | number>>([]);
const batchAction = ref<string | null>(null);
const categoryEnabled = ref(true);
const settingsRecord = ref<Record<string, unknown>>({});
const pagination = reactive({ pageSize: 20 });
const filters = reactive({
  goalType: 'all',
  status: 'all',
});

const settingsCategory = computed<'DAILY_TASK' | 'WEEKLY_TASK' | 'THREE_DAY_MYSTERY'>(() => {
  if (props.category === 'WEEKLY_TASK') return 'WEEKLY_TASK';
  if (props.category === 'THREE_DAY_MYSTERY') return 'THREE_DAY_MYSTERY';
  return 'DAILY_TASK';
});
const isThreeDay = computed(() => props.category === 'THREE_DAY_MYSTERY');
const isWeekly = computed(() => props.category === 'WEEKLY_TASK');
const banner = computed(() =>
  isWeekly.value
    ? '提示：每周任务周一 00:00 重置'
    : '提示：每日任务 00:00 重置',
);
const switchLabel = computed(() =>
  isWeekly.value ? '每周任务开关' : '每日任务开关',
);
const settingsLabel = computed(() =>
  isWeekly.value ? '每周任务设置' : '每日任务设置',
);
const createLabel = computed(() =>
  isWeekly.value ? '+ 新增每周任务' : '+ 新增每日任务',
);
const goalFilterOptions = [
  { label: '全部任务目标', value: 'all' },
  ...PERIODIC_GOAL_OPTIONS,
];
const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '开启', value: 'on' },
  { label: '关闭', value: 'off' },
];
const batchOptions = [
  { label: '批量开启', value: 'enable' },
  { label: '批量关闭', value: 'disable' },
  { label: '批量删除', value: 'delete' },
];

const rulesText = computed(() => {
  const type = String(settingsRecord.value.ruleDescriptionType || 'system');
  const custom = String(settingsRecord.value.ruleDescriptionCustomText || '');
  if (type === 'custom' && custom.trim()) return custom;
  if (settingsCategory.value === 'THREE_DAY_MYSTERY') {
    return threeDaySystemRuleText({
      auditMultiplier: Number(settingsRecord.value.auditMultiplier || 0),
    });
  }
  return systemRuleText(
    settingsCategory.value,
    Number(settingsRecord.value.auditMultiplier || 2),
  );
});

const allChecked = computed(
  () => rows.value.length > 0 && checkedIds.value.length === rows.value.length,
);
const someChecked = computed(
  () => checkedIds.value.length > 0 && !allChecked.value,
);

function labelOf(options: readonly { label: string; value: string }[], value: string) {
  return options.find((item) => item.value === value)?.label || value || '—';
}

function formatRange(row: any) {
  const start = row.startsAt ? String(row.startsAt).slice(0, 16).replace('T', ' ') : '';
  const end = row.endsAt ? String(row.endsAt).slice(0, 16).replace('T', ' ') : '';
  return start && end ? `${start} - ${end}` : '—';
}

function currenciesOf(row: any) {
  return Array.isArray(row.currencies) ? row.currencies.join(', ') : '—';
}

function tiersOf(row: any): any[] {
  return Array.isArray(row.tiers) ? row.tiers : [];
}

/** Coerce Prisma Decimal objects / strings so the table never shows [object Object] / NaN. */
function toNum(value: unknown, fallback = 0): number {
  if (value == null || value === '') return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    const n = Number((value as { toString: () => string }).toString());
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function joinField(row: any, pick: (tier: any) => string) {
  const parts = tiersOf(row).map(pick).filter(Boolean);
  return parts.length ? parts.join(' / ') : '—';
}

function expectedBonus(row: any) {
  return joinField(row, (tier) => {
    const min = toNum(tier.cashAmountMin, Number.NaN);
    const max = toNum(tier.cashAmountMax, Number.NaN);
    if (row.rewardMode === 'random' && Number.isFinite(min) && Number.isFinite(max)) {
      return ((min + max) / 2).toFixed(2);
    }
    return toNum(tier.cashAmount).toFixed(2);
  });
}

function displayAmount(row: any) {
  return joinField(row, (tier) => {
    const min = tier.cashAmountMin;
    const max = tier.cashAmountMax;
    if (row.rewardMode === 'random' && min != null && max != null) {
      return `${toNum(min)}-${toNum(max)}`;
    }
    return toNum(tier.cashAmount).toFixed(2);
  });
}

const columns: DataTableColumns<any> = [
  { type: 'selection' },
  { title: '排序', key: 'sortOrder', width: 70 },
  { title: 'ID', key: 'id', width: 70 },
  { title: '任务币种', key: 'currencies', width: 120, render: currenciesOf },
  { title: '任务日期', key: 'startsAt', width: 280, render: formatRange },
  {
    title: '任务目标',
    key: 'goalType',
    width: 130,
    render: (row) => labelOf(PERIODIC_GOAL_OPTIONS, row.goalType),
  },
  {
    title: '任务条件',
    key: 'condition',
    width: 120,
    render: (row) => joinField(row, (tier) => String(toNum(tier.threshold))),
  },
  {
    title: '奖励类型',
    key: 'rewardMode',
    width: 90,
    render: (row) => (row.rewardMode === 'random' ? '随机' : '固定'),
  },
  {
    title: '奖励金额',
    key: 'cash',
    width: 110,
    render: (row) => joinField(row, (tier) => toNum(tier.cashAmount).toFixed(2)),
  },
  { title: '期望奖金（平均金额）', key: 'expected', width: 160, render: expectedBonus },
  { title: '展示金额', key: 'display', width: 120, render: displayAmount },
  {
    title: '额外奖励类型',
    key: 'extraType',
    width: 130,
    render: (row) =>
      joinField(row, (tier) =>
        tier.extraEnabled ? labelOf(EXTRA_REWARD_OPTIONS, tier.extraType) : '',
      ),
  },
  {
    title: '额外奖励',
    key: 'extraAmount',
    width: 100,
    render: (row) =>
      joinField(row, (tier) =>
        tier.extraEnabled ? String(toNum(tier.extraAmount)) : '',
      ),
  },
  {
    title: '是否开启',
    key: 'isActive',
    width: 90,
    render: (row) =>
      h(NSwitch, {
        value: row.isActive,
        onUpdateValue: (value: boolean) => toggle(row, value),
      }),
  },
  {
    title: '操作',
    key: 'actions',
    width: 90,
    render: (row) =>
      h(
        NButton,
        { size: 'small', onClick: () => openEdit(row) },
        { default: () => '编辑' },
      ),
  },
  { title: '操作人', key: 'updatedBy', width: 100, render: (row) => row.updatedBy || '—' },
  {
    title: '操作时间',
    key: 'updatedAt',
    width: 170,
    render: (row) =>
      row.updatedAt ? String(row.updatedAt).slice(0, 19).replace('T', ' ') : '—',
  },
];

function unwrap(res: any) {
  return res?.data ?? res;
}

async function load() {
  loading.value = true;
  try {
    const res: any = await taskCenterPeriodicApi.list({
      category: props.category,
      goalType: filters.goalType === 'all' ? undefined : filters.goalType,
      isActive:
        filters.status === 'on' ? true : filters.status === 'off' ? false : undefined,
    });
    const data = unwrap(res);
    rows.value = Array.isArray(data) ? data : data?.data ?? [];
    checkedIds.value = [];
  } catch (error: any) {
    message.error(error?.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

async function loadSettings() {
  try {
    const res: any = await taskCenterPeriodicApi.getSettings(settingsCategory.value);
    const data = unwrap(res);
    categoryEnabled.value = data?.enabled !== false;
    settingsRecord.value =
      data?.settings && typeof data.settings === 'object' ? data.settings : {};
  } catch {
    categoryEnabled.value = true;
  }
}

function resetFilters() {
  filters.goalType = 'all';
  filters.status = 'all';
  void load();
}

function openCreate() {
  showSettings.value = false;
  showRules.value = false;
  editItem.value = null;
  showForm.value = true;
}
function openSettings() {
  showForm.value = false;
  showRules.value = false;
  showSettings.value = true;
}
function openRules() {
  showForm.value = false;
  showSettings.value = false;
  showRules.value = true;
}
function openEdit(row: any) {
  showSettings.value = false;
  showRules.value = false;
  editItem.value = row;
  showForm.value = true;
}

async function toggle(row: any, isActive: boolean) {
  try {
    await taskCenterPeriodicApi.setStatus(row.id, isActive);
    row.isActive = isActive;
  } catch (error: any) {
    message.error(error?.message || '更新失败');
  }
}

async function onToggleCategory(enabled: boolean) {
  try {
    await taskCenterPeriodicApi.saveSettings({
      category: settingsCategory.value,
      enabled,
      settings: settingsRecord.value,
    });
    categoryEnabled.value = enabled;
  } catch (error: any) {
    message.error(error?.message || '开关保存失败');
  }
}

function togglePage(checked: boolean) {
  checkedIds.value = checked ? rows.value.map((row) => row.id) : [];
}

async function runBatch() {
  if (!batchAction.value || !checkedIds.value.length) return;
  try {
    await taskCenterPeriodicApi.batch({
      ids: checkedIds.value.map((id) => Number(id)),
      action: batchAction.value as 'enable' | 'disable' | 'delete',
    });
    message.success('批量操作已完成');
    batchAction.value = null;
    await load();
  } catch (error: any) {
    message.error(error?.message || '批量操作失败');
  }
}

onMounted(() => {
  void load();
  void loadSettings();
});
</script>
