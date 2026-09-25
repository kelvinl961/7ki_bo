<script setup lang="ts">
/**
 * 新砍一刀 / soft gameplay config — competitor settings parity.
 */
import { computed, defineAsyncComponent, watch } from 'vue';
import {
  NButton,
  NCheckbox,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NSwitch,
} from 'naive-ui';
import { NEWBLADE_DEFAULT_ASSETS } from './newbladeDefaultAssets';

const MediaLibrarySelector = defineAsyncComponent(
  () => import('#/components/MediaLibrarySelector.vue'),
);

const props = defineProps<{
  formData: Record<string, any>;
}>();

const taskTypeOptions = [
  { label: '再有效推广下级≥', value: 'invite' },
  { label: '当日累计充值≥', value: 'daily_recharge' },
  { label: '当日累计打码≥', value: 'daily_wager' },
  { label: '本人每笔充值≥', value: 'per_deposit' },
  { label: '本人下载APP并登录', value: 'download_app' },
  { label: '本人绑定手机号', value: 'bind_phone' },
  { label: '本人绑定邮箱', value: 'bind_email' },
  { label: '本人绑定提现方式', value: 'bind_withdraw' },
];

const BOOLEAN_TASK_TYPES = new Set([
  'bind_phone',
  'bind_email',
  'bind_withdraw',
  'download_app',
]);

const slotTypeOptions = [
  { label: '随机', value: 'random' },
  { label: '固定', value: 'fixed' },
  { label: '谢谢惠顾', value: 'miss' },
];

const beforeLoginPopupOptions = [
  { label: '不弹窗', value: 'none' },
  { label: '高频弹窗', value: 'high_frequency' },
  { label: '每日一次', value: 'once_daily' },
];

const afterLoginPopupOptions = [
  { label: '不弹窗', value: 'none' },
  { label: '高频弹窗', value: 'high_frequency' },
  { label: '每日一次', value: 'once_daily' },
  { label: '每次登录', value: 'every_login' },
  { label: '只弹一次', value: 'only_once' },
];

const slotCountOptions = [4, 6, 8, 10, 12].map((n) => ({
  label: String(n),
  value: n,
}));

const wheelFaceColors = [
  { label: '墨绿色', value: '#0d4f3c' },
  { label: '棕色', value: '#8B5A2B' },
  { label: '黄色', value: '#E8B923' },
  { label: '天蓝色', value: '#5BA3E0' },
  { label: '蓝色', value: '#1E4F9C' },
  { label: '紫色', value: '#7B3FA0' },
  { label: '红色', value: '#C62828' },
  { label: '粉色', value: '#E91E8C' },
  { label: '黑色', value: '#1A1A1A' },
  { label: '绿色', value: '#2E7D32' },
];

function isBooleanTask(type: string) {
  return BOOLEAN_TASK_TYPES.has(type);
}

function taskValuePlaceholder(type: string) {
  switch (type) {
    case 'invite':
      return '请输入人数';
    case 'daily_recharge':
      return '请输入充值金额';
    case 'daily_wager':
      return '请输入打码金额';
    case 'per_deposit':
      return '请输入单笔充值金额';
    default:
      return '请输入条件值';
  }
}

function taskValueSuffix(type: string) {
  switch (type) {
    case 'invite':
      return '人，获得1次抽奖机会';
    case 'per_deposit':
    case 'daily_recharge':
    case 'daily_wager':
      return '获得1次抽奖机会';
    default:
      return '完成后获得1次抽奖机会';
  }
}

function onTaskTypeChange(task: Record<string, any>, type: string) {
  task.type = type;
  if (isBooleanTask(type)) task.value = 1;
}

function addTask(formData: Record<string, any>) {
  if (!Array.isArray(formData.newbladeTasks)) formData.newbladeTasks = [];
  formData.newbladeTasks.push({
    id: `task_${Date.now()}`,
    type: 'invite',
    value: 1,
    weight: 1,
  });
}

function removeTask(formData: Record<string, any>, index: number) {
  formData.newbladeTasks.splice(index, 1);
}

function defaultSlot(index: number) {
  if (index === 0) return { type: 'random', amount: 0, weight: 1, icon: '' };
  return { type: 'fixed', amount: 0, weight: 0, icon: '' };
}

function ensureWheelSlots(formData: Record<string, any>) {
  const count = Number(formData.newbladeWheelSlotCount) || 4;
  if (!Array.isArray(formData.newbladeWheelSlots)) {
    formData.newbladeWheelSlots = [];
  }
  while (formData.newbladeWheelSlots.length < count) {
    formData.newbladeWheelSlots.push(
      defaultSlot(formData.newbladeWheelSlots.length),
    );
  }
  if (formData.newbladeWheelSlots.length > count) {
    formData.newbladeWheelSlots = formData.newbladeWheelSlots.slice(0, count);
  }
}

function onSlotCountChange(formData: Record<string, any>, count: number) {
  formData.newbladeWheelSlotCount = count;
  ensureWheelSlots(formData);
}

function ensurePromoImages(formData: Record<string, any>) {
  if (!Array.isArray(formData.newbladePromoShareImages)) {
    formData.newbladePromoShareImages = [];
  }
}

function addPromoImage(formData: Record<string, any>) {
  ensurePromoImages(formData);
  formData.newbladePromoShareImages.push('');
}

function removePromoImage(formData: Record<string, any>, index: number) {
  ensurePromoImages(formData);
  formData.newbladePromoShareImages.splice(index, 1);
}

/** BO edits hours; ActivityFormModal persists giftOnlineMinutes. */
const giftOnlineHours = computed({
  get() {
    const mins = Number(props.formData.newbladeGiftOnlineMinutes) || 0;
    if (props.formData.newbladeGiftOnlineHours != null) {
      return Number(props.formData.newbladeGiftOnlineHours) || null;
    }
    return mins > 0 ? Math.min(24, Math.max(1, Math.round(mins / 60))) : null;
  },
  set(v: number | null) {
    const hours = v == null || v <= 0 ? 0 : Math.min(24, Math.max(1, Math.floor(v)));
    props.formData.newbladeGiftOnlineHours = hours || null;
    props.formData.newbladeGiftOnlineMinutes = hours > 0 ? hours * 60 : 0;
  },
});

const giftOnlineEnabled = computed({
  get() {
    return (Number(props.formData.newbladeGiftOnlineMinutes) || 0) > 0
      || (Number(props.formData.newbladeGiftOnlineHours) || 0) > 0;
  },
  set(on: boolean) {
    if (on) {
      const h = Number(props.formData.newbladeGiftOnlineHours) || 1;
      props.formData.newbladeGiftOnlineHours = h;
      props.formData.newbladeGiftOnlineMinutes = h * 60;
    } else {
      props.formData.newbladeGiftOnlineHours = null;
      props.formData.newbladeGiftOnlineMinutes = 0;
    }
  },
});

watch(
  () => props.formData.newbladeWheelSlotCount,
  () => ensureWheelSlots(props.formData),
  { immediate: true },
);

/** Seed style-1 default assets once when fields are empty (new activity / legacy config). */
watch(
  () => props.formData,
  (fd) => {
    if (!fd) return;
    const d = NEWBLADE_DEFAULT_ASSETS;
    if (!String(fd.newbladeHubAssetUrl || '').trim()) {
      fd.newbladeHubAssetUrl = d.hubAssetUrl;
    }
    if (!String(fd.newbladeWheelAssetUrl || '').trim()) {
      fd.newbladeWheelAssetUrl = d.wheelAssetUrl;
    }
    if (!String(fd.newbladeSegmentAssetUrl || '').trim()) {
      fd.newbladeSegmentAssetUrl = d.segmentAssetUrl;
    }
    if (!String(fd.newbladeWinEffectAssetUrl || '').trim()) {
      fd.newbladeWinEffectAssetUrl = d.winEffectAssetUrl;
    }
    if (!String(fd.newbladeFrameAssetUrl || '').trim()) {
      fd.newbladeFrameAssetUrl = d.frameAssetUrl;
    }
    if (!String(fd.newbladeSpinAssetUrl || '').trim()) {
      fd.newbladeSpinAssetUrl = d.spinAssetUrl;
    }
  },
  { immediate: true },
);

const previewSlotCount = computed(() => {
  const n = Number(props.formData.newbladeWheelSlotCount) || 8;
  return Math.min(12, Math.max(4, n));
});

const previewFaceColor = computed(
  () => props.formData.newbladeBgColor || '#0d4f3c',
);

const previewDrawStyle = computed(
  () => props.formData.newbladeDrawStyle || 'turntable_1',
);

const previewAmounts = computed(() => {
  const slots = Array.isArray(props.formData.newbladeWheelSlots)
    ? props.formData.newbladeWheelSlots
    : [];
  const n = previewSlotCount.value;
  return Array.from({ length: n }, (_, i) => {
    const s = slots[i];
    if (!s) return 0;
    if (s.type === 'miss') return 0;
    if (s.type === 'random') return -1;
    return Number(s.amount) || 0;
  });
});

function previewSlotStyle(index: number, total: number) {
  const angle = (index / total) * 360 - 90;
  const rad = (angle * Math.PI) / 180;
  const r = 38;
  return {
    left: `${50 + Math.cos(rad) * r}%`,
    top: `${50 + Math.sin(rad) * r}%`,
  };
}

function previewLabel(amt: number) {
  if (amt < 0) return '?';
  if (amt === 0) return '谢谢';
  return Number(amt).toFixed(2);
}
</script>

<template>
  <div class="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
    <div class="text-sm font-semibold text-emerald-900">新砍一刀配置</div>

    <div class="flex items-center justify-between">
      <label class="text-xs text-gray-600">是否展示到代理页面</label>
      <n-switch v-model:value="formData.newbladeDisplayOnAgentPage" />
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">登录前弹窗方式</label>
      <n-radio-group v-model:value="formData.newbladeBeforeLoginPopup">
        <n-space>
          <n-radio
            v-for="o in beforeLoginPopupOptions"
            :key="o.value"
            :value="o.value"
          >
            {{ o.label }}
          </n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">登录后弹窗方式</label>
      <n-radio-group v-model:value="formData.newbladeAfterLoginPopup">
        <n-space>
          <n-radio
            v-for="o in afterLoginPopupOptions"
            :key="o.value"
            :value="o.value"
          >
            {{ o.label }}
          </n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">弹窗样式</label>
      <n-radio-group v-model:value="formData.newbladePopupStyle">
        <n-space>
          <n-radio value="lottery">直接展示抽奖页面</n-radio>
          <n-radio value="promo_image">展示宣传图，点击后进入详情页</n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">重置周期</label>
      <n-radio-group v-model:value="formData.newbladeResetMode">
        <n-space>
          <n-radio value="once">一次性(推荐)</n-radio>
          <n-radio value="custom_days">自定义</n-radio>
        </n-space>
      </n-radio-group>
      <n-input-number
        v-if="formData.newbladeResetMode === 'custom_days'"
        v-model:value="formData.newbladeResetDays"
        class="mt-2 w-full"
        :min="1"
        :max="31"
      />
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">同周期能否多次参与</label>
      <n-radio-group v-model:value="formData.newbladeAllowReenterAfterClaim">
        <n-space>
          <n-radio :value="false">只能参与一次</n-radio>
          <n-radio :value="true">完成后可再次参与</n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">
        <span class="text-red-500">*</span>派发方式
      </label>
      <n-radio-group v-model:value="formData.newbladeDistributionMethod">
        <n-space vertical>
          <n-radio value="player_claim_auto_after_expire">玩家自领-过期自动派发</n-radio>
          <n-radio value="player_claim_expires">玩家自领-过期作废</n-radio>
          <n-radio value="manual">玩家申请-人工派发</n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">
        <span class="text-red-500">*</span>奖励领取过期天数
      </label>
      <n-input-number
        v-model:value="formData.newbladeRewardExpirationDays"
        :min="0"
        class="w-full"
      />
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">奖励类型</label>
      <n-radio-group v-model:value="formData.newbladeFinalRewardType">
        <n-space>
          <n-radio value="fixed">固定金额</n-radio>
          <n-radio value="random">随机金额</n-radio>
        </n-space>
      </n-radio-group>
      <div v-if="formData.newbladeFinalRewardType === 'fixed'" class="mt-2">
        <label class="mb-1 block text-xs text-gray-600">
          <span class="text-red-500">*</span>可领取金额(实际赠送)
        </label>
        <n-input-number
          v-model:value="formData.newbladeFinalRewardFixed"
          :min="0"
          class="w-full"
          placeholder="请输入可领取金额(实际赠送)"
        />
      </div>
      <div v-else class="mt-2 grid grid-cols-3 gap-2">
        <n-input-number
          v-model:value="formData.newbladeFinalRewardMin"
          :min="0"
          placeholder="请输入最小值"
        />
        <n-input-number
          v-model:value="formData.newbladeFinalRewardMax"
          :min="0"
          placeholder="请输入最大值"
        />
        <div>
          <label class="mb-1 block text-xs text-gray-500">平均金额</label>
          <n-input-number
            v-model:value="formData.newbladeFinalRewardExpected"
            :min="0"
            placeholder="请输入平均金额"
          />
        </div>
      </div>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">第1次中奖金额范围</label>
      <div class="grid grid-cols-[1fr_auto_1fr_1fr] items-end gap-2">
        <n-input-number
          v-model:value="formData.newbladeFirstSpinMin"
          :min="0"
          placeholder="请输入最小值"
        />
        <span class="pb-2 text-gray-400">-</span>
        <n-input-number
          v-model:value="formData.newbladeFirstSpinMax"
          :min="0"
          placeholder="请输入最大值"
        />
        <div>
          <label class="mb-1 block text-xs text-gray-500">
            <span class="text-red-500">*</span>平均金额
          </label>
          <n-input-number
            v-model:value="formData.newbladeFirstSpinExpected"
            :min="0"
            placeholder="请输入平均金额"
          />
        </div>
      </div>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">第1次抽奖参与限制</label>
      <n-radio-group v-model:value="formData.newbladeFirstSpinRequiresTask">
        <n-space>
          <n-radio :value="false">可直接抽奖</n-radio>
          <n-radio :value="true">完成参与条件后才可抽奖</n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">获奖必须的有效抽奖次数范围</label>
      <div class="grid grid-cols-[1fr_auto_1fr_1fr] items-end gap-2">
        <n-input-number
          v-model:value="formData.newbladeRequiredDrawsMin"
          :min="1"
          placeholder="请输入最小值"
        />
        <span class="pb-2 text-gray-400">-</span>
        <n-input-number
          v-model:value="formData.newbladeRequiredDrawsMax"
          :min="1"
          placeholder="请输入最大值"
        />
        <div>
          <label class="mb-1 block text-xs text-gray-500">
            <span class="text-red-500">*</span>平均次数
          </label>
          <n-input-number
            v-model:value="formData.newbladeRequiredDrawsExpected"
            :min="1"
            placeholder="请输入平均次数"
          />
        </div>
      </div>
    </div>

    <div>
      <label class="mb-2 block text-xs text-gray-600">赠送次数(不计入有效抽奖次数)</label>
      <div class="space-y-2">
        <n-checkbox v-model:checked="formData.newbladeGiftDailyLogin">
          每日登录赠送1次
        </n-checkbox>
        <div class="flex flex-wrap items-center gap-2">
          <n-checkbox v-model:checked="giftOnlineEnabled">
            每日在线时长≥
          </n-checkbox>
          <n-input-number
            v-model:value="giftOnlineHours"
            :min="1"
            :max="24"
            :disabled="!giftOnlineEnabled"
            class="w-28"
            placeholder="请输入在线时长, 1-24"
            :show-button="false"
          />
          <span class="text-xs text-gray-600">小时 赠送1次</span>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <label class="text-xs text-gray-600">首页抽奖次数提醒</label>
      <n-switch v-model:value="formData.newbladeHomeSpinReminder" />
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">是否允许次数累积</label>
      <n-radio-group v-model:value="formData.newbladeAccumulateTasks">
        <n-space>
          <n-radio :value="false">不累积</n-radio>
          <n-radio :value="true">允许累积</n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-2 block text-xs text-gray-600">任务列表</label>
      <div class="mb-1 grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto] gap-2 px-0.5 text-xs text-gray-500">
        <span>任务类型</span>
        <span>条件值</span>
        <span class="w-16" />
      </div>
      <div
        v-for="(task, index) in formData.newbladeTasks"
        :key="task.id || index"
        class="mb-2 grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto] items-start gap-2"
      >
        <n-select
          :value="task.type"
          :options="taskTypeOptions"
          size="small"
          @update:value="(v) => onTaskTypeChange(task, v)"
        />
        <div>
          <div
            v-if="!isBooleanTask(task.type)"
            class="flex h-7 w-full overflow-hidden rounded border border-gray-300 bg-white"
          >
            <n-input-number
              v-model:value="task.value"
              :min="0"
              size="small"
              class="min-w-0 flex-1 newblade-task-value"
              :placeholder="taskValuePlaceholder(task.type)"
              :show-button="false"
              :bordered="false"
            />
            <span
              class="inline-flex shrink-0 items-center whitespace-nowrap border-l border-gray-300 bg-gray-50 px-2 text-xs text-gray-600"
            >
              {{ taskValueSuffix(task.type) }}
            </span>
          </div>
          <span
            v-else
            class="inline-flex h-7 items-center rounded border border-gray-200 bg-gray-50 px-2 text-xs text-gray-600"
          >
            {{ taskValueSuffix(task.type) }}
          </span>
        </div>
        <div class="flex gap-1">
          <n-button size="small" type="primary" secondary @click="addTask(formData)">
            +
          </n-button>
          <n-button
            size="small"
            quaternary
            :disabled="(formData.newbladeTasks?.length || 0) <= 1"
            @click="removeTask(formData, index)"
          >
            ×
          </n-button>
        </div>
      </div>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">有效会员标准</label>
      <n-radio-group v-model:value="formData.newbladeValidMemberMode">
        <n-space>
          <n-radio value="register_login">注册登录成功算有效</n-radio>
          <n-radio value="strict">同时满足以下条件算有效</n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-2 block text-xs text-gray-600">统计人数限制</label>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="mb-1 block text-xs text-gray-500">同注册IP上限</label>
          <n-input-number v-model:value="formData.newbladeSameIpLimit" :min="0" class="w-full" />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">同注册设备上限</label>
          <n-input-number
            v-model:value="formData.newbladeSameDeviceLimit"
            :min="0"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <div>
      <label class="mb-2 block text-xs text-gray-600">选择推广图</label>
      <p class="mb-2 text-xs text-gray-400">
        格式 png,jpg，建议尺寸 1080×1920，大小 &lt;1MB。从媒体库选择或上传。
      </p>
      <div
        class="mb-2 flex flex-wrap gap-3 rounded border border-dashed border-gray-300 bg-white p-3"
      >
        <div
          v-for="(url, index) in formData.newbladePromoShareImages || []"
          :key="`promo_${index}`"
          class="relative w-28"
        >
          <MediaLibrarySelector
            v-model="formData.newbladePromoShareImages[index]"
            category="promotion"
            placeholder="选择推广图"
          />
          <div
            v-if="url"
            class="pointer-events-none absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white"
          >
            ✓
          </div>
          <n-button
            size="tiny"
            type="error"
            quaternary
            class="mt-1"
            @click="removePromoImage(formData, index)"
          >
            删除
          </n-button>
        </div>
        <n-button size="small" dashed @click="addPromoImage(formData)">
          + 上传 / 选择
        </n-button>
      </div>
      <p class="text-xs text-gray-400">仅选中的图片在客户端分享页面展示</p>
    </div>

    <div class="space-y-3">
      <div>
        <label class="mb-1 block text-xs text-gray-600">推广图展示活动名称</label>
        <n-radio-group v-model:value="formData.newbladeShareShowActivityName">
          <n-space>
            <n-radio :value="true">展示</n-radio>
            <n-radio :value="false">不展示</n-radio>
          </n-space>
        </n-radio-group>
      </div>
      <div>
        <label class="mb-1 block text-xs text-gray-600">推广图展示邀请码</label>
        <n-radio-group v-model:value="formData.newbladeShareShowInviteCode">
          <n-space>
            <n-radio :value="true">展示</n-radio>
            <n-radio :value="false">不展示</n-radio>
          </n-space>
        </n-radio-group>
      </div>
      <div>
        <label class="mb-1 block text-xs text-gray-600">推广图展示会员账号</label>
        <n-radio-group v-model:value="formData.newbladeShareShowMemberAccount">
          <n-space>
            <n-radio :value="true">展示</n-radio>
            <n-radio :value="false">不展示</n-radio>
          </n-space>
        </n-radio-group>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <label class="text-xs text-gray-600">中奖公告</label>
      <n-switch v-model:value="formData.newbladeEnableWinningAnnouncement" />
    </div>
    <div class="flex items-center justify-between">
      <label class="text-xs text-gray-600">爆屏通知</label>
      <n-switch v-model:value="formData.newbladeEnableBurstNotify" />
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">奖项数量</label>
      <n-radio-group
        :value="formData.newbladeWheelSlotCount"
        @update:value="(v) => onSlotCountChange(formData, Number(v))"
      >
        <n-space>
          <n-radio
            v-for="o in slotCountOptions"
            :key="o.value"
            :value="o.value"
          >
            {{ o.label }}
          </n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-2 block text-xs text-gray-600">奖项配置</label>
      <div class="mb-1 grid grid-cols-[80px_1fr_1.2fr_1.2fr] gap-2 text-xs text-gray-500">
        <span>#</span>
        <span>奖励类型</span>
        <span>奖励金额</span>
        <span>奖励图标</span>
      </div>
      <div
        v-for="(slot, index) in formData.newbladeWheelSlots || []"
        :key="`slot_${index}`"
        class="mb-2 grid grid-cols-[80px_1fr_1.2fr_1.2fr] items-center gap-2"
      >
        <span class="text-xs text-gray-500">奖项 {{ index + 1 }}</span>
        <n-select
          v-model:value="slot.type"
          :options="slotTypeOptions"
          size="small"
        />
        <n-input-number
          v-model:value="slot.amount"
          :min="0"
          size="small"
          :disabled="slot.type === 'miss' || slot.type === 'random'"
          :placeholder="
            slot.type === 'random'
              ? '0 - 请输入奖励金额'
              : slot.type === 'miss'
                ? '—'
                : '请输入奖励金额'
          "
          :show-button="false"
        />
        <MediaLibrarySelector
          v-model="slot.icon"
          category="promotion"
          placeholder="选择图标"
        />
      </div>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">抽奖样式</label>
      <n-radio-group v-model:value="formData.newbladeDrawStyle">
        <n-space>
          <n-radio value="turntable_1">转盘1</n-radio>
          <n-radio value="turntable_2">转盘2</n-radio>
          <n-radio value="gashapon">扭蛋机</n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-2 block text-xs text-gray-600">转盘素材（默认转盘1资源，可替换）</label>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs text-gray-500">中心圆+指针</label>
          <MediaLibrarySelector
            v-model="formData.newbladeHubAssetUrl"
            category="promotion"
            :accept-types="['image']"
            placeholder="选择中心圆素材"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">静止转盘</label>
          <MediaLibrarySelector
            v-model="formData.newbladeWheelAssetUrl"
            category="promotion"
            :accept-types="['image']"
            placeholder="选择静止转盘"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">转盘分区/奖项底</label>
          <MediaLibrarySelector
            v-model="formData.newbladeSegmentAssetUrl"
            category="promotion"
            :accept-types="['image']"
            placeholder="选择分区素材"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">中奖流光动画</label>
          <MediaLibrarySelector
            v-model="formData.newbladeWinEffectAssetUrl"
            category="promotion"
            :accept-types="['image']"
            placeholder="选择中奖动画"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">旋转中转盘</label>
          <MediaLibrarySelector
            v-model="formData.newbladeFrameAssetUrl"
            category="promotion"
            :accept-types="['image']"
            placeholder="选择旋转中素材"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">中奖态转盘</label>
          <MediaLibrarySelector
            v-model="formData.newbladeSpinAssetUrl"
            category="promotion"
            :accept-types="['image']"
            placeholder="选择中奖态素材"
          />
        </div>
      </div>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">背景颜色</label>
      <p class="mb-2 text-xs text-gray-400">影响转盘盘面颜色（弹窗外壳跟随客户端皮肤）。</p>
      <n-radio-group v-model:value="formData.newbladeBgColor">
        <n-space>
          <n-radio
            v-for="c in wheelFaceColors"
            :key="c.value"
            :value="c.value"
          >
            <span class="inline-flex items-center gap-1">
              <span
                class="inline-block h-3 w-3 rounded-sm border border-gray-300"
                :style="{ background: c.value }"
              />
              {{ c.label }}
            </span>
          </n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">第1次4选1抽奖样式</label>
      <n-radio-group v-model:value="formData.newbladeFirstDrawStyle">
        <n-space>
          <n-radio value="chest">宝箱</n-radio>
          <n-radio value="gift1">礼盒1</n-radio>
          <n-radio value="gift2">礼盒2</n-radio>
          <n-radio value="bowl">聚宝盆</n-radio>
          <n-radio value="golden_egg">金蛋</n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-2 block text-xs text-gray-600">抽奖预览</label>
      <div
        class="flex items-center justify-center rounded-lg border border-gray-200 bg-slate-900 p-4"
        style="min-height: 220px"
      >
        <div
          v-if="previewDrawStyle === 'gashapon'"
          class="flex flex-wrap justify-center gap-2"
        >
          <div
            v-for="(amt, i) in previewAmounts"
            :key="i"
            class="flex h-12 w-12 flex-col items-center justify-center rounded-full text-[10px] text-white"
            :style="{ background: previewFaceColor }"
          >
            {{ previewLabel(amt) }}
          </div>
        </div>
        <div
          v-else
          class="relative rounded-full border-4 border-amber-400 shadow-lg"
          :style="{
            width: previewDrawStyle === 'turntable_2' ? '180px' : '168px',
            height: previewDrawStyle === 'turntable_2' ? '180px' : '168px',
            background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.35), ${previewFaceColor})`,
            boxShadow: '0 0 0 3px #c62828, inset 0 0 20px rgba(0,0,0,0.25)',
          }"
        >
          <div
            v-for="(amt, i) in previewAmounts"
            :key="i"
            class="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-semibold text-white drop-shadow"
            :style="previewSlotStyle(i, previewSlotCount)"
          >
            {{ previewLabel(amt) }}
          </div>
          <div
            class="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-amber-300 text-[10px] font-bold text-white"
            :style="{ background: previewFaceColor, filter: 'brightness(0.75)' }"
          >
            <span>x1</span>
            <span class="text-[8px] font-normal opacity-90">免费抽奖</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.newblade-task-value :deep(.n-input),
.newblade-task-value :deep(.n-input-wrapper),
.newblade-task-value :deep(.n-input__input-el) {
  height: 100% !important;
  min-height: 0 !important;
}
.newblade-task-value :deep(.n-input) {
  border-radius: 0 !important;
  --n-height: 28px !important;
}
.newblade-task-value {
  height: 100%;
}
.newblade-task-value :deep(.n-input-number) {
  height: 100%;
  width: 100%;
}
</style>
