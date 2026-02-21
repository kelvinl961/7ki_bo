<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    title="新人福利设置"
    style="width: 90vw; max-width: 1200px"
    class="task-form-modal"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <AddOutline />
        <span>{{ isEdit ? '编辑任务' : '新人福利设置' }}</span>
      </div>
    </template>

    <div class="modal-content-wrapper">
      <!-- 🎯 NEW: Tabbed Layout matching Screenshot 2 -->
      <n-tabs type="line" animated class="modal-tabs">
        <!-- Tab 1: Basic Settings -->
        <n-tab-pane name="basic" tab="基础设置">
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
                <h3 class="mb-4 text-sm font-medium text-gray-700">基础信息</h3>

                <n-form-item label="任务条件" path="title">
                  <n-input
                    v-model:value="formData.title"
                    placeholder="请输入任务条件描述"
                    maxlength="100"
                    show-count
                  />
                </n-form-item>

                <n-grid :cols="2" :x-gap="16">
                  <n-grid-item>
                    <n-form-item label="奖励类型" path="rewardType">
                      <n-select
                        v-model:value="formData.rewardType"
                        :options="rewardTypeOptions"
                        placeholder="选择奖励类型"
                      />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="奖励金额" path="rewardAmount">
                      <n-input-number
                        v-model:value="formData.rewardAmount"
                        :min="0"
                        :precision="2"
                        :step="0.01"
                        placeholder="请输入奖励金额"
                        style="width: 100%"
                        clearable
                      >
                        <template #suffix>BRL</template>
                      </n-input-number>
                    </n-form-item>
                  </n-grid-item>
                </n-grid>

                <n-form-item label="活跃度" path="activityLevel">
                  <n-input-number
                    v-model:value="formData.activityLevel"
                    :min="0"
                    :max="1000"
                    placeholder="0"
                    style="width: 200px"
                  />
                </n-form-item>

                <n-form-item label="状态设置">
                  <n-switch v-model:value="formData.isActive">
                    <template #checked>开</template>
                    <template #unchecked>关</template>
                  </n-switch>
                </n-form-item>
              </div>

              <!-- Task Validity Section -->
              <div class="rounded-lg bg-gray-50 p-4">
                <h3 class="mb-4 text-sm font-medium text-gray-700">任务时效</h3>
                <n-radio-group v-model:value="formData.taskValidity">
                  <n-space vertical>
                    <n-radio value="long_term">长期</n-radio>
                    <n-radio value="limited_time">限时</n-radio>
                  </n-space>
                </n-radio-group>
              </div>

              <!-- Claim Method Section -->
              <div class="rounded-lg bg-gray-50 p-4">
                <h3 class="mb-4 text-sm font-medium text-gray-700">领取方式</h3>
                <n-radio-group v-model:value="formData.claimMethod">
                  <n-space vertical>
                    <n-radio value="MANUAL">手动领取</n-radio>
                    <n-radio value="AUTOMATIC">自动收集立即到账</n-radio>
                  </n-space>
                </n-radio-group>
              </div>

              <!-- Claim Time Section -->
              <div class="rounded-lg bg-gray-50 p-4">
                <h3 class="mb-4 text-sm font-medium text-gray-700">领取时间</h3>
                <n-radio-group v-model:value="formData.claimTimeType">
                  <n-space vertical>
                    <n-radio value="NEXT_DAY">当天签到下日可领</n-radio>
                    <n-radio value="REAL_TIME">实时</n-radio>
                  </n-space>
                </n-radio-group>
              </div>

              <!-- Claim Entry Section -->
              <div class="rounded-lg bg-gray-50 p-4">
                <h3 class="mb-4 text-sm font-medium text-gray-700">领取入口</h3>
                <div class="grid grid-cols-2 gap-3">
                  <n-checkbox
                    v-model:checked="formData.claimEntries!.androidApp"
                    >Android APP可领取</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.iosApp"
                    >IOS APP可领取</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.h5"
                    >马甲包</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.pwa"
                    >PWA体验</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.iosWeb"
                    >IOS触登录</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.pcWeb"
                    >PC可领取</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.androidH5"
                    >Android H5可领取</n-checkbox
                  >
                  <n-checkbox v-model:checked="formData.claimEntries!.iosH5"
                    >IOS H5可领取</n-checkbox
                  >
                </div>

                <!-- Additional Entry Options -->
                <div class="mt-4 space-y-2">
                  <n-checkbox
                    v-model:checked="formData.claimEntries!.sameDeviceOnce"
                    >同设备只需完成一次</n-checkbox
                  >
                  <n-checkbox
                    v-model:checked="formData.claimEntries!.webLoginOnce"
                    >PC可领取</n-checkbox
                  >
                  <n-checkbox
                    v-model:checked="formData.claimEntries!.deviceBindingOnce"
                    >同设备绑定只能领取1次</n-checkbox
                  >
                </div>
              </div>
            </n-form>
          </div>
        </n-tab-pane>

        <!-- Tab 2: Restriction Conditions -->
        <n-tab-pane name="restrictions" tab="限制条件">
          <div class="space-y-6">
            <!-- More Reward Claim Restrictions -->
            <div class="rounded-lg bg-gray-50 p-4">
              <h3 class="mb-4 text-sm font-medium text-gray-700">
                更多奖领取限制
              </h3>
              <n-checkbox-group v-model:value="formData.restrictions">
                <div class="grid grid-cols-2 gap-2">
                  <n-checkbox value="phone_verified"
                    >完成手机验证才能领取</n-checkbox
                  >
                  <n-checkbox value="complete_email"
                    >完成邮箱验证才能领取</n-checkbox
                  >
                  <n-checkbox value="bank_card"
                    >完成银行卡绑定才能领取</n-checkbox
                  >
                  <n-checkbox value="complete_recharge"
                    >完成充值后才能领取</n-checkbox
                  >
                  <n-checkbox value="bind_currency"
                    >绑定虚拟货币才能领取</n-checkbox
                  >
                  <n-checkbox value="three_party"
                    >绑定三方钱包才能领取</n-checkbox
                  >
                  <n-checkbox value="complete_birthday"
                    >完成生日设置才能领取</n-checkbox
                  >
                  <n-checkbox value="bind_payment"
                    >绑定收款方式才能领取</n-checkbox
                  >
                  <n-checkbox value="real_name"
                    >完成实名认证才能领取</n-checkbox
                  >
                  <n-checkbox value="game_experience"
                    >填写真实姓名才能领取</n-checkbox
                  >
                  <n-checkbox value="same_activity"
                    >同类型活动只能领取1次</n-checkbox
                  >
                  <n-checkbox value="charge_after_complete"
                    >充值后未来法才能领取</n-checkbox
                  >
                  <n-checkbox value="same_ip">同登录IP只能申请1次</n-checkbox>
                  <n-checkbox value="complete_kyc"
                    >完成KYC认证才能领取</n-checkbox
                  >
                  <n-checkbox value="bind_currency_third_party"
                    >绑定虚拟货币三方钱包才能领取</n-checkbox
                  >
                  <n-checkbox value="complete_recharge_education"
                    >完成充值教育才能领取</n-checkbox
                  >
                  <n-checkbox value="complete_bet_education"
                    >完成投注教育才能领取</n-checkbox
                  >
                  <n-checkbox value="same_ip_device"
                    >同IP同设备只能申请1次</n-checkbox
                  >
                  <n-checkbox value="network_verification"
                    >网络实名验证才能领取</n-checkbox
                  >
                  <n-checkbox value="device_binding_limit"
                    >同设备绑定只能申请1次</n-checkbox
                  >
                  <n-checkbox value="phone_number_uniqueness"
                    >手机号唯一性才能领取</n-checkbox
                  >
                  <n-checkbox value="physical_verification"
                    >物理验证才能领取</n-checkbox
                  >
                  <n-checkbox value="location_verification"
                    >地理位置验证才能领取</n-checkbox
                  >
                  <n-checkbox value="payment_method_verification"
                    >支付方式验证才能领取</n-checkbox
                  >
                </div>
              </n-checkbox-group>
            </div>

            <!-- 🎯 CRITICAL: Audit Multiplier Configuration (稽核倍数设置) -->
            <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h3 class="mb-4 text-sm font-medium text-gray-700">
                稽核倍数设置
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <!-- Audit Required -->
                <div>
                  <label class="mb-1 block text-xs text-gray-600"
                    >是否需要稽核</label
                  >
                  <n-switch
                    v-model:value="formData.auditSettings!.auditRequired"
                  >
                    <template #checked>需要稽核</template>
                    <template #unchecked>无需稽核</template>
                  </n-switch>
                </div>

                <!-- Audit Multiplier -->
                <div>
                  <label class="mb-1 block text-xs text-gray-600"
                    >稽核倍数</label
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
                    <template #suffix>倍</template>
                  </n-input-number>
                </div>

                <!-- Audit Completion Time -->
                <!-- Audit completion time removed - fixed to 24 hours -->

                <!-- Manual Review Required -->
                <div>
                  <label class="mb-1 block text-xs text-gray-600"
                    >人工审核</label
                  >
                  <n-switch
                    v-model:value="
                      formData.auditSettings!.auditManualReviewRequired
                    "
                    :disabled="!formData.auditSettings!.auditRequired"
                  >
                    <template #checked>需要人工审核</template>
                    <template #unchecked>自动审核</template>
                  </n-switch>
                </div>
              </div>

              <!-- Audit Description -->
              <div
                v-if="formData.auditSettings!.auditRequired"
                class="mt-3 rounded-lg bg-blue-50 p-3"
              >
                <p class="text-xs text-blue-600">
                  <i class="fa fa-info-circle mr-1"></i>
                  稽核说明：用户获得奖励后需要投注
                  <strong
                    >{{
                      (formData.auditSettings!.auditMultiplier || 1).toFixed(1)
                    }}倍</strong
                  >
                  奖励金额才能提现。
                </p>
              </div>
            </div>

            <!-- Login Redirect Methods Section -->
            <div class="rounded-lg bg-gray-50 p-4">
              <h3 class="mb-4 text-sm font-medium text-gray-700">
                登录跳转方式
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-2 block text-xs text-gray-600"
                    >登录前跳转方式</label
                  >
                  <n-radio-group
                    v-model:value="formData.loginRedirectMethod!.beforeLogin"
                  >
                    <n-space vertical>
                      <n-radio value="high_frequency">高频跳转</n-radio>
                      <n-radio value="custom">自定义</n-radio>
                    </n-space>
                  </n-radio-group>
                </div>

                <div>
                  <label class="mb-2 block text-xs text-gray-600"
                    >登录后跳转方式</label
                  >
                  <n-radio-group
                    v-model:value="formData.loginRedirectMethod!.afterLogin"
                  >
                    <n-space vertical>
                      <n-radio value="high_frequency">高频跳转</n-radio>
                      <n-radio value="custom">自定义</n-radio>
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
                >
                  充值后直接跳转
                </n-checkbox>
              </div>
            </div>

            <!-- Reward Rules Section -->
            <div class="rounded-lg bg-gray-50 p-4">
              <h3 class="mb-4 text-sm font-medium text-gray-700">
                奖励获取规则
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="mb-1 block text-xs text-gray-600"
                    >规则说明</label
                  >
                  <n-radio-group
                    v-model:value="formData.rewardRules!.explanationType"
                  >
                    <n-space vertical>
                      <n-radio value="default">系统默认</n-radio>
                      <n-radio value="custom">自定义</n-radio>
                    </n-space>
                  </n-radio-group>
                </div>

                <!-- Custom Rules Text Area -->
                <div v-if="formData.rewardRules!.explanationType === 'custom'">
                  <label class="mb-1 block text-xs text-gray-600"
                    >自定义规则说明</label
                  >
                  <n-input
                    v-model:value="formData.rewardRules!.customText"
                    type="textarea"
                    placeholder="请输入自定义规则说明..."
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
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '更新' : '确定' }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
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
  title: '注册账号', // Pre-fill with the value from screenshot
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
    { required: true, message: '请输入任务条件', trigger: 'blur' },
    { max: 100, message: '任务条件不能超过100个字符', trigger: 'blur' },
  ],
  rewardType: [
    { required: true, message: '请选择奖励类型', trigger: 'change' },
  ],
  rewardAmount: [
    {
      required: true,
      type: 'number',
      message: '请输入奖励金额',
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
      message: '奖励金额不能小于0',
      trigger: ['blur', 'change'],
    },
  ],
};

const rewardTypeOptions = [
  { label: '现金（固定）', value: 'CASH' },
  { label: '奖金（浮动）', value: 'BONUS' },
  { label: '积分', value: 'POINTS' },
  { label: '免费旋转', value: 'FREE_SPINS' },
  { label: '折扣', value: 'DISCOUNT' },
  { label: '自定义奖励', value: 'CUSTOM' },
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

    message.success(props.isEdit ? '任务更新成功' : '任务创建成功');
    showModal.value = false;
    emit('submit');
  } catch (error: any) {
    console.error('Task center submission failed:', error);
    message.error(error.message || '操作失败，请重试');
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
