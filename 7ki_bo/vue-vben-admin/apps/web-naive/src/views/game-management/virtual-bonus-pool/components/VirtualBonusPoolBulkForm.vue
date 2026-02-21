<template>
  <div>
    <div class="mb-4">
      <n-alert type="info" title="批量修改说明">
        <p>
          当前选中了
          <strong>{{ selectedItems.length }}</strong> 个虚拟彩金池配置。
        </p>
        <p>只需填写要修改的字段，未填写的字段将保持原值不变。</p>
      </n-alert>
    </div>

    <!-- 选中项目预览 -->
    <div class="mb-6">
      <n-card title="选中的项目" size="small">
        <div class="selected-items-grid">
          <div
            v-for="item in selectedItems"
            :key="item.id"
            class="selected-item"
          >
            <n-tag type="info" size="small"> ID: {{ item.id }} </n-tag>
            <span class="item-currency">{{ item.currency }}</span>
            <span class="item-position">{{ item.displayPosition }}</span>
          </div>
        </div>
      </n-card>
    </div>

    <n-form
      ref="formRef"
      :model="formData"
      label-placement="left"
      label-width="auto"
      size="medium"
    >
      <n-grid :cols="2" :x-gap="16" :y-gap="16">
        <!-- 展示形式 -->
        <n-form-item-gi label="展示形式">
          <n-checkbox
            v-model:checked="enableFields.displayType"
            @update:checked="handleFieldToggle('displayType', $event)"
          >
            修改展示形式
          </n-checkbox>
          <n-select
            v-model:value="formData.displayType"
            placeholder="选择展示形式"
            :options="displayTypeOptions"
            :disabled="!enableFields.displayType"
            class="mt-2"
          />
        </n-form-item-gi>

        <!-- 金额数字样式 -->
        <n-form-item-gi label="金额数字样式">
          <n-checkbox
            v-model:checked="enableFields.numberStyle"
            @update:checked="handleFieldToggle('numberStyle', $event)"
          >
            修改数字样式
          </n-checkbox>
          <n-select
            v-model:value="formData.numberStyle"
            placeholder="选择数字样式"
            :options="numberStyleOptions"
            :disabled="!enableFields.numberStyle"
            class="mt-2"
          />
        </n-form-item-gi>

        <!-- 背景风格 -->
        <n-form-item-gi label="背景风格">
          <n-checkbox
            v-model:checked="enableFields.backgroundStyle"
            @update:checked="handleFieldToggle('backgroundStyle', $event)"
          >
            修改背景风格
          </n-checkbox>
          <n-select
            v-model:value="formData.backgroundStyle"
            placeholder="选择背景风格"
            :options="backgroundStyleOptions"
            :disabled="!enableFields.backgroundStyle"
            class="mt-2"
          />
        </n-form-item-gi>

        <!-- 小数点位数 -->
        <n-form-item-gi label="小数点位数">
          <n-checkbox
            v-model:checked="enableFields.decimalPlaces"
            @update:checked="handleFieldToggle('decimalPlaces', $event)"
          >
            修改小数点位数
          </n-checkbox>
          <n-input-number
            v-model:value="formData.decimalPlaces"
            placeholder="小数点位数"
            style="width: 100%"
            :min="0"
            :max="8"
            :precision="0"
            :disabled="!enableFields.decimalPlaces"
            show-button
            class="mt-2"
          />
        </n-form-item-gi>

        <!-- 状态 -->
        <n-form-item-gi label="状态">
          <n-checkbox
            v-model:checked="enableFields.status"
            @update:checked="handleFieldToggle('status', $event)"
          >
            修改状态
          </n-checkbox>
          <div class="mt-2">
            <n-switch
              v-model:value="formData.status"
              :disabled="!enableFields.status"
            />
            <span class="ml-2 text-sm text-gray-600">
              {{ formData.status ? '启用' : '禁用' }}
            </span>
          </div>
        </n-form-item-gi>

        <!-- 最大展示金额调整 -->
        <n-form-item-gi label="最大金额调整">
          <n-checkbox
            v-model:checked="enableFields.maxAmountAdjustment"
            @update:checked="handleFieldToggle('maxAmountAdjustment', $event)"
          >
            调整最大金额
          </n-checkbox>
          <div class="mt-2" v-if="enableFields.maxAmountAdjustment">
            <n-radio-group v-model:value="formData.maxAmountAdjustmentType">
              <n-radio value="multiply">乘以倍数</n-radio>
              <n-radio value="add">增加固定值</n-radio>
              <n-radio value="set">设置为固定值</n-radio>
            </n-radio-group>
            <n-input-number
              v-model:value="formData.maxAmountAdjustmentValue"
              :placeholder="getAmountPlaceholder('max')"
              style="width: 100%; margin-top: 8px"
              :min="0"
              :precision="2"
              show-button
            />
          </div>
        </n-form-item-gi>

        <!-- 最小展示金额调整 -->
        <n-form-item-gi label="最小金额调整">
          <n-checkbox
            v-model:checked="enableFields.minAmountAdjustment"
            @update:checked="handleFieldToggle('minAmountAdjustment', $event)"
          >
            调整最小金额
          </n-checkbox>
          <div class="mt-2" v-if="enableFields.minAmountAdjustment">
            <n-radio-group v-model:value="formData.minAmountAdjustmentType">
              <n-radio value="multiply">乘以倍数</n-radio>
              <n-radio value="add">增加固定值</n-radio>
              <n-radio value="set">设置为固定值</n-radio>
            </n-radio-group>
            <n-input-number
              v-model:value="formData.minAmountAdjustmentValue"
              :placeholder="getAmountPlaceholder('min')"
              style="width: 100%; margin-top: 8px"
              :min="0"
              :precision="2"
              show-button
            />
          </div>
        </n-form-item-gi>

        <!-- 备注 -->
        <n-form-item-gi label="备注" :span="2">
          <n-checkbox
            v-model:checked="enableFields.remark"
            @update:checked="handleFieldToggle('remark', $event)"
          >
            修改备注
          </n-checkbox>
          <n-input
            v-model:value="formData.remark"
            type="textarea"
            placeholder="输入新的备注信息"
            :autosize="{ minRows: 3, maxRows: 6 }"
            :disabled="!enableFields.remark"
            class="mt-2"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <!-- 预览变更 -->
    <div v-if="hasEnabledFields" class="mt-6">
      <n-card title="变更预览" size="small">
        <div class="changes-preview">
          <div
            v-for="(field, key) in enabledChanges"
            :key="key"
            class="change-item"
          >
            <n-tag type="warning" size="small">{{ getFieldLabel(key) }}</n-tag>
            <span class="change-description">{{
              getChangeDescription(key, field)
            }}</span>
          </div>
        </div>
      </n-card>
    </div>

    <div class="mt-6 flex justify-end gap-3">
      <n-button @click="handleCancel">取消</n-button>
      <n-button
        type="primary"
        @click="handleSubmit"
        :loading="submitting"
        :disabled="!hasEnabledFields"
      >
        应用批量修改
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import {
  NForm,
  NFormItemGi,
  NGrid,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  NButton,
  NCheckbox,
  NRadioGroup,
  NRadio,
  NTag,
  NCard,
  NAlert,
  useMessage,
  type FormInst,
} from 'naive-ui';

// Props
interface Props {
  selectedItems: any[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  submit: [data: any];
  cancel: [];
}>();

// Message
const message = useMessage();

// Form ref
const formRef = ref<FormInst>();
const submitting = ref(false);

// Enable/disable fields
const enableFields = reactive({
  displayType: false,
  numberStyle: false,
  backgroundStyle: false,
  decimalPlaces: false,
  status: false,
  maxAmountAdjustment: false,
  minAmountAdjustment: false,
  remark: false,
});

// Form data
const formData = reactive({
  displayType: '',
  numberStyle: '',
  backgroundStyle: '',
  decimalPlaces: 2,
  status: true,
  maxAmountAdjustmentType: 'multiply',
  maxAmountAdjustmentValue: 1,
  minAmountAdjustmentType: 'multiply',
  minAmountAdjustmentValue: 1,
  remark: '',
});

// Options
const displayTypeOptions = [
  { label: '固定金额', value: 'fixed' },
  { label: '随机金额', value: 'random' },
  { label: '实时更新', value: 'realtime' },
  { label: '递增金额', value: 'increment' },
];

const numberStyleOptions = [
  { label: '样式一', value: 'style1' },
  { label: '样式二', value: 'style2' },
  { label: '样式三', value: 'style3' },
  { label: '样式四', value: 'style4' },
];

const backgroundStyleOptions = [
  { label: '样式一', value: 'style1' },
  { label: '样式二', value: 'style2' },
  { label: '样式三', value: 'style3' },
  { label: '样式四', value: 'style4' },
];

// Computed
const hasEnabledFields = computed(() => {
  return Object.values(enableFields).some((enabled) => enabled);
});

const enabledChanges = computed(() => {
  const changes: Record<string, any> = {};
  Object.keys(enableFields).forEach((key) => {
    if (enableFields[key as keyof typeof enableFields]) {
      changes[key] = formData[key as keyof typeof formData];
    }
  });
  return changes;
});

// Methods
const handleFieldToggle = (field: string, enabled: boolean) => {
  if (!enabled) {
    // Reset field value when disabled
    if (field === 'status') {
      formData.status = true;
    } else if (field === 'decimalPlaces') {
      formData.decimalPlaces = 2;
    } else if (field.includes('AmountAdjustment')) {
      if (field === 'maxAmountAdjustment') {
        formData.maxAmountAdjustmentType = 'multiply';
        formData.maxAmountAdjustmentValue = 1;
      } else {
        formData.minAmountAdjustmentType = 'multiply';
        formData.minAmountAdjustmentValue = 1;
      }
    } else {
      (formData as any)[field] = '';
    }
  }
};

const getAmountPlaceholder = (type: 'max' | 'min') => {
  const adjustmentType =
    type === 'max'
      ? formData.maxAmountAdjustmentType
      : formData.minAmountAdjustmentType;
  switch (adjustmentType) {
    case 'multiply':
      return '输入倍数 (如: 1.5)';
    case 'add':
      return '输入增加的金额';
    case 'set':
      return '输入新的固定金额';
    default:
      return '输入数值';
  }
};

const getFieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    displayType: '展示形式',
    numberStyle: '金额数字样式',
    backgroundStyle: '背景风格',
    decimalPlaces: '小数点位数',
    status: '状态',
    maxAmountAdjustment: '最大金额调整',
    minAmountAdjustment: '最小金额调整',
    remark: '备注',
  };
  return labels[field] || field;
};

const getChangeDescription = (field: string, value: any) => {
  switch (field) {
    case 'displayType':
      const displayOption = displayTypeOptions.find(
        (opt) => opt.value === value,
      );
      return `→ ${displayOption?.label || value}`;
    case 'numberStyle':
      const numberOption = numberStyleOptions.find(
        (opt) => opt.value === value,
      );
      return `→ ${numberOption?.label || value}`;
    case 'backgroundStyle':
      const bgOption = backgroundStyleOptions.find(
        (opt) => opt.value === value,
      );
      return `→ ${bgOption?.label || value}`;
    case 'decimalPlaces':
      return `→ ${value} 位`;
    case 'status':
      return `→ ${value ? '启用' : '禁用'}`;
    case 'maxAmountAdjustment':
      const maxType = formData.maxAmountAdjustmentType;
      const maxValue = formData.maxAmountAdjustmentValue;
      return `→ ${maxType === 'multiply' ? '乘以' : maxType === 'add' ? '增加' : '设为'} ${maxValue}`;
    case 'minAmountAdjustment':
      const minType = formData.minAmountAdjustmentType;
      const minValue = formData.minAmountAdjustmentValue;
      return `→ ${minType === 'multiply' ? '乘以' : minType === 'add' ? '增加' : '设为'} ${minValue}`;
    case 'remark':
      return `→ ${value || '清空备注'}`;
    default:
      return `→ ${value}`;
  }
};

const handleSubmit = () => {
  if (!hasEnabledFields.value) {
    message.warning('请至少选择一个要修改的字段');
    return;
  }

  submitting.value = true;

  // Prepare submission data
  const changes = {
    selectedIds: props.selectedItems.map((item) => item.id),
    enabledFields: { ...enableFields },
    changes: { ...enabledChanges.value },
    formData: { ...formData },
  };

  setTimeout(() => {
    emit('submit', changes);
    submitting.value = false;
  }, 1000);
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.selected-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.selected-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.item-currency {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
}

.item-position {
  font-size: 0.8rem;
  color: #6c757d;
}

.changes-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.change-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.change-item:last-child {
  border-bottom: none;
}

.change-description {
  font-size: 0.9rem;
  color: #495057;
  font-family: 'Monaco', 'Consolas', monospace;
}

.n-form-item-gi {
  --n-label-font-weight: 500;
}

.n-checkbox {
  margin-bottom: 8px;
}

.mt-2 {
  margin-top: 8px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
