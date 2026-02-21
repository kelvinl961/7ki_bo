<template>
  <n-modal v-model:show="showModal" preset="dialog" title="任务详情" style="width: 700px;">
    <template #header>
      <div class="flex items-center gap-2">
        <EyeOutline />
        <span>任务详情</span>
      </div>
    </template>

    <div v-if="taskData" class="space-y-6">
      <!-- 基本信息 -->
      <n-card title="基本信息" size="small">
        <n-descriptions :column="2" label-placement="left" :label-style="{ fontWeight: '500' }">
          <n-descriptions-item label="任务ID">
            {{ taskData.id }}
          </n-descriptions-item>
          <n-descriptions-item label="排序">
            {{ taskData.sortOrder }}
          </n-descriptions-item>
          <n-descriptions-item label="任务条件">
            {{ taskData.title }}
          </n-descriptions-item>
          <n-descriptions-item label="任务类型">
            {{ getTaskTypeLabel(taskData.taskType) }}
          </n-descriptions-item>
          <n-descriptions-item label="任务分类">
            {{ getCategoryLabel(taskData.category) }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="taskData.isActive ? 'success' : 'default'" size="small">
              {{ taskData.isActive ? '启用' : '禁用' }}
            </n-tag>
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 任务描述 -->
      <n-card v-if="taskData.description" title="任务描述" size="small">
        <div class="text-gray-700 leading-relaxed">
          {{ taskData.description }}
        </div>
      </n-card>

      <!-- 奖励信息 -->
      <n-card title="奖励信息" size="small">
        <n-descriptions :column="2" label-placement="left" :label-style="{ fontWeight: '500' }">
          <n-descriptions-item label="奖励类型">
            <n-tag :type="getRewardTypeColor(taskData.rewardType)" size="small">
              {{ getRewardTypeLabel(taskData.rewardType) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="奖励金额">
            <span class="font-medium text-green-600">
              {{ taskData.rewardAmount }} {{ taskData.rewardCurrency || 'BRL' }}
            </span>
          </n-descriptions-item>
          <n-descriptions-item label="活跃度">
            <span class="font-medium text-blue-600">0</span>
          </n-descriptions-item>
          <n-descriptions-item label="提示气泡">
            <n-tag type="default" size="small">关闭</n-tag>
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 规则说明 -->
      <n-card v-if="taskData.ruleDescription" title="规则说明" size="small">
        <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {{ taskData.ruleDescription }}
        </div>
      </n-card>

      <!-- 任务条件 -->
      <n-card v-if="taskData.taskConditions" title="任务条件配置" size="small">
        <n-code :code="JSON.stringify(taskData.taskConditions, null, 2)" language="json" />
      </n-card>

      <!-- 时间设置 -->
      <n-card title="时间设置" size="small">
        <n-descriptions :column="1" label-placement="left" :label-style="{ fontWeight: '500' }">
          <n-descriptions-item label="开始时间">
            {{ taskData.startTime ? formatDateTime(taskData.startTime) : '无限制' }}
          </n-descriptions-item>
          <n-descriptions-item label="结束时间">
            {{ taskData.endTime ? formatDateTime(taskData.endTime) : '无限制' }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 操作信息 -->
      <n-card title="操作信息" size="small">
        <n-descriptions :column="2" label-placement="left" :label-style="{ fontWeight: '500' }">
          <n-descriptions-item label="创建人">
            {{ taskData.createdBy || '--' }}
          </n-descriptions-item>
          <n-descriptions-item label="最后操作人">
            {{ taskData.updatedBy || '--' }}
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">
            {{ formatDateTime(taskData.createdAt) }}
          </n-descriptions-item>
          <n-descriptions-item label="更新时间">
            {{ taskData.updatedAt ? formatDateTime(taskData.updatedAt) : '--' }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>
    </div>

    <template #action>
      <n-space>
        <n-button @click="showModal = false">关闭</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
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

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 获取任务类型标签
const getTaskTypeLabel = (taskType: string) => {
  const typeMap: Record<string, string> = {
    REGISTRATION: '注册任务',
    FIRST_DEPOSIT: '首充任务',
    DAILY_CHECKIN: '每日签到',
    DAILY_BET: '每日投注',
    WEEKLY_BET: '每周投注',
    INVITE_FRIENDS: '邀请好友',
    GAME_PLAY: '游戏体验',
    PROFILE_COMPLETE: '完善资料',
    BANK_BINDING: '银行卡绑定',
    PHONE_VERIFICATION: '手机验证',
    EMAIL_VERIFICATION: '邮箱验证',
    CUSTOM: '自定义任务',
  };
  return typeMap[taskType] || taskType;
};

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    NOVICE_WELFARE: '新人福利',
    DAILY_TASK: '每日任务',
    WEEKLY_TASK: '每周任务',
    THREE_DAY_RANKING: '三日神秘任务',
  };
  return categoryMap[category] || category;
};

// 获取奖励类型标签
const getRewardTypeLabel = (rewardType: string) => {
  const typeMap: Record<string, string> = {
    CASH: '现金（固定）',
    BONUS: '奖金（浮动）',
    POINTS: '积分',
    FREE_SPINS: '免费旋转',
    DISCOUNT: '折扣',
    CUSTOM: '自定义奖励',
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