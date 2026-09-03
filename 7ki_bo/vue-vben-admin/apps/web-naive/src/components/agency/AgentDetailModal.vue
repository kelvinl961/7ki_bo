<template>
  <n-modal
    v-model:show="visibleModel"
    :mask-closable="false"
    preset="card"
    :title="$t('agency.agentDetail.title')"
    style="width: 98vw; max-width: 1600px; height: 90vh"
    size="huge"
    @close="handleClose"
  >
    <template #header-extra>
      <div class="flex gap-2">
        <n-button size="small" @click="handleRefresh"> {{ $t('common.refresh') }} </n-button>
        <n-button size="small" type="primary" @click="handleEdit">
          {{ $t('agency.agentDetail.edit') }}
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
        <n-tab-pane name="overview" :tab="$t('agency.agentDetail.overview')">
          <div class="grid grid-cols-1 gap-4 xl:grid-cols-4">
            <!-- Left Panel: Agent Basic Information -->
            <div class="xl:col-span-3">
              <n-card :title="$t('agency.agentDetail.basicInfo')" class="mb-2">
                <n-descriptions bordered :column="3" size="small">
                  <n-descriptions-item :label="$t('agency.profile.agentId')">
                    {{ agentDetail.id }}
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.profile.agentAccount')">
                    <div class="flex items-center gap-2">
                      {{ agentDetail.username }}
                      <n-button
                        size="tiny"
                        @click="copyToClipboard(agentDetail.username)"
                      >
                        {{ $t('common.copy') }}
                      </n-button>
                    </div>
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.profile.referralCode')">
                    <div class="flex items-center gap-2">
                      {{ agentDetail.referralCode }}
                      <n-button
                        size="tiny"
                        @click="copyToClipboard(agentDetail.referralCode)"
                      >
                        {{ $t('common.copy') }}
                      </n-button>
                    </div>
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.profile.agentLevel')">
                    <n-tag type="warning"
                      >{{ agentDetail.level
                      }}{{ $t('agency.profile.levelSuffix') }}</n-tag
                    >
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('common.status')">
                    <div class="flex items-center gap-2">
                      <n-tag :type="getStatusType(agentDetail.isActive)">
                        {{ getStatusLabel(agentDetail.isActive) }}
                      </n-tag>
                      <n-button
                        size="tiny"
                        text
                        @click="showStatusModal = true"
                      >
                        {{ $t('agency.agentDetail.modifyStatus') }}
                      </n-button>
                    </div>
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('common.currency')">
                    <n-tag type="info">{{ agentDetail.currency }}</n-tag>
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.profile.registrationSource')">
                    {{ agentDetail.registrationSource }}
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.profile.registrationMode')">
                    <n-tag type="info">{{ agentDetail.mode }}</n-tag>
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.profile.hierarchyLevel')">
                    {{ agentDetail.hierarchyLevel }}
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.profile.inviterCode')">
                    {{ agentDetail.invitedByCode || '--' }}
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.profile.topAgentCode')">
                    {{ agentDetail.topAgentCode || '--' }}
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('common.createTime')">
                    <TzDateTime :value="agentDetail.createdAt" />
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.profile.assignedAt')">
                    <TzDateTime
                      :value="agentDetail.assignedAt"
                      fallback="--"
                    />
                  </n-descriptions-item>
                </n-descriptions>
              </n-card>

              <n-card :title="$t('agency.agentDetail.agentInfo')" class="mb-2">
                <n-descriptions bordered :column="3" size="small">
                  <n-descriptions-item :label="$t('agency.profile.agentLevel')">
                    <div class="flex items-center gap-2">
                      <n-tag type="warning"
                        >{{ agentDetail.level
                        }}{{ $t('agency.profile.levelSuffix') }}</n-tag
                      >
                      <n-button size="tiny" text @click="showLevelModal = true">
                        {{ $t('common.modify') }}
                      </n-button>
                    </div>
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.agentDetail.agentTags')">
                    <div class="flex items-center gap-2">
                      <n-tag size="small" type="info">
                        {{ $t('agency.agentDetail.agentUser') }}
                      </n-tag>
                      <n-button size="tiny" text @click="showTagModal = true">
                        {{ $t('common.modify') }}
                      </n-button>
                    </div>
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.agentDetail.vipLevel')">
                    V0
                  </n-descriptions-item>
                  <n-descriptions-item
                    :label="$t('agency.agentDetail.registrationTime')"
                  >
                    <TzDateTime :value="agentDetail.createdAt" />
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.agentDetail.lastLogin')">
                    <TzDateTime :value="agentDetail.updatedAt" />
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.agentDetail.loginCount')">
                    {{ $t('agency.agentDetail.loginCountSuffix', [0]) }}
                  </n-descriptions-item>
                  <n-descriptions-item :label="$t('agency.agentDetail.loginPassword')">
                    <div class="flex items-center gap-2">
                      ****** ({{ $t('agency.agentDetail.samePasswordCount', [0]) }})
                    </div>
                  </n-descriptions-item>
                  <n-descriptions-item
                    :label="$t('agency.agentDetail.withdrawalAccounts')"
                  >
                    {{ $t('agency.agentDetail.sameAccountCount', [0, 0]) }}
                  </n-descriptions-item>
                </n-descriptions>
              </n-card>
            </div>

            <!-- Right Panel: Financial Information -->
            <div class="xl:col-span-2">
              <n-card :title="$t('agency.agentDetail.financialBehavior')" class="mb-2 flex">
                <template #header-extra>
                  <div class="flex flex-wrap gap-1">
                    <n-button size="tiny" @click="handleRefresh">{{ $t('common.refresh') }}</n-button>
                    <n-button
                      size="tiny"
                      type="warning"
                      @click="showCreditModal = true"
                      >{{ $t('agency.agentDetail.manualRecall') }}</n-button
                    >
                    <n-button
                      size="tiny"
                      type="info"
                      @click="handleViewTransactionHistory"
                      >{{ $t('agency.agentDetail.transactionHistory') }}</n-button
                    >
                    <n-button
                      size="tiny"
                      type="success"
                      @click="handleShowManualTransaction('credit')"
                      >{{ $t('agency.agentDetail.manualCredit') }}</n-button
                    >
                    <n-button
                      size="tiny"
                      type="error"
                      @click="handleShowManualTransaction('debit')"
                      >{{ $t('agency.agentDetail.manualDebit') }}</n-button
                    >
                  </div>
                </template>

                <div class="space-y-1 text-sm">
                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600"
                      >{{ $t('agency.agentDetail.accountBalance') }}:</span
                    >
                    <div class="text-right">
                      <div>
                        {{ $t('agency.agentDetail.available') }}:
                        <span class="font-semibold">{{
                          formatCurrency(agentDetail.unclaimedCommission)
                        }}</span>
                      </div>
                      <div>
                        {{ $t('agency.agentDetail.frozen') }}:
                        <span class="font-semibold">{{
                          formatCurrency(agentDetail.claimedCommission)
                        }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600"
                      >{{ $t('agency.agentDetail.totalCommission') }}:</span
                    >
                    <span class="font-semibold">{{
                      formatCurrency(agentDetail.commissionTotal)
                    }}</span>
                  </div>

                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600"
                      >{{ $t('agency.agentDetail.subAgents') }}:</span
                    >
                    <span class="font-semibold"
                      >{{ agentDetail.otherCount }}
                      {{ $t('agency.profile.countSuffix') }}</span
                    >
                  </div>

                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600"
                      >{{ $t('agency.agentDetail.todayBet') }}:</span
                    >
                    <div class="text-right">
                      <div>
                        {{ $t('agency.agentDetail.valid') }}:
                        <span class="font-semibold">R$ 0.00</span>
                      </div>
                      <div>
                        {{ $t('agency.agentDetail.totalBet') }}:
                        <span class="font-semibold">R$ 0.00</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600"
                      >{{ $t('agency.agentDetail.todayPnL') }}:</span
                    >
                    <span class="font-semibold text-gray-600"> R$ 0.00 </span>
                  </div>

                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600"
                      >{{ $t('agency.agentDetail.activityBonus') }}:</span
                    >
                    <div class="text-right">
                      <div>
                        {{ $t('agency.agentDetail.tasks') }}:
                        <span class="font-semibold">R$ 0.00</span>
                      </div>
                      <div>
                        {{ $t('agency.agentDetail.recharge') }}:
                        <span class="font-semibold">R$ 0.00</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600"
                      >{{ $t('agency.agentDetail.agentHierarchy') }}:</span
                    >
                    <div class="flex items-center gap-2">
                      <span class="font-semibold"
                        >{{ agentDetail.level
                        }}{{ $t('agency.profile.levelSuffix') }}</span
                      >
                      <n-button size="tiny" text @click="showLevelModal = true"
                        >{{ $t('common.modify') }}</n-button
                      >
                    </div>
                  </div>

                  <div class="flex items-center justify-between border-b py-1">
                    <span class="text-gray-600"
                      >{{ $t('agency.agentDetail.agentTags') }}:</span
                    >
                    <div class="flex items-center gap-2">
                      <span class="font-semibold">{{
                        $t('agency.agentDetail.agentUser')
                      }}</span>
                      <n-button size="tiny" text @click="showTagModal = true"
                        >{{ $t('common.modify') }}</n-button
                      >
                    </div>
                  </div>
                </div>

                <div class="mt-2 flex gap-2 border-t pt-2">
                  <n-button size="tiny">{{
                    $t('agency.agentDetail.moreAssociations')
                  }}</n-button>
                  <n-button size="tiny">{{
                    $t('agency.agentDetail.records')
                  }}</n-button>
                  <n-button size="tiny">{{ $t('common.refresh') }}</n-button>
                  <n-button size="tiny">{{
                    $t('agency.agentDetail.manualModify')
                  }}</n-button>
                </div>
              </n-card>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="contact" :tab="$t('agency.agentDetail.contactTab')">
          <contact-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <n-tab-pane name="profile" :tab="$t('agency.agentDetail.profileTab')">
          <profile-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <n-tab-pane
          name="withdrawal-accounts"
          :tab="$t('agency.agentDetail.withdrawalAccountsTab')"
        >
          <withdraw-account-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <n-tab-pane
          name="transactions"
          :tab="$t('agency.agentDetail.transactionsTab')"
        >
          <transaction-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <n-tab-pane name="betting" :tab="$t('agency.agentDetail.bettingTab')">
          <bet-statistic-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <n-tab-pane name="messages" :tab="$t('agency.agentDetail.messagesTab')">
          <div class="py-12 text-center text-gray-500">
            {{ $t('agency.agentDetail.messagesDeveloping') }}
          </div>
        </n-tab-pane>

        <n-tab-pane name="logs" :tab="$t('agency.agentDetail.logsTab')">
          <user-audit-trail-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <n-tab-pane name="devices" :tab="$t('agency.agentDetail.devicesTab')">
          <login-devices-tab :agent-id="props.agentId" />
        </n-tab-pane>

        <n-tab-pane
          name="associations"
          :tab="$t('agency.agentDetail.associationsTab')"
        >
          <div class="py-12 text-center text-gray-500">
            {{ $t('agency.agentDetail.associationsDeveloping') }}
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- Status Change Modal -->
    <n-modal
      v-model:show="showStatusModal"
      preset="dialog"
      :title="$t('agency.agentDetail.modifyStatusTitle')"
    >
      <n-form>
        <n-form-item :label="$t('agency.agentDetail.agentStatus')">
          <n-select v-model:value="newStatus" :options="statusOptions" />
        </n-form-item>
        <n-form-item :label="$t('common.remark')">
          <n-input
            v-model:value="statusReason"
            type="textarea"
            :placeholder="$t('agency.agentDetail.enterModifyReason')"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <div class="flex gap-2">
          <n-button @click="showStatusModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="handleUpdateStatus">{{ $t('common.confirm') }}</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Level Change Modal -->
    <n-modal
      v-model:show="showLevelModal"
      preset="dialog"
      :title="$t('agency.agentDetail.modifyLevelTitle')"
    >
      <n-form>
        <n-form-item :label="$t('agency.profile.agentLevel')">
          <n-select v-model:value="newLevel" :options="levelOptions" />
        </n-form-item>
        <n-form-item :label="$t('common.remark')">
          <n-input
            v-model:value="levelReason"
            type="textarea"
            :placeholder="$t('agency.agentDetail.enterModifyReason')"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <div class="flex gap-2">
          <n-button @click="showLevelModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="handleUpdateLevel">{{ $t('common.confirm') }}</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Tag Change Modal -->
    <n-modal
      v-model:show="showTagModal"
      preset="dialog"
      :title="$t('agency.agentDetail.modifyTagTitle')"
    >
      <n-form>
        <n-form-item :label="$t('agency.agentDetail.agentTag')">
          <n-select v-model:value="newTag" :options="tagOptions" />
        </n-form-item>
        <n-form-item :label="$t('common.remark')">
          <n-input
            v-model:value="tagReason"
            type="textarea"
            :placeholder="$t('agency.agentDetail.enterModifyReason')"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <div class="flex gap-2">
          <n-button @click="showTagModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="handleUpdateTag">{{ $t('common.confirm') }}</n-button>
        </div>
      </template>
    </n-modal>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, computed, watch } from 'vue';
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
import TzDateTime from '#/components/common/TzDateTime.vue';

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
const newTag = ref<string>('agent_user');
const tagReason = ref('');

const statusOptions = computed(() => [
  { label: $t('agency.profile.active'), value: true },
  { label: $t('agency.profile.inactive'), value: false },
]);

const levelOptions = computed(() =>
  [1, 2, 3, 4, 5].map((level) => ({
    label: $t('agency.agentDetail.levelN', [level]),
    value: level,
  })),
);

const tagOptions = computed(() => [
  { label: $t('agency.agentDetail.agentUser'), value: 'agent_user' },
  { label: $t('agency.agentDetail.seniorAgent'), value: 'senior_agent' },
  { label: $t('agency.agentDetail.vipAgent'), value: 'vip_agent' },
  { label: $t('agency.agentDetail.regularAgent'), value: 'regular_agent' },
]);

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
    message.error($t('agency.agentDetail.loadFailed'));
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
  message.info($t('agency.agentDetail.editDeveloping'));
};

const handleViewTransactionHistory = () => {
  message.info($t('agency.agentDetail.transactionHistoryDeveloping'));
};

const handleShowManualTransaction = (type: 'credit' | 'debit') => {
  message.info(
    type === 'credit'
      ? $t('agency.agentDetail.manualCreditDeveloping')
      : $t('agency.agentDetail.manualDebitDeveloping'),
  );
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

    message.success($t('agency.agentDetail.statusUpdateSuccess'));
    showStatusModal.value = false;
    loadAgentDetail();
    emit('refresh');
  } catch (error) {
    message.error($t('agency.agentDetail.statusUpdateFailed'));
    console.error('Error updating agent status:', error);
  }
};

const handleUpdateLevel = async () => {
  try {
    message.success($t('agency.agentDetail.levelUpdateSuccess'));
    showLevelModal.value = false;
    loadAgentDetail();
    emit('refresh');
  } catch (error) {
    message.error($t('agency.agentDetail.levelUpdateFailed'));
    console.error('Error updating agent level:', error);
  }
};

const handleUpdateTag = async () => {
  try {
    message.success($t('agency.agentDetail.tagUpdateSuccess'));
    showTagModal.value = false;
    loadAgentDetail();
    emit('refresh');
  } catch (error) {
    message.error($t('agency.agentDetail.tagUpdateFailed'));
    console.error('Error updating agent tag:', error);
  }
};

const formatCurrency = (amount: number) => {
  if (amount === null || amount === undefined) return 'R$ 0.00';
  return `R$ ${Number(amount).toFixed(2)}`;
};

const getStatusType = (status: boolean) => {
  return status ? 'success' : 'error';
};

const getStatusLabel = (status: boolean) => {
  return status ? $t('agency.profile.active') : $t('agency.profile.inactive');
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success($t('common.copySuccess'));
  } catch {
    message.error($t('agency.profile.copyFailed'));
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
