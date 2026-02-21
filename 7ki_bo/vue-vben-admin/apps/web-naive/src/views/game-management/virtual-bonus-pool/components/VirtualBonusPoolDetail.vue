<template>
  <div class="virtual-bonus-pool-detail">
    <n-descriptions :column="2" size="medium" bordered>
      <n-descriptions-item label="ID">
        <n-tag type="info">{{ data?.id || '-' }}</n-tag>
      </n-descriptions-item>

      <n-descriptions-item label="币种">
        <n-tag type="success">{{ data?.currency || '-' }}</n-tag>
      </n-descriptions-item>

      <n-descriptions-item label="展示形式">
        <n-tag type="warning">{{
          getDisplayTypeLabel(data?.displayType)
        }}</n-tag>
      </n-descriptions-item>

      <n-descriptions-item label="展示位置">
        {{ data?.displayPosition || '-' }}
      </n-descriptions-item>

      <n-descriptions-item label="点击跳转位置" :span="2">
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

      <n-descriptions-item label="最大展示金额">
        <span class="amount-text">
          {{ formatAmount(data?.maxAmount) }}
        </span>
      </n-descriptions-item>

      <n-descriptions-item label="最小展示金额">
        <span class="amount-text">
          {{ formatAmount(data?.minAmount) }}
        </span>
      </n-descriptions-item>

      <n-descriptions-item label="小数点位数">
        <n-tag size="small">{{ data?.decimalPlaces || 0 }} 位</n-tag>
      </n-descriptions-item>

      <n-descriptions-item label="金额数字样式">
        <n-tag type="primary">{{
          getNumberStyleLabel(data?.numberStyle)
        }}</n-tag>
      </n-descriptions-item>

      <n-descriptions-item label="背景风格">
        <n-tag type="primary">{{
          getBackgroundStyleLabel(data?.backgroundStyle)
        }}</n-tag>
      </n-descriptions-item>

      <n-descriptions-item label="状态">
        <n-tag :type="data?.status ? 'success' : 'error'">
          {{ data?.status ? '启用' : '禁用' }}
        </n-tag>
      </n-descriptions-item>

      <n-descriptions-item label="备注" :span="2">
        <div class="remark-content">
          {{ data?.remark || '无备注' }}
        </div>
      </n-descriptions-item>

      <n-descriptions-item label="操作人">
        <n-tag type="info">{{ data?.operator || '-' }}</n-tag>
      </n-descriptions-item>

      <n-descriptions-item label="操作时间">
        {{ formatDateTime(data?.operationTime) }}
      </n-descriptions-item>
    </n-descriptions>

    <!-- 预览区域 -->
    <div class="preview-section mt-6">
      <n-card title="样式预览" size="small">
        <div class="preview-container">
          <div
            class="bonus-pool-preview"
            :class="[
              `bg-${data?.backgroundStyle || 'style1'}`,
              `number-${data?.numberStyle || 'style1'}`,
            ]"
          >
            <div class="pool-header">
              <span class="pool-title">虚拟彩金池</span>
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
