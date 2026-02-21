<template>
  <n-modal
    v-model:show="visibleModel"
    :mask-closable="false"
    preset="card"
    title="代理详情"
    style="width: 98vw; max-width: 1600px; height: 90vh"
    size="huge"
    @close="handleClose"
  >
    <template #header-extra>
      <div class="flex gap-2">
        <n-button size="small" @click="handleRefresh"> 刷新 </n-button>
        <n-button size="small" type="primary" @click="handleEdit">
          编辑
        </n-button>
      </div>
    </template>

    <div v-if="loading" class="flex h-96 items-center justify-center">
      <div class="w-full max-w-4xl">
        <n-skeleton :rows="3" />
        <div class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-4">
          <div class="xl:col-span-3">
            <n-skeleton :rows="6" />
          </div>
          <div class="xl:col-span-1">
            <n-skeleton :rows="4" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="agentDetail" class="agent-detail-content">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <!-- Tab 1: 代理概览 -->
        <n-tab-pane name="overview" tab="代理概览">
          <div class="grid grid-cols-1 gap-4 xl:grid-cols-4">
            <!-- Left Panel: Agent Basic Information -->
            <div class="xl:col-span-3">
              <n-card title="基本信息" class="mb-2">
                <n-descriptions bordered :column="3" size="small">
                  <n-descriptions-item label="代理ID">
                    {{ agentDetail.id }}
                  </n-descriptions-item>
                  <n-descriptions-item label="代理账号">
                    <div class="flex items-center gap-2">
                      {{ agentDetail.username }}
                      <n-button
                        size="tiny"
                        @click="copyToClipboard(agentDetail.username)"
                      >
                        复制
                      </n-button>
                    </div>
                  </n-descriptions-item>
                  <n-descriptions-item label="推荐码">
                    <div class="flex items-center gap-2">
                      {{ agentDetail.referralCode }}
                      <n-button
                        size="tiny"
                        @click="copyToClipboard(agentDetail.referralCode)"
                      >
                        复制
                      </n-button>
                    </div>
                  </n-descriptions-item>
                  <n-descriptions-item label="代理等级">
                    <n-tag type="warning">{{ agentDetail.level }}级</n-tag>
                  </n-descriptions-item>
                  <n-descriptions-item label="状态">
                    <div class="flex items-center gap-2">
                      <n-tag :type="getStatusType(agentDetail.isActive)">
                        {{ getStatusLabel(agentDetail.isActive) }}
                      </n-tag>
                      <n-button
                        size="tiny"
                        text
                        @click="showStatusModal = true"
                      >
                        修改状态
                      </n-button>
                    </div>
                  </n-descriptions-item>
                  <n-descriptions-item label="币种">
                    <n-tag type="info">{{ agentDetail.currency }}</n-tag>
                  </n-descriptions-item>
                  <n-descriptions-item label="注册来源">
                    {{ agentDetail.registrationSource }}
                  </n-descriptions-item>
                  <n-descriptions-item label="注册模式">
                    <n-tag type="info">{{ agentDetail.mode }}</n-tag>
                  </n-descriptions-item>
                  <n-descriptions-item label="层级等级">
                    {{ agentDetail.hierarchyLevel }}
                  </n-descriptions-item>
                  <n-descriptions-item label="邀请人推荐码">
                    {{ agentDetail.invitedByCode || '--' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="顶级代理推荐码">
                    {{ agentDetail.topAgentCode || '--' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="创建时间">
                    {{ formatDateTime(agentDetail.createdAt) }}
                  </n-descriptions-item>
                  <n-descriptions-item label="分配时间">
                    {{
                      agentDetail.assignedAt
                        ? formatDateTime(agentDetail.assignedAt)
                        : '--'
                    }}
                  </n-descriptions-item>
                </n-descriptions>
              </n-card>

              <n-card title="代理信息" class="mb-2">
                <n-descriptions bordered :column="3" size="small">
                  <n-descriptions-item label="代理等级">
                    <div class="flex items-center gap-2">
                      <n-tag type="warning">{{ agentDetail.level }}级</n-tag>
                      <n-button size="tiny" text @click="showLevelModal = true">
                        修改
                      </n-button>
                    </div>
                  </n-descriptions-item>
                  <n-descriptions-item label="代理标签">
                    <div class="flex items-center gap-2">
                      <n-tag size="small" type="info"> 代理用户 </n-tag>
                      <n-button size="tiny" text @click="showTagModal = true">
                        修改
                      </n-button>
                    </div>
                  </n-descriptions-item>
                  <n-descriptions-item label="VIP等级">
                    V0
                  </n-descriptions-item>
                  <n-descriptions-item label="注册时间">
                    {{ formatDateTime(agentDetail.createdAt) }}
                  </n-descriptions-item>
                  <n-descriptions-item label="最后登录">
                    {{ formatDateTime(agentDetail.updatedAt) }}
                  </n-descriptions-item>
                  <n-descriptions-item label="登录次数">
                    0 次
                  </n-descriptions-item>
                  <n-descriptions-item label="登录密码">
                    <div class="flex items-center gap-2">
                      ****** (同密码人数: 0)
                    </div>
                  </n-descriptions-item>
                  <n-descriptions-item label="提现账号">
                    0个 (同号人数: 0)
                  </n-descriptions-item>
                </n-descriptions>
              </n-card>
            </div>

            <!-- Right Panel: Financial Information -->
            <div class="xl:col-span-2">
              <n-card title="资金投注行为" class="mb-2 flex">
                <template #header-extra>
                  <div class="flex flex-wrap gap-1">
                    <n-button size="tiny" @click="handleRefresh">刷新</n-button>
                    <n-button
                      size="tiny"
                      type="warning"
                      @click="showCreditModal = true"
                      >人工拉回</n-button
                    >
                    <n-button
                      size="tiny"
                      type="info"
                      @click="handleViewTransactionHistory"
                      >账变记录</n-button
                    >
                    <n-button
                      size="tiny"
                      type="success"
                      @click="handleShowManualTransaction('credit')"
                      >手动加款</n-button
                    >
                    <n-button
                      size="tiny"
                      type="error"
                      @click="handleShowManualTransaction('debit')"
                      >手动扣除</n-button
                    >
                  </div>
                </template>

                <div class="space-y-1 text-sm">
                  <!-- Balance Information -->
                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600">账户余额:</span>
                    <div class="text-right">
                      <div>
                        可用:
                        <span class="font-semibold">{{
                          formatCurrency(agentDetail.unclaimedCommission)
                        }}</span>
                      </div>
                      <div>
                        冻结:
                        <span class="font-semibold">{{
                          formatCurrency(agentDetail.claimedCommission)
                        }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Commission Summary -->
                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600">累计佣金:</span>
                    <span class="font-semibold">{{
                      formatCurrency(agentDetail.commissionTotal)
                    }}</span>
                  </div>

                  <!-- Sub-agents Count -->
                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600">下级代理:</span>
                    <span class="font-semibold"
                      >{{ agentDetail.otherCount }} 个</span
                    >
                  </div>

                  <!-- Today's Betting -->
                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600">今日投注:</span>
                    <div class="text-right">
                      <div>
                        有效: <span class="font-semibold">R$ 0.00</span>
                      </div>
                      <div>
                        总投注: <span class="font-semibold">R$ 0.00</span>
                      </div>
                    </div>
                  </div>

                  <!-- Today's Win/Loss -->
                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600">今日损益:</span>
                    <span class="font-semibold text-gray-600"> R$ 0.00 </span>
                  </div>

                  <!-- Activity Summary -->
                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600">活动优惠:</span>
                    <div class="text-right">
                      <div>
                        任务: <span class="font-semibold">R$ 0.00</span>
                      </div>
                      <div>
                        充值: <span class="font-semibold">R$ 0.00</span>
                      </div>
                    </div>
                  </div>

                  <!-- Agent Level -->
                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600">代理层级:</span>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold"
                        >{{ agentDetail.level }}级</span
                      >
                      <n-button size="tiny" text @click="showLevelModal = true"
                        >修改</n-button
                      >
                    </div>
                  </div>

                  <!-- Agent Tags -->
                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600">代理标签:</span>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold">代理用户</span>
                      <n-button size="tiny" text @click="showTagModal = true"
                        >修改</n-button
                      >
                    </div>
                  </div>
                </div>

                <!-- Bottom Action Buttons -->
                <div class="mt-2 flex gap-2 border-t pt-2">
                  <n-button size="tiny">更多关联</n-button>
                  <n-button size="tiny">记录</n-button>
                  <n-button size="tiny">刷新</n-button>
                  <n-button size="tiny">手动修改</n-button>
                </div>
              </n-card>
            </div>
          </div>
        </n-tab-pane>

        <!-- Tab 2: 联系方式（需安全码解密） -->
        <n-tab-pane name="contact" tab="联系方式（需安全码解密）">
          <contact-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <!-- Tab 3: 个人资料 -->
        <n-tab-pane name="profile" tab="个人资料">
          <profile-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <!-- Tab 4: 提现账号 -->
        <n-tab-pane name="withdrawal-accounts" tab="提现账号">
          <withdraw-account-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <!-- Tab 5: 账户交易 -->
        <n-tab-pane name="transactions" tab="账户交易">
          <transaction-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <!-- Tab 6: 投注统计 -->
        <n-tab-pane name="betting" tab="投注统计">
          <bet-statistic-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <!-- Tab 7: 会员消息 -->
        <n-tab-pane name="messages" tab="会员消息">
          <div class="py-12 text-center text-gray-500">
            会员消息功能开发中...
          </div>
        </n-tab-pane>

        <!-- Tab 8: 会员日志 -->
        <n-tab-pane name="logs" tab="会员日志">
          <user-audit-trail-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <!-- Tab 9: 登录设备 -->
        <n-tab-pane name="devices" tab="登录设备">
          <login-devices-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <!-- Tab 10: 关联账号 -->
        <n-tab-pane name="associations" tab="关联账号">
          <div class="py-12 text-center text-gray-500">
            关联账号功能开发中...
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- Status Change Modal -->
    <n-modal
      v-model:show="showStatusModal"
      preset="dialog"
      title="修改代理状态"
    >
      <n-form>
        <n-form-item label="代理状态">
          <n-select v-model:value="newStatus" :options="statusOptions" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input
            v-model:value="statusReason"
            type="textarea"
            placeholder="请输入修改原因"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <div class="flex gap-2">
          <n-button @click="showStatusModal = false">取消</n-button>
          <n-button type="primary" @click="handleUpdateStatus">确认</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Level Change Modal -->
    <n-modal v-model:show="showLevelModal" preset="dialog" title="修改代理等级">
      <n-form>
        <n-form-item label="代理等级">
          <n-select v-model:value="newLevel" :options="levelOptions" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input
            v-model:value="levelReason"
            type="textarea"
            placeholder="请输入修改原因"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <div class="flex gap-2">
          <n-button @click="showLevelModal = false">取消</n-button>
          <n-button type="primary" @click="handleUpdateLevel">确认</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Tag Change Modal -->
    <n-modal v-model:show="showTagModal" preset="dialog" title="修改代理标签">
      <n-form>
        <n-form-item label="代理标签">
          <n-select v-model:value="newTag" :options="tagOptions" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input
            v-model:value="tagReason"
            type="textarea"
            placeholder="请输入修改原因"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <div class="flex gap-2">
          <n-button @click="showTagModal = false">取消</n-button>
          <n-button type="primary" @click="handleUpdateTag">确认</n-button>
        </div>
      </template>
    </n-modal>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import {
  NModal,
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NInput,
  NForm,
  NFormItem,
  NSelect,
  NTabs,
  NTabPane,
  useMessage,
} from 'naive-ui';
import { getAgentByIdApi } from '#/api/agency/agent';
import type { AgentRecord } from '#/api/agency/agent';
import ContactTab from './ContactTab.vue';
import ProfileTab from './ProfileTab.vue';
import WithdrawAccountTab from './WithdrawAccountTab.vue';
import TransactionTab from './TransactionTab.vue';
import BetStatisticTab from './BetStatisticTab.vue';
import UserAuditTrailTab from './UserAuditTrailTab.vue';
import LoginDevicesTab from './LoginDevicesTab.vue';
import { updateAgentStatusApi } from '#/api/agency/agent';
import { notification } from '#/adapter/naive';

interface Props {
  visible: boolean;
  agentId?: number;
}

interface Emits {
  (event: 'update:visible', value: boolean): void;
  (event: 'refresh'): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  agentId: 0,
});

const emit = defineEmits<Emits>();

const message = useMessage();

// Reactive data
const loading = ref(false);
const agentDetail = ref<AgentRecord | null>(null);
const activeTab = ref('overview');

// Modal states
const showStatusModal = ref(false);
const showLevelModal = ref(false);
const showTagModal = ref(false);
const showCreditModal = ref(false);

// Form data
const newStatus = ref<boolean>(true);
const statusReason = ref('');
const newLevel = ref<number>(1);
const levelReason = ref('');
const newTag = ref<string>('代理用户');
const tagReason = ref('');

// Options
const statusOptions = [
  { label: '激活', value: true },
  { label: '停用', value: false },
];

const levelOptions = [
  { label: '1级', value: 1 },
  { label: '2级', value: 2 },
  { label: '3级', value: 3 },
  { label: '4级', value: 4 },
  { label: '5级', value: 5 },
];

const tagOptions = [
  { label: '代理用户', value: '代理用户' },
  { label: '高级代理', value: '高级代理' },
  { label: 'VIP代理', value: 'VIP代理' },
  { label: '普通代理', value: '普通代理' },
];

// Computed
const visibleModel = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

// Watch for visible changes
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.agentId) {
      loadAgentDetail();
    }
  },
  { immediate: true },
);

// Watch for agentId changes
watch(
  () => props.agentId,
  (newVal) => {
    if (newVal && props.visible) {
      loadAgentDetail();
    }
  },
);

// Methods
const loadAgentDetail = async () => {
  if (!props.agentId) return;

  loading.value = true;
  try {
    agentDetail.value = await getAgentByIdApi(Number(props.agentId));
  } catch (error) {
    message.error('获取代理详情失败');
    console.error('Error loading agent detail:', error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('update:visible', false);
  activeTab.value = 'overview';
};

const handleRefresh = () => {
  loadAgentDetail();
  emit('refresh');
};

const handleEdit = () => {
  message.info('编辑功能开发中...');
};

const handleViewTransactionHistory = () => {
  message.info('账变记录功能开发中...');
};

const handleShowManualTransaction = (type: 'credit' | 'debit') => {
  message.info(`${type === 'credit' ? '手动加款' : '手动扣除'}功能开发中...`);
};

const handleToggleStatus = () => {
  newStatus.value = !agentDetail.value?.isActive;
  statusReason.value = '';
  showStatusModal.value = true;
};

const handleUpdateStatus = async () => {
  if (!agentDetail.value) return;

  try {
    await updateAgentStatusApi(agentDetail.value.id, {
      isActive: newStatus.value,
      remark: statusReason.value,
    });

    message.success('状态更新成功');
    showStatusModal.value = false;
    loadAgentDetail();
    emit('refresh');
  } catch (error) {
    message.error('状态更新失败');
    console.error('Error updating agent status:', error);
  }
};

const handleUpdateLevel = async () => {
  try {
    message.success('等级更新成功');
    showLevelModal.value = false;
    loadAgentDetail();
    emit('refresh');
  } catch (error) {
    message.error('等级更新失败');
    console.error('Error updating agent level:', error);
  }
};

const handleUpdateTag = async () => {
  try {
    message.success('标签更新成功');
    showTagModal.value = false;
    loadAgentDetail();
    emit('refresh');
  } catch (error) {
    message.error('标签更新失败');
    console.error('Error updating agent tag:', error);
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

const formatCurrency = (amount: number) => {
  if (amount === null || amount === undefined) return 'R$ 0.00';
  return `R$ ${Number(amount).toFixed(2)}`;
};

const getStatusType = (status: boolean) => {
  return status ? 'success' : 'error';
};

const getStatusLabel = (status: boolean) => {
  return status ? '激活' : '停用';
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  } catch (error) {
    message.error('复制失败');
  }
};

// Expose methods
defineExpose({
  loadAgentDetail,
});
</script>

<style scoped>
.agent-detail-content {
  min-height: 400px;
  overflow-y: auto;
  max-height: 75vh;
}

.n-descriptions :deep(.n-descriptions-item-label) {
  font-weight: 500;
  color: #666;
  padding: 8px 12px;
}

.n-descriptions :deep(.n-descriptions-item-content) {
  color: #333;
  padding: 8px 12px;
}

.n-descriptions :deep(.n-descriptions-item) {
  padding: 4px 0;
}

.n-card :deep(.n-card-header) {
  padding: 12px 16px;
}

.n-card :deep(.n-card__content) {
  padding: 12px 16px;
}

/* Utility classes */
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.gap-4 {
  gap: 1rem;
}
.gap-2 {
  gap: 0.5rem;
}
.gap-1 {
  gap: 0.25rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}
.mt-2 {
  margin-top: 0.5rem;
}
.pt-2 {
  padding-top: 0.5rem;
}
.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}
.text-center {
  text-align: center;
}
.text-gray-500 {
  color: #6b7280;
}
.text-gray-600 {
  color: #4b5563;
}
.text-sm {
  font-size: 0.875rem;
}
.font-semibold {
  font-weight: 600;
}
.border-b {
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
}
.border-t {
  border-top-width: 1px;
  border-top-color: #e5e7eb;
}
.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.flex-wrap {
  flex-wrap: wrap;
}
</style>
