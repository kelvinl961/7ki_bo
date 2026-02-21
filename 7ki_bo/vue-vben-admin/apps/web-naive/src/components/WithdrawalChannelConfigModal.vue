<template>
  <n-modal
    :show="visible"
    @update:show="(value) => $emit('update:visible', value)"
    preset="card"
    title="提现通道配置"
    style="width: 800px"
    :mask-closable="false"
  >
    <template #header-extra>
      <n-button quaternary size="small" @click="$emit('update:visible', false)">
        <template #icon>
          <n-icon><CloseOutline /></n-icon>
        </template>
      </n-button>
    </template>

    <n-tabs
      v-model:value="activeTab"
      type="line"
      size="large"
      :tab-style="{ paddingLeft: '24px', paddingRight: '24px' }"
    >
      <!-- First Tab: Basic Configuration -->
      <n-tab-pane name="basic" tab="基础配置">
        <n-form
          ref="basicFormRef"
          :model="basicFormData"
          :rules="basicFormRules"
          label-placement="left"
          label-width="140px"
          require-mark-placement="right-hanging"
        >
          <n-grid :cols="2" :x-gap="24">
            <n-form-item-gi label="允许绑定PIX类型" path="pixTypes">
              <n-space>
                <n-checkbox
                  v-for="t in pixTypeOptions"
                  :key="t.value"
                  v-model:checked="basicFormData.pixTypesMap[t.value]"
                  >{{ t.label }}</n-checkbox
                >
              </n-space>
            </n-form-item-gi>
            <n-form-item-gi label="允许绑定PIX账号数量" path="allowBindCount">
              <n-input-number
                v-model:value="basicFormData.allowBindCount"
                :min="0"
                style="width: 100%"
              />
            </n-form-item-gi>
          </n-grid>

          <n-form-item label="支持语言" path="language">
            <n-select
              v-model:value="basicFormData.language"
              :options="languageOptions"
            />
          </n-form-item>

          <n-form-item label="角标背景颜色" path="badgeColor">
            <n-radio-group v-model:value="basicFormData.badgeColor">
              <n-space>
                <n-radio value="red">红色</n-radio>
                <n-radio value="green">绿色</n-radio>
                <n-radio value="blue">蓝色</n-radio>
                <n-radio value="orange">橙色</n-radio>
              </n-space>
            </n-radio-group>
          </n-form-item>

          <!-- 单笔限额（可按层级添加多行） -->
          <n-form-item label="单笔限额">
            <div class="limit-settings-container">
              <!-- Header row for clarity -->
              <n-grid
                :cols="24"
                :x-gap="12"
                class="limit-header"
                style="margin-bottom: 8px"
              >
                <n-form-item-gi :span="6" label-width="0">
                  <span class="field-label">指定会员层级</span>
                </n-form-item-gi>
                <n-form-item-gi :span="8" label-width="0">
                  <span class="field-label">最低限额 (BRL)</span>
                </n-form-item-gi>
                <n-form-item-gi :span="8" label-width="0">
                  <span class="field-label">最高限额 (BRL)</span>
                </n-form-item-gi>
                <n-form-item-gi :span="2" label-width="0">
                  <span class="field-label">操作</span>
                </n-form-item-gi>
              </n-grid>
              <!-- Data rows -->
              <n-space vertical style="width: 100%">
                <n-grid
                  :cols="24"
                  :x-gap="12"
                  v-for="(row, idx) in singleLimitRows"
                  :key="idx"
                >
                  <n-form-item-gi :span="6" label-width="0">
                    <n-select
                      v-model:value="row.level"
                      :options="vipLevelOptions"
                      placeholder="全部层级"
                    />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label-width="0">
                    <n-input-number
                      v-model:value="row.min"
                      :min="0"
                      style="width: 100%"
                      placeholder="最低金额"
                    />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label-width="0">
                    <n-input-number
                      v-model:value="row.max"
                      :min="0"
                      style="width: 100%"
                      placeholder="最高金额"
                    />
                  </n-form-item-gi>
                  <n-form-item-gi :span="2" label-width="0">
                    <n-space>
                      <n-button
                        size="small"
                        @click="addSingleLimitRow"
                        ghost
                        type="primary"
                        >+</n-button
                      >
                      <n-button
                        v-if="singleLimitRows.length > 1"
                        size="small"
                        @click="removeSingleLimitRow(idx)"
                        ghost
                        type="error"
                        >-</n-button
                      >
                    </n-space>
                  </n-form-item-gi>
                </n-grid>
              </n-space>
            </div>
          </n-form-item>

          <!-- 手续费设置 -->
          <n-form-item label="提现手续费">
            <div class="fee-settings-container">
              <!-- Header row for clarity -->
              <n-grid
                :cols="24"
                :x-gap="12"
                class="fee-header"
                style="margin-bottom: 8px"
              >
                <n-form-item-gi :span="8" label-width="0">
                  <span class="field-label">提现金额</span>
                </n-form-item-gi>
                <n-form-item-gi :span="5" label-width="0">
                  <span class="field-label">收取方式</span>
                </n-form-item-gi>
                <n-form-item-gi :span="5" label-width="0">
                  <span class="field-label">设置</span>
                </n-form-item-gi>
                <n-form-item-gi :span="3" label-width="0">
                  <span class="field-label">单位</span>
                </n-form-item-gi>
                <n-form-item-gi :span="3" label-width="0">
                  <span class="field-label">操作</span>
                </n-form-item-gi>
              </n-grid>
              <!-- Data rows -->
              <div
                v-for="(feeRow, index) in feeRows"
                :key="index"
                class="fee-row"
              >
                <n-grid :cols="24" :x-gap="12">
                  <n-form-item-gi :span="8" label-width="0">
                    <n-input
                      v-model:value="feeRow.range"
                      placeholder="0.00 到 20000.00"
                    />
                  </n-form-item-gi>
                  <n-form-item-gi :span="5" label-width="0">
                    <n-select
                      v-model:value="feeRow.method"
                      :options="feeMethodOptions"
                      placeholder="选择方式"
                    />
                  </n-form-item-gi>
                  <n-form-item-gi :span="5" label-width="0">
                    <n-input-number
                      v-model:value="feeRow.value"
                      :min="0"
                      style="width: 100%"
                      placeholder="费用"
                    />
                  </n-form-item-gi>
                  <n-form-item-gi :span="3" label-width="0">
                    <n-select
                      v-model:value="feeRow.unit"
                      :options="feeUnitOptions"
                    />
                  </n-form-item-gi>
                  <n-form-item-gi :span="3" label-width="0">
                    <n-space>
                      <n-button
                        size="small"
                        @click="addFeeRow"
                        ghost
                        type="primary"
                        >+</n-button
                      >
                      <n-button
                        v-if="feeRows.length > 1"
                        size="small"
                        @click="removeFeeRow(index)"
                        ghost
                        type="error"
                        >-</n-button
                      >
                    </n-space>
                  </n-form-item-gi>
                </n-grid>
              </div>
            </div>
          </n-form-item>

          <!-- 提示文案 -->
          <n-form-item label="提现页温馨提示">
            <n-input
              v-model:value="advancedFormData.withdrawTip"
              placeholder="不超过200字"
              maxlength="200"
            />
          </n-form-item>
          <n-form-item label="添加账号温馨提示">
            <n-input
              v-model:value="advancedFormData.addAccountTip"
              placeholder="不超过200字"
              maxlength="200"
            />
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <!-- Second Tab: Advanced Settings -->
      <n-tab-pane name="advanced" tab="高级设置">
        <n-form
          ref="advancedFormRef"
          :model="advancedFormData"
          :rules="advancedFormRules"
          label-placement="left"
          label-width="140px"
          require-mark-placement="right-hanging"
        >
          <n-grid :cols="2" :x-gap="24">
            <n-form-item-gi label="单笔限额" path="singleLimit">
              <n-input
                v-model:value="advancedFormData.singleLimit"
                placeholder="例: 0.00-20,000.00"
              />
            </n-form-item-gi>
            <n-form-item-gi label="手续费" path="fees">
              <n-input
                v-model:value="advancedFormData.fees"
                placeholder="例: 0.00-20,000.00 0.00"
              />
            </n-form-item-gi>
          </n-grid>

          <n-grid :cols="2" :x-gap="24">
            <n-form-item-gi label="每日限额" path="dailyLimit">
              <n-input-number
                v-model:value="advancedFormData.dailyLimit"
                :min="0"
                placeholder="每日限额"
                style="width: 100%"
              />
            </n-form-item-gi>
            <n-form-item-gi label="风险等级" path="riskLevel">
              <n-select
                v-model:value="advancedFormData.riskLevel"
                :options="riskLevelOptions"
                placeholder="请选择风险等级"
              />
            </n-form-item-gi>
          </n-grid>

          <n-grid :cols="2" :x-gap="24">
            <n-form-item-gi label="优先级" path="priority">
              <n-input-number
                v-model:value="advancedFormData.priority"
                :min="0"
                :max="100"
                placeholder="优先级 (0-100)"
                style="width: 100%"
              />
            </n-form-item-gi>
            <n-form-item-gi label="状态" path="status">
              <n-select
                v-model:value="advancedFormData.status"
                :options="channelStatusOptions"
                placeholder="请选择状态"
              />
            </n-form-item-gi>
          </n-grid>

          <n-form-item label="工作时间" path="workingHours">
            <n-input
              v-model:value="advancedFormData.workingHours"
              placeholder="例: 09:00-18:00 或留空表示24小时"
            />
          </n-form-item>

          <n-form-item label="备注" path="remarks">
            <n-input
              v-model:value="advancedFormData.remarks"
              type="textarea"
              placeholder="请输入备注信息"
              :rows="3"
            />
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <!-- Third Tab: API Configuration -->
      <n-tab-pane name="api" tab="API">
        <n-form
          ref="apiFormRef"
          :model="apiFormData"
          :rules="apiFormRules"
          label-placement="left"
          label-width="140px"
          require-mark-placement="right-hanging"
        >
          <n-form-item label="API地址" path="apiUrl">
            <n-input
              v-model:value="apiFormData.apiUrl"
              placeholder="请输入API地址"
            />
          </n-form-item>

          <n-grid :cols="2" :x-gap="24">
            <n-form-item-gi label="商户ID" path="merchantId">
              <n-input
                v-model:value="apiFormData.merchantId"
                placeholder="请输入商户ID"
              />
            </n-form-item-gi>
            <n-form-item-gi label="密钥" path="secretKey">
              <n-input
                v-model:value="apiFormData.secretKey"
                type="password"
                show-password-on="click"
                placeholder="请输入密钥"
              />
            </n-form-item-gi>
          </n-grid>

          <n-form-item label="回调地址" path="callbackUrl">
            <n-input
              v-model:value="apiFormData.callbackUrl"
              placeholder="请输入回调地址"
            />
          </n-form-item>

          <n-form-item label="请求超时" path="timeout">
            <n-input-number
              v-model:value="apiFormData.timeout"
              :min="1000"
              :max="60000"
              :step="1000"
              placeholder="毫秒"
              style="width: 100%"
            />
            <template #suffix>ms</template>
          </n-form-item>

          <n-form-item label="重试次数" path="retryCount">
            <n-input-number
              v-model:value="apiFormData.retryCount"
              :min="0"
              :max="10"
              placeholder="重试次数"
              style="width: 100%"
            />
          </n-form-item>

          <n-form-item label="API版本" path="apiVersion">
            <n-select
              v-model:value="apiFormData.apiVersion"
              :options="apiVersionOptions"
              placeholder="请选择API版本"
            />
          </n-form-item>

          <n-form-item label="测试模式" path="testMode">
            <n-switch v-model:value="apiFormData.testMode" />
          </n-form-item>

          <n-form-item label="额外参数" path="extraParams">
            <n-input
              v-model:value="apiFormData.extraParams"
              type="textarea"
              placeholder="JSON格式的额外参数"
              :rows="4"
            />
          </n-form-item>
        </n-form>
      </n-tab-pane>
    </n-tabs>

    <template #action>
      <div class="flex justify-end gap-3">
        <n-button @click="$emit('update:visible', false)">取消</n-button>
        <n-button type="primary" :loading="loading" @click="handleConfirm"
          >确定</n-button
        >
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.field-label {
  font-weight: 600;
  color: #666;
  font-size: 12px;
  display: block;
  margin-bottom: 4px;
}

.limit-settings-container,
.fee-settings-container {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  background-color: #fafafa;
}

.limit-header,
.fee-header {
  background-color: #f5f5f5;
  padding: 8px 0;
  border-radius: 4px;
  margin-bottom: 8px !important;
}

.fee-row {
  margin-bottom: 8px;
}

.fee-row:last-child {
  margin-bottom: 0;
}
</style>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import {
  NModal,
  NButton,
  NIcon,
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NFormItemGi,
  NGrid,
  NCheckbox,
  NSpace,
  NInputNumber,
  NSelect,
  NRadioGroup,
  NRadio,
  NInput,
  NSwitch,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import { CloseOutline } from '@vicons/ionicons5';
import { requestClient } from '#/api/request';

// Define props and emits
interface Props {
  visible: boolean;
  editData?: any;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  editData: null,
});

const emit = defineEmits(['update:visible', 'success']);

// Initialize message
const message = useMessage();

// Form refs
const basicFormRef = ref<FormInst | null>(null);
const advancedFormRef = ref<FormInst | null>(null);
const apiFormRef = ref<FormInst | null>(null);

// Loading state
const loading = ref(false);

// Active tab
const activeTab = ref('basic');

// Form data
const basicFormData = reactive({
  categoryType: '',
  paymentMethod: '',
  allowWithdrawal: true,
  allowMemberUse: false,
  supportTransfer: true,
  supportDigitalCurrency: true,
  withdrawalStatus: 'enabled',
  monitorCount: 4,
  currency: 'BRL',
  arrivalStatus: 'instant',
  pixTypesMap: {
    CPF: true,
    PHONE: false,
    EMAIL: false,
    EVP: false,
    CNPJ: false,
    SLRY: false,
    SVGS: false,
    CACC: false,
    TRAN: false,
  },
  allowBindCount: 4,
  language: 'zh-CN',
  badgeColor: 'red',
});

const advancedFormData = reactive({
  singleLimit: '0.00-20,000.00',
  fees: '0.00-20,000.00 0.00',
  dailyLimit: 50000,
  riskLevel: 'medium',
  priority: 50,
  status: 'active',
  workingHours: '',
  remarks: '',
  feeRange: '0.00 到 20000.00',
  feeMethod: 'fixed',
  feeValue: 0,
  feeUnit: 'BRL',
  withdrawTip: '',
  addAccountTip: '',
});

const apiFormData = reactive({
  apiUrl: '',
  merchantId: '',
  secretKey: '',
  callbackUrl: '',
  timeout: 30000,
  retryCount: 3,
  apiVersion: 'v1',
  testMode: false,
  extraParams: '',
});

// Form validation rules
const basicFormRules: FormRules = {
  categoryType: [
    { required: true, message: '请选择提现大类', trigger: 'change' },
  ],
  paymentMethod: [
    { required: true, message: '请输入提现方式', trigger: 'blur' },
  ],
  currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
};

const advancedFormRules: FormRules = {
  singleLimit: [{ required: true, message: '请输入单笔限额', trigger: 'blur' }],
  fees: [{ required: true, message: '请输入手续费', trigger: 'blur' }],
  riskLevel: [{ required: true, message: '请选择风险等级', trigger: 'change' }],
};

const apiFormRules: FormRules = {
  apiUrl: [
    { required: true, message: '请输入API地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' },
  ],
  merchantId: [{ required: true, message: '请输入商户ID', trigger: 'blur' }],
  secretKey: [{ required: true, message: '请输入密钥', trigger: 'blur' }],
  callbackUrl: [
    { required: true, message: '请输入回调地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' },
  ],
};

// Options
const categoryTypeOptions = [
  { label: 'PIX', value: 'PIX' },
  { label: '银行转账', value: 'BANK_TRANSFER' },
  { label: '数字货币', value: 'CRYPTO' },
  { label: '电子钱包', value: 'E_WALLET' },
];

const statusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
  { label: '维护', value: 'maintenance' },
];

const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'USDT', value: 'USDT' },
];

const arrivalOptions = [
  { label: '即时', value: 'instant' },
  { label: '1小时内', value: '1h' },
  { label: '24小时内', value: '24h' },
  { label: '3-5工作日', value: '3-5days' },
];

const riskLevelOptions = [
  { label: '低风险', value: 'low' },
  { label: '中风险', value: 'medium' },
  { label: '高风险', value: 'high' },
];

const channelStatusOptions = [
  { label: '激活', value: 'active' },
  { label: '暂停', value: 'paused' },
  { label: '停用', value: 'disabled' },
];

const apiVersionOptions = [
  { label: 'v1', value: 'v1' },
  { label: 'v2', value: 'v2' },
  { label: 'v3', value: 'v3' },
];

// extra options
const pixTypeOptions = [
  { label: 'CPF', value: 'CPF' },
  { label: 'PHONE', value: 'PHONE' },
  { label: 'EMAIL', value: 'EMAIL' },
  { label: 'EVP', value: 'EVP' },
  { label: 'CNPJ', value: 'CNPJ' },
  { label: 'SLRY', value: 'SLRY' },
  { label: 'SVGS', value: 'SVGS' },
  { label: 'CACC', value: 'CACC' },
  { label: 'TRAN', value: 'TRAN' },
];

const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: '葡萄牙语', value: 'pt-BR' },
];

const vipLevelOptions = [
  { label: '全部层级', value: 'all' },
  { label: 'VIP0', value: 'VIP0' },
  { label: 'VIP1', value: 'VIP1' },
  { label: 'VIP2', value: 'VIP2' },
  { label: 'VIP3', value: 'VIP3' },
];

const feeMethodOptions = [
  { label: '固定金额', value: 'fixed' },
  { label: '百分比', value: 'percent' },
];
const feeUnitOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: '%', value: 'PERCENT' },
];

// rows state
const singleLimitRows = ref([{ level: 'all', min: 30, max: 20000 }]);
const addSingleLimitRow = () =>
  singleLimitRows.value.push({ level: 'all', min: 0, max: 0 });
const removeSingleLimitRow = (index: number) => {
  if (singleLimitRows.value.length > 1) {
    singleLimitRows.value.splice(index, 1);
  }
};

// fee rows state
const feeRows = ref([
  { range: '0.00 到 20000.00', method: 'fixed', value: 0, unit: 'BRL' },
]);
const addFeeRow = () =>
  feeRows.value.push({ range: '', method: 'fixed', value: 0, unit: 'BRL' });
const removeFeeRow = (index: number) => {
  if (feeRows.value.length > 1) {
    feeRows.value.splice(index, 1);
  }
};

Object.assign(basicFormData, {
  pixTypesMap: {
    CPF: true,
    PHONE: false,
    EMAIL: false,
    EVP: false,
    CNPJ: false,
    SLRY: false,
    SVGS: false,
    CACC: false,
    TRAN: false,
  },
  allowBindCount: 4,
  language: 'zh-CN',
  badgeColor: 'red',
});

// Watch for edit data
watch(
  () => props.editData,
  (newData) => {
    if (newData && props.visible) {
      console.log('📝 Loading edit data:', newData);
      // Load data into forms
      Object.assign(basicFormData, {
        categoryType: newData.type || '',
        paymentMethod: newData.name || '',
        allowWithdrawal: newData.allowWithdrawal ?? true,
        allowMemberUse: newData.allowMemberUse ?? false,
        supportTransfer: newData.supportTransfer ?? true,
        supportDigitalCurrency: newData.supportDigitalCurrency ?? true,
        withdrawalStatus: newData.status || 'enabled',
        monitorCount: newData.monitorCount || 4,
        currency: newData.currency || 'BRL',
        arrivalStatus: newData.arrivalStatus || 'instant',
        pixTypesMap: newData.pixTypesMap || {
          CPF: true,
          PHONE: false,
          EMAIL: false,
          EVP: false,
          CNPJ: false,
          SLRY: false,
          SVGS: false,
          CACC: false,
          TRAN: false,
        },
        allowBindCount: newData.allowBindCount || 4,
        language: newData.language || 'zh-CN',
        badgeColor: newData.badgeColor || 'red',
      });

      Object.assign(advancedFormData, {
        singleLimit: newData.singleLimit || '0.00-20,000.00',
        fees: newData.fees || '0.00-20,000.00 0.00',
        dailyLimit: newData.dailyLimit || 50000,
        riskLevel: newData.riskLevel || 'medium',
        priority: newData.priority || 50,
        status: newData.status || 'active',
        workingHours: newData.workingHours || '',
        remarks: newData.remarks || '',
        feeRange: newData.feeRange || '0.00 到 20000.00',
        feeMethod: newData.feeMethod || 'fixed',
        feeValue: newData.feeValue || 0,
        feeUnit: newData.feeUnit || 'BRL',
        withdrawTip: newData.withdrawTip || '',
        addAccountTip: newData.addAccountTip || '',
      });

      Object.assign(apiFormData, {
        apiUrl: newData.apiUrl || '',
        merchantId: newData.merchantId || '',
        secretKey: newData.secretKey || '',
        callbackUrl: newData.callbackUrl || '',
        timeout: newData.timeout || 30000,
        retryCount: newData.retryCount || 3,
        apiVersion: newData.apiVersion || 'v1',
        testMode: newData.testMode ?? false,
        extraParams: newData.extraParams || '',
      });
    }
  },
  { immediate: true },
);

// Watch modal visibility
watch(
  () => props.visible,
  (newVisible) => {
    console.log('🔧 Channel Config Modal visibility changed:', newVisible);
    if (newVisible) {
      activeTab.value = 'basic';
      console.log(' Modal opening, current data:', {
        basicFormData,
        advancedFormData,
        apiFormData,
      });
    }
  },
);

// Handle form submission
const handleConfirm = async () => {
  try {
    await basicFormRef.value?.validate();
    await advancedFormRef.value?.validate();
    await apiFormRef.value?.validate();

    loading.value = true;

    const payload = {
      categoryType: basicFormData.categoryType,
      paymentMethod: basicFormData.paymentMethod,
      allowWithdrawal: basicFormData.allowWithdrawal,
      allowMemberUse: basicFormData.allowMemberUse,
      supportTransfer: basicFormData.supportTransfer,
      supportDigitalCurrency: basicFormData.supportDigitalCurrency,
      withdrawalStatus: basicFormData.withdrawalStatus,
      monitorCount: basicFormData.monitorCount,
      currency: basicFormData.currency,
      arrivalStatus: basicFormData.arrivalStatus,
      pixTypes: Object.keys(basicFormData.pixTypesMap).filter(
        (k) => (basicFormData.pixTypesMap as any)[k],
      ),
      allowBindCount: basicFormData.allowBindCount,
      language: basicFormData.language,
      badgeColor: basicFormData.badgeColor,

      // limits
      singleLimitRows: singleLimitRows.value,

      // advanced
      singleLimit: advancedFormData.singleLimit,
      fees: advancedFormData.fees,
      dailyLimit: advancedFormData.dailyLimit,
      riskLevel: advancedFormData.riskLevel,
      priority: advancedFormData.priority,
      status: advancedFormData.status,
      workingHours: advancedFormData.workingHours,
      remarks: advancedFormData.remarks,
      feeRange: advancedFormData.feeRange,
      feeMethod: advancedFormData.feeMethod,
      feeValue: advancedFormData.feeValue,
      feeUnit: advancedFormData.feeUnit,
      withdrawTip: advancedFormData.withdrawTip,
      addAccountTip: advancedFormData.addAccountTip,

      // api
      apiUrl: apiFormData.apiUrl,
      merchantId: apiFormData.merchantId,
      secretKey: apiFormData.secretKey,
      callbackUrl: apiFormData.callbackUrl,
      timeout: apiFormData.timeout,
      retryCount: apiFormData.retryCount,
      apiVersion: apiFormData.apiVersion,
      testMode: apiFormData.testMode,
      extraParams: apiFormData.extraParams,
    } as any;

    let resp;
    if (props.editData?.id) {
      resp = await requestClient.put(
        `/third-party-channels/${props.editData.id}`,
        payload,
      );
    } else {
      resp = await requestClient.post('/third-party-channels', payload);
    }

    const data = resp.data;
    if (data?.success !== false) {
      message.success('提现通道配置保存成功');
      emit('success');
      emit('update:visible', false);
    } else {
      message.error(data?.message || '保存失败');
    }
  } catch (error: any) {
    console.error('❌ Save channel config error:', error);
    if (error?.errorInfo) {
      message.error('请检查表单必填项');
    } else {
      message.error(`保存失败: ${error.message || '未知错误'}`);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.gap-3 {
  gap: 12px;
}
</style>
