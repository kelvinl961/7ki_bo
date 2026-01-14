<template>
  <n-modal
    v-model:show="modalVisible"
    preset="card"
    :title="modalTitle"
    size="huge"
    :mask-closable="false"
    style="width: 90vw; max-width: 1200px"
    :on-close="handleClose"
  >
    <n-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-placement="left"
      label-width="140px"
      size="medium"
    >
      <n-grid :cols="2" :x-gap="24">
        <!-- 基本信息 -->
        <n-grid-item :span="2">
          <n-divider title-placement="left">基本信息</n-divider>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="任务标题" path="title">
            <n-input
              v-model:value="formData.title"
              placeholder="请输入任务标题"
              clearable
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="任务类型" path="taskType">
            <n-select
              v-model:value="formData.taskType"
              placeholder="请选择任务类型"
              :options="taskTypeOptions"
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="排序权重" path="sortOrder">
            <n-input-number
              v-model:value="formData.sortOrder"
              :min="0"
              :max="9999"
              placeholder="数字越小排序越靠前"
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="任务状态" path="isActive">
            <n-switch
              v-model:value="formData.isActive"
              :rail-style="switchRailStyle"
            >
              <template #checked>启用</template>
              <template #unchecked>停用</template>
            </n-switch>
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item :span="2">
          <n-form-item label="任务描述" path="description">
            <n-input
              v-model:value="formData.description"
              type="textarea"
              placeholder="请输入任务描述"
              :autosize="{ minRows: 3, maxRows: 5 }"
            />
          </n-form-item>
        </n-grid-item>

        <!-- 选择平台 -->
        <n-grid-item :span="2">
          <n-divider title-placement="left">选择平台</n-divider>
        </n-grid-item>
        
        <n-grid-item :span="2">
          <n-form-item label="支持平台" path="platforms">
            <n-checkbox-group v-model:value="selectedPlatforms">
              <n-space>
                <n-checkbox value="android" label="Android APP" />
                <n-checkbox value="ios" label="iOS APP" />
                <n-checkbox value="h5" label="H5移动端" />
                <n-checkbox value="pc" label="PC网页端" />
              </n-space>
            </n-checkbox-group>
          </n-form-item>
        </n-grid-item>

        <!-- 参与会员组 -->
        <n-grid-item :span="2">
          <n-divider title-placement="left">参与会员组</n-divider>
        </n-grid-item>
        
        <n-grid-item :span="2">
          <n-form-item label="会员组" path="memberGroups">
            <n-checkbox-group v-model:value="formData.memberGroups">
              <n-grid :cols="4" :x-gap="12" :y-gap="8">
                <n-grid-item v-for="group in memberGroupOptions" :key="group.value">
                  <n-checkbox :value="group.value" :label="group.label" />
                </n-grid-item>
              </n-grid>
            </n-checkbox-group>
          </n-form-item>
        </n-grid-item>

        <!-- 任务校验方式 -->
        <n-grid-item :span="2">
          <n-divider title-placement="left">任务校验方式</n-divider>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="校验方式" path="validationMethod">
            <n-radio-group v-model:value="formData.validationMethod">
              <n-space>
                <n-radio value="LONG_TERM" label="长效" />
                <n-radio value="LIMITED_TIME" label="限时" />
              </n-space>
            </n-radio-group>
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item v-if="formData.validationMethod === 'LIMITED_TIME'">
          <n-form-item label="限时设置" path="validationTime">
            <n-space>
              <n-date-picker
                v-model:value="validationStartTime"
                type="datetime"
                placeholder="开始时间"
                style="width: 160px"
              />
              <span>至</span>
              <n-date-picker
                v-model:value="validationEndTime"
                type="datetime"
                placeholder="结束时间"
                style="width: 160px"
              />
            </n-space>
          </n-form-item>
        </n-grid-item>

        <!-- 领取方式 -->
        <n-grid-item :span="2">
          <n-divider title-placement="left">领取方式</n-divider>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="领取方式" path="claimMethod">
            <n-radio-group v-model:value="formData.claimMethod">
              <n-space>
                <n-radio value="MANUAL" label="手动领取" />
                <n-radio value="AUTOMATIC" label="自动领取" />
              </n-space>
            </n-radio-group>
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="领取时间" path="claimTimeType">
            <n-radio-group v-model:value="formData.claimTimeType">
              <n-space>
                <n-radio value="REAL_TIME" label="当天实时" />
                <n-radio value="NEXT_DAY" label="下次日" />
              </n-space>
            </n-radio-group>
          </n-form-item>
        </n-grid-item>

        <!-- 领取入口 -->
        <n-grid-item :span="2">
          <n-divider title-placement="left">领取入口</n-divider>
        </n-grid-item>
        
        <n-grid-item :span="2">
          <n-form-item label="领取入口" path="claimEntrance">
            <n-checkbox-group v-model:value="selectedClaimEntrance">
              <n-space>
                <n-checkbox value="androidApp" label="Android APP可领取" />
                <n-checkbox value="iosApp" label="iOS APP可领取" />
                <n-checkbox value="h5" label="H5移动端可领取" />
                <n-checkbox value="pc" label="PC网页端可领取" />
              </n-space>
            </n-checkbox-group>
          </n-form-item>
        </n-grid-item>

        <!-- 更多领取限制 -->
        <n-grid-item :span="2">
          <n-divider title-placement="left">更多领取限制</n-divider>
        </n-grid-item>
        
        <n-grid-item :span="2">
          <n-form-item label="领取限制" path="claimRestrictions">
            <n-checkbox-group v-model:value="selectedRestrictions">
              <n-grid :cols="2" :x-gap="12" :y-gap="8">
                <n-grid-item>
                  <n-checkbox value="requireEmailVerification" label="完成邮箱验证才能领取" />
                </n-grid-item>
                <n-grid-item>
                  <n-checkbox value="requirePhoneVerification" label="完成手机验证才能领取" />
                </n-grid-item>
                <n-grid-item>
                  <n-checkbox value="requireBankBinding" label="完成银行卡绑定才能领取" />
                </n-grid-item>
                <n-grid-item>
                  <n-checkbox value="requireRealNameAuth" label="完成实名认证才能领取" />
                </n-grid-item>
              </n-grid>
            </n-checkbox-group>
          </n-form-item>
        </n-grid-item>

        <!-- 登录相关 -->
        <n-grid-item :span="2">
          <n-divider title-placement="left">登录相关</n-divider>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="登录新增方式" path="loginAdditionMethod">
            <n-select
              v-model:value="formData.loginAdditionMethod"
              placeholder="请选择登录新增方式"
              :options="loginAdditionOptions"
              clearable
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="登录导流方式" path="loginDiversionMethod">
            <n-select
              v-model:value="formData.loginDiversionMethod"
              placeholder="请选择登录导流方式"
              :options="loginDiversionOptions"
              clearable
            />
          </n-form-item>
        </n-grid-item>

        <!-- 奖励设置 -->
        <n-grid-item :span="2">
          <n-divider title-placement="left">奖励设置</n-divider>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="奖励类型" path="rewardType">
            <n-select
              v-model:value="formData.rewardType"
              placeholder="请选择奖励类型"
              :options="taskRewardTypeOptions"
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="奖励金额" path="rewardAmount">
            <n-input-number
              v-model:value="formData.rewardAmount"
              :min="0"
              :precision="2"
              placeholder="请输入奖励金额"
            >
              <template #suffix>{{ formData.rewardCurrency }}</template>
            </n-input-number>
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="奖励币种" path="rewardCurrency">
            <n-select
              v-model:value="formData.rewardCurrency"
              placeholder="请选择奖励币种"
              :options="currencyOptions"
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="奖励倍数" path="rewardMultiplier">
            <n-input-number
              v-model:value="formData.rewardMultiplier"
              :min="0"
              :precision="4"
              placeholder="请输入奖励倍数"
            />
          </n-form-item>
        </n-grid-item>

        <!-- 任务条件 -->
        <n-grid-item :span="2">
          <n-divider title-placement="left">任务条件</n-divider>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="条件类型" path="taskConditions.conditionType">
            <n-input
              v-model:value="formData.taskConditions.conditionType"
              placeholder="如：首次充值、每日签到等"
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="目标值" path="taskConditions.targetValue">
            <n-input-number
              v-model:value="formData.taskConditions.targetValue"
              :min="0"
              placeholder="请输入目标值"
            />
          </n-form-item>
        </n-grid-item>

        <!-- 时间设置 -->
        <n-grid-item :span="2">
          <n-divider title-placement="left">时间设置</n-divider>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="开始时间" path="startTime">
            <n-date-picker
              v-model:value="startTime"
              type="datetime"
              placeholder="请选择开始时间"
              style="width: 100%"
              clearable
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="结束时间" path="endTime">
            <n-date-picker
              v-model:value="endTime"
              type="datetime"
              placeholder="请选择结束时间"
              style="width: 100%"
              clearable
            />
          </n-form-item>
        </n-grid-item>

        <!-- 规则说明 -->
        <n-grid-item :span="2">
          <n-divider title-placement="left">规则说明</n-divider>
        </n-grid-item>
        
        <n-grid-item :span="2">
          <n-form-item label="规则说明" path="ruleDescription">
            <n-input
              v-model:value="formData.ruleDescription"
              type="textarea"
              placeholder="请输入详细的任务规则说明"
              :autosize="{ minRows: 4, maxRows: 8 }"
            />
          </n-form-item>
        </n-grid-item>
      </n-grid>
    </n-form>

    <template #footer>
      <n-space justify="center">
        <n-button @click="handleClose">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ mode === 'add' ? '创建' : '更新' }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useMessage } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { 
  TaskCategory, 
  createTaskCenter,
  updateTaskCenter,
  taskTypeOptions,
  taskRewardTypeOptions
} from '../../../api/taskCenter';
import type { TaskCenterFormData, TaskCenterItem } from '../../../api/taskCenter';

interface Props {
  visible: boolean;
  mode: 'add' | 'edit';
  taskData?: TaskCenterItem | null;
  category: TaskCategory;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const message = useMessage();

// Form ref
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);

// Modal state
const modalVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
});

const modalTitle = computed(() => {
  return props.mode === 'add' ? '新增任务' : '编辑任务';
});

// Form data
const formData = ref<TaskCenterFormData>({
  title: '',
  description: '',
  category: props.category,
  taskType: 'REGISTRATION',
  sortOrder: 0,
  
  // Platform
  platformAndroid: false,
  platformIOS: false,
  platformH5: false,
  platformPC: false,
  
  // Member groups
  memberGroups: [],
  
  // Validation
  validationMethod: 'LONG_TERM',
  validationStartTime: undefined,
  validationEndTime: undefined,
  
  // Claim
  claimMethod: 'MANUAL',
  claimAndroidApp: false,
  claimIOSApp: false,
  claimH5: false,
  claimPC: false,
  
  // Restrictions
  requireEmailVerification: false,
  requirePhoneVerification: false,
  requireBankBinding: false,
  requireRealNameAuth: false,
  claimRestrictions: [],
  
  // Claim time
  claimTimeType: 'REAL_TIME',
  
  // Login
  loginAdditionMethod: '',
  loginDiversionMethod: '',
  
  // Reward
  rewardType: 'CASH',
  rewardAmount: 0,
  rewardCurrency: 'BRL',
  rewardMultiplier: 1.0,
  
  // Trigger conditions
  triggerConditions: {
    platforms: [],
    methods: [],
    additional: {}
  },
  
  // Rule description
  ruleDescription: '',
  
  // Task conditions
  taskConditions: {
    targetValue: 1,
    conditionType: '',
    parameters: {}
  },
  
  // Time
  startTime: undefined,
  endTime: undefined,
  
  isActive: true
});

// Checkbox groups
const selectedPlatforms = ref<string[]>([]);
const selectedClaimEntrance = ref<string[]>([]);
const selectedRestrictions = ref<string[]>([]);

// Date pickers
const validationStartTime = ref<number | null>(null);
const validationEndTime = ref<number | null>(null);
const startTime = ref<number | null>(null);
const endTime = ref<number | null>(null);

// Options
const memberGroupOptions = [
  { label: 'VIP会员', value: 1 },
  { label: '普通会员', value: 2 },
  { label: '新注册会员', value: 3 },
  { label: '活跃会员', value: 4 },
  { label: '高价值会员', value: 5 },
  { label: '流失会员', value: 6 }
];

const loginAdditionOptions = [
  { label: '首次登录', value: 'FIRST_LOGIN' },
  { label: '每日登录', value: 'DAILY_LOGIN' },
  { label: '连续登录', value: 'CONTINUOUS_LOGIN' }
];

const loginDiversionOptions = [
  { label: '游戏大厅', value: 'GAME_LOBBY' },
  { label: '充值页面', value: 'DEPOSIT_PAGE' },
  { label: '活动页面', value: 'ACTIVITY_PAGE' },
  { label: '任务中心', value: 'TASK_CENTER' }
];

const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' }
];

// Form rules
const formRules: FormRules = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  rewardAmount: [{ required: true, message: '请输入奖励金额', trigger: 'blur' }],
  'taskConditions.conditionType': [{ required: true, message: '请输入条件类型', trigger: 'blur' }],
  'taskConditions.targetValue': [{ required: true, message: '请输入目标值', trigger: 'blur' }]
};

// Switch rail style
const switchRailStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
  const style: any = {};
  if (checked) {
    style.background = '#13ce66';
    if (focused) {
      style.boxShadow = '0 0 0 2px #13ce6640';
    }
  } else {
    style.background = '#ff4757';
    if (focused) {
      style.boxShadow = '0 0 0 2px #ff475740';
    }
  }
  return style;
};

// Methods
const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    category: props.category,
    taskType: 'REGISTRATION',
    sortOrder: 0,
    
    // Platform
    platformAndroid: false,
    platformIOS: false,
    platformH5: false,
    platformPC: false,
    
    // Member groups
    memberGroups: [],
    
    // Validation
    validationMethod: 'LONG_TERM',
    validationStartTime: undefined,
    validationEndTime: undefined,
    
    // Claim
    claimMethod: 'MANUAL',
    claimAndroidApp: false,
    claimIOSApp: false,
    claimH5: false,
    claimPC: false,
    
    // Restrictions
    requireEmailVerification: false,
    requirePhoneVerification: false,
    requireBankBinding: false,
    requireRealNameAuth: false,
    claimRestrictions: [],
    
    // Claim time
    claimTimeType: 'REAL_TIME',
    
    // Login
    loginAdditionMethod: '',
    loginDiversionMethod: '',
    
    // Reward
    rewardType: 'CASH',
    rewardAmount: 0,
    rewardCurrency: 'BRL',
    rewardMultiplier: 1.0,
    
    // Trigger conditions
    triggerConditions: {
      platforms: [],
      methods: [],
      additional: {}
    },
    
    // Rule description
    ruleDescription: '',
    
    // Task conditions
    taskConditions: {
      targetValue: 1,
      conditionType: '',
      parameters: {}
    },
    
    // Time
    startTime: undefined,
    endTime: undefined,
    
    isActive: true
  };
  
  selectedPlatforms.value = [];
  selectedClaimEntrance.value = [];
  selectedRestrictions.value = [];
  validationStartTime.value = null;
  validationEndTime.value = null;
  startTime.value = null;
  endTime.value = null;
};

const loadTaskData = () => {
  if (props.taskData) {
    const task = props.taskData;
    
    // Basic info
    formData.value.title = task.title;
    formData.value.description = task.description || '';
    formData.value.taskType = task.taskType;
    formData.value.sortOrder = task.sortOrder;
    formData.value.isActive = task.isActive;
    
    // Platform
    formData.value.platformAndroid = task.platforms.android;
    formData.value.platformIOS = task.platforms.ios;
    formData.value.platformH5 = task.platforms.h5;
    formData.value.platformPC = task.platforms.pc;
    
    // Update checkbox groups
    selectedPlatforms.value = [];
    if (task.platforms.android) selectedPlatforms.value.push('android');
    if (task.platforms.ios) selectedPlatforms.value.push('ios');
    if (task.platforms.h5) selectedPlatforms.value.push('h5');
    if (task.platforms.pc) selectedPlatforms.value.push('pc');
    
    // Claim entrance
    selectedClaimEntrance.value = [];
    if (task.claimEntrance.androidApp) selectedClaimEntrance.value.push('androidApp');
    if (task.claimEntrance.iosApp) selectedClaimEntrance.value.push('iosApp');
    if (task.claimEntrance.h5) selectedClaimEntrance.value.push('h5');
    if (task.claimEntrance.pc) selectedClaimEntrance.value.push('pc');
    
    // Validation
    formData.value.validationMethod = task.validationMethod;
    if (task.validationStartTime) {
      validationStartTime.value = new Date(task.validationStartTime).getTime();
    }
    if (task.validationEndTime) {
      validationEndTime.value = new Date(task.validationEndTime).getTime();
    }
    
    // Claim
    formData.value.claimMethod = task.claimMethod;
    formData.value.claimTimeType = task.claimTimeType;
    
    // Reward
    formData.value.rewardType = task.rewardType;
    formData.value.rewardAmount = task.rewardAmount;
    formData.value.rewardCurrency = task.rewardCurrency;
    
    // Task conditions
    formData.value.taskConditions = { ...task.taskConditions };
    
    // Time
    if (task.startTime) {
      startTime.value = new Date(task.startTime).getTime();
    }
    if (task.endTime) {
      endTime.value = new Date(task.endTime).getTime();
    }
  }
};

const syncCheckboxGroups = () => {
  // Sync platforms
  formData.value.platformAndroid = selectedPlatforms.value.includes('android');
  formData.value.platformIOS = selectedPlatforms.value.includes('ios');
  formData.value.platformH5 = selectedPlatforms.value.includes('h5');
  formData.value.platformPC = selectedPlatforms.value.includes('pc');
  
  // Sync claim entrance
  formData.value.claimAndroidApp = selectedClaimEntrance.value.includes('androidApp');
  formData.value.claimIOSApp = selectedClaimEntrance.value.includes('iosApp');
  formData.value.claimH5 = selectedClaimEntrance.value.includes('h5');
  formData.value.claimPC = selectedClaimEntrance.value.includes('pc');
  
  // Sync restrictions
  formData.value.requireEmailVerification = selectedRestrictions.value.includes('requireEmailVerification');
  formData.value.requirePhoneVerification = selectedRestrictions.value.includes('requirePhoneVerification');
  formData.value.requireBankBinding = selectedRestrictions.value.includes('requireBankBinding');
  formData.value.requireRealNameAuth = selectedRestrictions.value.includes('requireRealNameAuth');
  
  // Sync time
  if (validationStartTime.value) {
    formData.value.validationStartTime = new Date(validationStartTime.value).toISOString();
  }
  if (validationEndTime.value) {
    formData.value.validationEndTime = new Date(validationEndTime.value).toISOString();
  }
  if (startTime.value) {
    formData.value.startTime = new Date(startTime.value).toISOString();
  }
  if (endTime.value) {
    formData.value.endTime = new Date(endTime.value).toISOString();
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    syncCheckboxGroups();
    
    submitting.value = true;
    
    if (props.mode === 'add') {
      await createTaskCenter(formData.value);
    } else if (props.taskData) {
      await updateTaskCenter(props.taskData.id, formData.value);
    }
    
    emit('success');
  } catch (error) {
    if (error instanceof Error) {
      message.error(error.message);
    } else {
      message.error(props.mode === 'add' ? '创建任务失败' : '更新任务失败');
    }
    console.error('Submit error:', error);
  } finally {
    submitting.value = false;
  }
};

const handleClose = () => {
  emit('cancel');
};

// Watch for modal visibility
watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(() => {
      if (props.mode === 'edit' && props.taskData) {
        loadTaskData();
      } else {
        resetForm();
      }
    });
  }
});

// Watch for category changes
watch(() => props.category, (category) => {
  formData.value.category = category;
});
</script>

<style scoped lang="scss">
.n-form {
  :deep(.n-form-item-label) {
    font-weight: 500;
    color: #333;
  }
  
  :deep(.n-divider) {
    margin: 20px 0 16px 0;
    
    .n-divider__title {
      font-weight: 600;
      color: #1890ff;
    }
  }
}

// Dark mode support
:deep(.dark) {
  .n-form {
    .n-form-item-label {
      color: #fff;
    }
    
    .n-divider {
      .n-divider__title {
        color: #409eff;
      }
    }
  }
}
</style> 