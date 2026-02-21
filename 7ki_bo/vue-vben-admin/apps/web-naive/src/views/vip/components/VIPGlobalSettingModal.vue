<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    title="VIP公共设置"
    :style="{ width: '1000px', maxHeight: '90vh' }"
    :closable="true"
    :mask-closable="false"
    :show-icon="false"
  >
    <div class="vip-global-setting-modal">
      <n-scrollbar style="max-height: 70vh">
        <n-form
          ref="formRef"
          :model="formModel"
          :rules="formRules"
          label-placement="left"
          label-width="140px"
          require-mark-placement="right-hanging"
        >
          <!-- 奖励开关总控制 -->
          <div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <n-form-item label="发放开关" path="rewardEnabled">
              <n-switch
                v-model:value="formModel.rewardEnabled"
                :checked-value="true"
                :unchecked-value="false"
              />
              <n-text depth="3" class="ml-2">
                {{
                  formModel.rewardEnabled
                    ? '已启用VIP奖励发放'
                    : '已关闭VIP奖励发放'
                }}
              </n-text>
            </n-form-item>
          </div>

          <!-- 每日奖励设置 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">每日奖励设置</h3>

            <n-form-item label="领取时间" path="dailySettings.claimTime">
              <n-radio-group v-model:value="formModel.dailySettings.claimTime">
                <n-space>
                  <n-radio value="next-day" class="text-blue-600">次日</n-radio>
                  <n-radio value="same-day" class="text-blue-600">当日</n-radio>
                </n-space>
              </n-radio-group>
              <n-text
                depth="3"
                class="ml-4 cursor-pointer text-blue-500 hover:underline"
              >
                (实时领取(需审核))
              </n-text>
            </n-form-item>

            <n-form-item label="领取方式" path="dailySettings.repeatableClaim">
              <n-radio-group
                v-model:value="formModel.dailySettings.repeatableClaim"
              >
                <n-space vertical>
                  <n-radio value="repeatable">可重复领取(含补领部分)</n-radio>
                  <n-radio value="highest-only">只能领取最高一档</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item
              label="*奖励领取延迟天数"
              path="dailySettings.delayDays"
            >
              <n-input-number
                v-model:value="formModel.dailySettings.delayDays"
                :min="0"
                :max="30"
                placeholder="请输入延迟天数"
                style="width: 200px"
              />
              <n-text depth="3" class="ml-2">天</n-text>
            </n-form-item>
          </div>

          <!-- 每周奖励设置 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">每周奖励设置</h3>

            <n-form-item label="领取时间" path="weeklySettings.claimTime">
              <n-radio-group v-model:value="formModel.weeklySettings.claimTime">
                <n-space>
                  <n-radio value="next-day" class="text-blue-600">次日</n-radio>
                  <n-radio value="same-day" class="text-blue-600">当日</n-radio>
                </n-space>
              </n-radio-group>
              <n-text
                depth="3"
                class="ml-4 cursor-pointer text-blue-500 hover:underline"
              >
                (实时领取(需审核))
              </n-text>
            </n-form-item>

            <n-form-item label="领取方式" path="weeklySettings.repeatableClaim">
              <n-radio-group
                v-model:value="formModel.weeklySettings.repeatableClaim"
              >
                <n-space vertical>
                  <n-radio value="repeatable">可重复领取(含补领部分)</n-radio>
                  <n-radio value="highest-only">只能领取最高一档</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item
              label="*奖励领取延迟天数"
              path="weeklySettings.delayDays"
            >
              <n-input-number
                v-model:value="formModel.weeklySettings.delayDays"
                :min="0"
                :max="30"
                placeholder="请输入延迟天数"
                style="width: 200px"
              />
              <n-text depth="3" class="ml-2">天</n-text>
            </n-form-item>
          </div>

          <!-- 每月奖励设置 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">每月奖励设置</h3>

            <n-form-item label="领取时间" path="monthlySettings.claimTime">
              <n-radio-group
                v-model:value="formModel.monthlySettings.claimTime"
              >
                <n-space>
                  <n-radio value="next-day" class="text-blue-600">次日</n-radio>
                  <n-radio value="same-day" class="text-blue-600">当日</n-radio>
                </n-space>
              </n-radio-group>
              <n-text
                depth="3"
                class="ml-4 cursor-pointer text-blue-500 hover:underline"
              >
                (实时领取(需审核))
              </n-text>
            </n-form-item>

            <n-form-item
              label="领取方式"
              path="monthlySettings.repeatableClaim"
            >
              <n-radio-group
                v-model:value="formModel.monthlySettings.repeatableClaim"
              >
                <n-space vertical>
                  <n-radio value="repeatable">可重复领取(含补领部分)</n-radio>
                  <n-radio value="highest-only">只能领取最高一档</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item
              label="*奖励领取延迟天数"
              path="monthlySettings.delayDays"
            >
              <n-input-number
                v-model:value="formModel.monthlySettings.delayDays"
                :min="0"
                :max="30"
                placeholder="请输入延迟天数"
                style="width: 200px"
              />
              <n-text depth="3" class="ml-2">天</n-text>
            </n-form-item>
          </div>

          <!-- 生日金奖励设置 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">
              生日金奖励设置
            </h3>

            <n-form-item label="领取时间" path="birthdaySettings.claimTime">
              <n-radio-group
                v-model:value="formModel.birthdaySettings.claimTime"
              >
                <n-space>
                  <n-radio value="next-day" class="text-blue-600">次日</n-radio>
                  <n-radio value="same-day" class="text-blue-600">当日</n-radio>
                </n-space>
              </n-radio-group>
              <n-text
                depth="3"
                class="ml-4 cursor-pointer text-blue-500 hover:underline"
              >
                (实时领取(需审核))
              </n-text>
            </n-form-item>

            <n-form-item
              label="领取方式"
              path="birthdaySettings.repeatableClaim"
            >
              <n-radio-group
                v-model:value="formModel.birthdaySettings.repeatableClaim"
              >
                <n-space vertical>
                  <n-radio value="repeatable">可重复领取(含补领部分)</n-radio>
                  <n-radio value="highest-only">只能领取最高一档</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item
              label="*奖励领取延迟天数"
              path="birthdaySettings.delayDays"
            >
              <n-input-number
                v-model:value="formModel.birthdaySettings.delayDays"
                :min="0"
                :max="30"
                placeholder="请输入延迟天数"
                style="width: 200px"
              />
              <n-text depth="3" class="ml-2">天</n-text>
            </n-form-item>
          </div>

          <!-- 玩法奖励设定 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">玩法奖励设定</h3>

            <n-form-item label="派发方式" path="distributionMethod">
              <n-radio-group v-model:value="formModel.distributionMethod">
                <n-space vertical>
                  <n-radio value="daily-birthday-common"
                    >仅限每日/生日/公共设置</n-radio
                  >
                  <n-radio value="period-only">仅限周期奖励</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item
              label="晋级奖金"
              path="promotionBonusSettings.claimTime"
            >
              <n-radio-group
                v-model:value="formModel.promotionBonusSettings.claimTime"
              >
                <n-space>
                  <n-radio value="next-day" class="text-blue-600">次日</n-radio>
                  <n-radio value="same-day" class="text-blue-600">当日</n-radio>
                </n-space>
              </n-radio-group>
              <n-text
                depth="3"
                class="ml-4 cursor-pointer text-blue-500 hover:underline"
              >
                (实时领取(需审核))
              </n-text>
            </n-form-item>

            <n-form-item
              label="晋级奖金领取方式"
              path="promotionBonusSettings.repeatableClaim"
            >
              <n-radio-group
                v-model:value="formModel.promotionBonusSettings.repeatableClaim"
              >
                <n-space vertical>
                  <n-radio value="repeatable">可重复领取(含补领部分)</n-radio>
                  <n-radio value="highest-only">只能领取最高一档</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
          </div>

          <!-- 其他设置 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">其他设置</h3>

            <n-form-item label="禁止参与等级(最多多选)" path="excludedLevels">
              <n-checkbox-group v-model:value="formModel.excludedLevels">
                <n-grid :cols="5" :x-gap="8" :y-gap="8">
                  <n-grid-item
                    v-for="level in memberLevelOptions"
                    :key="level.value"
                  >
                    <n-checkbox :value="level.value" class="text-sm">{{
                      level.label
                    }}</n-checkbox>
                  </n-grid-item>
                </n-grid>
              </n-checkbox-group>
            </n-form-item>

            <n-form-item label="*结算倍率" path="settlementMultiplier">
              <n-input-number
                v-model:value="formModel.settlementMultiplier"
                :min="0.01"
                :max="100"
                :precision="2"
                placeholder="请输入结算倍率"
                style="width: 200px"
              />
            </n-form-item>

            <n-form-item label="奖金结算控制平台" path="platformControl">
              <n-radio-group v-model:value="formModel.platformControl">
                <n-space vertical>
                  <n-radio value="unlimited">不限制</n-radio>
                  <n-radio value="selected-only">仅限勾选平台</n-radio>
                  <n-radio value="exclude-selected">排除勾选平台</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item
              v-if="formModel.platformControl !== 'unlimited'"
              label="选择平台"
              path="selectedPlatforms"
            >
              <n-checkbox-group v-model:value="formModel.selectedPlatforms">
                <n-grid :cols="3" :x-gap="16" :y-gap="8">
                  <n-grid-item
                    v-for="platform in platformOptions"
                    :key="platform.value"
                  >
                    <n-checkbox :value="platform.value">{{
                      platform.label
                    }}</n-checkbox>
                  </n-grid-item>
                </n-grid>
              </n-checkbox-group>
            </n-form-item>

            <n-form-item label="规则说明" path="rulesType">
              <n-radio-group v-model:value="formModel.rulesType">
                <n-space>
                  <n-radio value="custom">自定义</n-radio>
                  <n-radio value="system">系统翻译</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item label="规则内容" path="rulesContent">
              <n-input
                v-model:value="formModel.rulesContent"
                type="textarea"
                :placeholder="
                  formModel.rulesType === 'system'
                    ? '使用系统默认规则说明'
                    : '请输入自定义规则内容'
                "
                :disabled="formModel.rulesType === 'system'"
                :autosize="{ minRows: 6, maxRows: 10 }"
                class="bg-gray-50"
              />
            </n-form-item>
          </div>

          <!-- 展示设置 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">展示设置</h3>

            <n-form-item label="VIP展示方式" path="displayMethod">
              <n-radio-group v-model:value="formModel.displayMethod">
                <n-space>
                  <n-radio value="list">列表展示</n-radio>
                  <n-radio value="card">卡片展示</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item label="图标样式" path="iconStyle">
              <n-radio-group v-model:value="formModel.iconStyle">
                <n-space>
                  <n-radio value="style1">样式1</n-radio>
                  <n-radio value="style2">样式2</n-radio>
                  <n-radio value="style3">样式3</n-radio>
                  <n-radio value="style4">样式4</n-radio>
                  <n-radio value="custom">自定义</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item label="徽章图" path="badgeVariant">
              <n-radio-group v-model:value="formModel.badgeVariant">
                <n-grid :cols="4" :x-gap="16" :y-gap="16">
                  <n-grid-item
                    v-for="badge in badgeVariantOptions"
                    :key="badge.value"
                  >
                    <n-radio :value="badge.value">
                      <div class="flex flex-col items-center gap-2">
                        <div
                          :class="[
                            'flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg',
                            badge.colorClass,
                          ]"
                        >
                          {{ badge.stars }}
                        </div>
                        <n-text class="text-center text-xs">{{
                          badge.label
                        }}</n-text>
                      </div>
                    </n-radio>
                  </n-grid-item>
                </n-grid>
              </n-radio-group>
            </n-form-item>
          </div>
        </n-form>
      </n-scrollbar>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button @click="handleCancel" size="medium">取消</n-button>
        <n-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          size="medium"
        >
          保存设置
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NButton,
  NSwitch,
  NRadio,
  NRadioGroup,
  NCheckbox,
  NCheckboxGroup,
  NInputNumber,
  NInput,
  NText,
  NSpace,
  NGrid,
  NGridItem,
  NScrollbar,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui';

import {
  getVIPGlobalSettings,
  updateVIPGlobalSettings,
  type VIPGlobalSetting,
} from '#/api/vip';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const message = useMessage();
const formRef = ref<FormInst>();
const submitting = ref(false);

// 控制弹窗显示
const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

// 表单数据模型
const formModel = reactive({
  rewardEnabled: true,

  // 每日奖励设置
  dailySettings: {
    claimTime: 'next-day',
    repeatableClaim: 'repeatable',
    delayDays: 0,
  },

  // 每周奖励设置
  weeklySettings: {
    claimTime: 'next-day',
    repeatableClaim: 'repeatable',
    delayDays: 0,
  },

  // 每月奖励设置
  monthlySettings: {
    claimTime: 'next-day',
    repeatableClaim: 'repeatable',
    delayDays: 0,
  },

  // 生日金奖励设置
  birthdaySettings: {
    claimTime: 'same-day',
    repeatableClaim: 'highest-only',
    delayDays: 0,
  },

  // 玩法奖励设定
  distributionMethod: 'daily-birthday-common',
  promotionBonusSettings: {
    claimTime: 'next-day',
    repeatableClaim: 'highest-only',
  },

  // 其他设置
  excludedLevels: [],
  settlementMultiplier: 1.0,
  platformControl: 'unlimited',
  selectedPlatforms: [],
  rulesType: 'system',
  rulesContent: '',

  // 展示设置
  displayMethod: 'list',
  iconStyle: 'style1',
  badgeVariant: 'red-diamond',
});

// 表单验证规则
const formRules: FormRules = {
  'dailySettings.delayDays': [
    {
      required: true,
      type: 'number',
      message: '请输入每日奖励延迟天数',
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0,
      max: 30,
      message: '延迟天数应在0-30天之间',
      trigger: 'blur',
    },
  ],
  'weeklySettings.delayDays': [
    {
      required: true,
      type: 'number',
      message: '请输入每周奖励延迟天数',
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0,
      max: 30,
      message: '延迟天数应在0-30天之间',
      trigger: 'blur',
    },
  ],
  'monthlySettings.delayDays': [
    {
      required: true,
      type: 'number',
      message: '请输入每月奖励延迟天数',
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0,
      max: 30,
      message: '延迟天数应在0-30天之间',
      trigger: 'blur',
    },
  ],
  'birthdaySettings.delayDays': [
    {
      required: true,
      type: 'number',
      message: '请输入生日奖励延迟天数',
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0,
      max: 30,
      message: '延迟天数应在0-30天之间',
      trigger: 'blur',
    },
  ],
  settlementMultiplier: [
    {
      required: true,
      type: 'number',
      message: '请输入结算倍率',
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0.01,
      max: 100,
      message: '结算倍率应在0.01-100之间',
      trigger: 'blur',
    },
  ],
  rulesContent: [
    {
      validator: (rule, value) => {
        if (
          formModel.rulesType === 'custom' &&
          (!value || value.trim() === '')
        ) {
          return new Error('自定义规则内容不能为空');
        }
        return true;
      },
      trigger: 'blur',
    },
  ],
  displayMethod: [
    { required: true, message: '请选择VIP展示方式', trigger: 'change' },
  ],
  iconStyle: [{ required: true, message: '请选择图标样式', trigger: 'change' }],
  badgeVariant: [
    { required: true, message: '请选择徽章图', trigger: 'change' },
  ],
};

// 选项配置
const memberLevelOptions = [
  { label: '默认等级', value: 'default' },
  { label: '备用等级', value: 'backup' },
  { label: '五元玩家', value: 'five-yuan' },
  { label: '十元玩家', value: 'ten-yuan' },
  { label: '三十元玩家', value: 'thirty-yuan' },
  { label: '五十元玩家', value: 'fifty-yuan' },
  { label: '一百元玩家', value: 'hundred-yuan' },
  { label: '三百元玩家', value: 'three-hundred-yuan' },
  { label: '五百元玩家', value: 'five-hundred-yuan' },
  { label: '一千元玩家', value: 'thousand-yuan' },
  { label: '三千元玩家', value: 'three-thousand-yuan' },
  { label: '五千元玩家', value: 'five-thousand-yuan' },
  { label: '一万元玩家', value: 'ten-thousand-yuan' },
  { label: '三万元玩家', value: 'thirty-thousand-yuan' },
  { label: '五万元玩家', value: 'fifty-thousand-yuan' },
  { label: '测试专用等级', value: 'test-only' },
];

const platformOptions = [
  { label: 'Evolution Gaming', value: 'evolution' },
  { label: 'Pragmatic Play', value: 'pragmatic' },
  { label: 'NetEnt', value: 'netent' },
  { label: 'Microgaming', value: 'microgaming' },
  { label: "Play'n GO", value: 'playngo' },
  { label: 'Red Tiger', value: 'redtiger' },
  { label: 'Big Time Gaming', value: 'bigtimegaming' },
  { label: 'Blueprint Gaming', value: 'blueprint' },
  { label: 'Quickspin', value: 'quickspin' },
  { label: 'Yggdrasil', value: 'yggdrasil' },
  { label: 'NoLimit City', value: 'nolimit' },
  { label: 'Push Gaming', value: 'push' },
];

const badgeVariantOptions = [
  {
    label: '红钻石',
    value: 'red-diamond',
    stars: '♦',
    colorClass: 'bg-gradient-to-br from-red-500 to-red-600',
  },
  {
    label: '蓝宝石',
    value: 'blue-sapphire',
    stars: '♦',
    colorClass: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    label: '绿翡翠',
    value: 'green-emerald',
    stars: '♦',
    colorClass: 'bg-gradient-to-br from-green-500 to-green-600',
  },
  {
    label: '紫水晶',
    value: 'purple-amethyst',
    stars: '♦',
    colorClass: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },
  {
    label: '黄金徽章',
    value: 'gold-crown',
    stars: '♕',
    colorClass: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
  },
  {
    label: '银铂徽章',
    value: 'silver-crown',
    stars: '♔',
    colorClass: 'bg-gradient-to-br from-gray-400 to-gray-500',
  },
  {
    label: '铜质徽章',
    value: 'bronze-crown',
    stars: '♚',
    colorClass: 'bg-gradient-to-br from-orange-600 to-orange-700',
  },
  {
    label: '钻石王冠',
    value: 'diamond-crown',
    stars: '♛',
    colorClass: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
  },
  {
    label: '玫瑰金',
    value: 'rose-gold',
    stars: '♕',
    colorClass: 'bg-gradient-to-br from-pink-400 to-pink-500',
  },
  {
    label: '白金徽章',
    value: 'platinum',
    stars: '♔',
    colorClass: 'bg-gradient-to-br from-slate-300 to-slate-400',
  },
  {
    label: '珊瑚粉',
    value: 'coral-pink',
    stars: '♦',
    colorClass: 'bg-gradient-to-br from-coral-400 to-coral-500',
  },
  {
    label: '翠绿宝石',
    value: 'jade-green',
    stars: '♛',
    colorClass: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
  },
];

// 系统默认规则说明
const systemRulesContent = `VIP奖励系统规则说明：

1. 奖励发放规则
   - 每日奖励：会员可在指定时间段内领取当日奖励，需完成当日有效投注要求
   - 每周奖励：每周一自动发放上周奖励，基于上周投注活跃度计算
   - 每月奖励：每月1日自动发放上月奖励，根据VIP等级和月度表现发放
   - 生日奖励：会员生日当天可领取特殊奖励，每年限领一次

2. 发放条件与限制
   - 奖励金额根据VIP等级、投注活跃度和历史表现综合计算
   - 单次奖励不得超过各类型设定的最高上限金额
   - 会员须完成相应的有效投注要求才可提现奖励
   - 不同终端设备可设置不同的奖励发放政策

3. 晋级奖励说明
   - 会员VIP等级提升时可获得相应晋级奖励
   - 晋级奖励根据新等级标准发放，不可重复领取
   - 晋级奖励需在规定时间内领取，逾期视为放弃

4. 其他重要条款
   - 奖励有效期为7个自然日，过期自动失效
   - 平台保留对异常账户停止发放奖励的权利
   - 如发现违规行为，平台有权收回已发放的奖励
   - 如有争议，以系统记录和平台最终解释为准
   - 本规则最终解释权归平台所有，如有变更恕不另行通知`;

// 监听规则类型变化，自动填充内容
watch(
  () => formModel.rulesType,
  (newType) => {
    if (newType === 'system') {
      formModel.rulesContent = systemRulesContent;
    } else if (
      newType === 'custom' &&
      formModel.rulesContent === systemRulesContent
    ) {
      formModel.rulesContent = '';
    }
  },
);

// 监听平台控制变化，清空选择的平台
watch(
  () => formModel.platformControl,
  (newControl) => {
    if (newControl === 'unlimited') {
      formModel.selectedPlatforms = [];
    }
  },
);

// 加载当前设置
const loadCurrentSettings = async () => {
  try {
    const settings = await getVIPGlobalSettings();

    // 将后端数据映射到前端表单模型
    Object.assign(formModel, {
      rewardEnabled: settings.rewardEnabled || settings.isEnabled || true,

      // 每日奖励设置
      dailySettings: {
        claimTime: settings.dailyClaimTime || 'next-day',
        repeatableClaim: settings.dailyRepeatableClaim || 'repeatable',
        delayDays: settings.dailyDelayDays || 0,
      },

      // 每周奖励设置
      weeklySettings: {
        claimTime: settings.weeklyClaimTime || 'next-day',
        repeatableClaim: settings.weeklyRepeatableClaim || 'repeatable',
        delayDays: settings.weeklyDelayDays || 0,
      },

      // 每月奖励设置
      monthlySettings: {
        claimTime: settings.monthlyClaimTime || 'next-day',
        repeatableClaim: settings.monthlyRepeatableClaim || 'repeatable',
        delayDays: settings.monthlyDelayDays || 0,
      },

      // 生日金奖励设置
      birthdaySettings: {
        claimTime: settings.birthdayClaimTime || 'same-day',
        repeatableClaim: settings.birthdayRepeatableClaim || 'highest-only',
        delayDays: settings.birthdayDelayDays || 0,
      },

      // 玩法奖励设定
      distributionMethod:
        settings.distributionMethod || 'daily-birthday-common',
      promotionBonusSettings: {
        claimTime: settings.promotionClaimTime || 'next-day',
        repeatableClaim: settings.promotionRepeatableClaim || 'highest-only',
      },

      // 其他设置
      excludedLevels: settings.excludedLevels || [],
      settlementMultiplier: settings.settlementMultiplier || 1.0,
      platformControl: settings.platformControl || 'unlimited',
      selectedPlatforms: settings.selectedPlatforms || [],
      rulesType: settings.rulesType || 'system',
      rulesContent: settings.rulesContent || systemRulesContent,

      // 展示设置
      displayMethod: settings.displayMethod || 'list',
      iconStyle: settings.iconStyle || 'style1',
      badgeVariant: settings.badgeVariant || 'red-diamond',
    });
  } catch (error) {
    console.error('加载VIP全局设置失败:', error);
    // 使用默认值，不显示错误消息，因为可能是首次设置
  }
};

// 事件处理
const handleCancel = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    // 转换表单数据为后端格式
    const settingsData = {
      // 基础设置
      rewardEnabled: formModel.rewardEnabled,
      isEnabled: formModel.rewardEnabled,

      // ===== 每日奖励设置 =====
      dailyClaimTime: formModel.dailySettings.claimTime,
      dailyRepeatableClaim: formModel.dailySettings.repeatableClaim,
      dailyDelayDays: formModel.dailySettings.delayDays,

      // ===== 每周奖励设置 =====
      weeklyClaimTime: formModel.weeklySettings.claimTime,
      weeklyRepeatableClaim: formModel.weeklySettings.repeatableClaim,
      weeklyDelayDays: formModel.weeklySettings.delayDays,

      // ===== 每月奖励设置 =====
      monthlyClaimTime: formModel.monthlySettings.claimTime,
      monthlyRepeatableClaim: formModel.monthlySettings.repeatableClaim,
      monthlyDelayDays: formModel.monthlySettings.delayDays,

      // ===== 生日金奖励设置 =====
      birthdayClaimTime: formModel.birthdaySettings.claimTime,
      birthdayRepeatableClaim: formModel.birthdaySettings.repeatableClaim,
      birthdayDelayDays: formModel.birthdaySettings.delayDays,

      // ===== 玩法奖励设定 =====
      distributionMethod: formModel.distributionMethod,
      promotionClaimTime: formModel.promotionBonusSettings.claimTime,
      promotionRepeatableClaim:
        formModel.promotionBonusSettings.repeatableClaim,

      // ===== 其他设置 =====
      excludedLevels: formModel.excludedLevels,
      settlementMultiplier: formModel.settlementMultiplier,
      platformControl: formModel.platformControl,
      selectedPlatforms: formModel.selectedPlatforms,
      rulesType: formModel.rulesType,
      rulesContent: formModel.rulesContent,

      // ===== 展示设置 =====
      displayMethod: formModel.displayMethod,
      iconStyle: formModel.iconStyle,
      badgeVariant: formModel.badgeVariant,

      // ===== 向后兼容字段 =====
      distributionMethodType: 'DIRECT_CASH', // 默认值
      defaultIconSet: formModel.iconStyle,
      ruleType:
        formModel.rulesType === 'custom' ? 'CUSTOM_RULES' : 'SYSTEM_TEMPLATE',
      customRules:
        formModel.rulesType === 'custom' ? formModel.rulesContent : undefined,
      systemTemplate:
        formModel.rulesType === 'system' ? formModel.rulesContent : undefined,
      platformFilter:
        formModel.platformControl !== 'unlimited'
          ? formModel.selectedPlatforms
          : [],
      rewardMultiplier: 1.0, // 默认值

      // 系统字段
      updatedAt: new Date().toISOString(),
    };

    await updateVIPGlobalSettings(settingsData);
    message.success('VIP公共设置保存成功');
    emit('success');
    showModal.value = false;
  } catch (error) {
    message.error('保存失败，请检查输入内容');
    console.error('保存VIP全局设置失败:', error);
  } finally {
    submitting.value = false;
  }
};

// 监听弹窗显示状态，加载数据
watch(
  () => props.show,
  (show) => {
    if (show) {
      loadCurrentSettings();
    }
  },
);

// 初始化系统规则内容
onMounted(() => {
  formModel.rulesContent = systemRulesContent;
});
</script>

<style scoped>
.vip-global-setting-modal {
  .n-form-item {
    margin-bottom: 20px;
  }

  /* 为徽章图标添加hover效果 */
  .n-radio:hover .bg-gradient-to-br {
    transform: scale(1.05);
    transition: transform 0.2s ease-in-out;
  }

  /* 美化边框容器 */
  .border-gray-200 {
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  /* 滚动条样式 */
  .n-scrollbar {
    border-radius: 6px;
  }
}

/* TailwindCSS样式补充 */
.bg-coral-400 {
  background-color: #ff7875;
}
.bg-coral-500 {
  background-color: #ff6b6b;
}
.to-coral-500 {
  --tw-gradient-to: #ff6b6b;
}
.from-coral-400 {
  --tw-gradient-from: #ff7875;
}
</style>
