<script setup lang="ts">
/**
 * 新砍一刀 / soft gameplay config fields — persists canonical API keys.
 */
import {
  NButton,
  NCheckbox,
  NInput,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
} from 'naive-ui';

defineProps<{
  formData: Record<string, any>;
}>();

const taskTypeOptions = [
  { label: '邀请有效下级', value: 'invite' },
  { label: '每日充值金额', value: 'daily_recharge' },
  { label: '每日有效投注', value: 'daily_wager' },
  { label: '每日充值次数', value: 'daily_recharge_count' },
  { label: '绑定手机', value: 'bind_phone' },
  { label: '绑定邮箱', value: 'bind_email' },
  { label: '绑定提现账户', value: 'bind_withdraw' },
  { label: '下载APP', value: 'download_app' },
  { label: '登录', value: 'login' },
];

const popupOptions = [
  { label: '不弹窗', value: 'none' },
  { label: '高频', value: 'high_frequency' },
  { label: '每日一次', value: 'once_daily' },
  { label: '每次登录', value: 'every_login' },
  { label: '仅一次', value: 'only_once' },
];

const slotCountOptions = [4, 6, 8, 10, 12].map((n) => ({
  label: String(n),
  value: n,
}));

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
</script>

<template>
  <div class="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
    <div class="text-sm font-semibold text-emerald-900">新砍一刀配置</div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">重置周期</label>
      <n-radio-group v-model:value="formData.newbladeResetMode">
        <n-space>
          <n-radio value="once">一次性</n-radio>
          <n-radio value="custom_days">自定义天数</n-radio>
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
          <n-radio :value="false">仅一次</n-radio>
          <n-radio :value="true">完成后可再参与</n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">派发方式</label>
      <n-select
        v-model:value="formData.newbladeDistributionMethod"
        :options="[
          { label: '玩家自领 / 过期自动派发', value: 'player_claim_auto_after_expire' },
          { label: '玩家自领 / 过期作废', value: 'player_claim_expires' },
          { label: '玩家申请 / 人工派发', value: 'manual' },
        ]"
      />
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">奖励领取过期天数</label>
      <n-input-number v-model:value="formData.newbladeRewardExpirationDays" :min="0" class="w-full" />
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
        <n-input-number v-model:value="formData.newbladeFinalRewardFixed" :min="0" class="w-full" />
      </div>
      <div v-else class="mt-2 grid grid-cols-3 gap-2">
        <n-input-number v-model:value="formData.newbladeFinalRewardMin" :min="0" placeholder="最小" />
        <n-input-number v-model:value="formData.newbladeFinalRewardMax" :min="0" placeholder="最大" />
        <n-input-number v-model:value="formData.newbladeFinalRewardExpected" :min="0" placeholder="均值" />
      </div>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">第1次中奖金额范围</label>
      <div class="grid grid-cols-3 gap-2">
        <n-input-number v-model:value="formData.newbladeFirstSpinMin" :min="0" />
        <n-input-number v-model:value="formData.newbladeFirstSpinMax" :min="0" />
        <n-input-number v-model:value="formData.newbladeFirstSpinExpected" :min="0" />
      </div>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">第1次抽奖限制</label>
      <n-radio-group v-model:value="formData.newbladeFirstSpinRequiresTask">
        <n-space>
          <n-radio :value="false">可直接抽奖</n-radio>
          <n-radio :value="true">满足参与条件后抽奖</n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">获奖必须的有效抽奖次数范围</label>
      <div class="grid grid-cols-3 gap-2">
        <n-input-number v-model:value="formData.newbladeRequiredDrawsMin" :min="1" />
        <n-input-number v-model:value="formData.newbladeRequiredDrawsMax" :min="1" />
        <n-input-number v-model:value="formData.newbladeRequiredDrawsExpected" :min="1" />
      </div>
    </div>

    <div class="space-y-2">
      <n-checkbox v-model:checked="formData.newbladeGiftDailyLogin">每日登录赠送1次</n-checkbox>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-600">每日在线(分钟)赠送1次</span>
        <n-input-number v-model:value="formData.newbladeGiftOnlineMinutes" :min="0" class="w-32" />
      </div>
      <n-checkbox v-model:checked="formData.newbladeHomeSpinReminder">首页抽奖次数提醒</n-checkbox>
      <n-checkbox v-model:checked="formData.newbladeAccumulateTasks">允许次数累积</n-checkbox>
    </div>

    <div>
      <label class="mb-2 block text-xs text-gray-600">任务列表</label>
      <div
        v-for="(task, index) in formData.newbladeTasks"
        :key="task.id || index"
        class="mb-2 flex items-end gap-2"
      >
        <n-select v-model:value="task.type" :options="taskTypeOptions" class="flex-1" size="small" />
        <n-input-number v-model:value="task.value" :min="0" size="small" class="w-24" />
        <n-input-number v-model:value="task.weight" :min="1" size="small" class="w-20" />
        <n-button size="small" type="error" @click="removeTask(formData, index)">删</n-button>
      </div>
      <n-button size="small" type="primary" @click="addTask(formData)">+ 任务</n-button>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">有效会员标准</label>
      <n-radio-group v-model:value="formData.newbladeValidMemberMode">
        <n-space>
          <n-radio value="register_login">成功注册并登录</n-radio>
          <n-radio value="strict">严格条件</n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="mb-1 block text-xs text-gray-600">同IP人数上限(0=不限)</label>
        <n-input-number v-model:value="formData.newbladeSameIpLimit" :min="0" class="w-full" />
      </div>
      <div>
        <label class="mb-1 block text-xs text-gray-600">同设备人数上限</label>
        <n-input-number v-model:value="formData.newbladeSameDeviceLimit" :min="0" class="w-full" />
      </div>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">登录前弹窗</label>
      <n-select v-model:value="formData.newbladeBeforeLoginPopup" :options="popupOptions" />
    </div>
    <div>
      <label class="mb-1 block text-xs text-gray-600">登录后弹窗</label>
      <n-select v-model:value="formData.newbladeAfterLoginPopup" :options="popupOptions" />
    </div>
    <div>
      <label class="mb-1 block text-xs text-gray-600">弹窗样式</label>
      <n-radio-group v-model:value="formData.newbladePopupStyle">
        <n-space>
          <n-radio value="lottery">直接展示抽奖页</n-radio>
          <n-radio value="promo_image">展示宣传图</n-radio>
        </n-space>
      </n-radio-group>
    </div>
    <n-checkbox v-model:checked="formData.newbladeDisplayOnAgentPage">展示到代理页面</n-checkbox>

    <div>
      <label class="mb-1 block text-xs text-gray-600">奖项数量</label>
      <n-radio-group v-model:value="formData.newbladeWheelSlotCount">
        <n-space>
          <n-radio v-for="o in slotCountOptions" :key="o.value" :value="o.value">{{ o.label }}</n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">抽奖样式</label>
      <n-select
        v-model:value="formData.newbladeDrawStyle"
        :options="[
          { label: '转盘1', value: 'turntable_1' },
          { label: '转盘2', value: 'turntable_2' },
          { label: '扭蛋机', value: 'gashapon' },
        ]"
      />
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">背景颜色</label>
      <n-input v-model:value="formData.newbladeBgColor" placeholder="#0d4f3c" />
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">第1次抽奖样式</label>
      <n-select
        v-model:value="formData.newbladeFirstDrawStyle"
        :options="[
          { label: '宝箱', value: 'chest' },
          { label: '礼盒1', value: 'gift1' },
          { label: '礼盒2', value: 'gift2' },
          { label: '聚宝盆', value: 'bowl' },
          { label: '金蛋', value: 'golden_egg' },
        ]"
      />
    </div>

    <div class="space-y-2">
      <n-checkbox v-model:checked="formData.newbladeEnableWinningAnnouncement">中奖公告</n-checkbox>
      <n-checkbox v-model:checked="formData.newbladeEnableBurstNotify">爆屏通知</n-checkbox>
    </div>

    <div>
      <label class="mb-1 block text-xs text-gray-600">推广图URL（逗号分隔）</label>
      <n-input
        v-model:value="formData.newbladePromoShareImagesText"
        type="textarea"
        placeholder="https://..."
      />
    </div>

    <div class="space-y-1">
      <div class="text-xs text-gray-600">分享图叠加</div>
      <n-checkbox v-model:checked="formData.newbladeShareShowActivityName">活动名称</n-checkbox>
      <n-checkbox v-model:checked="formData.newbladeShareShowInviteCode">邀请码</n-checkbox>
      <n-checkbox v-model:checked="formData.newbladeShareShowMemberAccount">会员账号</n-checkbox>
    </div>
  </div>
</template>
