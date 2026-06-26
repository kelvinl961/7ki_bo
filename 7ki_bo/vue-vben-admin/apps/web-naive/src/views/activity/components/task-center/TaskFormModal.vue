<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="$t('activity.noviceWelfareGlobal.k65b0')"
    style="width: 90vw; max-width: 1200px"
    class="task-form-modal"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <AddOutline />
        <span>{{ isEdit ? $t('activity.common.editTask') : $t('activity.common.noviceWelfareSettings') }}</span>
      </div>
    </template>

    <div class="modal-content-wrapper">
      <!-- 🎯 NEW: Tabbed Layout matching Screenshot 2 -->
      <n-tabs type="line" animated class="modal-tabs">
        <!-- Tab 1: Basic Settings -->
        <n-tab-pane name="basic" :tab="$t('activity.formModal.k57fa')">
          <div class="space-y-6">
            <n-form
              ref="formRef"
              :model="formData"
              :rules="rules"
              label-placement="left"
              label-width="120px"
              size="medium"
            >
              <!-- Basic Information Section -->
              <div class="rounded-lg bg-gray-50 p-4">
                <h3 class="mb-4 text-sm font-medium text-gray-700">{{ $t('activity.taskForm.k57fa') }}</h3>

                <n-form-item :label="$t('activity.noviceWelfare.k4efb')" path="title">
                  <n-input
                    v-model:value="formData.title"
                    :placeholder="$t('activity.taskForm.k8bf7')"
                    maxlength="100"
                    show-count
                  />
                </n-form-item>

                <n-grid :cols="2" :x-gap="16">
                  <n-grid-item>
                    <n-form-item :label="$t('activity.rewardReport.k5956')" path="rewardType">
                      <n-select
                        v-model:value="formData.rewardType"
                        :options="rewardTypeOptions"
                        :placeholder="$t('activity.taskForm.k9009')"
                      />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item :label="$t('activity.formModal.k5956')" path="rewardAmount">
                      <n-input-number
                        v-model:value="formData.rewardAmount"
                        :min="0"
                        :precision="2"
                        :step="0.01"
                        :placeholder="$t('activity.formModal.k8bf73')"
                        style="width: 100%"
                        clearable
                      >
                        <template #suffix>BRL</template>
                      </n-input-number>
                    </n-form-item>
                  </n-grid-item>
                </n-grid>

                <n-form-item :label="$t('activity.rewardReport.k6d3b5')" path="activityLevel">
                  <n-input-number
                    v-model:value="formData.activityLevel"
                    :min="0"
                    :max="1000"
                    placeholder="0"
                    style="width: 200px"
                  />
                </n-form-item>

                <n-form-item :label="$t('activity.taskForm.k72b6')">
                  <n-switch v-model:value="formData.isActive">
                    <template #checked>{{ $t('activity.noviceWelfare.k5f00') }}</template>
                    <template #unchecked>{{ $t('activity.formModal.k5173') }}</template>
                  </n-switch>
                </n-form-item>
              </div>

              <!-- Task Validity Section -->
              <div class="rounded-lg bg-gray-50 p-4">
                <h3 class="mb-4 text-sm font-medium text-gray-700">{{ $t('activity.taskForm.k4efb') }}</h3>
                <n-radio-group v-model:value="formData.taskValidity">
                  <n-space vertical>
                    <n-radio value="long_term">{{ $t('activity.noviceWelfareGlobal.k957f') }}</n-radio>
                    <n-radio value="limited_time">{{ $t('activity.noviceWelfareGlobal.k9650') }}</n-radio>
                  </n-space>
                </n-radio-group>
              </div>

              <!-- Claim Method Section -->
              <div class="rounded-lg bg-gray-50 p-4">
                <h3 class="mb-4 text-sm font-medium text-gray-700">{{ $t('activity.rewardReport.k9886') }}</h3>
                <n-radio-group v-model:value="formData.claimMethod">
                  <n-space vertical>
                    <n-radio value="MANUAL">{{ $t('activity.rewardReport.k624b') }}</n-radio>
                    <n-radio value="AUTOMATIC">{{ $t('activity.taskForm.k81ea') }}</n-radio>
                  </n-space>
                </n-radio-group>
              </div>

              <!-- Claim Time Section -->
              <div class="rounded-lg bg-gray-50 p-4">
                <h3 class="mb-4 text-sm font-medium text-gray-700">{{ $t('activity.rewardReport.k98862') }}</h3>
                <n-radio-group v-model:value="formData.claimTimeType">
                  <n-space vertical>
                    <n-radio value="NEXT_DAY">{{ $t('activity.taskForm.k5f53') }}</n-radio>
                    <n-radio value="REAL_TIME">{{ $t('activity.taskForm.k5b9e') }}</n-radio>
                  </n-space>
                </n-radio-group>
              </div>

              <!-- Claim Entry Section -->
              <div class="rounded-lg bg-gray-50 p-4">
                <h3 class="mb-4 text-sm font-medium text-gray-700">{{ $t('activity.luckyWheelPublicConfig.k98862') }}</h3>
                <div class="grid grid-cols-2 gap-3">
                  <n-checkbox
                    v-model:checked="formData.claimEntries!.androidApp"
                    >{{ $t('activity.luckyWheelPublicConfig.androidAPP') }}</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.iosApp"
                    >{{ $t('activity.taskForm.iOSAPP') }}</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.h5"
                    >{{ $t('activity.formModal.k9a6c') }}</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.pwa"
                    >{{ $t('activity.taskForm.pWA') }}</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.iosWeb"
                    >{{ $t('activity.taskForm.iOS') }}</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.pcWeb"
                    >{{ $t('activity.formModal.pC') }}</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.androidH5"
                    >{{ $t('activity.luckyWheelPublicConfig.androidH5') }}</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.iosH5"
                    >{{ $t('activity.taskForm.iOSH5') }}</n-checkbox
                  >
                </div>

                <!-- Additional Entry Options -->
                <div class="mt-4 space-y-2">
                  <n-checkbox
                    v-model:checked="formData.claimEntries!.sameDeviceOnce"
                    >{{ $t('activity.taskForm.k540c') }}</n-checkbox
                  >
                  <n-checkbox
                    v-model:checked="formData.claimEntries!.webLoginOnce"
                    >{{ $t('activity.formModal.pC') }}</n-checkbox
                  >
                  <n-checkbox
                    v-model:checked="formData.claimEntries!.deviceBindingOnce"
                    >{{ $t('activity.taskForm.k540c2') }}</n-checkbox
                  >
                </div>
              </div>
            </n-form>
          </div>
        </n-tab-pane>

        <!-- Tab 2: Restriction Conditions -->
        <n-tab-pane name="restrictions" :tab="$t('activity.formModal.k9650')">
          <div class="space-y-6">
            <!-- More Reward Claim Restrictions -->
            <div class="rounded-lg bg-gray-50 p-4">
              <h3 class="mb-4 text-sm font-medium text-gray-700">{{ $t('activity.formModal.k66f42') }}</h3>
              <n-checkbox-group v-model:value="formData.restrictions">
                <div class="grid grid-cols-2 gap-2">
                  <n-checkbox value="phone_verified"
                    >{{ $t('activity.formModal.k5b8c') }}</n-checkbox
                  >
                  <n-checkbox value="complete_email"
                    >{{ $t('activity.formModal.k5b8c2') }}</n-checkbox
                  >
                  <n-checkbox value="bank_card"
                    >{{ $t('activity.formModal.k5b8c3') }}</n-checkbox
                  >
                  <n-checkbox value="complete_recharge"
                    >{{ $t('activity.formModal.k5b8c4') }}</n-checkbox
                  >
                  <n-checkbox value="bind_currency"
                    >{{ $t('activity.formModal.k7ed1') }}</n-checkbox
                  >
                  <n-checkbox value="three_party"
                    >{{ $t('activity.formModal.k7ed12') }}</n-checkbox
                  >
                  <n-checkbox value="complete_birthday"
                    >{{ $t('activity.formModal.k5b8c5') }}</n-checkbox
                  >
                  <n-checkbox value="bind_payment"
                    >{{ $t('activity.formModal.k7ed13') }}</n-checkbox
                  >
                  <n-checkbox value="real_name"
                    >{{ $t('activity.formModal.k5b8c6') }}</n-checkbox
                  >
                  <n-checkbox value="game_experience"
                    >{{ $t('activity.formModal.k586b') }}</n-checkbox
                  >
                  <n-checkbox value="same_activity"
                    >{{ $t('activity.formModal.k540c') }}</n-checkbox
                  >
                  <n-checkbox value="charge_after_complete"
                    >{{ $t('activity.formModal.k51456') }}</n-checkbox
                  >
                  <n-checkbox value="same_ip">{{ $t('activity.formModal.k540c2') }}</n-checkbox>
                  <n-checkbox value="complete_kyc"
                    >{{ $t('activity.formModal.k5b8c7') }}</n-checkbox
                  >
                  <n-checkbox value="bind_currency_third_party"
                    >{{ $t('activity.formModal.k7ed14') }}</n-checkbox
                  >
                  <n-checkbox value="complete_recharge_education"
                    >{{ $t('activity.formModal.k5b8c8') }}</n-checkbox
                  >
                  <n-checkbox value="complete_bet_education"
                    >{{ $t('activity.formModal.k5b8c9') }}</n-checkbox
                  >
                  <n-checkbox value="same_ip_device"
                    >{{ $t('activity.formModal.k540c3') }}</n-checkbox
                  >
                  <n-checkbox value="network_verification"
                    >{{ $t('activity.formModal.k7f51') }}</n-checkbox
                  >
                  <n-checkbox value="device_binding_limit"
                    >{{ $t('activity.formModal.k540c4') }}</n-checkbox
                  >
                  <n-checkbox value="phone_number_uniqueness"
                    >{{ $t('activity.formModal.k624b') }}</n-checkbox
                  >
                  <n-checkbox value="physical_verification"
                    >{{ $t('activity.formModal.k7269') }}</n-checkbox
                  >
                  <n-checkbox value="location_verification"
                    >{{ $t('activity.formModal.k5730') }}</n-checkbox
                  >
                  <n-checkbox value="payment_method_verification"
                    >{{ $t('activity.formModal.k652f') }}</n-checkbox
                  >
                </div>
              </n-checkbox-group>
            </div>

            <!-- 🎯 CRITICAL: Audit Multiplier Configuration (稽核倍数设置) -->
            <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h3 class="mb-4 text-sm font-medium text-gray-700">{{ $t('activity.formModal.k7a3d') }}</h3>
              <div class="grid grid-cols-2 gap-4">
                <!-- Audit Required -->
                <div>
                  <label class="mb-1 block text-xs text-gray-600"
                    >{{ $t('activity.formModal.k662f6') }}</label
                  >
                  <n-switch
                    v-model:value="formData.auditSettings!.auditRequired"
                  >
                    <template #checked>{{ $t('activity.formModal.k97003') }}</template>
                    <template #unchecked>{{ $t('activity.formModal.k65e02') }}</template>
                  </n-switch>
                </div>

                <!-- Audit Multiplier -->
                <div>
                  <label class="mb-1 block text-xs text-gray-600"
                    >{{ $t('activity.formModal.k7a3d2') }}</label
                  >
                  <n-input-number
                    v-model:value="formData.auditSettings!.auditMultiplier"
                    :min="0"
                    :max="50"
                    :step="0.1"
                    :precision="1"
                    placeholder="10.00"
                    :disabled="!formData.auditSettings!.auditRequired"
                    class="w-full"
                  >
                    <template #suffix>{{ $t('activity.formModal.k500d') }}</template>
                  </n-input-number>
                </div>

                <!-- Audit Completion Time -->
                <!-- Audit completion time removed - fixed to 24 hours -->

                <!-- Manual Review Required -->
                <div>
                  <label class="mb-1 block text-xs text-gray-600"
                    >{{ $t('activity.formModal.k4eba') }}</label
                  >
                  <n-switch
                    v-model:value="
                      formData.auditSettings!.auditManualReviewRequired
                    "
                    :disabled="!formData.auditSettings!.auditRequired"
                  >
                    <template #checked>{{ $t('activity.formModal.k97004') }}</template>
                    <template #unchecked>{{ $t('activity.formModal.k81ea4') }}</template>
                  </n-switch>
                </div>
              </div>

              <!-- Audit Description -->
              <div
                v-if="formData.auditSettings!.auditRequired"
                class="mt-3 rounded-lg bg-blue-50 p-3"
              >
                <p class="text-xs text-blue-600">
                  <i class="fa fa-info-circle mr-1"></i>{{ $t('activity.formModal.k7a3dk7528') }}<strong
                    >{{
                      $t('activity.common.auditMultiplierSuffix', [
                        (formData.auditSettings!.auditMultiplier || 1).toFixed(1),
                      ])
                    }}</strong
                  >{{ $t('activity.formModal.k59569') }}</p>
              </div>
            </div>

            <!-- Login Redirect Methods Section -->
            <div class="rounded-lg bg-gray-50 p-4">
              <h3 class="mb-4 text-sm font-medium text-gray-700">{{ $t('activity.taskForm.k767b') }}</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-2 block text-xs text-gray-600"
                    >{{ $t('activity.taskForm.k767b2') }}</label
                  >
                  <n-radio-group
                    v-model:value="formData.loginRedirectMethod!.beforeLogin"
                  >
                    <n-space vertical>
                      <n-radio value="high_frequency">{{ $t('activity.taskForm.k9ad8') }}</n-radio>
                      <n-radio value="custom">{{ $t('activity.detailModal.k81ea') }}</n-radio>
                    </n-space>
                  </n-radio-group>
                </div>

                <div>
                  <label class="mb-2 block text-xs text-gray-600"
                    >{{ $t('activity.taskForm.k767b3') }}</label
                  >
                  <n-radio-group
                    v-model:value="formData.loginRedirectMethod!.afterLogin"
                  >
                    <n-space vertical>
                      <n-radio value="high_frequency">{{ $t('activity.taskForm.k9ad8') }}</n-radio>
                      <n-radio value="custom">{{ $t('activity.detailModal.k81ea') }}</n-radio>
                    </n-space>
                  </n-radio-group>
                </div>
              </div>

              <!-- Direct after recharge -->
              <div class="mt-4">
                <n-checkbox
                  v-model:checked="
                    formData.loginRedirectMethod!.directAfterRecharge
                  "
                >{{ $t('activity.taskForm.k5145') }}</n-checkbox>
              </div>
            </div>

            <!-- Reward Rules Section -->
            <div class="rounded-lg bg-gray-50 p-4">
              <h3 class="mb-4 text-sm font-medium text-gray-700">{{ $t('activity.taskForm.k5956') }}</h3>
              <div class="space-y-4">
                <div>
                  <label class="mb-1 block text-xs text-gray-600"
                    >{{ $t('activity.formModal.k89c4') }}</label
                  >
                  <n-radio-group
                    v-model:value="formData.rewardRules!.explanationType"
                  >
                    <n-space vertical>
                      <n-radio value="default">{{ $t('activity.taskForm.k7cfb') }}</n-radio>
                      <n-radio value="custom">{{ $t('activity.detailModal.k81ea') }}</n-radio>
                    </n-space>
                  </n-radio-group>
                </div>

                <!-- Custom Rules Text Area -->
                <div v-if="formData.rewardRules!.explanationType === 'custom'">
                  <label class="mb-1 block text-xs text-gray-600"
                    >{{ $t('activity.taskForm.k81ea2') }}</label
                  >
                  <n-input
                    v-model:value="formData.rewardRules!.customText"
                    type="textarea"
                    :placeholder="$t('activity.noviceWelfareGlobal.k8bf73')"
                    :rows="4"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <template #action>
      <n-space>
        <n-button @click="handleCancel">{{ $t('activity.activityList.k53d6') }}</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? $t('activity.common.updateBtn') : $t('activity.common.confirmBtn') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, computed, watch, reactive } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NButton,
  NSpace,
  NGrid,
  NGridItem,
  NCheckbox,
  NCheckboxGroup,
  NRadio,
  NRadioGroup,
  NSwitch,
  NTabs,
  NTabPane,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import { AddOutline } from '@vicons/ionicons5';
import {
  createTaskCenter,
  updateTaskCenter,
  type TaskCenter,
  type TaskCenterCreateRequest,
} from '#/api/taskCenter';

interface Props {
  show: boolean;
  formData: TaskCenter | null;
  isEdit: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'submit'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

// 🎯 NEW: Enhanced form data matching Screenshot 2
const formData = reactive<TaskCenterCreateRequest>({
  // Basic Information
  title: $t('activity.noviceWelfareSettings.k6ce8'), // Pre-fill with the value from screenshot
  description: '',
  category: 'NOVICE_WELFARE',
  taskType: 'REGISTRATION',
  sortOrder: 1,
  rewardType: 'CASH',
  rewardAmount: 10.0,
  rewardCurrency: 'BRL',
  isActive: true,
  activityLevel: 0, // 🎯 NEW: Activity level field
  ruleDescription: '',

  // Task Conditions
  taskConditions: {
    targetValue: 1,
    conditionType: 'count',
    parameters: {},
  },
  triggerConditions: {
    platforms: [],
    methods: [],
    additional: {},
  },
  claimRestrictions: [],
  memberGroups: [],

  // 🎯 NEW: Task Validity and Claim Settings (from Screenshot 2)
  taskValidity: 'long_term', // 'long_term' | 'limited_time'
  claimMethod: 'MANUAL', // Backend expects 'MANUAL' | 'AUTOMATIC'
  claimTimeType: 'REAL_TIME', // Backend expects 'REAL_TIME' | 'NEXT_DAY'

  // 🎯 NEW: Claim Entries (from Screenshot 2)
  claimEntries: {
    androidApp: true,
    iosApp: true,
    h5: false,
    pwa: false,
    iosWeb: false,
    pcWeb: false,
    androidH5: false,
    iosH5: false,
    sameDeviceOnce: false,
    webLoginOnce: false,
    deviceBindingOnce: false,
  },

  // 🎯 NEW: Restrictions (from Screenshot 2)
  restrictions: [] as string[],

  // 🎯 CRITICAL: Audit Settings (稽核倍数设置) - Main missing feature
  auditSettings: {
    auditRequired: true,
    auditMultiplier: 10.0, // Default to 10.00 as shown in screenshot
    auditManualReviewRequired: false,
  },

  // 🎯 NEW: Login Redirect Methods (from Screenshot 2)
  loginRedirectMethod: {
    beforeLogin: 'high_frequency', // 'high_frequency' | 'custom'
    afterLogin: 'high_frequency', // 'high_frequency' | 'custom'
    directAfterRecharge: false,
  },

  // 🎯 NEW: Reward Rules (from Screenshot 2)
  rewardRules: {
    explanationType: 'default', // 'default' | 'custom'
    customText: '',
  },

  // Legacy Platform selection (at least one required)
  platformAndroid: true,
  platformIOS: false,
  platformH5: false,
  platformPC: false,
  // Legacy Claim method (at least one required)
  claimAndroidApp: true,
  claimIOSApp: false,
  claimH5: false,
  claimPC: false,
  // Legacy Validation method
  validationMethod: 'LONG_TERM',
  validationStartTime: undefined,
  validationEndTime: undefined,
  // Legacy Additional requirements
  requireEmailVerification: false,
  requirePhoneVerification: false,
  requireBankBinding: false,
  requireRealNameAuth: false,
  // Legacy Login methods
  loginAdditionMethod: undefined,
  loginDiversionMethod: undefined,
  // Legacy Reward multiplier
  rewardMultiplier: 1.0,
  startTime: undefined,
  endTime: undefined,
});

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: $t('activity.common.enterTaskCondition'), trigger: 'blur' },
    { max: 100, message: $t('activity.taskForm.k4efb3'), trigger: 'blur' },
  ],
  rewardType: [
    { required: true, message: $t('activity.rewardReport.k8bf73'), trigger: 'change' },
  ],
  rewardAmount: [
    {
      required: true,
      type: 'number',
      message: $t('activity.formModal.k8bf73'),
      trigger: ['blur', 'change'],
      transform: (value: any) => {
        if (typeof value === 'string') {
          return Number(value);
        }
        return value;
      },
    },
    {
      type: 'number',
      min: 0,
      message: $t('activity.taskForm.k59562'),
      trigger: ['blur', 'change'],
    },
  ],
};

const rewardTypeOptions = [
  { label: $t('activity.taskDetail.k73b0k56fa'), value: 'CASH' },
  { label: $t('activity.taskDetail.k5956k6d6e'), value: 'BONUS' },
  { label: $t('activity.rewardReport.k79ef2'), value: 'POINTS' },
  { label: $t('activity.noviceWelfare.k514d'), value: 'FREE_SPINS' },
  { label: $t('activity.noviceWelfare.k6298'), value: 'DISCOUNT' },
  { label: $t('activity.taskDetail.k81ea2'), value: 'CUSTOM' },
];

const handleCancel = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  submitting.value = true;
  try {
    await formRef.value.validate();

    // 🔍 Comprehensive debug logging to find the missing required field
    console.log(
      '🎯 Full formData object being submitted:',
      JSON.stringify(formData, null, 2),
    );

    // Check specific required fields from backend validator
    console.log('🔍 Required field check:', {
      title: formData.title || 'MISSING',
      rewardAmount: formData.rewardAmount || 'MISSING',
      taskConditions: formData.taskConditions || 'MISSING',
      taskConditions_targetValue:
        formData.taskConditions?.targetValue || 'MISSING',
      taskConditions_conditionType:
        formData.taskConditions?.conditionType || 'MISSING',
      platformCheck: {
        android: formData.platformAndroid,
        ios: formData.platformIOS,
        h5: formData.platformH5,
        pc: formData.platformPC,
        atLeastOne:
          formData.platformAndroid ||
          formData.platformIOS ||
          formData.platformH5 ||
          formData.platformPC,
      },
      claimCheck: {
        androidApp: formData.claimAndroidApp,
        iosApp: formData.claimIOSApp,
        h5: formData.claimH5,
        pc: formData.claimPC,
        atLeastOne:
          formData.claimAndroidApp ||
          formData.claimIOSApp ||
          formData.claimH5 ||
          formData.claimPC,
      },
    });

    await (props.isEdit
      ? updateTaskCenter(props.formData?.id || 0, {
          ...formData,
          id: props.formData?.id,
        })
      : createTaskCenter(formData));

    message.success(props.isEdit ? $t('activity.common.taskUpdateSuccess') : $t('activity.common.taskCreateSuccess'));
    showModal.value = false;
    emit('submit');
  } catch (error: any) {
    console.error('Task center submission failed:', error);
    message.error(error.message || $t('activity.common.operationRetry'));
  } finally {
    submitting.value = false;
  }
};

// Watch for modal visibility changes
watch(showModal, (newValue) => {
  if (newValue && props.formData) {
    // Edit mode - populate form with existing data
    Object.assign(formData, {
      ...props.formData,
      // Ensure nested objects exist
      auditSettings: props.formData.auditSettings || {
        auditRequired: true,
        auditMultiplier: 10.0,
        auditManualReviewRequired: false,
      },
      claimEntries: props.formData.claimEntries || {
        androidApp: true,
        iosApp: true,
        h5: false,
        pwa: false,
        iosWeb: false,
        pcWeb: false,
        androidH5: false,
        iosH5: false,
        sameDeviceOnce: false,
        webLoginOnce: false,
        deviceBindingOnce: false,
      },
      loginRedirectMethod: props.formData.loginRedirectMethod || {
        beforeLogin: 'high_frequency',
        afterLogin: 'high_frequency',
        directAfterRecharge: false,
      },
      rewardRules: props.formData.rewardRules || {
        explanationType: 'default',
        customText: '',
      },
    });
  }
});
</script>

<style scoped>
/* Modal Layout Fix */
.task-form-modal :deep(.n-dialog) {
  max-height: 90vh !important;
  display: flex !important;
  flex-direction: column !important;
}

.task-form-modal :deep(.n-dialog__content) {
  flex: 1 !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
}

.modal-content-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-tabs :deep(.n-tabs-content) {
  flex: 1;
  overflow-y: auto;
  max-height: calc(90vh - 200px);
  padding-right: 8px;
}

.modal-tabs :deep(.n-tab-pane) {
  padding: 16px 0;
}

/* Spacing utilities */
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* Form sections styling */
.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-yellow-50 {
  background-color: #fffbeb;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.border-yellow-200 {
  border-color: #fde68a;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }

  .task-form-modal :deep(.n-dialog) {
    width: 95vw !important;
    max-width: none !important;
  }
}

/* Scrollbar styling */
.modal-tabs :deep(.n-tabs-content)::-webkit-scrollbar {
  width: 6px;
}

.modal-tabs :deep(.n-tabs-content)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-tabs :deep(.n-tabs-content)::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-tabs :deep(.n-tabs-content)::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
