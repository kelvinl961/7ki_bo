<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="modalTitle"
    class="periodic-form-modal"
    :style="{ width: '1100px', maxWidth: '96vw' }"
    :mask-closable="false"
    :content-style="{ maxHeight: '72vh', overflow: 'auto' }"
  >
    <n-form label-placement="left" label-width="120" size="medium" class="periodic-task-form">
      <n-form-item label="选择币种" required>
        <div class="field-block">
          <n-checkbox :checked="allCurrencies" @update:checked="toggleAllCurrencies">
            全选
          </n-checkbox>
          <div class="entry-row">
            <n-checkbox-group v-model:value="form.currencies">
              <n-space>
                <n-checkbox
                  v-for="currency in currencyOptions"
                  :key="currency.value"
                  :value="currency.value"
                  :label="currency.label"
                />
              </n-space>
            </n-checkbox-group>
          </div>
        </div>
      </n-form-item>

      <n-form-item label="任务活动日期" required>
        <n-date-picker
          v-model:value="dateRange"
          type="datetimerange"
          clearable
          style="width: 100%"
        />
      </n-form-item>

      <n-form-item label="任务目标" required>
        <n-select v-model:value="form.goalType" :options="goalOptions" />
      </n-form-item>

      <n-form-item v-if="isRechargeGoal" label="充值方式" required>
        <div class="field-block">
          <n-checkbox :checked="allDepositMethods" @update:checked="toggleAllMethods">
            全选
          </n-checkbox>
          <div class="entry-row">
            <n-checkbox-group v-model:value="form.depositMethods">
              <n-space>
                <n-checkbox
                  v-for="method in depositMethodOptions"
                  :key="method.value"
                  :value="method.value"
                  :label="method.label"
                />
              </n-space>
            </n-checkbox-group>
          </div>
        </div>
      </n-form-item>

      <n-form-item v-if="form.goalType === 'invite_friends'" label="有效判定" required>
        <n-radio-group v-model:value="form.inviteValidity">
          <n-space>
            <n-radio value="register_login">完成注册登录</n-radio>
            <n-radio value="first_deposit">完成首充</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>

      <n-form-item label="指定VIP等级">
        <div class="field-block">
          <n-switch v-model:value="form.vipEnabled" />
          <div v-if="form.vipEnabled" class="vip-grid">
            <n-checkbox
              :checked="allVipSelected"
              @update:checked="toggleAllVip"
            >
              全选
            </n-checkbox>
            <n-checkbox-group v-model:value="form.vipLevelIds">
              <n-space wrap>
                <n-checkbox
                  v-for="level in vipLevelOptions"
                  :key="level.value"
                  :value="level.value"
                  :label="level.label"
                />
              </n-space>
            </n-checkbox-group>
          </div>
        </div>
      </n-form-item>

      <n-form-item label="奖励类型">
        <n-radio-group v-model:value="form.rewardMode">
          <n-space>
            <n-radio value="fixed">固定</n-radio>
            <n-radio value="random">随机</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>

      <div
        class="ladder-head"
        :class="form.rewardMode === 'random' ? 'ladder-head-random' : 'ladder-head-fixed'"
      >
        <span>{{ thresholdLabel }}</span>
        <template v-if="form.rewardMode === 'random'">
          <span>奖励金额区间</span>
          <span>期望奖金 (平均金额)</span>
          <span>展示金额区间</span>
        </template>
        <template v-else>
          <span>奖励金额</span>
        </template>
        <span>额外奖励</span>
        <span class="ladder-actions-head" />
      </div>
      <div class="ladder-note">
        满足所有阶梯奖励均可领取，每个阶梯奖励只能领取一次
      </div>

      <div v-for="(tier, index) in form.tiers" :key="index" class="ladder-row">
        <div
          class="ladder-main"
          :class="form.rewardMode === 'random' ? 'ladder-main-random' : 'ladder-main-fixed'"
        >
          <n-input-number
            v-model:value="tier.threshold"
            :min="0"
            :placeholder="`请输入${thresholdLabel}`"
          />
          <template v-if="form.rewardMode === 'random'">
            <div class="range-pair">
              <n-input-number
                v-model:value="tier.cashAmountMin"
                :min="0"
                :precision="2"
                placeholder="最小"
              />
              <span class="range-sep">—</span>
              <n-input-number
                v-model:value="tier.cashAmountMax"
                :min="0"
                :precision="2"
                placeholder="最大"
              />
            </div>
            <n-input-number
              v-model:value="tier.expectedAmount"
              :min="0"
              :precision="2"
              placeholder="期望奖金"
            />
            <div class="range-pair">
              <n-input-number
                v-model:value="tier.displayMin"
                :min="0"
                :precision="2"
                placeholder="展示最小"
              />
              <span class="range-sep">—</span>
              <n-input-number
                v-model:value="tier.displayMax"
                :min="0"
                :precision="2"
                placeholder="展示最大"
              />
            </div>
          </template>
          <template v-else>
            <n-input-number
              v-model:value="tier.cashAmount"
              :min="0"
              :precision="2"
              placeholder="请输入奖励金额"
            />
          </template>
          <n-switch v-model:value="tier.extraEnabled" />
          <div class="ladder-actions">
            <n-button
              v-if="index === form.tiers.length - 1"
              size="small"
              type="primary"
              @click="addTier"
            >
              +
            </n-button>
            <n-button
              v-if="form.tiers.length > 1"
              size="small"
              @click="removeTier(index)"
            >
              ×
            </n-button>
          </div>
        </div>
        <div v-if="tier.extraEnabled" class="extra-row">
          <n-form-item label="额外奖励类型" label-placement="top" :show-feedback="false">
            <n-select
              v-model:value="tier.extraType"
              :options="extraTypeOptions"
              placeholder="额外奖励类型"
            />
          </n-form-item>
          <n-form-item label="额外奖励" label-placement="top" :show-feedback="false">
            <n-input-number
              v-model:value="tier.extraAmount"
              :min="0"
              placeholder="请输入活跃度数量"
              style="width: 100%"
            />
          </n-form-item>
          <n-form-item label="有效天数" label-placement="top" :show-feedback="false">
            <n-input-number
              v-model:value="tier.extraValidDays"
              :min="1"
              :max="31"
              placeholder="请输入有效天数，1-31天"
              style="width: 100%"
            />
          </n-form-item>
        </div>
      </div>

      <n-form-item label="加倍奖励">
        <div class="field-block">
          <div class="entry-row">
            <n-switch v-model:value="enableDouble" :disabled="!canDouble" />
            <span v-if="!canDouble" class="double-warn">
              奖励金额为0，无法生成加倍奖励
            </span>
          </div>
          <div v-if="enableDouble && canDouble" class="entry-row">
            <n-select
              v-model:value="form.doubleRewardSchemeId"
              :options="doubleOptions"
              placeholder="选择加倍奖励"
              style="width: 240px"
              clearable
            />
            <n-button :disabled="!selectedScheme" @click="showScheme = true">详情</n-button>
            <n-button type="primary" @click="showCreateScheme = true">
              + 新增加倍奖励
            </n-button>
          </div>
        </div>
      </n-form-item>
    </n-form>

    <n-modal v-model:show="showScheme" preset="card" title="加倍奖励详情" :style="{ width: '420px' }">
      <p v-if="selectedScheme">
        {{ selectedScheme.label }}，倍数 {{ selectedScheme.multiplier }}
      </p>
    </n-modal>
    <n-modal v-model:show="showCreateScheme" preset="card" title="新增加倍奖励" :style="{ width: '420px' }">
      <n-form label-placement="left" label-width="80">
        <n-form-item label="名称">
          <n-input v-model:value="schemeDraft.name" />
        </n-form-item>
        <n-form-item label="倍数">
          <n-input-number v-model:value="schemeDraft.multiplier" :min="1.01" :precision="2" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showCreateScheme = false">取消</n-button>
          <n-button type="primary" @click="createScheme">确认</n-button>
        </n-space>
      </template>
    </n-modal>

    <template #footer>
      <n-space justify="center">
        <n-button @click="visible = false">取消</n-button>
        <n-button type="primary" :loading="saving" @click="submit">确认</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style>
.periodic-task-form .field-block {
  width: 100%;
}
.periodic-task-form .entry-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
.periodic-task-form .vip-grid {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.periodic-task-form .ladder-head {
  display: grid;
  gap: 8px;
  margin: 4px 0 8px;
  color: #6b7280;
  font-size: 13px;
  align-items: center;
}
.periodic-task-form .ladder-head-fixed {
  grid-template-columns: minmax(140px, 1.2fr) minmax(120px, 1fr) 72px 72px;
}
.periodic-task-form .ladder-head-random {
  grid-template-columns:
    minmax(110px, 1fr)
    minmax(150px, 1.2fr)
    minmax(110px, 1fr)
    minmax(150px, 1.2fr)
    72px
    72px;
}
.periodic-task-form .ladder-actions-head {
  min-width: 56px;
}
.periodic-task-form .ladder-note {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  background: #fffbeb;
  color: #b45309;
  font-size: 12px;
}
.periodic-task-form .ladder-row {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.periodic-task-form .ladder-main {
  display: grid;
  gap: 8px;
  align-items: center;
}
.periodic-task-form .ladder-main-fixed {
  grid-template-columns: minmax(140px, 1.2fr) minmax(120px, 1fr) 72px 72px;
}
.periodic-task-form .ladder-main-random {
  grid-template-columns:
    minmax(110px, 1fr)
    minmax(150px, 1.2fr)
    minmax(110px, 1fr)
    minmax(150px, 1.2fr)
    72px
    72px;
}
.periodic-task-form .range-pair {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.periodic-task-form .range-pair .n-input-number {
  flex: 1;
  min-width: 0;
}
.periodic-task-form .range-sep {
  color: #9ca3af;
  flex-shrink: 0;
}
.periodic-task-form .ladder-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}
.periodic-task-form .extra-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
}
.periodic-task-form .double-warn {
  color: #d97706;
  font-size: 12px;
}
</style>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  NButton,
  NCheckbox,
  NCheckboxGroup,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NSwitch,
  useMessage,
} from 'naive-ui';
import { getThirdPartyChannelList } from '#/api/finance/third-party-channels';
import {
  EXTRA_REWARD_OPTIONS,
  PERIODIC_GOAL_OPTIONS,
  taskCenterPeriodicApi,
  type PeriodicCategory,
  type PeriodicTaskPayload,
} from '#/api/taskCenterPeriodic';
import { getVIPLevels } from '#/api/vip';

const props = defineProps<{
  show: boolean;
  category: PeriodicCategory;
  editItem?: any | null;
}>();
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'saved'): void;
}>();

const message = useMessage();
const saving = ref(false);
const visible = ref(false);
watch(
  () => props.show,
  (open) => {
    visible.value = open;
  },
  { immediate: true },
);
watch(visible, (open) => {
  if (open !== props.show) emit('update:show', open);
});
const enableDouble = ref(false);
const dateRange = ref<[number, number] | null>(null);
const showScheme = ref(false);
const showCreateScheme = ref(false);
const schemeDraft = reactive({ name: '', multiplier: 2 });
const doubleOptions = ref<Array<{ label: string; value: string; multiplier: number }>>([]);
const depositMethodOptions = ref<Array<{ label: string; value: string }>>([
  { label: '提现转充值', value: '提现转充值' },
  { label: 'pix', value: 'PIX' },
]);
const vipLevelOptions = ref<Array<{ label: string; value: string }>>([]);

const isEdit = computed(() => Boolean(props.editItem?.id));
const modalTitle = computed(() => {
  if (isEdit.value) return '编辑任务';
  return props.category === 'WEEKLY_TASK' ? '新增每周任务' : '新增每日任务';
});

const currencyOptions = [
  { label: '巴西(BRL)', value: 'BRL' },
  { label: '加纳(GHS)', value: 'GHS' },
  { label: 'XAF', value: 'XAF' },
  { label: '老挝(LAK)', value: 'LAK' },
  { label: '柬埔寨(KHR1)', value: 'KHR' },
];
const goalOptions = [...PERIODIC_GOAL_OPTIONS];
const extraTypeOptions = [...EXTRA_REWARD_OPTIONS];

type TierForm = {
  threshold: number;
  cashAmount: number;
  cashAmountMin: number | null;
  cashAmountMax: number | null;
  expectedAmount: number | null;
  displayMin: number | null;
  displayMax: number | null;
  extraEnabled: boolean;
  extraType: string | null;
  extraAmount: number;
  extraValidDays: number;
};

const emptyTier = (): TierForm => ({
  threshold: 0,
  cashAmount: 0,
  cashAmountMin: null,
  cashAmountMax: null,
  expectedAmount: null,
  displayMin: null,
  displayMax: null,
  extraEnabled: true,
  extraType: 'activity_points',
  extraAmount: 0,
  extraValidDays: 1,
});

const form = reactive({
  currencies: ['BRL'] as string[],
  goalType: 'cum_recharge',
  depositMethods: [] as string[],
  inviteValidity: 'register_login' as string | null,
  rewardMode: 'fixed' as 'fixed' | 'random',
  vipEnabled: false,
  vipLevelIds: [] as string[],
  doubleRewardSchemeId: null as string | null,
  tiers: [emptyTier()] as TierForm[],
});

const isRechargeGoal = computed(
  () => form.goalType === 'cum_recharge' || form.goalType === 'single_recharge',
);
const thresholdLabel = computed(
  () => goalOptions.find((item) => item.value === form.goalType)?.label || '累计充值金额',
);
const canDouble = computed(() =>
  form.tiers.some((tier) => {
    const cash = Number(tier.cashAmount || 0);
    const expected = Number(tier.expectedAmount || 0);
    const max = Number(tier.cashAmountMax || 0);
    return cash > 1 || expected > 1 || max > 1;
  }),
);
const allCurrencies = computed(
  () => form.currencies.length === currencyOptions.length,
);
const allDepositMethods = computed(
  () =>
    depositMethodOptions.value.length > 0 &&
    form.depositMethods.length === depositMethodOptions.value.length,
);
const allVipSelected = computed(
  () =>
    vipLevelOptions.value.length > 0 &&
    form.vipLevelIds.length === vipLevelOptions.value.length,
);
const selectedScheme = computed(() =>
  doubleOptions.value.find((item) => item.value === form.doubleRewardSchemeId),
);

watch(canDouble, (allowed) => {
  if (!allowed) enableDouble.value = false;
});

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

function toNumOrNull(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = toNum(value, Number.NaN);
  return Number.isFinite(n) ? n : null;
}

function toggleAllCurrencies(checked: boolean) {
  form.currencies = checked ? currencyOptions.map((item) => item.value) : [];
}
function toggleAllMethods(checked: boolean) {
  form.depositMethods = checked
    ? depositMethodOptions.value.map((item) => item.value)
    : [];
}
function toggleAllVip(checked: boolean) {
  form.vipLevelIds = checked
    ? vipLevelOptions.value.map((item) => item.value)
    : [];
}
function addTier() {
  form.tiers.push(emptyTier());
}
function removeTier(index: number) {
  form.tiers.splice(index, 1);
}

async function loadVipLevels() {
  try {
    const vipResponse = await getVIPLevels({ pageSize: 100, isActive: true });
    const list = vipResponse?.list || [];
    vipLevelOptions.value = list.map((level: { name: string; id: number; level?: number }) => ({
      value: String(level.id),
      label: String(level.name || `VIP${level.level ?? level.id}`),
    }));
  } catch {
    vipLevelOptions.value = [];
  }
}

async function loadDepositMethods() {
  try {
    const res: any = await getThirdPartyChannelList({
      page: 1,
      limit: 100,
      isActive: true,
    });
    const records = res?.data?.records ?? res?.records ?? [];
    // value MUST be channelCode — Deposit.paymentMethod references channelCode
    const options = new Map<string, string>();
    for (const row of records) {
      const code = String(row.channelCode || '').trim();
      if (!code) continue;
      const label =
        String(row.channelName || row.platformName || code).trim() || code;
      options.set(code, label);
    }
    if (options.size) {
      depositMethodOptions.value = [...options.entries()].map(
        ([value, label]) => ({
          label,
          value,
        }),
      );
    }
  } catch {
    /* keep the fallback methods shown in the screenshot */
  }
}

async function loadSchemes() {
  try {
    const res: any = await taskCenterPeriodicApi.listDoubleSchemes();
    const rows = res?.data ?? res ?? [];
    doubleOptions.value = (Array.isArray(rows) ? rows : []).map((row: any) => ({
      label: row.name,
      value: String(row.id),
      multiplier: Number(row.multiplier),
    }));
  } catch {
    doubleOptions.value = [];
  }
}

async function createScheme() {
  if (!schemeDraft.name.trim()) {
    message.error('请填写加倍奖励名称');
    return;
  }
  try {
    const res: any = await taskCenterPeriodicApi.createDoubleScheme({
      name: schemeDraft.name.trim(),
      multiplier: Number(schemeDraft.multiplier),
    });
    const created = res?.data ?? res;
    await loadSchemes();
    if (created?.id) form.doubleRewardSchemeId = String(created.id);
    showCreateScheme.value = false;
    schemeDraft.name = '';
  } catch (error: any) {
    message.error(error?.message || '创建加倍奖励失败');
  }
}

watch(
  () => props.show,
  async (open) => {
    if (!open) return;
    await Promise.all([loadDepositMethods(), loadSchemes(), loadVipLevels()]);
    if (props.editItem) {
      const item = props.editItem;
      form.currencies = Array.isArray(item.currencies) ? [...item.currencies] : ['BRL'];
      form.goalType = item.goalType || 'cum_recharge';
      const savedMethods = Array.isArray(item.depositMethods)
        ? item.depositMethods.map((method: string) => String(method))
        : [];
      form.depositMethods = savedMethods.includes('all')
        ? depositMethodOptions.value.map((method) => method.value)
        : savedMethods.filter((method: string) => method !== 'all');
      form.inviteValidity = item.inviteValidity || 'register_login';
      form.rewardMode = item.rewardMode || 'fixed';
      form.doubleRewardSchemeId = item.doubleRewardSchemeId || null;
      enableDouble.value = Boolean(item.doubleRewardSchemeId);
      const meta =
        item.metadata && typeof item.metadata === 'object' ? item.metadata : {};
      form.vipEnabled =
        item.vipEnabled === true || meta.vipEnabled === true;
      const rawIds = Array.isArray(item.vipLevelIds)
        ? item.vipLevelIds
        : Array.isArray(meta.vipLevelIds)
          ? meta.vipLevelIds
          : [];
      form.vipLevelIds = rawIds.map((id: string | number) => String(id));
      form.tiers =
        Array.isArray(item.tiers) && item.tiers.length
          ? item.tiers.map((tier: any) => ({
              threshold: toNum(tier.threshold),
              cashAmount: toNum(tier.cashAmount),
              cashAmountMin: toNumOrNull(tier.cashAmountMin),
              cashAmountMax: toNumOrNull(tier.cashAmountMax),
              expectedAmount: toNumOrNull(tier.expectedAmount),
              displayMin: toNumOrNull(tier.displayMin),
              displayMax: toNumOrNull(tier.displayMax),
              extraEnabled: Boolean(tier.extraEnabled),
              extraType: tier.extraType || 'activity_points',
              extraAmount: toNum(tier.extraAmount),
              extraValidDays: toNum(tier.extraValidDays, 1),
            }))
          : [emptyTier()];
      dateRange.value =
        item.startsAt && item.endsAt
          ? [new Date(item.startsAt).getTime(), new Date(item.endsAt).getTime()]
          : null;
    } else {
      form.currencies = ['BRL'];
      form.goalType = 'cum_recharge';
      form.depositMethods = [];
      form.inviteValidity = 'register_login';
      form.rewardMode = 'fixed';
      form.vipEnabled = false;
      form.vipLevelIds = [];
      form.doubleRewardSchemeId = null;
      enableDouble.value = false;
      form.tiers = [emptyTier()];
      const now = Date.now();
      dateRange.value = [now, now + 30 * 86400000];
    }
  },
  { immediate: true },
);

async function submit() {
  if (!dateRange.value) {
    message.error('请选择活动日期');
    return;
  }
  if (!form.currencies.length) {
    message.error('请选择币种');
    return;
  }
  if (isRechargeGoal.value && !form.depositMethods.length) {
    message.error('请选择充值方式');
    return;
  }
  if (form.vipEnabled && !form.vipLevelIds.length) {
    message.error('请选择至少一个VIP等级');
    return;
  }
  if (form.rewardMode === 'random') {
    for (const [i, tier] of form.tiers.entries()) {
      const min = Number(tier.cashAmountMin);
      const max = Number(tier.cashAmountMax);
      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        message.error(`第${i + 1}档请填写奖励金额区间`);
        return;
      }
      if (max < min) {
        message.error(`第${i + 1}档奖励金额最大值不能小于最小值`);
        return;
      }
    }
  }

  const payload: PeriodicTaskPayload = {
    category: props.category,
    title: form.goalType,
    currencies: form.currencies,
    startsAt: new Date(dateRange.value[0]).toISOString(),
    endsAt: new Date(dateRange.value[1]).toISOString(),
    goalType: form.goalType,
    depositMethods: isRechargeGoal.value
      ? allDepositMethods.value
        ? ['all']
        : form.depositMethods
      : [],
    inviteValidity:
      form.goalType === 'invite_friends' ? form.inviteValidity : null,
    rewardMode: form.rewardMode,
    vipEnabled: form.vipEnabled,
    vipLevelIds: form.vipEnabled
      ? form.vipLevelIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [],
    doubleRewardSchemeId:
      enableDouble.value && canDouble.value ? form.doubleRewardSchemeId : null,
    isActive: props.editItem?.isActive ?? true,
    tiers: form.tiers.map((tier, index) => {
      const expected = toNumOrNull(tier.expectedAmount);
      const cashFixed = Number(tier.cashAmount) || 0;
      return {
        threshold: Number(tier.threshold) || 0,
        cashAmount:
          form.rewardMode === 'random'
            ? expected != null && expected > 0
              ? expected
              : cashFixed
            : cashFixed,
        cashAmountMin:
          form.rewardMode === 'random' ? toNumOrNull(tier.cashAmountMin) : null,
        cashAmountMax:
          form.rewardMode === 'random' ? toNumOrNull(tier.cashAmountMax) : null,
        expectedAmount: form.rewardMode === 'random' ? expected : null,
        displayMin:
          form.rewardMode === 'random' ? toNumOrNull(tier.displayMin) : null,
        displayMax:
          form.rewardMode === 'random' ? toNumOrNull(tier.displayMax) : null,
        extraEnabled: Boolean(tier.extraEnabled),
        extraType: tier.extraEnabled ? tier.extraType : null,
        extraAmount: tier.extraEnabled ? Number(tier.extraAmount) || 0 : null,
        extraValidDays: tier.extraEnabled
          ? Number(tier.extraValidDays) || 1
          : null,
        sortOrder: index,
      };
    }),
  };
  saving.value = true;
  try {
    if (isEdit.value) {
      await taskCenterPeriodicApi.update(props.editItem.id, payload);
    } else {
      await taskCenterPeriodicApi.create(payload);
    }
    message.success('已保存');
    visible.value = false;
    emit('saved');
  } catch (error: any) {
    message.error(error?.message || '保存失败');
  } finally {
    saving.value = false;
  }
}
</script>
