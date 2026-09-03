<template>
  <div class="profile-tab">
    <n-card :title="$t('agency.profile.overview')" class="mb-4">
      <n-descriptions bordered :column="3" size="small">
        <n-descriptions-item :label="$t('agency.profile.agentId')">
          {{ agentDetail?.id || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.agentAccount')">
          {{ agentDetail?.username || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.referralCode')">
          {{ agentDetail?.referralCode || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.agentLevel')">
          <n-tag type="warning" size="small"
            >{{ agentDetail?.level || '--'
            }}{{ $t('agency.profile.levelSuffix') }}</n-tag
          >
        </n-descriptions-item>
        <n-descriptions-item :label="$t('common.status')">
          <n-tag :type="getStatusType(agentDetail?.isActive)" size="small">
            {{ getStatusLabel(agentDetail?.isActive) }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item :label="$t('common.currency')">
          <n-tag type="info" size="small">{{
            agentDetail?.currency || '--'
          }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.registrationSource')">
          {{ agentDetail?.registrationSource || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.registrationMode')">
          <n-tag type="info" size="small">{{
            agentDetail?.mode || '--'
          }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.hierarchyLevel')">
          {{ agentDetail?.hierarchyLevel || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('common.createTime')">
          <TzDateTime :value="agentDetail?.createdAt" fallback="--" />
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.assignedAt')">
          <TzDateTime :value="agentDetail?.assignedAt" fallback="--" />
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.lastUpdated')">
          <TzDateTime :value="agentDetail?.updatedAt" fallback="--" />
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <n-card :title="$t('agency.profile.commissionInfo')" class="mb-4">
      <n-descriptions bordered :column="3" size="small">
        <n-descriptions-item :label="$t('agency.profile.totalCommission')">
          <span class="font-semibold text-green-600">
            {{ formatCurrency(agentDetail?.commissionTotal) }}
          </span>
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.claimedCommission')">
          <span class="font-semibold text-blue-600">
            {{ formatCurrency(agentDetail?.claimedCommission) }}
          </span>
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.unclaimedCommission')">
          <span class="font-semibold text-orange-600">
            {{ formatCurrency(agentDetail?.unclaimedCommission) }}
          </span>
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.commissionMode')">
          <n-tag type="info" size="small">{{
            agentDetail?.commissionMode || '--'
          }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.subAgentCount')">
          <span class="font-semibold"
            >{{ agentDetail?.otherCount || 0
            }}{{ $t('agency.profile.countSuffix') }}</span
          >
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.referralLink')">
          <div class="flex items-center gap-2">
            <span class="max-w-32 truncate">{{
              agentDetail?.referralUrl || '--'
            }}</span>
            <n-button
              size="tiny"
              v-if="agentDetail?.referralUrl"
              @click="copyToClipboard(agentDetail.referralUrl)"
            >
              {{ $t('common.copy') }}
            </n-button>
          </div>
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <n-card :title="$t('agency.profile.hierarchy')" class="mb-4">
      <n-descriptions bordered :column="2" size="small">
        <n-descriptions-item :label="$t('agency.profile.inviterCode')">
          {{ agentDetail?.invitedByCode || $t('agency.agentDetail.none') }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.topAgentCode')">
          {{ agentDetail?.topAgentCode || $t('agency.agentDetail.none') }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.currentLevel')">
          {{ agentDetail?.hierarchyLevel || '--' }}
        </n-descriptions-item>
        <n-descriptions-item :label="$t('agency.profile.subAgentCountLabel')">
          {{ agentDetail?.otherCount || 0 }}{{ $t('agency.profile.countSuffix') }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <n-card :title="$t('agency.profile.activityStats')" class="mb-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="stat-card">
          <div class="stat-value">{{ agentDetail?.otherCount || 0 }}</div>
          <div class="stat-label">{{ $t('agency.profile.subAgents') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">
            {{ formatCurrency(agentDetail?.commissionTotal) }}
          </div>
          <div class="stat-label">
            {{ $t('agency.profile.totalCommissionStat') }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ getDaysSinceCreation() }}</div>
          <div class="stat-label">
            {{ $t('agency.profile.registrationDays') }}
          </div>
        </div>
      </div>
    </n-card>

    <n-card :title="$t('agency.profile.quickActions')" class="mb-4">
      <div class="flex flex-wrap gap-2">
        <n-button type="primary" @click="handleEditProfile">
          {{ $t('agency.profile.editProfile') }}
        </n-button>
        <n-button type="info" @click="handleViewSubAgents">
          {{ $t('agency.profile.viewSubAgents') }}
        </n-button>
        <n-button type="success" @click="handleViewCommissionHistory">
          {{ $t('agency.profile.viewCommissionHistory') }}
        </n-button>
        <n-button type="warning" @click="handleExportProfile">
          {{ $t('agency.profile.exportProfile') }}
        </n-button>
        <n-button @click="handleRefreshProfile">
          {{ $t('agency.profile.refreshProfile') }}
        </n-button>
      </div>
    </n-card>

    <n-card :title="$t('agency.profile.changeHistory')" class="mb-4">
      <div class="py-8 text-center text-gray-500">
        <n-icon size="48" class="mb-4">
          <TimeOutline />
        </n-icon>
        <div class="mb-2 text-lg font-medium">
          {{ $t('agency.profile.noChangeHistory') }}
        </div>
        <div class="text-sm">{{ $t('agency.profile.changeHistoryHint') }}</div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, onMounted } from 'vue';
import {
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NButton,
  NTag,
  NIcon,
  useMessage,
} from 'naive-ui';
import { TimeOutline } from '@vicons/ionicons5';
import {
  getAgentProfileInfoApi,
  type AgentProfileInfo,
} from '#/api/agency/agent-details';
import TzDateTime from '#/components/common/TzDateTime.vue';

interface Props {
  agentId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  agentId: 0,
});

const message = useMessage();
const loading = ref(false);
const agentDetail = ref<AgentProfileInfo | null>(null);

const loadAgentProfile = async () => {
  if (!props.agentId) return;

  loading.value = true;
  try {
    const data = await getAgentProfileInfoApi(props.agentId);
    agentDetail.value = data;
  } catch (error) {
    console.error('Failed to load agent profile:', error);
    message.error($t('agency.profile.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount: number | undefined) => {
  if (amount === null || amount === undefined) return 'R$ 0.00';
  return `R$ ${Number(amount).toFixed(2)}`;
};

const getStatusType = (status: boolean | undefined) => {
  if (status === undefined) return 'default';
  return status ? 'success' : 'error';
};

const getStatusLabel = (status: boolean | undefined) => {
  if (status === undefined) return $t('agency.profile.unknown');
  return status ? $t('agency.profile.active') : $t('agency.profile.inactive');
};

const getDaysSinceCreation = () => {
  if (!agentDetail.value?.createdAt) return 0;
  const created = new Date(agentDetail.value.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success($t('common.copySuccess'));
  } catch {
    message.error($t('agency.profile.copyFailed'));
  }
};

const handleEditProfile = () => {
  message.info($t('agency.profile.editDeveloping'));
};

const handleViewSubAgents = () => {
  message.info($t('agency.profile.subAgentsDeveloping'));
};

const handleViewCommissionHistory = () => {
  message.info($t('agency.profile.commissionDeveloping'));
};

const handleExportProfile = () => {
  message.info($t('agency.profile.exportDeveloping'));
};

const handleRefreshProfile = () => {
  loadAgentProfile();
  message.success($t('agency.profile.refreshed'));
};

onMounted(() => {
  if (props.agentId) {
    loadAgentProfile();
  }
});
</script>

<style scoped>
.profile-tab {
  padding: 16px;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.text-center {
  text-align: center;
}

.text-gray-500 {
  color: #6b7280;
}

.text-lg {
  font-size: 1.125rem;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.text-green-600 {
  color: #059669;
}

.text-blue-600 {
  color: #2563eb;
}

.text-orange-600 {
  color: #ea580c;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.gap-2 {
  gap: 0.5rem;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.max-w-32 {
  max-width: 8rem;
}
</style>
