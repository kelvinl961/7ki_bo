<template>
  <n-modal
    v-model:show="show"
    preset="card"
    :title="isEdit ? '编辑任务' : '新增每日任务'"
    style="width: 90vw; max-width: 720px"
    @update:show="(v) => emit('update:show', v)"
  >
    <n-form label-placement="left" label-width="120" size="medium">
      <n-form-item label="选择币种" required>
        <n-checkbox-group v-model:value="form.currencies">
          <n-space>
            <n-checkbox
              v-for="c in currencyOptions"
              :key="c.value"
              :value="c.value"
              :label="c.label"
            />
          </n-space>
        </n-checkbox-group>
      </n-form-item>

      <n-form-item label="任务活动日期" required>
        <n-date-picker
          v-model:value="dateRange"
          type="datetimerange"
          clearable
          class="w-full"
        />
      </n-form-item>

      <n-form-item label="任务目标" required>
        <n-select v-model:value="form.goalType" :options="goalOptions" />
      </n-form-item>

      <n-form-item
        v-if="isRechargeGoal"
        label="充值方式"
        required
      >
        <n-checkbox-group v-model:value="form.depositMethods">
          <n-space>
            <n-checkbox value="all" label="全选" />
            <n-checkbox value="PIX" label="PIX" />
            <n-checkbox value="Paystack" label="Paystack" />
            <n-checkbox value="crypto" label="数字币app" />
          </n-space>
        </n-checkbox-group>
      </n-form-item>

      <n-form-item
        v-if="form.goalType === 'invite_friends'"
        label="有效判定"
        required
      >
        <n-radio-group v-model:value="form.inviteValidity">
          <n-radio value="register_login">完成注册登录</n-radio>
          <n-radio value="first_deposit">完成首充</n-radio>
        </n-radio-group>
      </n-form-item>

      <n-form-item label="奖励类型">
        <n-radio-group v-model:value="form.rewardMode">
          <n-radio value="fixed">固定</n-radio>
          <n-radio value="random">随机</n-radio>
        </n-radio-group>
      </n-form-item>

      <div class="mb-2 rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
        满足所有阶梯奖励均可领取，每个阶梯奖励只能领取一次
      </div>

      <div
        v-for="(tier, index) in form.tiers"
        :key="index"
        class="mb-3 space-y-2 rounded border border-gray-200 p-3"
      >
        <div class="flex items-center gap-2">
          <n-input-number
            v-model:value="tier.threshold"
            :min="0"
            placeholder="目标阈值"
            class="flex-1"
          />
          <n-input-number
            v-model:value="tier.cashAmount"
            :min="0"
            :precision="2"
            placeholder="奖励金额"
            class="flex-1"
          />
          <n-switch v-model:value="tier.extraEnabled" />
          <n-button size="small" type="primary" @click="addTier">+</n-button>
          <n-button
            v-if="form.tiers.length > 1"
            size="small"
            @click="removeTier(index)"
            >x</n-button
          >
        </div>
        <div v-if="tier.extraEnabled" class="grid grid-cols-3 gap-2">
          <n-select
            v-model:value="tier.extraType"
            :options="extraTypeOptions"
            placeholder="额外奖励类型"
          />
          <n-input-number
            v-model:value="tier.extraAmount"
            :min="0"
            placeholder="额外奖励"
          />
          <n-input-number
            v-model:value="tier.extraValidDays"
            :min="1"
            :max="31"
            placeholder="有效天数 1-31"
          />
        </div>
      </div>

      <n-form-item label="加倍奖励">
        <div class="flex w-full flex-col gap-2">
          <n-switch v-model:value="enableDouble" />
          <p v-if="!canDouble" class="text-xs text-amber-600">
            奖励金额为0，无法生成加倍奖励（需主奖励现金 &gt; 1）
          </p>
          <div v-else class="flex gap-2">
            <n-select
              v-model:value="form.doubleRewardSchemeId"
              :options="doubleOptions"
              placeholder="选择加倍奖励"
              class="flex-1"
              clearable
            />
            <n-button disabled>详情</n-button>
            <n-button type="primary" @click="onNewDouble"
              >+ 新增加倍奖励</n-button
            >
          </div>
        </div>
      </n-form-item>

      <n-form-item label="标题" required>
        <n-input v-model:value="form.title" maxlength="100" />
      </n-form-item>
    </n-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <n-button @click="show = false">取消</n-button>
        <n-button type="primary" :loading="saving" @click="submit">确认</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useMessage } from 'naive-ui';
import {
  taskCenterPeriodicApi,
  type PeriodicCategory,
  type PeriodicTaskPayload,
} from '#/api/taskCenterPeriodic';

const props = defineProps<{
  show: boolean;
  category: PeriodicCategory;
  editItem?: any | null;
}>();
const emit = defineEmits<{
  (e: 'update:show', v: boolean): void;
  (e: 'saved'): void;
}>();

const message = useMessage();
const saving = ref(false);
const enableDouble = ref(false);
const dateRange = ref<[number, number] | null>(null);

const show = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v),
});
const isEdit = computed(() => Boolean(props.editItem?.id));

const currencyOptions = [
  { label: '巴西(BRL)', value: 'BRL' },
  { label: '加纳(GHS)', value: 'GHS' },
  { label: 'XAF', value: 'XAF' },
  { label: '老挝(LAK)', value: 'LAK' },
  { label: '柬埔寨(KHR1)', value: 'KHR' },
];

const goalOptions = [
  { label: '累计充值', value: 'cum_recharge' },
  { label: '单笔充值', value: 'single_recharge' },
  { label: '累计有效投注', value: 'cum_valid_bet' },
  { label: '单笔有效投注', value: 'single_valid_bet' },
  { label: '单笔盈利', value: 'single_profit' },
  { label: '单笔亏损', value: 'single_loss' },
  { label: '累计盈利', value: 'cum_profit' },
  { label: '累计亏损', value: 'cum_loss' },
  { label: '邀请好友', value: 'invite_friends' },
];

const extraTypeOptions = [
  { label: '活跃度', value: 'activity_points' },
  { label: '幸运值', value: 'luck_value' },
  { label: '积分', value: 'points' },
  { label: '盲盒抽奖', value: 'mystery_box' },
  { label: '折扣券', value: 'discount_coupon' },
];

const doubleOptions: { label: string; value: string }[] = [];

const emptyTier = () => ({
  threshold: 0,
  cashAmount: 0,
  extraEnabled: false,
  extraType: 'activity_points' as string | null,
  extraAmount: 0,
  extraValidDays: 7,
});

const form = reactive({
  title: '',
  currencies: ['BRL'] as string[],
  goalType: 'cum_recharge',
  depositMethods: ['all'] as string[],
  inviteValidity: 'register_login' as string | null,
  rewardMode: 'fixed' as 'fixed' | 'random',
  doubleRewardSchemeId: null as string | null,
  tiers: [emptyTier()],
});

const isRechargeGoal = computed(
  () =>
    form.goalType === 'cum_recharge' || form.goalType === 'single_recharge',
);

const canDouble = computed(() =>
  form.tiers.some((t) => Number(t.cashAmount || 0) > 1),
);

watch(
  () => props.show,
  (v) => {
    if (!v) return;
    if (props.editItem) {
      const it = props.editItem;
      form.title = it.title || '';
      form.currencies = Array.isArray(it.currencies) ? [...it.currencies] : ['BRL'];
      form.goalType = it.goalType || 'cum_recharge';
      form.depositMethods = Array.isArray(it.depositMethods)
        ? [...it.depositMethods]
        : ['all'];
      form.inviteValidity = it.inviteValidity || 'register_login';
      form.rewardMode = it.rewardMode || 'fixed';
      form.doubleRewardSchemeId = it.doubleRewardSchemeId || null;
      enableDouble.value = Boolean(it.doubleRewardSchemeId);
      form.tiers =
        Array.isArray(it.tiers) && it.tiers.length
          ? it.tiers.map((t: any) => ({
              threshold: Number(t.threshold) || 0,
              cashAmount: Number(t.cashAmount) || 0,
              extraEnabled: Boolean(t.extraEnabled),
              extraType: t.extraType || 'activity_points',
              extraAmount: Number(t.extraAmount) || 0,
              extraValidDays: Number(t.extraValidDays) || 7,
            }))
          : [emptyTier()];
      if (it.startsAt && it.endsAt) {
        dateRange.value = [
          new Date(it.startsAt).getTime(),
          new Date(it.endsAt).getTime(),
        ];
      }
    } else {
      form.title = '';
      form.currencies = ['BRL'];
      form.goalType = 'cum_recharge';
      form.depositMethods = ['all'];
      form.inviteValidity = 'register_login';
      form.rewardMode = 'fixed';
      form.doubleRewardSchemeId = null;
      enableDouble.value = false;
      form.tiers = [emptyTier()];
      const now = Date.now();
      dateRange.value = [now, now + 30 * 86400000];
    }
  },
);

function addTier() {
  form.tiers.push(emptyTier());
}
function removeTier(i: number) {
  form.tiers.splice(i, 1);
}
function onNewDouble() {
  message.warning('加倍奖励为独立模块，尚未上线');
}

async function submit() {
  if (!form.title.trim()) {
    message.error('请填写标题');
    return;
  }
  if (!dateRange.value) {
    message.error('请选择活动日期');
    return;
  }
  if (!form.currencies.length) {
    message.error('请选择币种');
    return;
  }
  const payload: PeriodicTaskPayload = {
    category: props.category,
    title: form.title.trim(),
    currencies: form.currencies,
    startsAt: new Date(dateRange.value[0]).toISOString(),
    endsAt: new Date(dateRange.value[1]).toISOString(),
    goalType: form.goalType,
    depositMethods: isRechargeGoal.value
      ? form.depositMethods.filter((m) => m !== 'all')
      : [],
    inviteValidity:
      form.goalType === 'invite_friends' ? form.inviteValidity : null,
    rewardMode: form.rewardMode,
    doubleRewardSchemeId:
      enableDouble.value && canDouble.value
        ? form.doubleRewardSchemeId
        : null,
    isActive: true,
    tiers: form.tiers.map((t, i) => ({
      threshold: Number(t.threshold) || 0,
      cashAmount: Number(t.cashAmount) || 0,
      extraEnabled: Boolean(t.extraEnabled),
      extraType: t.extraEnabled ? t.extraType : null,
      extraAmount: t.extraEnabled ? Number(t.extraAmount) || 0 : null,
      extraValidDays: t.extraEnabled ? Number(t.extraValidDays) || 7 : null,
      sortOrder: i,
    })),
  };
  saving.value = true;
  try {
    if (isEdit.value) {
      await taskCenterPeriodicApi.update(props.editItem.id, payload);
    } else {
      await taskCenterPeriodicApi.create(payload);
    }
    message.success('已保存');
    show.value = false;
    emit('saved');
  } catch (e: any) {
    message.error(e?.message || '保存失败');
  } finally {
    saving.value = false;
  }
}
</script>
