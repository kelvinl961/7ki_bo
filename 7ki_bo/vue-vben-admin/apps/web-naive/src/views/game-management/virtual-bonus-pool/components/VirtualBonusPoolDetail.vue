<template>
  <div class="virtual-bonus-pool-detail">
    <n-descriptions :column="2" size="medium" bordered>
      <n-descriptions-item label="ID">
        <n-tag type="info">{{ data?.id || '-' }}</n-tag>
      </n-descriptions-item>

      <n-descriptions-item :label="$t('common.currency')">
        <n-tag type="success">{{ data?.currency || '-' }}</n-tag>
      </n-descriptions-item>

      <:label="$t('game.virtualBonusPool.displayForm')">
        <n-tag type="warning">{{
          getDisplayTypeLabel(data?.displayType)
        }}</n-tag>
      </n-descriptions-item>

      <n-descriptions-item :label="$t('game.virtualBonusPool.displayPosition')">
        {{ data?.displayPosition || '-' }}
      </n-descriptions-item>

      <n-descriptions-item :label="$t('game.virtualBonusPool.clickTarget')" :span="2">
        <n-ellipsis style="max-width: 100%">
          <a
            :href="data?.clickTarget"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ data?.clickTarget || '-' }}
          </a>
        </n-ellipsis>
      </n-descriptions-item>

      <:label="$t('game.virtualBonusPool.maxDisplayAmount')">
        <span class="amount-text">
          {{ formatAmount(data?.maxAmount) }}
        </span>
      </n-descriptions-item>

      <:label="$t('game.virtualBonusPool.minDisplayAmount')">
        <span class="amount-text">
          {{ formatAmount(data?.minAmount) }}
        </span>
      </n-descriptions-item>

      <n-descriptions-item :label="$t('game.virtualBonusPool.decimalPlaces')">
        <n-tag size="small">{{ $t('game.virtualBonusPool.decimalPlacesUnit', [data?.decimalPlaces || 0]) }}</n-tag>
      </n-descriptions-item>

      <n-descriptions-item :label="$t('game.virtualBonusPool.numberStyle')">
        <n-tag type="primary">{{
          getNumberStyleLabel(data?.numberStyle)
        }}</n-tag>
      </n-descriptions-item>

      <n-descriptions-item :label="$t('game.virtualBonusPool.backgroundStyle')">
        <n-tag type="primary">{{
          getBackgroundStyleLabel(data?.backgroundStyle)
        }}</n-tag>
      </n-descriptions-item>

      <n-descriptions-item :label="$t('common.status')">
        <n-tag :type="data?.status ? 'success' : 'error'">
          {{ data?.status ? $t('common.enabled') : $t('common.disabled') }}
        </n-tag>
      </n-descriptions-item>

      <n-descriptions-item :label="$t('common.remark')" :span="2">
        <div class="remark-content">
          {{ data?.remark || '{{ $t('game.virtualBonusPool.noRemark') }}' }}
        </div>
      </n-descriptions-item>

      <n-descriptions-item :label="$t('common.operator')">
        <n-tag type="info">{{ data?.operator || '-' }}</n-tag>
      </n-descriptions-item>

      <n-descriptions-item :label="$t('common.operationTime')">
        {{ formatDateTime(data?.operationTime) }}
      </n-descriptions-item>
    </n-descriptions>

    
    <div class="preview-section mt-6">
      <:title="$t('game.virtualBonusPool.stylePreview')" size="small">
        <div class="preview-container">
          <div
            class="bonus-pool-preview"
            :class="[
              `bg-${data?.backgroundStyle || 'style1'}`,
              `number-${data?.numberStyle || 'style1'}`,
            ]"
          >
            <div class="pool-header">
              <span class="pool-title">{{ $t('game.virtualBonusPool.poolTitle') }}</span>
              <span class="pool-position">{{ data?.displayPosition }}</span>
            </div>
            <div class="pool-amount">
              <span class="currency">{{
                getCurrencySymbol(data?.currency)
              }}</span>
              <span class="amount">{{ getPreviewAmount() }}</span>
            </div>
            <div class="pool-footer">
              <span class="pool-type">{{
                getDisplayTypeLabel(data?.displayType)
              }}</span>
            </div>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { computed } from 'vue';
import {
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NEllipsis,
  NCard,
} from 'naive-ui';

// Props
interface Props {
  data?: any;
}

const props = defineProps<Props>();

// Options for mapping
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

// Helper functions
const getDisplayTypeLabel = (value?: string) => {
  const option = displayTypeOptions.find((opt) => opt.value === value);
  return option?.label || value || '-';
};

const getNumberStyleLabel = (value?: string) => {
  const option = numberStyleOptions.find((opt) => opt.value === value);
  return option?.label || value || '-';
};

const getBackgroundStyleLabel = (value?: string) => {
  const option = backgroundStyleOptions.find((opt) => opt.value === value);
  return option?.label || value || '-';
};

const formatAmount = (amount?: number) => {
  if (typeof amount !== 'number') return '-';
  return amount.toLocaleString();
};

const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('zh-CN');
};

const getCurrencySymbol = (currency?: string) => {
  const currencyMap: Record<string, string> = {
    '巴西(BRL)': 'R$',
    '美元(USD)': '$',
    '欧元(EUR)': '€',
    '人民币(CNY)': '¥',
    '日元(JPY)': '¥',
  };
  return currencyMap[currency || ''] || '$';
};

const getPreviewAmount = () => {
  if (!props.data) return '0.00';

  const {
    displayType,
    minAmount = 0,
    maxAmount = 0,
    decimalPlaces = 2,
  } = props.data;

  let amount = 0;
  switch (displayType) {
    case 'fixed':
      amount = maxAmount;
      break;
    case 'random':
      amount = Math.random() * (maxAmount - minAmount) + minAmount;
      break;
    case 'realtime':
      amount =
        minAmount +
        ((Math.sin(Date.now() / 1000) + 1) * (maxAmount - minAmount)) / 2;
      break;
    case 'increment':
      amount =
        minAmount + ((Date.now() % 10000) / 10000) * (maxAmount - minAmount);
      break;
    default:
      amount = maxAmount;
  }

  return amount.toFixed(decimalPlaces);
};
</script>

<style scoped>
.virtual-bonus-pool-detail {
  max-width: 100%;
  overflow: hidden;
}

.amount-text {
  font-weight: 600;
  color: #52c41a;
  font-family: 'Monaco', 'Consolas', monospace;
}

.remark-content {
  max-width: 100%;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.preview-section {
  margin-top: 1.5rem;
}

.preview-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
}

.bonus-pool-preview {
  width: 300px;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

/* Background styles */
.bg-style1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.bg-style2 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.bg-style3 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.bg-style4 {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #333;
}

.pool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.pool-title {
  font-weight: 600;
}

.pool-position {
  font-size: 0.8rem;
  opacity: 0.8;
}

.pool-amount {
  margin: 1.5rem 0;
}

.currency {
  font-size: 1.2rem;
  font-weight: 500;
  margin-right: 0.5rem;
}

.amount {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: 'Monaco', 'Consolas', monospace;
}

/* Number styles */
.number-style1 .amount {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.number-style2 .amount {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.number-style3 .amount {
  border: 2px solid currentColor;
  border-radius: 8px;
  padding: 0.2rem 0.5rem;
}

.number-style4 .amount {
  position: relative;
}

.number-style4 .amount::before {
  content: '';
  position: absolute;
  inset: -4px;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  border-radius: 8px;
  z-index: -1;
}

.pool-footer {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-top: 1rem;
}

.pool-type {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-weight: 500;
}
</style>
