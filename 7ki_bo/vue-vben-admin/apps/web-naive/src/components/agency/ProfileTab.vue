<template>
  <div class="profile-tab">
    <!-- Profile Overview -->
    <n-card title="代理资料概览" class="mb-4">
      <n-descriptions bordered :column="3" size="small">
        <n-descriptions-item label="代理ID">
          {{ agentDetail?.id || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="代理账号">
          {{ agentDetail?.username || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="推荐码">
          {{ agentDetail?.referralCode || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="代理等级">
          <n-tag type="warning" size="small"
            >{{ agentDetail?.level || '--' }}级</n-tag
          >
        </n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="getStatusType(agentDetail?.isActive)" size="small">
            {{ getStatusLabel(agentDetail?.isActive) }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="币种">
          <n-tag type="info" size="small">{{
            agentDetail?.currency || '--'
          }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="注册来源">
          {{ agentDetail?.registrationSource || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="注册模式">
          <n-tag type="info" size="small">{{
            agentDetail?.mode || '--'
          }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="层级等级">
          {{ agentDetail?.hierarchyLevel || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="创建时间">
          {{ formatDateTime(agentDetail?.createdAt) || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="分配时间">
          {{ formatDateTime(agentDetail?.assignedAt) || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="最后更新">
          {{ formatDateTime(agentDetail?.updatedAt) || '--' }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <!-- Commission Information -->
    <n-card title="佣金信息" class="mb-4">
      <n-descriptions bordered :column="3" size="small">
        <n-descriptions-item label="总佣金">
          <span class="font-semibold text-green-600">
            {{ formatCurrency(agentDetail?.commissionTotal) }}
          </span>
        </n-descriptions-item>
        <n-descriptions-item label="已领取佣金">
          <span class="font-semibold text-blue-600">
            {{ formatCurrency(agentDetail?.claimedCommission) }}
          </span>
        </n-descriptions-item>
        <n-descriptions-item label="未领取佣金">
          <span class="font-semibold text-orange-600">
            {{ formatCurrency(agentDetail?.unclaimedCommission) }}
          </span>
        </n-descriptions-item>
        <n-descriptions-item label="佣金模式">
          <n-tag type="info" size="small">{{
            agentDetail?.commissionMode || '--'
          }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="下级代理数">
          <span class="font-semibold"
            >{{ agentDetail?.otherCount || 0 }} 个</span
          >
        </n-descriptions-item>
        <n-descriptions-item label="推荐链接">
          <div class="flex items-center gap-2">
            <span class="max-w-32 truncate">{{
              agentDetail?.referralUrl || '--'
            }}</span>
            <n-button
              size="tiny"
              v-if="agentDetail?.referralUrl"
              @click="copyToClipboard(agentDetail.referralUrl)"
            >
              复制
            </n-button>
          </div>
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <!-- Hierarchy Information -->
    <n-card title="层级关系" class="mb-4">
      <n-descriptions bordered :column="2" size="small">
        <n-descriptions-item label="邀请人推荐码">
          {{ agentDetail?.invitedByCode || '无' }}
        </n-descriptions-item>
        <n-descriptions-item label="顶级代理推荐码">
          {{ agentDetail?.topAgentCode || '无' }}
        </n-descriptions-item>
        <n-descriptions-item label="当前层级">
          {{ agentDetail?.hierarchyLevel || '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="下级代理数量">
          {{ agentDetail?.otherCount || 0 }} 个
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <!-- Activity Statistics -->
    <n-card title="活动统计" class="mb-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="stat-card">
          <div class="stat-value">{{ agentDetail?.otherCount || 0 }}</div>
          <div class="stat-label">下级代理</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">
            {{ formatCurrency(agentDetail?.commissionTotal) }}
          </div>
          <div class="stat-label">累计佣金</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ getDaysSinceCreation() }}</div>
          <div class="stat-label">注册天数</div>
        </div>
      </div>
    </n-card>

    <!-- Quick Actions -->
    <n-card title="快速操作" class="mb-4">
      <div class="flex flex-wrap gap-2">
        <n-button type="primary" @click="handleEditProfile">
          编辑资料
        </n-button>
        <n-button type="info" @click="handleViewSubAgents">
          查看下级代理
        </n-button>
        <n-button type="success" @click="handleViewCommissionHistory">
          查看佣金记录
        </n-button>
        <n-button type="warning" @click="handleExportProfile">
          导出资料
        </n-button>
        <n-button @click="handleRefreshProfile"> 刷新资料 </n-button>
      </div>
    </n-card>

    <!-- Profile History -->
    <n-card title="资料变更历史" class="mb-4">
      <div class="py-8 text-center text-gray-500">
        <n-icon size="48" class="mb-4">
          <TimeOutline />
        </n-icon>
        <div class="mb-2 text-lg font-medium">暂无变更记录</div>
        <div class="text-sm">代理资料变更历史将在此显示</div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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

interface Props {
  agentId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  agentId: 0,
});

const message = useMessage();

// Reactive data
const loading = ref(false);
const agentDetail = ref<AgentProfileInfo | null>(null);

// Methods
const loadAgentProfile = async () => {
  if (!props.agentId) return;

  loading.value = true;
  try {
    const data = await getAgentProfileInfoApi(props.agentId);
    agentDetail.value = data;
  } catch (error) {
    console.error('Failed to load agent profile:', error);
    message.error('加载代理资料失败');
  } finally {
    loading.value = false;
  }
};

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleString('zh-CN');
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
  if (status === undefined) return '未知';
  return status ? '激活' : '停用';
};

const getDaysSinceCreation = () => {
  if (!agentDetail.value?.createdAt) return 0;
  const created = new Date(agentDetail.value.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  } catch (error) {
    message.error('复制失败');
  }
};

const handleEditProfile = () => {
  message.info('编辑资料功能开发中...');
};

const handleViewSubAgents = () => {
  message.info('查看下级代理功能开发中...');
};

const handleViewCommissionHistory = () => {
  message.info('查看佣金记录功能开发中...');
};

const handleExportProfile = () => {
  message.info('导出资料功能开发中...');
};

const handleRefreshProfile = () => {
  loadAgentProfile();
  message.success('资料已刷新');
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
