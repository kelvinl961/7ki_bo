<template>
  <n-modal v-model:show="modalShow" :mask-closable="false">
    <n-card
      style="width: 700px; max-height: 80vh"
      title="活动详情"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      closable
      @close="handleClose"
    >
      <div v-if="activity" class="activity-detail">
        <!-- Activity Header -->
        <div class="mb-6">
          <div class="mb-4 flex items-start justify-between">
            <div class="flex-1">
              <h2 class="mb-2 text-xl font-bold text-gray-800">
                {{ getActivityTitle(activity) }}
              </h2>
              <p class="mb-3 text-gray-600">
                {{ getActivityDescription(activity) }}
              </p>
              <div class="flex items-center gap-4">
                <n-tag :type="getStatusTagType()" size="medium">
                  {{ getStatusText() }}
                </n-tag>
                <span class="text-sm text-gray-500">
                  {{ activity.type }} · {{ activity.currency }}
                </span>
              </div>
            </div>
          </div>

          <!-- Time Information -->
          <div
            v-if="activity.startsAt || activity.endsAt"
            class="rounded-lg bg-gray-50 p-4"
          >
            <div class="grid grid-cols-2 gap-4">
              <div v-if="activity.startsAt">
                <label class="text-sm font-medium text-gray-600"
                  >开始时间</label
                >
                <div class="text-sm">
                  {{ formatDateTime(activity.startsAt) }}
                </div>
              </div>
              <div v-if="activity.endsAt">
                <label class="text-sm font-medium text-gray-600"
                  >结束时间</label
                >
                <div class="text-sm">{{ formatDateTime(activity.endsAt) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Progress Summary -->
        <div v-if="activity.userStatus" class="mb-6">
          <h3 class="mb-4 text-lg font-semibold">我的进度</h3>
          <div class="mb-4 grid grid-cols-3 gap-4">
            <n-card>
              <n-statistic
                label="今日已领"
                :value="activity.userStatus.summary.claimedToday"
              />
            </n-card>
            <n-card>
              <n-statistic
                label="累计已领"
                :value="activity.userStatus.summary.claimedTotal"
              />
            </n-card>
            <n-card>
              <n-statistic
                label="上次领取"
                :value="getLastClaimTime()"
                :formatter="(value) => value || '暂无'"
              />
            </n-card>
          </div>

          <!-- Eligibility Status -->
          <div class="mb-4 rounded-lg bg-blue-50 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <n-icon
                  size="20"
                  :color="
                    activity.userStatus.summary.eligible ? '#52c41a' : '#faad14'
                  "
                  class="mr-2"
                >
                  <CheckmarkCircle
                    v-if="activity.userStatus.summary.eligible"
                  />
                  <Warning v-else />
                </n-icon>
                <span class="font-medium">
                  {{
                    activity.userStatus.summary.eligible
                      ? '符合参与条件'
                      : '暂不符合条件'
                  }}
                </span>
              </div>
              <div
                v-if="!activity.userStatus.summary.eligible"
                class="text-sm text-gray-600"
              >
                {{ activity.userStatus.summary.reason }}
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Units (Claimable Items) -->
        <div v-if="activity.userStatus?.units?.length" class="mb-6">
          <h3 class="mb-4 text-lg font-semibold">奖励详情</h3>
          <div class="space-y-3">
            <div
              v-for="unit in activity.userStatus.units"
              :key="unit.unitKey"
              class="rounded-lg border p-4 transition-colors"
              :class="{
                'border-green-200 bg-green-50': unit.state === 'eligible',
                'border-gray-200 bg-gray-50': unit.state === 'claimed',
                'border-orange-200 bg-orange-50': unit.state === 'locked',
              }"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="mb-2 flex items-center gap-3">
                    <n-tag :type="getUnitStateType(unit.state)" size="small">
                      {{ getUnitStateText(unit.state) }}
                    </n-tag>
                    <span class="font-medium">{{ getUnitTitle(unit) }}</span>
                  </div>

                  <!-- Progress Bar -->
                  <div v-if="unit.progress" class="mb-2">
                    <div
                      class="mb-1 flex items-center justify-between text-sm text-gray-600"
                    >
                      <span>进度</span>
                      <span
                        >{{ unit.progress.current }} /
                        {{ unit.progress.target }}</span
                      >
                    </div>
                    <n-progress
                      :percentage="unit.progress.percentage"
                      :color="getProgressColor(unit.state)"
                      :show-indicator="false"
                    />
                  </div>

                  <!-- Reward Info -->
                  <div v-if="unit.reward" class="flex items-center text-sm">
                    <n-icon size="16" color="#1890ff" class="mr-1">
                      <Gift />
                    </n-icon>
                    <span class="font-medium text-blue-600">
                      {{ formatReward(unit.reward) }}
                    </span>
                  </div>
                </div>

                <!-- Claim Button -->
                <div class="ml-4">
                  <n-button
                    v-if="unit.state === 'eligible'"
                    type="primary"
                    size="small"
                    @click="handleClaim(unit.unitKey)"
                    :loading="claiming"
                  >
                    领取
                  </n-button>
                  <n-button
                    v-else-if="unit.state === 'claimed'"
                    size="small"
                    disabled
                  >
                    已领取
                  </n-button>
                  <n-button v-else size="small" disabled> 未解锁 </n-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Window Information -->
        <div v-if="activity.userStatus?.window" class="mb-6">
          <h3 class="mb-4 text-lg font-semibold">活动窗口</h3>
          <div class="rounded-lg bg-gray-50 p-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-600"
                  >窗口类型</label
                >
                <div class="text-sm">
                  {{ getWindowTypeText(activity.userStatus.window.type) }}
                </div>
              </div>
              <div
                v-if="activity.userStatus.window.remainingClaims !== undefined"
              >
                <label class="text-sm font-medium text-gray-600"
                  >剩余名额</label
                >
                <div class="text-sm">
                  {{ activity.userStatus.window.remainingClaims }} /
                  {{ activity.userStatus.window.globalClaimCap }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Next Eligible Time -->
        <div
          v-if="
            activity.userStatus?.nextEligibleAt &&
            !activity.userStatus.summary.eligible
          "
          class="mb-6"
        >
          <n-alert type="info" title="下次可参与时间">
            {{ formatDateTime(activity.userStatus.nextEligibleAt) }}
          </n-alert>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <n-button @click="handleClose">关闭</n-button>
          <n-space>
            <n-button @click="$emit('refresh', activity?.id)">
              刷新状态
            </n-button>
            <n-button
              v-if="hasEligibleUnits"
              type="primary"
              @click="handleClaimAll"
              :loading="claiming"
            >
              领取所有可用奖励
            </n-button>
          </n-space>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  NModal,
  NCard,
  NButton,
  NIcon,
  NTag,
  NProgress,
  NStatistic,
  NSpace,
  NAlert,
  useMessage,
} from 'naive-ui';
import { CheckmarkCircle, Warning, Gift } from '@vicons/ionicons5';
import type { UserActivity, ActivityUnit } from '#/api/activityClaim';

// Props & Emits
interface Props {
  show: boolean;
  activity: UserActivity | null;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'claim', activityId: string, unitKey?: string): void;
  (e: 'refresh', activityId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  activity: null,
});

const emit = defineEmits<Emits>();

// Reactive Data
const claiming = ref(false);
const message = useMessage();

// Computed
const modalShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

const hasEligibleUnits = computed(() => {
  return (
    props.activity?.userStatus?.units?.some(
      (unit) => unit.state === 'eligible',
    ) || false
  );
});

// Methods
const handleClose = () => {
  modalShow.value = false;
};

const handleClaim = async (unitKey: string) => {
  if (!props.activity || claiming.value) return;

  claiming.value = true;
  try {
    emit('claim', props.activity.id, unitKey);
    message.success('正在处理领取请求...');
  } finally {
    claiming.value = false;
  }
};

const handleClaimAll = async () => {
  if (!props.activity || claiming.value) return;

  const eligibleUnits =
    props.activity.userStatus?.units?.filter(
      (unit) => unit.state === 'eligible',
    ) || [];

  if (eligibleUnits.length === 0) {
    message.warning('暂无可领取的奖励');
    return;
  }

  claiming.value = true;
  try {
    // Claim the first eligible unit (modify this based on business logic)
    emit('claim', props.activity.id, eligibleUnits[0].unitKey);
    message.success('正在处理领取请求...');
  } finally {
    claiming.value = false;
  }
};

// Helper Functions
const getActivityTitle = (activity: UserActivity): string => {
  const locale =
    activity.locales.find((l) => l.locale === 'zh-CN') || activity.locales[0];
  return locale?.title || activity.type;
};

const getActivityDescription = (activity: UserActivity): string => {
  const locale =
    activity.locales.find((l) => l.locale === 'zh-CN') || activity.locales[0];
  return locale?.description || locale?.subtitle || '';
};

const getStatusTagType = () => {
  if (!props.activity?.userStatus) return 'default';
  if (props.activity.userStatus.summary.eligible) return 'success';
  if (props.activity.userStatus.summary.claimedToday > 0) return 'info';
  return 'warning';
};

const getStatusText = (): string => {
  if (!props.activity?.userStatus) return '状态未知';
  if (props.activity.userStatus.summary.eligible) return '可参与';
  if (props.activity.userStatus.summary.claimedToday > 0) return '今日已参与';
  return '暂不可参与';
};

const getLastClaimTime = (): string => {
  const lastClaimAt = props.activity?.userStatus?.summary.lastClaimAt;
  if (!lastClaimAt) return '';

  const date = new Date(lastClaimAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}天前`;
  if (diffHours > 0) return `${diffHours}小时前`;
  return '刚刚';
};

const getUnitStateType = (state: string) => {
  switch (state) {
    case 'eligible':
      return 'success';
    case 'claimed':
      return 'info';
    case 'locked':
      return 'warning';
    default:
      return 'default';
  }
};

const getUnitStateText = (state: string): string => {
  switch (state) {
    case 'eligible':
      return '可领取';
    case 'claimed':
      return '已领取';
    case 'locked':
      return '未解锁';
    default:
      return '未知';
  }
};

const getUnitTitle = (unit: ActivityUnit): string => {
  // Generate title based on unit key
  switch (unit.unitKey) {
    case 'default':
      return '基础奖励';
    case 'daily':
      return '每日奖励';
    case 'weekly':
      return '每周奖励';
    default:
      if (unit.unitKey.startsWith('day_')) {
        const day = unit.unitKey.replace('day_', '');
        return `第${day}天签到`;
      }
      if (unit.unitKey.startsWith('tier_')) {
        const amount = unit.unitKey.replace('tier_', '');
        return `充值${amount}奖励`;
      }
      return unit.unitKey;
  }
};

const getProgressColor = (state: string): string => {
  switch (state) {
    case 'eligible':
      return '#52c41a';
    case 'claimed':
      return '#1890ff';
    case 'locked':
      return '#faad14';
    default:
      return '#d9d9d9';
  }
};

const formatReward = (reward: ActivityUnit['reward']): string => {
  if (!reward) return '';
  return `${reward.type === 'cash' ? 'R$' : ''} ${reward.amount} ${reward.currency}`;
};

const getWindowTypeText = (type?: string): string => {
  switch (type) {
    case 'daily':
      return '每日窗口';
    case 'weekly':
      return '每周窗口';
    case 'range':
      return '时段窗口';
    default:
      return '未知';
  }
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.activity-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.activity-detail::-webkit-scrollbar {
  width: 6px;
}

.activity-detail::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.activity-detail::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.activity-detail::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
