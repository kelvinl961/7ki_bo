<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="$t('vip.globalSettings')"
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
            <n-form-item :label="$t('vip.rewardDistributionSwitch')" path="rewardEnabled">
              <n-switch
                v-model:value="formModel.rewardEnabled"
                :checked-value="true"
                :unchecked-value="false"
              />
              <n-text depth="3" class="ml-2">
                {{
                  formModel.rewardEnabled
                    ? $t('vip.rewardEnabled')
                    : $t('vip.rewardDisabled')
                }}
              </n-text>
            </n-form-item>
          </div>

          <!-- 每日奖励设置 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">
              {{ $t('vip.dailyRewardSettings') }}
            </h3>

            <n-form-item :label="$t('vip.claimTime')" path="dailySettings.claimTime">
              <n-radio-group v-model:value="formModel.dailySettings.claimTime">
                <n-space>
                  <n-radio value="next-day" class="text-blue-600">{{
                    $t('vip.nextDay')
                  }}</n-radio>
                  <n-radio value="same-day" class="text-blue-600">{{
                    $t('vip.sameDay')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
              <n-text
                depth="3"
                class="ml-4 cursor-pointer text-blue-500 hover:underline"
              >
                {{ $t('vip.realtimeClaimAudit') }}
              </n-text>
            </n-form-item>

            <n-form-item
              :label="$t('vip.claimMethod')"
              path="dailySettings.repeatableClaim"
            >
              <n-radio-group
                v-model:value="formModel.dailySettings.repeatableClaim"
              >
                <n-space vertical>
                  <n-radio value="repeatable">{{
                    $t('vip.repeatableClaim')
                  }}</n-radio>
                  <n-radio value="highest-only">{{
                    $t('vip.highestOnlyClaim')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item
              :label="$t('vip.rewardDelayDays')"
              path="dailySettings.delayDays"
            >
              <n-input-number
                v-model:value="formModel.dailySettings.delayDays"
                :min="0"
                :max="30"
                :placeholder="$t('vip.enterDelayDays')"
                style="width: 200px"
              />
              <n-text depth="3" class="ml-2">{{ $t('vip.days') }}</n-text>
            </n-form-item>
          </div>

          <!-- 每周奖励设置 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">
              {{ $t('vip.weeklyRewardSettings') }}
            </h3>

            <n-form-item :label="$t('vip.claimTime')" path="weeklySettings.claimTime">
              <n-radio-group v-model:value="formModel.weeklySettings.claimTime">
                <n-space>
                  <n-radio value="next-day" class="text-blue-600">{{
                    $t('vip.nextDay')
                  }}</n-radio>
                  <n-radio value="same-day" class="text-blue-600">{{
                    $t('vip.sameDay')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
              <n-text
                depth="3"
                class="ml-4 cursor-pointer text-blue-500 hover:underline"
              >
                {{ $t('vip.realtimeClaimAudit') }}
              </n-text>
            </n-form-item>

            <n-form-item
              :label="$t('vip.claimMethod')"
              path="weeklySettings.repeatableClaim"
            >
              <n-radio-group
                v-model:value="formModel.weeklySettings.repeatableClaim"
              >
                <n-space vertical>
                  <n-radio value="repeatable">{{
                    $t('vip.repeatableClaim')
                  }}</n-radio>
                  <n-radio value="highest-only">{{
                    $t('vip.highestOnlyClaim')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item
              :label="$t('vip.rewardDelayDays')"
              path="weeklySettings.delayDays"
            >
              <n-input-number
                v-model:value="formModel.weeklySettings.delayDays"
                :min="0"
                :max="30"
                :placeholder="$t('vip.enterDelayDays')"
                style="width: 200px"
              />
              <n-text depth="3" class="ml-2">{{ $t('vip.days') }}</n-text>
            </n-form-item>
          </div>

          <!-- 每月奖励设置 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">
              {{ $t('vip.monthlyRewardSettings') }}
            </h3>

            <n-form-item :label="$t('vip.claimTime')" path="monthlySettings.claimTime">
              <n-radio-group
                v-model:value="formModel.monthlySettings.claimTime"
              >
                <n-space>
                  <n-radio value="next-day" class="text-blue-600">{{
                    $t('vip.nextDay')
                  }}</n-radio>
                  <n-radio value="same-day" class="text-blue-600">{{
                    $t('vip.sameDay')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
              <n-text
                depth="3"
                class="ml-4 cursor-pointer text-blue-500 hover:underline"
              >
                {{ $t('vip.realtimeClaimAudit') }}
              </n-text>
            </n-form-item>

            <n-form-item
              :label="$t('vip.claimMethod')"
              path="monthlySettings.repeatableClaim"
            >
              <n-radio-group
                v-model:value="formModel.monthlySettings.repeatableClaim"
              >
                <n-space vertical>
                  <n-radio value="repeatable">{{
                    $t('vip.repeatableClaim')
                  }}</n-radio>
                  <n-radio value="highest-only">{{
                    $t('vip.highestOnlyClaim')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item
              :label="$t('vip.rewardDelayDays')"
              path="monthlySettings.delayDays"
            >
              <n-input-number
                v-model:value="formModel.monthlySettings.delayDays"
                :min="0"
                :max="30"
                :placeholder="$t('vip.enterDelayDays')"
                style="width: 200px"
              />
              <n-text depth="3" class="ml-2">{{ $t('vip.days') }}</n-text>
            </n-form-item>
          </div>

          <!-- 生日金奖励设置 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">
              {{ $t('vip.birthdayRewardSettings') }}
            </h3>

            <n-form-item :label="$t('vip.claimTime')" path="birthdaySettings.claimTime">
              <n-radio-group
                v-model:value="formModel.birthdaySettings.claimTime"
              >
                <n-space>
                  <n-radio value="next-day" class="text-blue-600">{{
                    $t('vip.nextDay')
                  }}</n-radio>
                  <n-radio value="same-day" class="text-blue-600">{{
                    $t('vip.sameDay')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
              <n-text
                depth="3"
                class="ml-4 cursor-pointer text-blue-500 hover:underline"
              >
                {{ $t('vip.realtimeClaimAudit') }}
              </n-text>
            </n-form-item>

            <n-form-item
              :label="$t('vip.claimMethod')"
              path="birthdaySettings.repeatableClaim"
            >
              <n-radio-group
                v-model:value="formModel.birthdaySettings.repeatableClaim"
              >
                <n-space vertical>
                  <n-radio value="repeatable">{{
                    $t('vip.repeatableClaim')
                  }}</n-radio>
                  <n-radio value="highest-only">{{
                    $t('vip.highestOnlyClaim')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item
              :label="$t('vip.rewardDelayDays')"
              path="birthdaySettings.delayDays"
            >
              <n-input-number
                v-model:value="formModel.birthdaySettings.delayDays"
                :min="0"
                :max="30"
                :placeholder="$t('vip.enterDelayDays')"
                style="width: 200px"
              />
              <n-text depth="3" class="ml-2">{{ $t('vip.days') }}</n-text>
            </n-form-item>
          </div>

          <!-- 玩法奖励设定 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">
              {{ $t('vip.gameplayRewardSettings') }}
            </h3>

            <n-form-item :label="$t('vip.distributionMethod')" path="distributionMethod">
              <n-radio-group v-model:value="formModel.distributionMethod">
                <n-space vertical>
                  <n-radio value="daily-birthday-common">{{
                    $t('vip.dailyBirthdayCommonOnly')
                  }}</n-radio>
                  <n-radio value="period-only">{{
                    $t('vip.periodRewardOnly')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item
              :label="$t('vip.promotionBonus')"
              path="promotionBonusSettings.claimTime"
            >
              <n-radio-group
                v-model:value="formModel.promotionBonusSettings.claimTime"
              >
                <n-space>
                  <n-radio value="next-day" class="text-blue-600">{{
                    $t('vip.nextDay')
                  }}</n-radio>
                  <n-radio value="same-day" class="text-blue-600">{{
                    $t('vip.sameDay')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
              <n-text
                depth="3"
                class="ml-4 cursor-pointer text-blue-500 hover:underline"
              >
                {{ $t('vip.realtimeClaimAudit') }}
              </n-text>
            </n-form-item>

            <n-form-item
              :label="$t('vip.promotionBonusClaimMethod')"
              path="promotionBonusSettings.repeatableClaim"
            >
              <n-radio-group
                v-model:value="formModel.promotionBonusSettings.repeatableClaim"
              >
                <n-space vertical>
                  <n-radio value="repeatable">{{
                    $t('vip.repeatableClaim')
                  }}</n-radio>
                  <n-radio value="highest-only">{{
                    $t('vip.highestOnlyClaim')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
          </div>

          <!-- 其他设置 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">
              {{ $t('vip.otherSettings') }}
            </h3>

            <n-form-item
              :label="$t('vip.forbiddenLevels')"
              path="excludedLevels"
            >
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

            <n-form-item
              :label="$t('vip.settlementMultiplier')"
              path="settlementMultiplier"
            >
              <n-input-number
                v-model:value="formModel.settlementMultiplier"
                :min="0.01"
                :max="100"
                :precision="2"
                :placeholder="$t('vip.enterSettlementMultiplier')"
                style="width: 200px"
              />
            </n-form-item>

            <n-form-item
              :label="$t('vip.bonusSettlementPlatform')"
              path="platformControl"
            >
              <n-radio-group v-model:value="formModel.platformControl">
                <n-space vertical>
                  <n-radio value="unlimited">{{
                    $t('vip.noRestriction')
                  }}</n-radio>
                  <n-radio value="selected-only">{{
                    $t('vip.selectedPlatformsOnly')
                  }}</n-radio>
                  <n-radio value="exclude-selected">{{
                    $t('vip.excludeSelectedPlatforms')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item
              v-if="formModel.platformControl !== 'unlimited'"
              :label="$t('vip.selectPlatform')"
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

            <n-form-item :label="$t('vip.rulesDescription')" path="rulesType">
              <n-radio-group v-model:value="formModel.rulesType">
                <n-space>
                  <n-radio value="custom">{{ $t('common.custom') }}</n-radio>
                  <n-radio value="system">{{
                    $t('vip.systemTranslation')
                  }}</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item :label="$t('vip.rulesContent')" path="rulesContent">
              <n-input
                v-model:value="formModel.rulesContent"
                type="textarea"
                :placeholder="
                  formModel.rulesType === 'system'
                    ? $t('vip.useDefaultRules')
                    : $t('vip.enterCustomRules')
                "
                :disabled="formModel.rulesType === 'system'"
                :autosize="{ minRows: 6, maxRows: 10 }"
                class="bg-gray-50"
              />
            </n-form-item>
          </div>

          <!-- 展示设置 -->
          <div class="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-lg font-medium text-gray-700">
              {{ $t('vip.displaySettings') }}
            </h3>

            <n-form-item :label="$t('vip.vipDisplayMode')" path="displayMethod">
              <n-radio-group v-model:value="formModel.displayMethod">
                <n-space>
                  <n-radio value="list">{{ $t('vip.listDisplay') }}</n-radio>
                  <n-radio value="card">{{ $t('vip.cardDisplay') }}</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item :label="$t('vip.iconStyle')" path="iconStyle">
              <n-radio-group v-model:value="formModel.iconStyle">
                <n-space>
                  <n-radio value="style1">{{ $t('vip.style1') }}</n-radio>
                  <n-radio value="style2">{{ $t('vip.style2') }}</n-radio>
                  <n-radio value="style3">{{ $t('vip.style3') }}</n-radio>
                  <n-radio value="style4">{{ $t('vip.style4') }}</n-radio>
                  <n-radio value="custom">{{ $t('common.custom') }}</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item :label="$t('vip.badgeImage')" path="badgeVariant">
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
        <n-button @click="handleCancel" size="medium">{{ $t('common.cancel') }}</n-button>
        <n-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          size="medium"
        >
          {{ $t('vip.saveSettings') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

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
const formRules = computed<FormRules>(() => ({
  'dailySettings.delayDays': [
    {
      required: true,
      type: 'number',
      message: $t('vip.enterDailyDelayDays'),
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0,
      max: 30,
      message: $t('vip.delayDaysRange'),
      trigger: 'blur',
    },
  ],
  'weeklySettings.delayDays': [
    {
      required: true,
      type: 'number',
      message: $t('vip.enterWeeklyDelayDays'),
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0,
      max: 30,
      message: $t('vip.delayDaysRange'),
      trigger: 'blur',
    },
  ],
  'monthlySettings.delayDays': [
    {
      required: true,
      type: 'number',
      message: $t('vip.enterMonthlyDelayDays'),
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0,
      max: 30,
      message: $t('vip.delayDaysRange'),
      trigger: 'blur',
    },
  ],
  'birthdaySettings.delayDays': [
    {
      required: true,
      type: 'number',
      message: $t('vip.enterBirthdayDelayDays'),
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0,
      max: 30,
      message: $t('vip.delayDaysRange'),
      trigger: 'blur',
    },
  ],
  settlementMultiplier: [
    {
      required: true,
      type: 'number',
      message: $t('vip.enterSettlementMultiplierRequired'),
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0.01,
      max: 100,
      message: $t('vip.settlementMultiplierRange'),
      trigger: 'blur',
    },
  ],
  rulesContent: [
    {
      validator: (_rule, value) => {
        if (
          formModel.rulesType === 'custom' &&
          (!value || value.trim() === '')
        ) {
          return new Error($t('vip.customRulesRequired'));
        }
        return true;
      },
      trigger: 'blur',
    },
  ],
  displayMethod: [
    {
      required: true,
      message: $t('vip.selectVipDisplayMode'),
      trigger: 'change',
    },
  ],
  iconStyle: [
    { required: true, message: $t('vip.selectIconStyle'), trigger: 'change' },
  ],
  badgeVariant: [
    { required: true, message: $t('vip.selectBadgeImage'), trigger: 'change' },
  ],
}));

// 选项配置
const memberLevelOptions = computed(() => [
  { label: $t('vip.memberLevelDefault'), value: 'default' },
  { label: $t('vip.memberLevelBackup'), value: 'backup' },
  { label: $t('vip.memberLevel5'), value: 'five-yuan' },
  { label: $t('vip.memberLevel10'), value: 'ten-yuan' },
  { label: $t('vip.memberLevel30'), value: 'thirty-yuan' },
  { label: $t('vip.memberLevel50'), value: 'fifty-yuan' },
  { label: $t('vip.memberLevel100'), value: 'hundred-yuan' },
  { label: $t('vip.memberLevel300'), value: 'three-hundred-yuan' },
  { label: $t('vip.memberLevel500'), value: 'five-hundred-yuan' },
  { label: $t('vip.memberLevel1000'), value: 'thousand-yuan' },
  { label: $t('vip.memberLevel3000'), value: 'three-thousand-yuan' },
  { label: $t('vip.memberLevel5000'), value: 'five-thousand-yuan' },
  { label: $t('vip.memberLevel10000'), value: 'ten-thousand-yuan' },
  { label: $t('vip.memberLevel30000'), value: 'thirty-thousand-yuan' },
  { label: $t('vip.memberLevel50000'), value: 'fifty-thousand-yuan' },
  { label: $t('vip.memberLevelTest'), value: 'test-only' },
]);

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

const badgeVariantOptions = computed(() => [
  {
    label: $t('vip.badgeRedDiamond'),
    value: 'red-diamond',
    stars: '♦',
    colorClass: 'bg-gradient-to-br from-red-500 to-red-600',
  },
  {
    label: $t('vip.badgeBlueSapphire'),
    value: 'blue-sapphire',
    stars: '♦',
    colorClass: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    label: $t('vip.badgeGreenJade'),
    value: 'green-emerald',
    stars: '♦',
    colorClass: 'bg-gradient-to-br from-green-500 to-green-600',
  },
  {
    label: $t('vip.badgePurpleAmethyst'),
    value: 'purple-amethyst',
    stars: '♦',
    colorClass: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },
  {
    label: $t('vip.badgeGoldBadge'),
    value: 'gold-crown',
    stars: '♕',
    colorClass: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
  },
  {
    label: $t('vip.badgeSilverPlatinum'),
    value: 'silver-crown',
    stars: '♔',
    colorClass: 'bg-gradient-to-br from-gray-400 to-gray-500',
  },
  {
    label: $t('vip.badgeBronze'),
    value: 'bronze-crown',
    stars: '♚',
    colorClass: 'bg-gradient-to-br from-orange-600 to-orange-700',
  },
  {
    label: $t('vip.badgeDiamondCrown'),
    value: 'diamond-crown',
    stars: '♛',
    colorClass: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
  },
  {
    label: $t('vip.badgeRoseGold'),
    value: 'rose-gold',
    stars: '♕',
    colorClass: 'bg-gradient-to-br from-pink-400 to-pink-500',
  },
  {
    label: $t('vip.badgePlatinum'),
    value: 'platinum',
    stars: '♔',
    colorClass: 'bg-gradient-to-br from-slate-300 to-slate-400',
  },
  {
    label: $t('vip.badgeCoralPink'),
    value: 'coral-pink',
    stars: '♦',
    colorClass: 'bg-gradient-to-br from-coral-400 to-coral-500',
  },
  {
    label: $t('vip.badgeEmerald'),
    value: 'jade-green',
    stars: '♛',
    colorClass: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
  },
]);

const systemRulesContent = computed(() => $t('vip.systemRulesContent'));

// 监听规则类型变化，自动填充内容
watch(
  () => formModel.rulesType,
  (newType) => {
    if (newType === 'system') {
      formModel.rulesContent = systemRulesContent.value;
    } else if (
      newType === 'custom' &&
      formModel.rulesContent === systemRulesContent.value
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
      rulesContent: settings.rulesContent || systemRulesContent.value,

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
    message.success($t('vip.globalSettingsSaveSuccess'));
    emit('success');
    showModal.value = false;
  } catch (error) {
    message.error($t('vip.globalSettingsSaveFailed'));
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
  formModel.rulesContent = systemRulesContent.value;
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
