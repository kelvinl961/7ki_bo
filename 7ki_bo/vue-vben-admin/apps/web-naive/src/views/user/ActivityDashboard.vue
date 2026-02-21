<template>
  <div class="activity-dashboard p-6">
    <!-- Header Section -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">活动中心</h1>
          <p class="text-gray-600 mt-1">参与活动，赢取丰富奖励</p>
        </div>
        <n-button 
          type="primary" 
          @click="refreshData"
          :loading="loading"
        >
          <template #icon>
            <n-icon><Refresh /></n-icon>
          </template>
          刷新
        </n-button>
      </div>

      <!-- User Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <n-card>
          <n-statistic label="今日参与" :value="userStats.todayParticipations" />
        </n-card>
        <n-card>
          <n-statistic label="总参与次数" :value="userStats.totalParticipations" />
        </n-card>
        <n-card>
          <n-statistic 
            label="累计奖励" 
            :value="userStats.totalRewardValue" 
            :formatter="formatCurrency"
          />
        </n-card>
        <n-card>
          <n-statistic label="可领取奖励" :value="availableRewards" />
        </n-card>
      </div>
    </div>

    <!-- Activity Filter -->
    <div class="mb-6">
      <n-space>
        <n-select
          v-model:value="filters.type"
          placeholder="选择活动类型"
          clearable
          style="width: 200px"
          :options="activityTypeOptions"
          @update:value="handleFilterChange"
        />
        <n-select
          v-model:value="filters.category"
          placeholder="选择分类"
          clearable
          style="width: 150px"
          :options="categoryOptions"
          @update:value="handleFilterChange"
        />
        <n-select
          v-model:value="filters.status"
          placeholder="状态筛选"
          clearable
          style="width: 150px"
          :options="statusOptions"
          @update:value="handleFilterChange"
        />
      </n-space>
    </div>

    <!-- Activity Cards Grid -->
    <div v-if="loading" class="text-center py-8">
      <n-spin size="large" />
      <p class="mt-4 text-gray-500">加载活动数据中...</p>
    </div>

    <div v-else-if="filteredActivities.length === 0" class="text-center py-12">
      <n-empty description="暂无可参与的活动">
        <template #extra>
          <n-button @click="refreshData">重新加载</n-button>
        </template>
      </n-empty>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <n-card
        v-for="activity in filteredActivities"
        :key="activity.id"
        class="activity-card cursor-pointer hover:shadow-lg transition-shadow"
        @click="openActivityModal(activity)"
      >
        <!-- Activity Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800 mb-1">
              {{ getActivityTitle(activity) }}
            </h3>
            <p class="text-sm text-gray-600">
              {{ getActivityDescription(activity) }}
            </p>
          </div>
          <n-tag 
            :type="getActivityStatusType(activity)"
            size="small"
          >
            {{ getActivityStatusText(activity) }}
          </n-tag>
        </div>

        <!-- Activity Progress -->
        <div v-if="activity.userStatus" class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">今日进度</span>
            <span class="text-sm font-medium">
              {{ activity.userStatus.summary.claimedToday }} / 
              {{ getMaxDailyClaims(activity) }}
            </span>
          </div>
          <n-progress
            :percentage="getProgressPercentage(activity)"
            :color="getProgressColor(activity)"
            :show-indicator="false"
          />
        </div>

        <!-- Activity Stats -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="text-center">
            <div class="text-lg font-semibold text-blue-600">
              {{ formatCurrency(getActivityReward(activity)) }}
            </div>
            <div class="text-xs text-gray-500">奖励金额</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-semibold text-green-600">
              {{ activity.userStatus?.summary.claimedTotal || 0 }}
            </div>
            <div class="text-xs text-gray-500">已领取次数</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <n-button
            v-if="canClaim(activity)"
            type="primary"
            block
            @click.stop="quickClaim(activity)"
            :loading="claimingActivities.has(activity.id)"
          >
            <template #icon>
              <n-icon><Gift /></n-icon>
            </template>
            立即领取
          </n-button>
          <n-button
            v-else-if="activity.userStatus?.summary.eligible === false"
            block
            disabled
          >
            {{ activity.userStatus.summary.reason || '暂不可领取' }}
          </n-button>
          <n-button
            v-else
            block
            @click.stop="openActivityModal(activity)"
          >
            查看详情
          </n-button>
        </div>

        <!-- Time Info -->
        <div v-if="activity.endsAt" class="mt-3 pt-3 border-t">
          <div class="flex items-center text-xs text-gray-500">
            <n-icon size="14" class="mr-1"><Time /></n-icon>
            <span>{{ getTimeRemaining(activity.endsAt) }}</span>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Activity Detail Modal -->
    <ActivityDetailModal
      v-model:show="showDetailModal"
      :activity="selectedActivity"
      @claim="handleClaimFromModal"
      @refresh="refreshActivityStatus"
    />

    <!-- Claim Result Modal -->
    <n-modal v-model:show="showClaimResult">
      <n-card
        style="width: 400px"
        title="领取结果"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <div class="text-center">
          <div v-if="claimResult?.success" class="mb-4">
            <n-icon size="64" color="#52c41a">
              <CheckmarkCircle />
            </n-icon>
            <h3 class="text-lg font-semibold mt-3 mb-2">领取成功！</h3>
            <p class="text-gray-600">
              获得奖励：{{ formatCurrency(claimResult.data?.claim.amount || 0) }}
            </p>
          </div>
          <div v-else class="mb-4">
            <n-icon size="64" color="#f5222d">
              <CloseCircle />
            </n-icon>
            <h3 class="text-lg font-semibold mt-3 mb-2">领取失败</h3>
            <p class="text-gray-600">{{ claimResult?.error || '未知错误' }}</p>
          </div>
        </div>
        <template #footer>
          <div class="text-center">
            <n-button @click="showClaimResult = false">确定</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import {
  NCard,
  NButton,
  NIcon,
  NSpin,
  NEmpty,
  NTag,
  NProgress,
  NStatistic,
  NSpace,
  NSelect,
  NModal,
  useMessage,
  useDialog,
} from 'naive-ui';
import { 
  Refresh, 
  Gift, 
  Time, 
  CheckmarkCircle, 
  CloseCircle 
} from '@vicons/ionicons5';
import {
  getActiveActivities,
  getActivityStatus,
  claimActivityReward,
  getUserActivityStats,
  type UserActivity,
  type ActivityStatus,
  type ClaimResponse,
} from '#/api/activityClaim';
// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
import { defineAsyncComponent } from 'vue';
const ActivityDetailModal = defineAsyncComponent(() => import('./components/ActivityDetailModal.vue'));

// Reactive Data
const loading = ref(false);
const activities = ref<UserActivity[]>([]);
const userStats = reactive({
  todayParticipations: 0,
  totalParticipations: 0,
  totalRewardValue: 0,
  recentActivities: []
});

const filters = reactive({
  type: null as string | null,
  category: null as string | null,
  status: null as string | null,
});

const showDetailModal = ref(false);
const selectedActivity = ref<UserActivity | null>(null);
const claimingActivities = ref<Set<string>>(new Set());
const showClaimResult = ref(false);
const claimResult = ref<{ success: boolean; data?: ClaimResponse; error?: string } | null>(null);

const message = useMessage();
const dialog = useDialog();

// Auto refresh interval
let refreshInterval: NodeJS.Timeout | null = null;

// Computed Properties
const filteredActivities = computed(() => {
  return activities.value.filter(activity => {
    if (filters.type && activity.type !== filters.type) return false;
    if (filters.category && activity.category !== filters.category) return false;
    if (filters.status) {
      const eligible = activity.userStatus?.summary.eligible;
      if (filters.status === 'eligible' && !eligible) return false;
      if (filters.status === 'claimed' && (eligible !== false || !activity.userStatus?.summary.claimedToday)) return false;
      if (filters.status === 'locked' && eligible !== false) return false;
    }
    return true;
  });
});

const availableRewards = computed(() => {
  return activities.value.filter(activity => canClaim(activity)).length;
});

// Options for filters
const activityTypeOptions = [
  { label: '充值活动', value: 'recharge' },
  { label: '签到活动', value: 'checkin' },
  { label: '打码活动', value: 'wagering' },
  { label: '救援金', value: 'rescue' },
  { label: '幸运转盘', value: 'luckyspin' },
  { label: '红包活动', value: 'redpacket' },
  { label: '新人活动', value: 'newbie' },
];

const categoryOptions = [
  { label: '充值类', value: 'deposit' },
  { label: '游戏类', value: 'gaming' },
  { label: '福利类', value: 'welfare' },
  { label: '推广类', value: 'promotion' },
];

const statusOptions = [
  { label: '可领取', value: 'eligible' },
  { label: '已领取', value: 'claimed' },
  { label: '未解锁', value: 'locked' },
];

// Methods
const loadActivities = async () => {
  try {
    loading.value = true;
    const response = await getActiveActivities({
      currency: 'BRL'
    });
    
    activities.value = response.data || [];
    
    // Load status for each activity
    await Promise.all(
      activities.value.map(async (activity) => {
        try {
          const statusResponse = await getActivityStatus(activity.id);
          activity.userStatus = statusResponse.data;
        } catch (error) {
          console.warn(`Failed to load status for activity ${activity.id}:`, error);
        }
      })
    );
  } catch (error) {
    console.error('Failed to load activities:', error);
    message.error('加载活动列表失败');
  } finally {
    loading.value = false;
  }
};

const loadUserStats = async () => {
  try {
    const response = await getUserActivityStats();
    Object.assign(userStats, response.data);
  } catch (error) {
    console.warn('Failed to load user stats:', error);
  }
};

const refreshData = async () => {
  await Promise.all([
    loadActivities(),
    loadUserStats()
  ]);
};

const handleFilterChange = () => {
  // Filters are reactive, so the computed property will update automatically
};

const openActivityModal = (activity: UserActivity) => {
  selectedActivity.value = activity;
  showDetailModal.value = true;
};

const canClaim = (activity: UserActivity): boolean => {
  const status = activity.userStatus;
  if (!status) return false;
  
  return status.summary.eligible && 
         status.units.some(unit => unit.state === 'eligible');
};

const quickClaim = async (activity: UserActivity) => {
  if (claimingActivities.value.has(activity.id)) return;
  
  try {
    claimingActivities.value.add(activity.id);
    
    // Find the first eligible unit
    const eligibleUnit = activity.userStatus?.units.find(unit => unit.state === 'eligible');
    
    const response = await claimActivityReward(activity.id, {
      unitKey: eligibleUnit?.unitKey
    });
    
    claimResult.value = { success: true, data: response.data };
    showClaimResult.value = true;
    
    // Refresh activity status
    await refreshActivityStatus(activity.id);
    await loadUserStats();
    
    message.success('奖励领取成功！');
  } catch (error) {
    console.error('Claim failed:', error);
    claimResult.value = { 
      success: false, 
      error: error instanceof Error ? error.message : '领取失败' 
    };
    showClaimResult.value = true;
  } finally {
    claimingActivities.value.delete(activity.id);
  }
};

const handleClaimFromModal = async (activityId: string, unitKey?: string) => {
  await quickClaim(activities.value.find(a => a.id === activityId)!);
  showDetailModal.value = false;
};

const refreshActivityStatus = async (activityId: string) => {
  try {
    const activity = activities.value.find(a => a.id === activityId);
    if (activity) {
      const statusResponse = await getActivityStatus(activityId);
      activity.userStatus = statusResponse.data;
    }
  } catch (error) {
    console.warn(`Failed to refresh status for activity ${activityId}:`, error);
  }
};

// Helper Functions
const getActivityTitle = (activity: UserActivity): string => {
  const locale = activity.locales.find(l => l.locale === 'zh-CN') || activity.locales[0];
  return locale?.title || activity.type;
};

const getActivityDescription = (activity: UserActivity): string => {
  const locale = activity.locales.find(l => l.locale === 'zh-CN') || activity.locales[0];
  return locale?.description || locale?.subtitle || '';
};

const getActivityStatusType = (activity: UserActivity) => {
  if (!activity.userStatus) return 'default';
  if (activity.userStatus.summary.eligible) return 'success';
  if (activity.userStatus.summary.claimedToday > 0) return 'info';
  return 'warning';
};

const getActivityStatusText = (activity: UserActivity): string => {
  if (!activity.userStatus) return '加载中';
  if (activity.userStatus.summary.eligible) return '可领取';
  if (activity.userStatus.summary.claimedToday > 0) return '已领取';
  return '暂不可用';
};

const getMaxDailyClaims = (activity: UserActivity): number => {
  // This would be extracted from activity rules or config
  return 1; // Default to 1 for now
};

const getProgressPercentage = (activity: UserActivity): number => {
  if (!activity.userStatus) return 0;
  const claimed = activity.userStatus.summary.claimedToday;
  const max = getMaxDailyClaims(activity);
  return Math.min((claimed / max) * 100, 100);
};

const getProgressColor = (activity: UserActivity): string => {
  const percentage = getProgressPercentage(activity);
  if (percentage >= 100) return '#52c41a';
  if (percentage >= 50) return '#1890ff';
  return '#faad14';
};

const getActivityReward = (activity: UserActivity): number => {
  const units = activity.userStatus?.units || [];
  const eligibleUnit = units.find(unit => unit.state === 'eligible');
  return eligibleUnit?.reward?.amount || 0;
};

const getTimeRemaining = (endTime: string): string => {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return '已结束';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `剩余 ${days} 天 ${hours} 小时`;
  return `剩余 ${hours} 小时`;
};

const formatCurrency = (amount: number): string => {
  return `R$ ${amount.toFixed(2)}`;
};

// Lifecycle
onMounted(() => {
  refreshData();
  
  // Auto refresh every 5 minutes
  refreshInterval = setInterval(() => {
    refreshData();
  }, 5 * 60 * 1000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.activity-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.activity-card {
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
}

.activity-card:hover {
  transform: translateY(-2px);
  border-color: #1890ff;
}

.activity-card .n-card__content {
  padding: 20px;
}
</style>
