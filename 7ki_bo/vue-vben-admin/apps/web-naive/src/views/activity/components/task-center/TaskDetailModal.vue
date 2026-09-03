<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="$t('activity.taskDetail.k4efb')"
    style="width: 700px"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <EyeOutline />
        <span>{{ $t('activity.taskDetail.k4efb') }}</span>
      </div>
    </template>

    <div v-if="taskData" class="space-y-6">
      <!-- 基本信息 -->
      <n-card :title="$t('activity.detailModal.k57fa')" size="small">
        <n-descriptions
          :column="2"
          label-placement="left"
          :label-style="{ fontWeight: '500' }"
        >
          <n-descriptions-item :label="$t('activity.taskDetail.k4efb2')">
            {{ taskData.id }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('activity.detailModal.k6392')">
            {{ taskData.sortOrder }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('activity.noviceWelfare.k4efb')">
            {{ taskData.title }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('activity.taskDetail.k4efb3')">
            {{ getTaskTypeLabel(taskData.taskType) }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('activity.taskDetail.k4efb4')">
            {{ getCategoryLabel(taskData.category) }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('activity.activityList.k72b6')">
            <n-tag
              :type="taskData.isActive ? 'success' : 'default'"
              size="small"
            >
              {{ taskData.isActive ? $t('activity.common.enabledTag') : $t('activity.common.disabledTag') }}
            </n-tag>
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 任务描述 -->
      <n-card v-if="taskData.description" :title="$t('activity.taskDetail.k4efb5')" size="small">
        <div class="leading-relaxed text-gray-700">
          {{ taskData.description }}
        </div>
      </n-card>

      <!-- 奖励信息 -->
      <n-card :title="$t('activity.taskDetail.k5956')" size="small">
        <n-descriptions
          :column="2"
          label-placement="left"
          :label-style="{ fontWeight: '500' }"
        >
          <n-descriptions-item :label="$t('activity.rewardReport.k5956')">
            <n-tag :type="getRewardTypeColor(taskData.rewardType)" size="small">
              {{ getRewardTypeLabel(taskData.rewardType) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item :label="$t('activity.formModal.k5956')">
            <span class="font-medium text-green-600">
              {{ taskData.rewardAmount }} {{ taskData.rewardCurrency || 'BRL' }}
            </span>
          </n-descriptions-item>
          <n-descriptions-item :label="$t('activity.rewardReport.k6d3b5')">
            <span class="font-medium text-blue-600">0</span>
          </n-descriptions-item>
          <n-descriptions-item :label="$t('activity.noviceWelfare.k63d0')">
            <n-tag type="default" size="small">{{ $t('activity.activityList.k5173') }}</n-tag>
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 规则说明 -->
      <n-card v-if="taskData.ruleDescription" :title="$t('activity.formModal.k89c4')" size="small">
        <div class="whitespace-pre-wrap leading-relaxed text-gray-700">
          {{ taskData.ruleDescription }}
        </div>
      </n-card>

      <!-- 任务条件 -->
      <n-card v-if="taskData.taskConditions" :title="$t('activity.taskDetail.k4efb6')" size="small">
        <n-code
          :code="JSON.stringify(taskData.taskConditions, null, 2)"
          language="json"
        />
      </n-card>

      <!-- 时间设置 -->
      <n-card :title="$t('activity.taskDetail.k65f6')" size="small">
        <n-descriptions
          :column="1"
          label-placement="left"
          :label-style="{ fontWeight: '500' }"
        >
          <n-descriptions-item :label="$t('activity.formModal.k5f00')">
            <TzDateTime
              v-if="taskData.startTime"
              :value="taskData.startTime"
            />
            <span v-else>{{ $t('activity.common.unlimited') }}</span>
          </n-descriptions-item>
          <n-descriptions-item :label="$t('activity.formModal.k7ed3')">
            <TzDateTime v-if="taskData.endTime" :value="taskData.endTime" />
            <span v-else>{{ $t('activity.common.unlimited') }}</span>
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 操作信息 -->
      <n-card :title="$t('activity.taskDetail.k64cd')" size="small">
        <n-descriptions
          :column="2"
          label-placement="left"
          :label-style="{ fontWeight: '500' }"
        >
          <n-descriptions-item :label="$t('activity.taskDetail.k521b')">
            {{ taskData.createdBy || '--' }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('activity.taskDetail.k6700')">
            {{ taskData.updatedBy || '--' }}
          </n-descriptions-item>
          <n-descriptions-item :label="$t('activity.providentFund.k521b')">
            <TzDateTime :value="taskData.createdAt" />
          </n-descriptions-item>
          <n-descriptions-item :label="$t('activity.detailModal.k66f4')">
            <TzDateTime :value="taskData.updatedAt" fallback="--" />
          </n-descriptions-item>
        </n-descriptions>
      </n-card>
    </div>

    <template #action>
      <n-space>
        <n-button @click="showModal = false">{{ $t('activity.activityList.k5173') }}</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { computed } from 'vue';
import {
  NModal,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NButton,
  NSpace,
  NCode,
} from 'naive-ui';
import { EyeOutline } from '@vicons/ionicons5';
import TzDateTime from '#/components/common/TzDateTime.vue';
import type { TaskCenter } from '#/api/taskCenter';

interface Props {
  show: boolean;
  taskData: TaskCenter | null;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

// 获取任务类型标签
const getTaskTypeLabel = (taskType: string) => {
  const typeMap: Record<string, string> = {
    CASH: $t('activity.rewardTypes.CASH'),
    BONUS: $t('activity.rewardTypes.BONUS'),
    POINTS: $t('activity.rewardTypes.POINTS'),
    FREE_SPINS: $t('activity.rewardTypes.FREE_SPINS'),
    DISCOUNT: $t('activity.rewardTypes.DISCOUNT'),
    CUSTOM: $t('activity.rewardTypes.CUSTOM'),
  };
  return typeMap[rewardType] || rewardType;
};

// 获取奖励类型颜色
const getRewardTypeColor = (rewardType: string) => {
  const colorMap: Record<string, string> = {
    CASH: 'success',
    BONUS: 'warning',
    POINTS: 'info',
    FREE_SPINS: 'primary',
    DISCOUNT: 'secondary',
    CUSTOM: 'default',
  };
  return colorMap[rewardType] || 'default';
};
</script>

<style scoped>
:deep(.n-card) {
  margin-bottom: 0;
}

:deep(.n-card .n-card-header) {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.n-card .n-card__content) {
  padding: 16px;
}

:deep(.n-descriptions-item-label) {
  color: #666;
}

:deep(.n-descriptions-item-content) {
  color: #333;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}
</style>
