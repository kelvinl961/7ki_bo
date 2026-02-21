<template>
  <n-modal
    v-model:show="modalShow"
    preset="card"
    title="活动详情"
    style="width: 800px; max-height: 90vh"
    :mask-closable="true"
  >
    <div v-if="mappedActivity" class="activity-detail">
      <!-- 活动基本信息 -->
      <div class="mb-6">
        <div class="mb-4 flex items-center gap-4">
          <div
            v-if="mappedActivity.imageUrl"
            class="flex h-20 w-20 items-center justify-center rounded-lg bg-white shadow-md"
          >
            <n-image
              :src="mappedActivity.imageUrl"
              width="64"
              height="64"
              object-fit="cover"
              class="rounded"
            />
          </div>
          <div
            v-else
            class="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-200"
          >
            <n-icon size="40" color="#ccc">
              <Gift />
            </n-icon>
          </div>

          <div class="flex-1">
            <h2 class="mb-2 text-2xl font-bold text-gray-800">
              {{ mappedActivity.title }}
            </h2>
            <div class="flex items-center gap-2">
              <n-tag type="info" size="medium">{{
                getCategoryText(mappedActivity.category)
              }}</n-tag>
              <n-tag
                v-if="mappedActivity.currencyScope"
                type="success"
                size="medium"
                >{{ mappedActivity.currencyScope }}</n-tag
              >
              <n-tag :type="getStatusType(mappedActivity.status)" size="medium">
                {{ getStatusText(mappedActivity.status) }}
              </n-tag>
            </div>
          </div>
        </div>

        <div v-if="mappedActivity.bannerUrl" class="mb-4">
          <n-image
            :src="mappedActivity.bannerUrl"
            width="100%"
            height="200"
            object-fit="cover"
            class="rounded-lg"
          />
        </div>
      </div>

      <!-- 活动详细信息 -->
      <n-tabs type="line" animated>
        <n-tab-pane name="info" tab="基本信息">
          <n-descriptions
            :column="2"
            label-placement="left"
            label-style="font-weight: 600; color: #666; width: 120px"
            content-style="color: #333"
          >
            <n-descriptions-item label="活动ID">
              {{ mappedActivity.id }}
            </n-descriptions-item>

            <n-descriptions-item label="活动分类">
              {{ getCategoryText(mappedActivity.category) }}
            </n-descriptions-item>

            <n-descriptions-item label="活动子种类">
              {{ getTypeText(mappedActivity.type) }}
            </n-descriptions-item>

            <n-descriptions-item label="币种">
              {{ mappedActivity.currencyScope || '未设置' }}
            </n-descriptions-item>

            <n-descriptions-item label="参与会员">
              {{ getMemberScopeText(mappedActivity.memberScope) }}
            </n-descriptions-item>

            <n-descriptions-item label="赠送金额">
              {{ mappedActivity.claimLimit }}
              {{ mappedActivity.currencyScope || '' }}
            </n-descriptions-item>

            <n-descriptions-item label="排序">
              {{ mappedActivity.displayOrder }}
            </n-descriptions-item>

            <n-descriptions-item label="最大参与人数">
              {{ mappedActivity.maxParticipants || '无限制' }}
            </n-descriptions-item>

            <n-descriptions-item label="当前参与人数">
              {{ mappedActivity.currentParticipants || 0 }}
            </n-descriptions-item>

            <n-descriptions-item label="参与进度">
              <div class="flex items-center gap-2">
                <n-progress
                  type="line"
                  :percentage="mappedActivity.progress"
                  :status="mappedActivity.progress >= 100 ? 'success' : 'info'"
                  :show-indicator="false"
                  style="width: 100px"
                />
                <span class="text-sm text-gray-600"
                  >{{ mappedActivity.progress }}%</span
                >
              </div>
            </n-descriptions-item>

            <n-descriptions-item label="活动状态">
              <n-tag :type="getStatusType(mappedActivity.status)">
                {{ getStatusText(mappedActivity.status) }}
              </n-tag>
            </n-descriptions-item>

            <n-descriptions-item label="展示状态">
              <n-tag :type="mappedActivity.isActive ? 'success' : 'error'">
                {{ mappedActivity.isActive ? '展示中' : '已隐藏' }}
              </n-tag>
            </n-descriptions-item>

            <n-descriptions-item label="支持平台">
              <n-space
                v-if="
                  mappedActivity.platforms &&
                  mappedActivity.platforms.length > 0
                "
                size="small"
              >
                <n-tag
                  v-for="platform in mappedActivity.platforms"
                  :key="platform"
                  type="success"
                  size="small"
                >
                  {{ getPlatformText(platform) }}
                </n-tag>
              </n-space>
              <span v-else class="text-gray-400">未设置</span>
            </n-descriptions-item>

            <n-descriptions-item label="操作人">
              {{ mappedActivity.lastModifiedBy }}
            </n-descriptions-item>

            <n-descriptions-item label="创建时间">
              {{ formatDateTime(mappedActivity.createdAt) }}
            </n-descriptions-item>

            <n-descriptions-item label="更新时间">
              {{ formatDateTime(mappedActivity.updatedAt) }}
            </n-descriptions-item>
          </n-descriptions>
        </n-tab-pane>

        <n-tab-pane name="time" tab="时间信息">
          <n-descriptions
            :column="1"
            label-placement="left"
            label-style="font-weight: 600; color: #666; width: 120px"
            content-style="color: #333"
          >
            <n-descriptions-item label="活动开始时间">
              <div class="flex items-center gap-2">
                <n-icon>
                  <TimeOutline />
                </n-icon>
                <span>{{ formatDateTime(mappedActivity.startsAt) }}</span>
              </div>
            </n-descriptions-item>

            <n-descriptions-item label="活动结束时间">
              <div class="flex items-center gap-2">
                <n-icon>
                  <TimeOutline />
                </n-icon>
                <span>{{ formatDateTime(mappedActivity.endsAt) }}</span>
              </div>
            </n-descriptions-item>

            <n-descriptions-item label="活动时长">
              <div class="flex items-center gap-2">
                <n-icon>
                  <CalendarOutline />
                </n-icon>
                <span>{{
                  getDurationText(
                    mappedActivity.startsAt,
                    mappedActivity.endsAt,
                  )
                }}</span>
              </div>
            </n-descriptions-item>

            <n-descriptions-item label="剩余时间">
              <div class="flex items-center gap-2">
                <n-icon>
                  <AlarmOutline />
                </n-icon>
                <span
                  :class="getRemainingTimeClass(mappedActivity.timeRemaining)"
                >
                  {{ getRemainingTimeText(mappedActivity.timeRemaining) }}
                </span>
              </div>
            </n-descriptions-item>

            <n-descriptions-item label="活动状态">
              <div class="flex items-center gap-2">
                <n-icon
                  :color="
                    mappedActivity.isCurrentlyActive ? '#52c41a' : '#d9d9d9'
                  "
                >
                  <CheckmarkCircleOutline />
                </n-icon>
                <span>{{
                  mappedActivity.isCurrentlyActive ? '进行中' : '未开始/已结束'
                }}</span>
              </div>
            </n-descriptions-item>
          </n-descriptions>
        </n-tab-pane>

        <n-tab-pane name="content" tab="内容信息">
          <div class="space-y-4">
            <div v-if="mappedActivity.requirement">
              <h4 class="mb-2 font-semibold text-gray-800">活动要求</h4>
              <div class="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                {{ mappedActivity.requirement }}
              </div>
            </div>

            <div v-if="mappedActivity.description">
              <h4 class="mb-2 font-semibold text-gray-800">活动描述</h4>
              <div class="rounded-lg bg-blue-50 p-3 text-sm text-gray-700">
                {{ mappedActivity.description }}
              </div>
            </div>

            <div v-if="mappedActivity.rules">
              <h4 class="mb-2 font-semibold text-gray-800">活动规则</h4>
              <div
                class="whitespace-pre-line rounded-lg bg-yellow-50 p-3 text-sm text-gray-700"
              >
                {{ mappedActivity.rules }}
              </div>
            </div>

            <div
              v-if="
                !mappedActivity.requirement &&
                !mappedActivity.description &&
                !mappedActivity.rules
              "
              class="py-8 text-center"
            >
              <n-empty description="暂无内容信息" />
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="stats" tab="统计信息">
          <div class="grid grid-cols-2 gap-4">
            <n-card size="small">
              <n-statistic
                label="参与人数"
                :value="mappedActivity.currentParticipants"
              >
                <template #suffix>
                  <span class="text-sm text-gray-500"
                    >/ {{ mappedActivity.maxParticipants || '无限制' }}</span
                  >
                </template>
              </n-statistic>
            </n-card>

            <n-card size="small">
              <n-statistic label="参与进度" :value="mappedActivity.progress">
                <template #suffix>
                  <span class="text-sm text-gray-500">%</span>
                </template>
              </n-statistic>
            </n-card>

            <n-card size="small">
              <n-statistic
                label="预计支出"
                :value="
                  (mappedActivity.currentParticipants || 0) *
                  (mappedActivity.claimLimit || 0)
                "
              >
                <template #suffix>
                  <span class="text-sm text-gray-500">{{
                    mappedActivity.currencyScope || ''
                  }}</span>
                </template>
              </n-statistic>
            </n-card>

            <n-card size="small">
              <n-statistic
                label="活动天数"
                :value="mappedActivity.durationDays"
              >
                <template #suffix>
                  <span class="text-sm text-gray-500">天</span>
                </template>
              </n-statistic>
            </n-card>
          </div>

          <div class="mt-6">
            <h4 class="mb-3 font-semibold text-gray-800">活动时间线</h4>
            <n-timeline>
              <n-timeline-item
                type="success"
                :title="formatDateTime(mappedActivity.createdAt)"
                content="活动创建"
              />
              <n-timeline-item
                :type="
                  new Date(mappedActivity.startsAt) <= new Date()
                    ? 'success'
                    : 'info'
                "
                :title="formatDateTime(mappedActivity.startsAt)"
                content="活动开始"
              />
              <n-timeline-item
                :type="
                  new Date(mappedActivity.endsAt) <= new Date()
                    ? 'error'
                    : 'warning'
                "
                :title="formatDateTime(mappedActivity.endsAt)"
                content="活动结束"
              />
            </n-timeline>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <div v-else class="py-8 text-center">
      <n-empty description="没有活动信息" />
    </div>

    <template #footer>
      <div class="flex justify-end">
        <n-button @click="handleClose">关闭</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  NModal,
  NTabs,
  NTabPane,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NProgress,
  NSpace,
  NIcon,
  NImage,
  NCard,
  NStatistic,
  NTimeline,
  NTimelineItem,
  NEmpty,
  NButton,
} from 'naive-ui';
import {
  Gift,
  TimeOutline,
  CalendarOutline,
  AlarmOutline,
  CheckmarkCircleOutline,
} from '@vicons/ionicons5';
import type { Activity } from '#/api/activity';

// Props & Emits
interface Props {
  show: boolean;
  activity?: Activity | null;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  activity: null,
});

const emit = defineEmits<Emits>();

// 响应式数据
const modalShow = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

// ✅ Ensure activity data is properly mapped from config
const mappedActivity = computed(() => {
  if (!props.activity) return null;

  const activity = props.activity;
  const config = activity.config || {};

  return {
    ...activity,
    // Extract from config if not directly available
    title: activity.title || config.title || '未设置标题',
    category: activity.category || config.category || '',
    type: activity.type || config.type || '',
    memberScope: activity.memberScope || config.memberScope || 'all',
    currencyScope: activity.currencyScope || config.currencyScope || '',
    claimLimit: activity.claimLimit || config.claimLimit || 0,
    platforms: activity.platforms || config.platforms || [],
    description: activity.description || config.description || '',
    rules: activity.rules || config.rules || '',
    requirement: activity.requirement || config.requirement || '',
    imageUrl: activity.imageUrl || config.imageUrl || '',
    bannerUrl: activity.bannerUrl || config.bannerUrl || '',
    startsAt:
      activity.startsAt ||
      activity.startAt ||
      config.startAt ||
      config.startsAt ||
      activity.createdAt,
    endsAt:
      activity.endsAt ||
      activity.endAt ||
      config.endAt ||
      config.endsAt ||
      activity.updatedAt,
    displayOrder: activity.displayOrder || config.displayOrder || 0,
    maxParticipants: activity.maxParticipants || config.maxParticipants || null,
    currentParticipants:
      activity.currentParticipants || config.currentParticipants || 0,
    progress: activity.progress || config.progress || 0,
    isActive:
      activity.isActive !== undefined
        ? activity.isActive
        : config.isActive !== undefined
          ? config.isActive
          : true,
    isCurrentlyActive:
      activity.isCurrentlyActive !== undefined
        ? activity.isCurrentlyActive
        : activity.status === 'active' || activity.status === 'ACTIVE',
    timeRemaining: activity.timeRemaining || config.timeRemaining || 0,
    durationDays: activity.durationDays || config.durationDays || 0,
    lastModifiedBy:
      activity.lastModifiedBy ||
      activity.createdBy ||
      config.lastModifiedBy ||
      '系统',
  };
});

// 工具函数
const formatDateTime = (dateString: string | Date | null | undefined) => {
  if (!dateString) {
    return '未设置';
  }

  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime())) {
      return '无效日期';
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (error) {
    return '日期格式错误';
  }
};

const getDurationText = (
  startAt: string | Date | null | undefined,
  endAt: string | Date | null | undefined,
) => {
  if (!startAt || !endAt) {
    return '未设置';
  }

  try {
    const start = startAt instanceof Date ? startAt : new Date(startAt);
    const end = endAt instanceof Date ? endAt : new Date(endAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '无效日期';
    }

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '1天';
    } else if (diffDays < 30) {
      return `${diffDays}天`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)}个月`;
    } else {
      return `${Math.floor(diffDays / 365)}年`;
    }
  } catch (error) {
    return '计算错误';
  }
};

const getRemainingTimeText = (timeRemaining: number) => {
  if (timeRemaining <= 0) {
    return '已结束';
  }

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}天${hours}小时`;
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
};

const getRemainingTimeClass = (timeRemaining: number) => {
  if (timeRemaining <= 0) {
    return 'text-red-500';
  } else if (timeRemaining < 24 * 60 * 60 * 1000) {
    return 'text-yellow-500';
  } else {
    return 'text-green-500';
  }
};

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    DRAFT: 'warning',
    ACTIVE: 'success',
    CLOSED: 'error',
    ENDED: 'default',
    draft: 'warning',
    active: 'success',
    paused: 'error',
    archived: 'default',
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    DRAFT: '草稿',
    ACTIVE: '进行中',
    CLOSED: '已关闭',
    ENDED: '已结束',
    draft: '草稿',
    active: '进行中',
    paused: '已暂停',
    archived: '已归档',
  };
  return statusMap[status] || status;
};

// ✅ Map category to Chinese
const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    comprehensive: '综合',
    chess_cards: '棋牌',
    hunting: '捕鱼',
    slot: '电子',
    live: '真人',
    sports: '体育',
    cockfight: '斗鸡',
    lottery: '彩票',
    video: '视频',
    esports: '电竞',
    table: '桌面',
    arcade: '街机',
    simulation: '模拟',
    other: '其他',
    recharge: '充值',
    betting: '打码',
    signin: '签到',
    invite: '邀请',
    newuser: '新人礼金',
    redpacket: '红包',
    custom: '自定义',
  };
  return categoryMap[category] || category || '未分类';
};

// ✅ Map type to Chinese
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    recharge: '充值',
    wagering: '打码',
    rescue: '救援金',
    checkin: '签到',
    luckyspin: '幸运转盘',
    luckywager: '幸运注单',
    redpacket: '红包',
    investment: '投资',
    promotion: '推广',
    agent: '代理',
    collect: '集字',
    guessing: '竞猜',
    newbie: '新人彩金',
    referral: '推荐奖励',
    soft: '软一刀',
    new: '新一刀',
    ranking: '相行榜',
    custom: '自定义',
  };
  return typeMap[type] || type || '未知类型';
};

// ✅ Map member scope to Chinese
const getMemberScopeText = (memberScope: string | string[] | undefined) => {
  const memberScopeMap: Record<string, string> = {
    all: '全部会员',
    five_yuan: '五元玩家',
    ten_yuan: '十元玩家',
    thirty_yuan: '三十元玩家',
    fifty_yuan: '五十元玩家',
    hundred_yuan: '一百元玩家',
    three_hundred: '三百元玩家',
    three_thousand: '三千元玩家',
    five_thousand: '五千元玩家',
    ten_thousand: '十万元玩家',
    hundred_thousand: '百万土豪',
    default: '默认等级',
    user: '备用等级',
    suspicion: '可疑玩家',
    high_win: '高胜率',
    test_user: '测试专用',
    manual_add: '手动出款',
    全部会员: '全部会员',
    VIP会员: 'VIP会员',
    新用户: '新用户',
    老用户: '老用户',
  };

  if (!memberScope) {
    return '全部会员';
  }

  if (typeof memberScope === 'string') {
    if (memberScopeMap[memberScope]) {
      return memberScopeMap[memberScope];
    }
    if (memberScope.includes(',')) {
      const tags = memberScope.split(',').map((tag) => tag.trim());
      const translatedTags = tags.map((tag) => memberScopeMap[tag] || tag);
      return translatedTags.join(', ');
    }
    return memberScope;
  }

  if (Array.isArray(memberScope)) {
    if (memberScope.length === 0) {
      return '全部会员';
    }
    const translatedTags = memberScope.map((tag) => memberScopeMap[tag] || tag);
    return translatedTags.join(', ');
  }

  return '全部会员';
};

// ✅ Map platform to Chinese
const getPlatformText = (platform: string) => {
  const platformMap: Record<string, string> = {
    android_app: 'Android应用',
    ios_app: 'iOS应用',
    native_app: '原生应用',
    pwa_app: 'PWA应用',
    pc_browser: 'PC浏览器',
    ios_h5: 'iOS H5',
    android_h5: 'Android H5',
    ios_browser: 'iOS浏览器',
    browser_app: '浏览器应用',
    mobile: '移动端',
    desktop: '桌面端',
    web: '网页',
  };
  return platformMap[platform] || platform;
};

// 事件处理
const handleClose = () => {
  modalShow.value = false;
};
</script>

<style scoped>
.activity-detail {
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.n-descriptions-item-label) {
  font-weight: 600;
  color: #666;
}

:deep(.n-descriptions-item-content) {
  color: #333;
}

:deep(.n-tabs-content) {
  padding-top: 16px;
}

:deep(.n-card) {
  border: 1px solid #e5e7eb;
}

:deep(.n-statistic-value) {
  color: #333;
}

:deep(.n-timeline-item-content) {
  color: #666;
}
</style>
