<template>
  <n-modal
    v-model:show="modalShow"
    preset="card"
    :title="$t('activity.detailModal.k6d3b')"
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
        <n-tab-pane name="info" :tab="$t('activity.detailModal.k57fa')">
          <n-descriptions
            :column="2"
            label-placement="left"
            label-style="font-weight: 600; color: #666; width: 120px"
            content-style="color: #333"
          >
            <n-descriptions-item :label="$t('activity.rewardReport.k6d3b2')">
              {{ mappedActivity.id }}
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k6d3b2')">
              {{ getCategoryText(mappedActivity.category) }}
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k6d3b3')">
              {{ getTypeText(mappedActivity.type) }}
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.luckyWheel.k5e01')">
              {{ mappedActivity.currencyScope || $t('activity.statuses.notSet') }}
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k53c2')">
              {{ memberParticipationText }}
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k8d60')">
              {{ mappedActivity.claimLimit }}
              {{ mappedActivity.currencyScope || '' }}
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k6392')">
              {{ mappedActivity.displayOrder }}
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k6700')">
              {{ mappedActivity.maxParticipants || $t('activity.common.unlimited') }}
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k5f53')">
              {{ mappedActivity.currentParticipants || 0 }}
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k53c22')">
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

            <n-descriptions-item :label="$t('activity.detailModal.k6d3b4')">
              <n-tag :type="getStatusType(mappedActivity.status)">
                {{ getStatusText(mappedActivity.status) }}
              </n-tag>
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k5c55')">
              <n-tag :type="mappedActivity.isActive ? 'success' : 'error'">
                {{ mappedActivity.isActive ? $t('activity.detailModal.k5c55') : $t('activity.detailModal.k5df2') }}
              </n-tag>
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k652f')">
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
              <span v-else class="text-gray-400">{{ $t('activity.detailModal.k672a') }}</span>
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.activityList.k64cd')">
              {{ mappedActivity.lastModifiedBy }}
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.providentFund.k521b')">
              <TzDateTime :value="mappedActivity.createdAt" />
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k66f4')">
              <TzDateTime :value="mappedActivity.updatedAt" />
            </n-descriptions-item>
          </n-descriptions>
        </n-tab-pane>

        <n-tab-pane name="time" :tab="$t('activity.detailModal.k65f6')">
          <n-descriptions
            :column="1"
            label-placement="left"
            label-style="font-weight: 600; color: #666; width: 120px"
            content-style="color: #333"
          >
            <n-descriptions-item :label="$t('activity.detailModal.k6d3b5')">
              <div class="flex items-center gap-2">
                <n-icon>
                  <TimeOutline />
                </n-icon>
                <span><TzDateTime :value="mappedActivity.startsAt" /></span>
              </div>
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k6d3b6')">
              <div class="flex items-center gap-2">
                <n-icon>
                  <TimeOutline />
                </n-icon>
                <span><TzDateTime :value="mappedActivity.endsAt" /></span>
              </div>
            </n-descriptions-item>

            <n-descriptions-item :label="$t('activity.detailModal.k6d3b7')">
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

            <n-descriptions-item :label="$t('activity.detailModal.k5269')">
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

            <n-descriptions-item :label="$t('activity.detailModal.k6d3b4')">
              <div class="flex items-center gap-2">
                <n-icon
                  :color="
                    mappedActivity.isCurrentlyActive ? '#52c41a' : '#d9d9d9'
                  "
                >
                  <CheckmarkCircleOutline />
                </n-icon>
                <span>{{
                  mappedActivity.isCurrentlyActive ? $t('activity.statuses.active') : $t('activity.detailModal.k672a')
                }}</span>
              </div>
            </n-descriptions-item>
          </n-descriptions>
        </n-tab-pane>

        <n-tab-pane name="content" :tab="$t('activity.detailModal.k5185')">
          <div class="space-y-4">
            <div v-if="mappedActivity.requirement">
              <h4 class="mb-2 font-semibold text-gray-800">{{ $t('activity.detailModal.k6d3b12') }}</h4>
              <div class="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                {{ mappedActivity.requirement }}
              </div>
            </div>

            <div v-if="mappedActivity.description">
              <h4 class="mb-2 font-semibold text-gray-800">{{ $t('activity.detailModal.k6d3b13') }}</h4>
              <div class="rounded-lg bg-blue-50 p-3 text-sm text-gray-700">
                {{ mappedActivity.description }}
              </div>
            </div>

            <div v-if="mappedActivity.rules">
              <h4 class="mb-2 font-semibold text-gray-800">{{ $t('activity.detailModal.k6d3b14') }}</h4>
              <div
                v-if="isRulesHtml(mappedActivity.rules)"
                class="activity-detail-rules-html rounded-lg bg-yellow-50 p-3 text-sm text-gray-700"
                v-html="mappedActivity.rules"
              />
              <div
                v-else
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
              <n-empty :description="$t('activity.detailModal.k6682')" />
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="stats" :tab="$t('activity.detailModal.k7edf')">
          <div class="grid grid-cols-2 gap-4">
            <n-card size="small">
              <n-statistic
                :label="$t('activity.detailModal.k53c23')"
                :value="mappedActivity.currentParticipants"
              >
                <template #suffix>
                  <span class="text-sm text-gray-500"
                    >/ {{ mappedActivity.maxParticipants || $t('activity.common.unlimited') }}</span
                  >
                </template>
              </n-statistic>
            </n-card>

            <n-card size="small">
              <n-statistic :label="$t('activity.detailModal.k53c22')" :value="mappedActivity.progress">
                <template #suffix>
                  <span class="text-sm text-gray-500">%</span>
                </template>
              </n-statistic>
            </n-card>

            <n-card size="small">
              <n-statistic
                :label="$t('activity.detailModal.k9884')"
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
                :label="$t('activity.detailModal.k6d3b8')"
                :value="mappedActivity.durationDays"
              >
                <template #suffix>
                  <span class="text-sm text-gray-500">{{ $t('activity.detailModal.k5929') }}</span>
                </template>
              </n-statistic>
            </n-card>
          </div>

          <div class="mt-6">
            <h4 class="mb-3 font-semibold text-gray-800">{{ $t('activity.detailModal.k6d3b15') }}</h4>
            <n-timeline>
              <n-timeline-item
                type="success"
                :title="formatDateTimeInTimezone(mappedActivity.createdAt)"
                :content="$t('activity.detailModal.k6d3b9')"
              />
              <n-timeline-item
                :type="
                  new Date(mappedActivity.startsAt) <= new Date()
                    ? 'success'
                    : 'info'
                "
                :title="formatDateTimeInTimezone(mappedActivity.startsAt)"
                :content="$t('activity.detailModal.k6d3b10')"
              />
              <n-timeline-item
                :type="
                  new Date(mappedActivity.endsAt) <= new Date()
                    ? 'error'
                    : 'warning'
                "
                :title="formatDateTimeInTimezone(mappedActivity.endsAt)"
                :content="$t('activity.detailModal.k6d3b11')"
              />
            </n-timeline>
          </div>
        </n-tab-pane>
        <n-tab-pane name="versions" tab="历史版本">
          <div class="mb-2 text-xs text-gray-500">最近 30 次修改记录</div>
          <n-spin :show="versionsLoading">
            <n-empty v-if="!versionsLoading && versions.length === 0" description="暂无版本记录" />
            <n-timeline v-else>
              <n-timeline-item
                v-for="v in versions"
                :key="v.id"
                type="info"
                :title="`v${v.version}`"
                :content="v.publishedAt ? formatDateTimeInTimezone(v.publishedAt) : `版本 ${v.version}`"
              />
            </n-timeline>
          </n-spin>
        </n-tab-pane>
      </n-tabs>
    </div>

    <div v-else class="py-8 text-center">
      <n-empty :description="$t('activity.detailModal.k6ca1')" />
    </div>

    <template #footer>
      <div class="flex justify-end">
        <n-button @click="handleClose">{{ $t('activity.activityList.k5173') }}</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { computed, watch, ref } from 'vue';
import {
  NModal,
  NTabs,
  NTabPane,
  NDescriptions,
  NSpin,
  NTimeline,
  NTimelineItem,
  NEmpty,
  NDescriptionsItem,
  NTag,
  NProgress,
  NSpace,
  NIcon,
  NImage,
  NCard,
  NStatistic,
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
import { getActivityVersions } from '#/api/activity';
import { useActiveMemberTiers } from '#/composables/useActiveMemberTiers';
import { formatActivityMemberParticipation } from '#/utils/activityMemberTier';
import { formatDateTimeInTimezone } from '#/utils/timezoneUtils';
import TzDateTime from '#/components/common/TzDateTime.vue';

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

const { tierOptions: memberTierOptions, load: loadMemberTierOptions } =
  useActiveMemberTiers();

watch(
  () => props.show,
  (open) => {
    if (open) {
      loadMemberTierOptions();
    }
  },
  { immediate: true },
);
function isRulesHtml(rules: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(rules);
}

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
    title: activity.title || config.title || $t('activity.detailModal.k672a2'),
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
      $t('activity.statuses.system'),
  };
});

const memberParticipationText = computed(() => {
  if (!props.activity) return $t('activity.detailModal.k5168');

  const config = props.activity.config || {
    memberScope: props.activity.memberScope,
  };

  return formatActivityMemberParticipation(config, memberTierOptions.value);
});

const getDurationText = (
  startAt: string | Date | null | undefined,
  endAt: string | Date | null | undefined,
) => {
  if (!startAt || !endAt) {
    return $t('activity.detailModal.k672a');
  }

  try {
    const start = startAt instanceof Date ? startAt : new Date(startAt);
    const end = endAt instanceof Date ? endAt : new Date(endAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return $t('activity.detailModal.k65e02');
    }

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return $t('activity.detailModal.1');
    } else if (diffDays < 30) {
      return $t('activity.detailModal.k65e5', [diffDays]);
    } else if (diffDays < 365) {
      return $t('activity.detailModal.k6708', [Math.floor(diffDays / 30)]);
    } else {
      return $t('activity.detailModal.k5e74', [Math.floor(diffDays / 365)]);
    }
  } catch (error) {
    return $t('activity.detailModal.k8ba1');
  }
};

const getRemainingTimeText = (timeRemaining: number) => {
  if (timeRemaining <= 0) {
    return $t('activity.detailModal.k5df22');
  }

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return $t('activity.detailModal.k65e5h', [days, hours]);
  } else if (hours > 0) {
    return $t('activity.detailModal.k5c0fh', [hours, minutes]);
  } else {
    return $t('activity.detailModal.k5206f', [minutes]);
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
    DRAFT: $t('activity.statuses.draft'),
    ACTIVE: $t('activity.statuses.active'),
    CLOSED: $t('activity.activityList.k5173'),
    ENDED: $t('activity.detailModal.k5df2'),
    draft: $t('activity.statuses.draft'),
    active: $t('activity.statuses.active'),
    paused: $t('activity.statuses.paused'),
    archived: $t('activity.statuses.archived'),
  };
  return statusMap[status] || status;
};

// ✅ Map category to Chinese
const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    comprehensive: $t('activity.categories.comprehensive'),
    chess_cards: $t('activity.categories.chess_cards'),
    hunting: $t('activity.categories.hunting'),
    slot: $t('activity.categories.slot'),
    live: $t('activity.categories.live'),
    sports: $t('activity.categories.sports'),
    cockfight: $t('activity.categories.cockfight'),
    lottery: $t('activity.categories.lottery'),
    video: $t('activity.categories.video'),
    esports: $t('activity.categories.esports'),
    table: $t('activity.categories.table'),
    arcade: $t('activity.categories.arcade'),
    simulation: $t('activity.categories.simulation'),
    other: $t('activity.categories.other'),
    recharge: $t('activity.categories.recharge'),
    betting: $t('activity.categories.betting'),
    signin: $t('activity.categories.signin'),
    invite: $t('activity.categories.invite'),
    newuser: $t('activity.categories.newuser'),
    redpacket: $t('activity.categories.redpacket'),
    custom: $t('activity.categories.custom'),
  };
  return categoryMap[category] || category || $t('activity.statuses.uncategorized');
};

// ✅ Map type to Chinese
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    recharge: $t('activity.types.recharge'),
    wagering: $t('activity.types.wagering'),
    rescue: $t('activity.types.rescue'),
    checkin: $t('activity.types.checkin'),
    luckyspin: $t('activity.types.luckyspin'),
    luckywager: $t('activity.types.luckywager'),
    redpacket: $t('activity.types.redpacket'),
    investment: $t('activity.types.investment'),
    promotion: $t('activity.types.promotion'),
    agent: $t('activity.types.agent'),
    collect: $t('activity.types.collect'),
    guessing: $t('activity.types.guessing'),
    newbie: $t('activity.types.newbie'),
    referral: $t('activity.types.referral'),
    soft: $t('activity.types.soft'),
    newblade: $t('activity.types.newblade'),
    new: $t('activity.types.new'),
    ranking: $t('activity.types.ranking'),
    custom: $t('activity.types.custom'),
  };
  return typeMap[type] || type || $t('activity.statuses.unknownType');
};

// ✅ Map platform to Chinese
const getPlatformText = (platform: string) => {
  const platformMap: Record<string, string> = {
    android_app: $t('activity.platforms.android_app'),
    ios_app: $t('activity.platforms.ios_app'),
    native_app: $t('activity.platforms.native_app'),
    pwa_app: $t('activity.platforms.pwa_app'),
    pc_browser: $t('activity.platforms.pc_browser'),
    ios_h5: 'iOS H5',
    android_h5: 'Android H5',
    ios_browser: $t('activity.platforms.ios_browser'),
    browser_app: $t('activity.platforms.browser_app'),
    mobile: $t('activity.platforms.mobile'),
    desktop: $t('activity.platforms.desktop'),
    web: $t('activity.platforms.web'),
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

.activity-detail-rules-html :deep(img) {
  max-width: 100%;
  height: auto;
}

.activity-detail-rules-html :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.activity-detail-rules-html :deep(td),
.activity-detail-rules-html :deep(th) {
  border: 1px solid #e5e7eb;
  padding: 4px 8px;
}
</style>
