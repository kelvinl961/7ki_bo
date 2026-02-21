<template>
  <n-modal
    v-model:show="modalVisible"
    preset="card"
    title="任务详情"
    size="large"
    :mask-closable="false"
    style="width: 80vw; max-width: 800px"
  >
    <n-spin :show="loading">
      <div v-if="taskDetail" class="task-detail-content">
        <n-descriptions
          :columns="2"
          bordered
          label-placement="left"
          label-style="font-weight: 500; width: 140px"
        >
          <n-descriptions-item label="任务标题">
            {{ taskDetail.title }}
          </n-descriptions-item>

          <n-descriptions-item label="任务类型">
            {{ getTaskTypeLabel(taskDetail.taskType) }}
          </n-descriptions-item>

          <n-descriptions-item label="任务分类">
            {{ getCategoryLabel(taskDetail.category) }}
          </n-descriptions-item>

          <n-descriptions-item label="排序">
            {{ taskDetail.sortOrder }}
          </n-descriptions-item>

          <n-descriptions-item label="状态">
            <n-tag :type="taskDetail.isActive ? 'success' : 'error'">
              {{ taskDetail.isActive ? '启用' : '停用' }}
            </n-tag>
          </n-descriptions-item>

          <n-descriptions-item label="奖励类型">
            <n-tag :type="getRewardTypeColor(taskDetail.rewardType)">
              {{ getRewardTypeLabel(taskDetail.rewardType) }}
            </n-tag>
          </n-descriptions-item>

          <n-descriptions-item label="奖励金额">
            {{ taskDetail.rewardAmount }} {{ taskDetail.rewardCurrency }}
          </n-descriptions-item>

          <n-descriptions-item label="参与人数">
            {{ taskDetail.statistics.totalParticipants }}
          </n-descriptions-item>

          <n-descriptions-item label="完成人数">
            {{ taskDetail.statistics.completedCount }}
          </n-descriptions-item>

          <n-descriptions-item label="已领取人数">
            {{ taskDetail.statistics.claimedCount }}
          </n-descriptions-item>

          <n-descriptions-item label="完成率">
            {{ taskDetail.statistics.completionRate }}%
          </n-descriptions-item>

          <n-descriptions-item label="领取率">
            {{ taskDetail.statistics.claimRate }}%
          </n-descriptions-item>

          <n-descriptions-item label="支持平台">
            <n-space>
              <n-tag v-if="taskDetail.platforms.android" size="small"
                >Android</n-tag
              >
              <n-tag v-if="taskDetail.platforms.ios" size="small">iOS</n-tag>
              <n-tag v-if="taskDetail.platforms.h5" size="small">H5</n-tag>
              <n-tag v-if="taskDetail.platforms.pc" size="small">PC</n-tag>
            </n-space>
          </n-descriptions-item>

          <n-descriptions-item label="领取入口">
            <n-space>
              <n-tag v-if="taskDetail.claimEntrance.androidApp" size="small"
                >Android APP</n-tag
              >
              <n-tag v-if="taskDetail.claimEntrance.iosApp" size="small"
                >iOS APP</n-tag
              >
              <n-tag v-if="taskDetail.claimEntrance.h5" size="small">H5</n-tag>
              <n-tag v-if="taskDetail.claimEntrance.pc" size="small">PC</n-tag>
            </n-space>
          </n-descriptions-item>

          <n-descriptions-item label="领取方式">
            {{ taskDetail.claimMethod === 'MANUAL' ? '手动领取' : '自动领取' }}
          </n-descriptions-item>

          <n-descriptions-item label="领取时间">
            {{
              taskDetail.claimTimeType === 'REAL_TIME' ? '当天实时' : '下次日'
            }}
          </n-descriptions-item>

          <n-descriptions-item label="校验方式">
            {{ taskDetail.validationMethod === 'LONG_TERM' ? '长效' : '限时' }}
          </n-descriptions-item>

          <n-descriptions-item label="任务条件">
            {{ taskDetail.taskConditions.conditionType }}:
            {{ taskDetail.taskConditions.targetValue }}
          </n-descriptions-item>

          <n-descriptions-item label="创建时间">
            {{ new Date(taskDetail.createdAt).toLocaleString() }}
          </n-descriptions-item>

          <n-descriptions-item label="更新时间">
            {{ new Date(taskDetail.updatedAt).toLocaleString() }}
          </n-descriptions-item>

          <n-descriptions-item
            v-if="taskDetail.description"
            label="任务描述"
            :span="2"
          >
            {{ taskDetail.description }}
          </n-descriptions-item>

          <n-descriptions-item
            v-if="taskDetail.ruleDescription"
            label="规则说明"
            :span="2"
          >
            <pre style="white-space: pre-wrap; font-family: inherit">{{
              taskDetail.ruleDescription
            }}</pre>
          </n-descriptions-item>
        </n-descriptions>

        <!-- 最近参与用户 -->
        <div
          v-if="
            taskDetail.recentParticipants &&
            taskDetail.recentParticipants.length > 0
          "
          class="participants-section"
        >
          <n-divider title-placement="left">最近参与用户</n-divider>
          <n-data-table
            :columns="participantColumns"
            :data="taskDetail.recentParticipants"
            size="small"
            :pagination="false"
            max-height="300"
          />
        </div>
      </div>
    </n-spin>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleClose">关闭</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMessage } from 'naive-ui';
import {
  getTaskCenterById,
  getCategoryLabel,
  getTaskTypeLabel,
  getRewardTypeLabel,
} from '../../../api/taskCenter';
import type { TaskCenterDetail } from '../../../api/taskCenter';

interface Props {
  visible: boolean;
  taskId: number | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const message = useMessage();

// State
const loading = ref(false);
const taskDetail = ref<TaskCenterDetail | null>(null);

// Modal visibility
const modalVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

// Participant table columns
const participantColumns = [
  {
    title: '用户账号',
    key: 'userAccount',
    width: 120,
  },
  {
    title: '用户名',
    key: 'userName',
    width: 100,
  },
  {
    title: '进度',
    key: 'progress',
    width: 80,
    render: (row: any) => `${row.progress}/${row.targetValue}`,
  },
  {
    title: '进度百分比',
    key: 'progressPercentage',
    width: 100,
    render: (row: any) => `${row.progressPercentage}%`,
  },
  {
    title: '是否完成',
    key: 'isCompleted',
    width: 80,
    render: (row: any) => (row.isCompleted ? '是' : '否'),
  },
  {
    title: '是否领取',
    key: 'isClaimed',
    width: 80,
    render: (row: any) => (row.isClaimed ? '是' : '否'),
  },
  {
    title: '参与时间',
    key: 'createdAt',
    width: 160,
    render: (row: any) => new Date(row.createdAt).toLocaleString(),
  },
];

// Methods
const getRewardTypeColor = (rewardType: string) => {
  switch (rewardType) {
    case 'CASH':
      return 'success';
    case 'POINTS':
      return 'info';
    case 'BONUS':
      return 'warning';
    case 'FREE_SPINS':
      return 'primary';
    default:
      return 'default';
  }
};

const fetchTaskDetail = async (taskId: number) => {
  if (!taskId) return;

  loading.value = true;
  try {
    const response = await getTaskCenterById(taskId);
    taskDetail.value = response;
  } catch (error) {
    message.error('获取任务详情失败');
    console.error('Fetch task detail error:', error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('close');
};

// Watch for modal visibility and task ID changes
watch([() => props.visible, () => props.taskId], ([visible, taskId]) => {
  if (visible && taskId) {
    fetchTaskDetail(taskId);
  }
});
</script>

<style scoped lang="scss">
.task-detail-content {
  .participants-section {
    margin-top: 24px;

    .n-divider {
      margin: 16px 0;

      :deep(.n-divider__title) {
        font-weight: 600;
        color: #1890ff;
      }
    }
  }
}

// Dark mode support
:deep(.dark) {
  .task-detail-content {
    .participants-section {
      .n-divider {
        .n-divider__title {
          color: #409eff;
        }
      }
    }
  }
}
</style>
