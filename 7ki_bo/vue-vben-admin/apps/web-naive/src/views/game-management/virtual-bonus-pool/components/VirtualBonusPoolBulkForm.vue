<template>
  <div>
    <div class="mb-4">
      <n-alert type="info" :title="$t('game.virtualBonusPool.bulkEditHint')">
        <p>
          {{ $t('game.virtualBonusPool.bulkEditDesc1') }}
          <strong>{{ selectedItems.length }}</strong> {{ $t('game.virtualBonusPool.bulkEditDesc2') }}
        </p>
        <p>{{ $t('game.virtualBonusPool.bulkEditDesc3') }}</p>
      </n-alert>
    </div>

    
    <div class="mb-6">
      <n-card :title="$t('game.virtualBonusPool.selectedItems')" size="small">
        <div class="selected-items-grid">
          <div
            v-for="item in selectedItems"
            :key="item.id"
            class="selected-item"
          >
            <n-tag type="info" size="small"> ID: {{ item.id }} </n-tag>
            <span class="item-currency">{{ item.currency }}</span>
            <span class="item-position">{{ getDisplayPositionLabel(item.displayPosition) }}</span>
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
        
        <n-form-item-gi :label="$t('game.virtualBonusPool.displayForm')">
          <n-checkbox
            v-model:checked="enableFields.displayType"
            @update:checked="handleFieldToggle('displayType', $event)"
          >
            {{ $t('game.virtualBonusPool.modifyDisplayType') }}
          </n-checkbox>
          <n-select
            v-model:value="formData.displayType"
            :placeholder="$t('game.virtualBonusPool.selectDisplayType')"
            :options="displayTypeOptions"
            :disabled="!enableFields.displayType"
            class="mt-2"
          />
        </n-form-item-gi>

        
        <n-form-item-gi :label="$t('game.virtualBonusPool.numberStyle')">
          <n-checkbox
            v-model:checked="enableFields.numberStyle"
            @update:checked="handleFieldToggle('numberStyle', $event)"
          >
            {{ $t('game.virtualBonusPool.modifyNumberStyle') }}
          </n-checkbox>
          <n-select
            v-model:value="formData.numberStyle"
            :placeholder="$t('game.virtualBonusPool.selectNumberStyle')"
            :options="numberStyleOptions"
            :disabled="!enableFields.numberStyle"
            class="mt-2"
          />
        </n-form-item-gi>

        
        <n-form-item-gi :label="$t('game.virtualBonusPool.backgroundStyle')">
          <n-checkbox
            v-model:checked="enableFields.backgroundStyle"
            @update:checked="handleFieldToggle('backgroundStyle', $event)"
          >
            {{ $t('game.virtualBonusPool.modifyBgStyle') }}
          </n-checkbox>
          <n-select
            v-model:value="formData.backgroundStyle"
            :placeholder="$t('game.virtualBonusPool.selectBgStyle')"
            :options="backgroundStyleOptions"
            :disabled="!enableFields.backgroundStyle"
            class="mt-2"
          />
        </n-form-item-gi>

        
        <n-form-item-gi :label="$t('game.virtualBonusPool.decimalPlaces')">
          <n-checkbox
            v-model:checked="enableFields.decimalPlaces"
            @update:checked="handleFieldToggle('decimalPlaces', $event)"
          >
            {{ $t('game.virtualBonusPool.modifyDecimalPlaces') }}
          </n-checkbox>
          <n-input-number
            v-model:value="formData.decimalPlaces"
            :placeholder="$t('game.virtualBonusPool.enterDecimalPlaces')"
            style="width: 100%"
            :min="0"
            :max="8"
            :precision="0"
            :disabled="!enableFields.decimalPlaces"
            show-button
            class="mt-2"
          />
        </n-form-item-gi>

        
        <n-form-item-gi :label="$t('common.status')">
          <n-checkbox
            v-model:checked="enableFields.status"
            @update:checked="handleFieldToggle('status', $event)"
          >
            {{ $t('game.virtualBonusPool.modifyStatus') }}
          </n-checkbox>
          <div class="mt-2">
            <n-switch
              v-model:value="formData.status"
              :disabled="!enableFields.status"
            />
            <span class="ml-2 text-sm text-gray-600">
              {{ formData.status ? $t('common.enabled') : $t('common.disabled') }}
            </span>
          </div>
        </n-form-item-gi>

        
        <n-form-item-gi :label="$t('game.virtualBonusPool.maxAmountAdjust')">
          <n-checkbox
            v-model:checked="enableFields.maxAmountAdjustment"
            @update:checked="handleFieldToggle('maxAmountAdjustment', $event)"
          >
            {{ $t('game.virtualBonusPool.adjustMaxAmount') }}
          </n-checkbox>
          <div class="mt-2" v-if="enableFields.maxAmountAdjustment">
            <n-radio-group v-model:value="formData.maxAmountAdjustmentType">
              <n-radio value="multiply">{{ $t('game.virtualBonusPool.multiply') }}</n-radio>
              <n-radio value="add">{{ $t('game.virtualBonusPool.addFixed') }}</n-radio>
              <n-radio value="set">{{ $t('game.virtualBonusPool.setFixed') }}</n-radio>
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

        
        <n-form-item-gi :label="$t('game.virtualBonusPool.minAmountAdjust')">
          <n-checkbox
            v-model:checked="enableFields.minAmountAdjustment"
            @update:checked="handleFieldToggle('minAmountAdjustment', $event)"
          >
            {{ $t('game.virtualBonusPool.adjustMinAmount') }}
          </n-checkbox>
          <div class="mt-2" v-if="enableFields.minAmountAdjustment">
            <n-radio-group v-model:value="formData.minAmountAdjustmentType">
              <n-radio value="multiply">{{ $t('game.virtualBonusPool.multiply') }}</n-radio>
              <n-radio value="add">{{ $t('game.virtualBonusPool.addFixed') }}</n-radio>
              <n-radio value="set">{{ $t('game.virtualBonusPool.setFixed') }}</n-radio>
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

        
        <n-form-item-gi :label="$t('common.remark')" :span="2">
          <n-checkbox
            v-model:checked="enableFields.remark"
            @update:checked="handleFieldToggle('remark', $event)"
          >
            {{ $t('game.virtualBonusPool.modifyRemark') }}
          </n-checkbox>
          <n-input
            v-model:value="formData.remark"
            type="textarea"
            :placeholder="$t('game.virtualBonusPool.enterNewRemark')"
            :autosize="{ minRows: 3, maxRows: 6 }"
            :disabled="!enableFields.remark"
            class="mt-2"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    
    <div v-if="hasEnabledFields" class="mt-6">
      <n-card :title="$t('game.virtualBonusPool.changePreview')" size="small">
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
      <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
      <n-button
        type="primary"
        @click="handleSubmit"
        :loading="submitting"
        :disabled="!hasEnabledFields"
      >
        {{ $t('game.virtualBonusPool.applyBulkEdit') }}
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

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

import { getDisplayPositionLabel } from '#/utils/gameTypeI18n';

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
  { label: $t('game.virtualBonusPool.fixedAmount'), value: 'fixed' },
  { label: $t('game.virtualBonusPool.randomAmount'), value: 'random' },
  { label: $t('game.virtualBonusPool.realtimeUpdate'), value: 'realtime' },
  { label: $t('game.virtualBonusPool.incrementAmount'), value: 'increment' },
];

const numberStyleOptions = [
  { label: $t('game.virtualBonusPool.style1'), value: 'style1' },
  { label: $t('game.virtualBonusPool.style2'), value: 'style2' },
  { label: $t('game.virtualBonusPool.style3'), value: 'style3' },
  { label: $t('game.virtualBonusPool.style4'), value: 'style4' },
];

const backgroundStyleOptions = [
  { label: $t('game.virtualBonusPool.style1'), value: 'style1' },
  { label: $t('game.virtualBonusPool.style2'), value: 'style2' },
  { label: $t('game.virtualBonusPool.style3'), value: 'style3' },
  { label: $t('game.virtualBonusPool.style4'), value: 'style4' },
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
      return $t('game.virtualBonusPool.enterMultiplier');
    case 'add':
      return $t('game.virtualBonusPool.enterAddAmount');
    case 'set':
      return $t('game.virtualBonusPool.enterNewFixedAmount');
    default:
      return $t('game.virtualBonusPool.enterValue');
  }
};

const getFieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    displayType: $t('game.virtualBonusPool.displayType'),
    numberStyle: $t('game.virtualBonusPool.numberStyle'),
    backgroundStyle: $t('game.virtualBonusPool.backgroundStyle'),
    decimalPlaces: $t('game.virtualBonusPool.decimalPlaces'),
    status: $t('common.status'),
    maxAmountAdjustment: $t('game.virtualBonusPool.maxAmountAdjust'),
    minAmountAdjustment: $t('game.virtualBonusPool.minAmountAdjust'),
    remark: $t('common.remark'),
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
      return `→ ${$t('game.virtualBonusPool.decimalPlacesUnit', [value])}`;
    case 'status':
      return `→ ${value ? $t('common.enabled') : $t('common.disabled')}`;
    case 'maxAmountAdjustment':
      const maxType = formData.maxAmountAdjustmentType;
      const maxValue = formData.maxAmountAdjustmentValue;
      return `→ ${$t('game.virtualBonusPool.adjustOp' + (maxType === 'multiply' ? 'Multiply' : maxType === 'add' ? 'Add' : 'Set'))} ${maxValue}`;
    case 'minAmountAdjustment':
      const minType = formData.minAmountAdjustmentType;
      const minValue = formData.minAmountAdjustmentValue;
      return `→ ${$t('game.virtualBonusPool.adjustOp' + (minType === 'multiply' ? 'Multiply' : minType === 'add' ? 'Add' : 'Set'))} ${minValue}`;
    case 'remark':
      return `→ ${value || $t('game.virtualBonusPool.clearRemark')}`;
    default:
      return `→ ${value}`;
  }
};

const handleSubmit = () => {
  if (!hasEnabledFields.value) {
    message.warning($t('game.virtualBonusPool.selectAtLeastOneField'));
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
