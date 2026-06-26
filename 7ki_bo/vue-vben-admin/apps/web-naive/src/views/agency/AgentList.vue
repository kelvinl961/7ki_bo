<template>
  <Page>
    <n-card>
      <div
        style="
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
        "
      >
        <!-- Tab buttons -->
        <n-button-group>
          <n-button
            :type="activeTab === 'day' ? 'primary' : 'default'"
            @click="activeTab = 'day'"
            >{{ $t('common.day') }}</n-button
          >
          <n-button
            :type="activeTab === 'week' ? 'primary' : 'default'"
            @click="activeTab = 'week'"
            >{{ $t('common.week') }}</n-button
          >
          <n-button
            :type="activeTab === 'month' ? 'primary' : 'default'"
            @click="activeTab = 'month'"
            >{{ $t('common.month') }}</n-button
          >
        </n-button-group>

        <!-- Date Range -->
        <div style="display: flex; gap: 4px; align-items: center">
          <span style="font-size: 12px">{{ $t('common.startTime') }}</span>
          <n-date-picker
            v-model:value="searchForm.startDate"
            type="datetime"
            :placeholder="$t('agency.agentList.selectTime')"
            style="width: 200px"
          />
        </div>
        <div style="display: flex; gap: 4px; align-items: center">
          <span style="font-size: 12px">{{ $t('common.endTime') }}</span>
          <n-date-picker
            v-model:value="searchForm.endDate"
            type="datetime"
            :placeholder="$t('agency.agentList.selectTime')"
            style="width: 200px"
          />
        </div>

        <!-- Filters -->
        <n-select
          v-model:value="searchForm.keywordField"
          :placeholder="$t('agency.commission.agentId')"
          style="width: 140px"
          :options="keywordFieldOptions"
        />
        <n-input
          v-model:value="searchForm.keyword"
          :placeholder="$t('agency.agentList.keywordFuzzy')"
          style="width: 220px"
          clearable
        />
        <n-select
          v-model:value="searchForm.metricField"
          :placeholder="$t('agency.agentList.totalCommissionFilter')"
          style="width: 140px"
          :options="metricFieldOptions"
          clearable
        />
        <n-input-number
          v-model:value="searchForm.metricMin"
          :placeholder="$t('agency.agentList.minValue')"
          style="width: 120px"
          :show-button="false"
          clearable
        />
        <n-input-number
          v-model:value="searchForm.metricMax"
          :placeholder="$t('agency.agentList.maxValue')"
          style="width: 120px"
          :show-button="false"
          clearable
        />
        <n-select
          v-model:value="searchForm.commissionMode"
          :placeholder="$t('agency.agentList.allCommissionModes')"
          style="width: 140px"
          :options="commissionFilterOptions"
          clearable
        />
        <n-select
          v-model:value="searchForm.agentMethod"
          :placeholder="$t('agency.agentList.allAgentMethods')"
          style="width: 150px"
          :options="agentMethodOptions"
          clearable
        />
        <n-select
          v-model:value="searchForm.agentType"
          :placeholder="$t('agency.agentList.allAgentLevels')"
          style="width: 150px"
          :options="agentTypeOptions"
          clearable
        />
        <n-select
          v-model:value="searchForm.registrationSource"
          :placeholder="$t('agency.agentList.allRegSources')"
          style="width: 150px"
          :options="registrationSourceOptions"
          clearable
        />

        <!-- Search button -->
        <n-button type="primary" @click="handleSearch">{{ $t('common.search') }}</n-button>
        <n-button @click="handleReset">{{ $t('agency.agentList.clearFilters') }}</n-button>
      </div>

      <!-- Action buttons -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px">
        <n-button type="primary" @click="handleCreate">
          <template #icon>
            <span>+</span>
          </template>
          {{ $t('agency.agentList.addAgent') }}
        </n-button>
        <n-button @click="handleImport">
          <template #icon>
            <span>↓</span>
          </template>
          {{ $t('agency.agentList.importAgent') }}
        </n-button>
        <n-button @click="handleExport">
          <template #icon>
            <span>↑</span>
          </template>
          {{ $t('agency.agentList.exportExtract') }}
        </n-button>
      </div>

      <!-- Table -->
      <n-data-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="paginationConfig"
        :row-key="(row: AgentRecord) => row.id"
        :scroll-x="2400"
        :summary="createSummary"
        remote
      />

      <!-- Summary Rows -->
      <div
        v-if="tableData.length > 0"
        style="
          margin-top: 16px;
          padding: 12px;
          background: #fafafa;
          border-radius: 4px;
        "
      >
        <n-space vertical :size="8">
          <!-- 小计 (Page Subtotal) -->
          <n-space :size="24">
            <span style="font-weight: bold; width: 80px">{{ $t('agency.agentList.subtotal') }}</span>
            <span>{{ $t('agency.agentList.directMembers') }}: {{ pageSubtotal.memberCount }}</span>
            <span>{{ $t('agency.agentList.downlineAgents') }}: {{ pageSubtotal.downlineCount }}</span>
            <span>{{ $t('agency.agentList.totalCommission') }}: {{ pageSubtotal.commissionTotal.toFixed(2) }}</span>
            <span
              >{{ $t('agency.agentList.totalClaimed') }}: {{ pageSubtotal.claimedCommission.toFixed(2) }}</span
            >
            <span
              >{{ $t('agency.agentList.unclaimed') }}: {{ pageSubtotal.unclaimedCommission.toFixed(2) }}</span
            >
          </n-space>
          <!-- 总计 (Grand Total) -->
          <n-space :size="24">
            <span style="font-weight: bold; width: 80px">{{ $t('agency.agentList.grandTotal') }}</span>
            <span>{{ $t('agency.agentList.directMembers') }}: {{ grandTotal.memberCount }}</span>
            <span>{{ $t('agency.agentList.downlineAgents') }}: {{ grandTotal.downlineCount }}</span>
            <span>{{ $t('agency.agentList.totalCommission') }}: {{ grandTotal.commissionTotal.toFixed(2) }}</span>
            <span>{{ $t('agency.agentList.totalClaimed') }}: {{ grandTotal.claimedCommission.toFixed(2) }}</span>
            <span>{{ $t('agency.agentList.unclaimed') }}: {{ grandTotal.unclaimedCommission.toFixed(2) }}</span>
          </n-space>
        </n-space>
      </div>
    </n-card>

    <!-- 新增/编辑代理弹窗 -->
    <n-modal
      v-model:show="modalVisible"
      preset="card"
      :title="$t('agency.agentList.addAgentTitle')"
      size="medium"
      :style="{ width: '600px', maxWidth: '90vw' }"
      :segmented="false"
      :mask-closable="false"
      transform-origin="center"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="120px"
        :show-feedback="true"
        size="medium"
      >
        <n-grid :cols="2" :x-gap="12" :y-gap="8">
          <!-- 代理币种 -->
          <n-gi>
            <n-form-item
              :label="`* ${$t('agency.agentList.agentCurrency')}`"
              path="currency"
              :show-feedback="true"
            >
              <n-select
                v-model:value="formData.currency"
                :options="currencyOptions"
                :placeholder="$t('agency.agentList.brazilBrl')"
              />
            </n-form-item>
          </n-gi>

          <!-- 代理模式 -->
          <n-gi>
            <n-form-item :label="$t('agency.agentList.agentMode')" path="mode">
              <n-select
                v-model:value="formData.mode"
                :options="modeOptions"
                :placeholder="$t('agency.agentList.levelOneAgent')"
              />
            </n-form-item>
          </n-gi>

          <!-- 代理账号 -->
          <n-gi>
            <n-form-item
              :label="`* ${$t('agency.agentList.agentAccount')}`"
              path="username"
              :show-feedback="true"
            >
              <n-input
                v-model:value="formData.username"
                :placeholder="$t('agency.agentList.enterAgentAccount')"
              />
            </n-form-item>
          </n-gi>

          <!-- 登录密码 -->
          <n-gi>
            <n-form-item
              :label="`* ${$t('agency.agentList.loginPassword')}`"
              path="loginPassword"
              :show-feedback="true"
            >
              <n-input
                v-model:value="formData.loginPassword"
                type="password"
                :placeholder="$t('agency.agentList.enterLoginPassword')"
              />
            </n-form-item>
          </n-gi>

          <!-- 提现密码 -->
          <n-gi>
            <n-form-item
              :label="$t('agency.agentList.withdrawalPassword')"
              path="withdrawalPassword"
              :show-feedback="true"
            >
              <n-input
                v-model:value="formData.withdrawalPassword"
                type="password"
                :placeholder="$t('agency.agentList.withdrawalPasswordHint')"
              />
            </n-form-item>
          </n-gi>

          <!-- 代理本人层级 -->
          <n-gi>
            <n-form-item
              :label="`* ${$t('agency.agentList.agentLevel')}`"
              path="level"
              :show-feedback="true"
            >
              <n-select
                v-model:value="formData.level"
                :options="memberTierOptions"
                :placeholder="$t('agency.agentList.selectAgentLevel')"
              />
            </n-form-item>
          </n-gi>

          <!-- 代理本人标签 -->
          <n-gi>
            <n-form-item :label="$t('agency.agentList.agentTag')" path="agentTag">
              <n-select
                v-model:value="formData.agentTag"
                :options="agentTagOptions"
                :placeholder="$t('agency.agentList.defaultTag')"
              />
            </n-form-item>
          </n-gi>

          <!-- 直属强制绑定层级 -->
          <n-gi>
            <n-form-item
              :label="`* ${$t('agency.agentList.directForcedLevel')}`"
              path="directForcedLevel"
              :show-feedback="true"
            >
              <n-select
                v-model:value="formData.directForcedLevel"
                :options="memberTierOptions"
                :placeholder="$t('agency.agentList.selectDirectForcedLevel')"
              />
            </n-form-item>
          </n-gi>

          <!-- 直属强制绑定标签 -->
          <n-gi>
            <n-form-item :label="$t('agency.agentList.directForcedTag')" path="directForcedTag">
              <n-select
                v-model:value="formData.directForcedTag"
                :options="directForcedTagOptions"
                :placeholder="$t('agency.agentList.defaultTag')"
              />
            </n-form-item>
          </n-gi>

          <!-- 代理提佣方式 -->
          <n-gi>
            <n-form-item
              :label="`* ${$t('agency.agentList.commissionMode')}`"
              path="commissionMode"
              :show-feedback="true"
            >
              <n-select
                v-model:value="formData.commissionMode"
                :options="commissionModeOptions"
                :placeholder="$t('agency.agentList.unlimitedFreeClaim')"
              />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
      <div
        style="
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        "
      >
        <n-button @click="modalVisible = false">{{ $t('common.cancel') }}</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ $t('common.confirm') }}
        </n-button>
      </div>
    </n-modal>

    <!-- 代理详情弹窗 -->
    <AgentDetailModal
      v-model:visible="agentDetailModalVisible"
      :agent-id="selectedAgentId"
      @refresh="fetchData"
    />

    <UserDetailModal
      v-model:visible="userDetailModalVisible"
      :user-id="selectedUserId"
    />
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, onMounted, h, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import {
  getNowInTimezone,
  convertTimezoneToUTC,
  getDisplayTimezone,
} from '#/utils/timezoneUtils';
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSelect,
  NInputNumber,
  NModal,
  NTag,
  NSpace,
  NPopconfirm,
  NGrid,
  NGi,
  NSwitch,
  NDatePicker,
  NButtonGroup,
  NDataTable,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  getAgentList,
  createAgent,
  updateAgent,
  deleteAgent,
  formatCurrency,
  type AgentRecord,
  type AgentListParams,
  type CreateAgentParams,
  type UpdateAgentParams,
} from '#/api/agency/agent';
import { getUserListApi } from '#/api/core/user-management';
import { getMemberTiersApi, type MemberTier } from '#/api/core/memberTier';
import { sortMemberTiersForDisplay } from '#/utils/memberTierSort';
import { agentModeApi } from '#/api/agency/agent-mode';
import {
  getAgentRebateSummariesApi,
  type AgentRebateSummary,
} from '#/api/agency/rebate';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const AgentDetailModal = defineAsyncComponent(
  () => import('#/components/agency/AgentDetailModal.vue'),
);
const UserDetailModal = defineAsyncComponent(
  () => import('#/components/user/UserDetailModal.vue'),
);
import { notification } from '#/adapter/naive';

const message = useMessage();
const router = useRouter();
const route = useRoute();

// 表单引用
const formRef = ref();

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const modalVisible = ref(false);
const isEdit = ref(false);
const tableData = ref<AgentRecord[]>([]);
const rawTableData = ref<AgentRecord[]>([]);
const currentRecord = ref<AgentRecord | null>(null);

// 代理详情弹窗
const agentDetailModalVisible = ref(false);
const selectedAgentId = ref<number>(0);
const userDetailModalVisible = ref(false);
const selectedUserId = ref<number>(0);

// Member tiers for level dropdown
const memberTiers = ref<MemberTier[]>([]);
const memberTierOptions = computed(() => {
  return memberTiers.value.map((tier) => ({
    label: tier.tierName,
    value: tier.id,
  }));
});

// Rebate summaries for commission display
const rebateSummaries = ref<Record<number, AgentRebateSummary>>({});

// Active tab
const activeTab = ref('day');

// 搜索表单
const searchForm = reactive({
  startDate: null as number | null,
  endDate: null as number | null,
  keywordField: 'agentId' as string,
  keyword: '',
  metricField: null as string | null,
  metricMin: null as null | number,
  metricMax: null as null | number,
  commissionMode: null as string | null,
  registrationSource: null as string | null,
  sortBy: null as string | null,
  agentMethod: null as string | null,
  agentType: null as string | null,
  superiorAgent: null as string | null,
});

// 表单数据
const formData = reactive({
  username: '',
  referralCode: '',
  loginPassword: '',
  withdrawalPassword: '',
  level: null,
  agentTag: '默认标签',
  directForcedLevel: null,
  directForcedTag: '默认标签',
  invitedByCode: '',
  topAgentCode: '',
  hierarchyLevel: 1,
  mode: null, // Will be set to first available agent mode
  registrationSource: '推广注册',
  currency: 'BRL',
  commissionMode: '不限制',
  isActive: true,
});

// 分页配置
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

// Pagination config for n-data-table
const paginationConfig = computed(() => {
  console.log('Pagination config:', {
    page: paginationReactive.page,
    pageSize: paginationReactive.pageSize,
    total: paginationReactive.total,
    pageCount: Math.ceil(
      paginationReactive.total / paginationReactive.pageSize,
    ),
  });

  return {
    page: paginationReactive.page,
    pageSize: paginationReactive.pageSize,
    pageCount: Math.ceil(
      paginationReactive.total / paginationReactive.pageSize,
    ),
    itemCount: paginationReactive.total,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onChange: (page: number) => {
      console.log('Page changed to:', page);
      paginationReactive.page = page;
      fetchData();
    },
    onUpdatePageSize: (pageSize: number) => {
      console.log('Page size changed to:', pageSize);
      paginationReactive.pageSize = pageSize;
      paginationReactive.page = 1;
      fetchData();
    },
  };
});

// Agent mode options (dynamic)
const agentModes = ref<any[]>([]);
const modeOptions = computed(() => {
  return agentModes.value.map((mode) => ({
    label: mode.name,
    value: mode.id, // Use unique mode ID as value
    modeType: 'REFERRAL', // Store the backend enum value separately
  }));
});
const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USDT', value: 'USDT' },
  { label: 'BTC', value: 'BTC' },
  { label: 'ETH', value: 'ETH' },
];
const agentTagOptions = computed(() => [
  { label: $t('agency.agentList.defaultTag'), value: '默认标签' },
]);
const directForcedTagOptions = computed(() => [
  { label: $t('agency.agentList.defaultTag'), value: '默认标签' },
]);
const commissionModeOptions = computed(() => [
  { label: $t('agency.agentList.unlimitedFreeClaim'), value: '不限制' },
  { label: $t('agency.agentList.byRatio'), value: '按比例' },
  { label: $t('agency.agentList.fixedAmount'), value: '固定金额' },
]);
const metricFieldOptions = computed(() => [
  { label: $t('agency.agentList.totalCommissionFilter'), value: 'commissionTotal' },
  { label: $t('agency.agentList.totalClaimedFilter'), value: 'claimedCommission' },
  { label: $t('agency.agentList.unclaimedFilter'), value: 'unclaimedCommission' },
  { label: $t('agency.agentList.hierarchyLevel'), value: 'hierarchyLevel' },
]);
const commissionFilterOptions = computed(() => [
  { label: $t('agency.agentList.allCommissionModes'), value: null },
  { label: $t('agency.agentList.unlimitedFreeClaim'), value: '不限制' },
  { label: $t('agency.agentList.byRatio'), value: '按比例' },
  { label: $t('agency.agentList.fixedAmount'), value: '固定金额' },
]);

const getRebateMetric = (
  row: AgentRecord,
  metric: 'claimedCommission' | 'totalCommission' | 'unclaimedCommission',
) => {
  const rebateData = rebateSummaries.value[row.id];
  if (rebateData) {
    return Number(rebateData[metric] || 0);
  }

  if (metric === 'totalCommission') return Number(row.commissionTotal || 0);
  if (metric === 'claimedCommission') return Number(row.claimedCommission || 0);
  return Number(row.unclaimedCommission || 0);
};

const metricValueGetters: Record<string, (row: AgentRecord) => number> = {
  commissionTotal: (row) => getRebateMetric(row, 'totalCommission'),
  claimedCommission: (row) => getRebateMetric(row, 'claimedCommission'),
  unclaimedCommission: (row) => getRebateMetric(row, 'unclaimedCommission'),
  hierarchyLevel: (row) => Number(row.hierarchyLevel || 0),
};

const keywordFieldOptions = computed(() => [
  { label: $t('agency.commission.agentId'), value: 'agentId' },
  { label: $t('agency.agentList.referralCode'), value: 'referralCode' },
  { label: $t('common.memberAccount'), value: 'username' },
  { label: $t('agency.agentList.superiorAgentId'), value: 'invitedById' },
  { label: $t('agency.agentList.superiorAgentAccount'), value: 'invitedByUsername' },
  { label: $t('agency.agentList.topAgentId'), value: 'topAgentId' },
  { label: $t('agency.agentList.topAgentAccount'), value: 'topAgentUsername' },
]);
const registrationSourceOptions = computed(() => [
  { label: $t('agency.agentList.promoRegistration'), value: '推广注册' },
  { label: $t('agency.agentList.manualRegistration'), value: '手动注册' },
]);
const totalInvitesOptions = computed(() => [
  { label: $t('common.all'), value: null },
  { label: $t('agency.agentList.greaterThan10'), value: '>10' },
  { label: $t('agency.agentList.greaterThan50'), value: '>50' },
  { label: $t('agency.agentList.greaterThan100'), value: '>100' },
]);
const profitLossOptions = computed(() => [
  { label: $t('common.all'), value: null },
  { label: $t('agency.agentList.profit'), value: 'profit' },
  { label: $t('agency.agentList.loss'), value: 'loss' },
]);
const sortOptions = computed(() => [
  { label: $t('agency.agentList.defaultSort'), value: null },
  { label: $t('agency.agentList.amountAsc'), value: 'amount_asc' },
  { label: $t('agency.agentList.amountDesc'), value: 'amount_desc' },
]);
const agentMethodOptions = computed(() => [
  { label: $t('agency.agentList.allAgentMethodsFilter'), value: null },
  { label: $t('agency.agentList.referralAgent'), value: 'REFERRAL' },
  { label: $t('agency.agentList.manualAgent'), value: 'MANUAL' },
]);
const agentTypeOptions = computed(() => [
  { label: $t('agency.agentList.allAgentTypes'), value: null },
  { label: $t('agency.agentList.levelOne'), value: '1' },
  { label: $t('agency.agentList.levelTwo'), value: '2' },
]);

// 表格列配置
const columns = computed<DataTableColumns<AgentRecord>>(() => [
  {
    type: 'selection',
    width: 40,
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 60,
    render: (row) => row.currency || 'BRL',
  },
  {
    title: $t('agency.agentList.userId'),
    key: 'userID',
    width: 100,
    render: (row) => {
      const displayId = row.userID || row.agentId || String(row.id);
      return h(
        'span',
        {
          style: 'color: #2080f0; cursor: pointer;',
          onClick: () => handleViewUserDetail(row),
        },
        displayId,
      );
    },
  },
  {
    title: $t('agency.agentList.agentAccount'),
    key: 'username',
    width: 140,
    render: (row) => {
      const tier = memberTiers.value.find((t) => t.id === row.level);
      const levelText = tier ? tier.tierName : `LV${row.level || 1}`;
      return h(
        'div',
        { style: 'display: flex; align-items: center; gap: 4px;' },
        [
          h(
            'span',
            { style: 'color: #666; font-size: 11px; white-space: nowrap;' },
            levelText,
          ),
          h(
            NButton,
            {
              text: true,
              type: 'primary',
              onClick: () => handleViewAgentDetail(row),
              style: 'padding: 0;',
            },
            { default: () => row.username },
          ),
        ],
      );
    },
  },
  {
    title: $t('agency.agentList.agentMethod'),
    key: 'mode',
    width: 100,
    align: 'center',
    render: (row) => (row.mode === 'MANUAL' ? $t('agency.agentList.manualAgentDisplay') : $t('agency.agentList.promoRegistration')),
  },
  {
    title: $t('agency.agentList.superiorAgent'),
    key: 'invitedByUsername',
    width: 120,
    render: (row) => row.invitedByUsername || '-',
  },
  {
    title: $t('agency.agentList.topAgent'),
    key: 'topAgentUsername',
    width: 120,
    render: (row) => row.topAgentUsername || '-',
  },
  {
    title: $t('agency.agentList.hierarchyLevel'),
    key: 'hierarchyLevel',
    width: 80,
    align: 'center',
    render: (row) => row.hierarchyLevel || 1,
  },
  {
    title: $t('agency.agentList.topAgent'),
    key: 'registrationSource',
    width: 100,
    render: (row) => row.registrationSource || $t('agency.agentList.promoRegistration'),
  },
  {
    title: $t('agency.agentList.hierarchyLevel'),
    key: 'memberCount',
    width: 80,
    align: 'center',
    render: (row) => row.memberCount || row.otherCount || 0,
  },
  {
    title: $t('agency.agentList.agentMode'),
    key: 'commissionMode',
    width: 120,
    render: (row) => row.commissionMode || $t('agency.agentList.levelOneAgent'),
  },
  {
    title: $t('agency.agentList.directCount'),
    key: 'downlineCount',
    width: 80,
    align: 'center',
    render: (row) => {
      // 🔧 FIX: Show memberCount (subordinate players) instead of downlineCount (sub-agents)
      const count = row.memberCount || 0;
      return h(
        NButton,
        {
          text: true,
          type: 'primary',
          size: 'small',
          onClick: () => handleViewDirectMembers(row),
          style: 'font-weight: 600;',
        },
        {
          default: () => count.toLocaleString(),
        },
      );
    },
  },
  {
    title: $t('agency.agentList.otherCount'),
    key: 'secondGenerationCount',
    width: 80,
    align: 'center',
    render: (row) => row.secondGenerationCount || 0,
  },
  {
    title: $t('agency.agentList.totalCommission'),
    key: 'commissionTotal',
    width: 100,
    align: 'right',
    render: (row) => {
      const rebateData = rebateSummaries.value[row.id];
      const amount = rebateData?.totalCommission ?? row.commissionTotal ?? 0;
      return Number(amount).toFixed(2);
    },
  },
  {
    title: $t('agency.agentList.totalClaimed'),
    key: 'claimedCommission',
    width: 100,
    align: 'right',
    render: (row) => {
      const rebateData = rebateSummaries.value[row.id];
      const amount =
        rebateData?.claimedCommission ?? row.claimedCommission ?? 0;
      return Number(amount).toFixed(2);
    },
  },
  {
    title: $t('agency.agentList.unclaimed'),
    key: 'unclaimedCommission',
    width: 100,
    align: 'right',
    render: (row) => {
      const rebateData = rebateSummaries.value[row.id];
      const amount =
        rebateData?.unclaimedCommission ?? row.unclaimedCommission ?? 0;
      return Number(amount).toFixed(2);
    },
  },
  {
    title: $t('agency.agentList.agentSince'),
    key: 'createdAt',
    width: 160,
    render: (row) => {
      const date = new Date(row.createdAt);
      return date
        .toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
        .replace(/\//g, '-');
    },
  },
  {
    title: $t('agency.agentList.commissionMethod'),
    key: 'bindingMethod',
    width: 160,
    render: (row) => $t('agency.agentList.unlimitedPrefix', [row.commissionMode || $t('agency.agentList.freeClaim')]),
  },
  {
    title: $t('agency.agentList.referralLink'),
    key: 'referralUrl',
    width: 180,
    render: (row) => {
      const referralUrl = `https://sevenki.118br.com/?ref=${row.agentId || row.invitationCode}`;
      return h(
        'div',
        { style: 'display: flex; align-items: center; gap: 4px;' },
        [
          h(
            'a',
            {
              href: referralUrl,
              target: '_blank',
              style:
                'color: #1890ff; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;',
            },
            referralUrl.length > 30
              ? referralUrl.substring(0, 30) + '...'
              : referralUrl,
          ),
          h(
            'span',
            {
              style: 'cursor: pointer;',
              onClick: () => {
                navigator.clipboard.writeText(referralUrl);
                window.$message?.success($t('agency.agentList.referralCopied'));
              },
            },
            '📋',
          ),
        ],
      );
    },
  },
  {
    title: $t('agency.agentList.visitCount'),
    key: 'visitCount',
    width: 80,
    align: 'center',
    render: (row) => row.visitCount || 0,
  },
  {
    title: $t('agency.agentList.promoStatus'),
    key: 'isActive',
    width: 100,
    align: 'center',
    render: (row) => {
      return h(NSwitch, {
        value: row.isActive,
        onUpdateValue: (value: boolean) => handleToggleStatus(row.id, value),
      });
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 120,
    fixed: 'right',
    align: 'center',
    render: (row) => {
      return h(
        NButton,
        {
          text: true,
          type: 'primary',
          onClick: () => handleViewAgentDetail(row),
        },
        { default: () => $t('agency.agentList.viewDetail') },
      );
    },
  },
]);

// 表单验证规则
const rules = computed(() => {
  return {
    username: [{ required: true, message: $t('agency.agentList.enterAgentAccountRequired'), trigger: 'blur' }],
    loginPassword: [
      { required: true, message: $t('agency.agentList.enterLoginPasswordRequired'), trigger: 'blur' },
    ],
    withdrawalPassword: [
      {
        pattern: /^\d{6}$/,
        message: $t('agency.agentList.withdrawalPasswordInvalid'),
        trigger: 'blur',
      },
    ],
    currency: [{ required: true, message: $t('agency.agentList.selectCurrencyRequired'), trigger: 'blur' }],
    level: [{ required: true, message: $t('agency.agentList.selectLevelRequired'), trigger: 'blur' }],
    directForcedLevel: [
      { required: true, message: $t('agency.agentList.selectDirectLevelRequired'), trigger: 'blur' },
    ],
    commissionMode: [
      { required: true, message: $t('agency.agentList.selectCommissionRequired'), trigger: 'blur' },
    ],
  };
});

// 小计 (Page Subtotal) - Sum of current page
const pageSubtotal = computed(() => {
  return {
    memberCount: tableData.value.reduce(
      (sum, row) => sum + (row.memberCount || row.otherCount || 0),
      0,
    ),
    downlineCount: tableData.value.reduce(
      (sum, row) => sum + (row.downlineCount || 0),
      0,
    ),
    commissionTotal: tableData.value.reduce(
      (sum, row) => sum + getRebateMetric(row, 'totalCommission'),
      0,
    ),
    claimedCommission: tableData.value.reduce(
      (sum, row) => sum + getRebateMetric(row, 'claimedCommission'),
      0,
    ),
    unclaimedCommission: tableData.value.reduce(
      (sum, row) => sum + getRebateMetric(row, 'unclaimedCommission'),
      0,
    ),
  };
});

// 总计 (Grand Total) - Would need to fetch from backend for all filtered results
// For now, using the same as pageSubtotal, but should be updated to fetch total from API
const grandTotal = ref({
  memberCount: 0,
  downlineCount: 0,
  commissionTotal: 0,
  claimedCommission: 0,
  unclaimedCommission: 0,
});

// Summary renderer for data table (optional, using custom div below instead)
const createSummary = (pageData: AgentRecord[]) => {
  return {};
};

// 数据获取
const fetchData = async () => {
  loading.value = true;
  try {
    const params: AgentListParams = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
    };

    console.log('Fetching data with params:', params);

    // Add date range if provided
    if (searchForm.startDate && searchForm.endDate) {
      params.dateRange = [
        new Date(searchForm.startDate).toISOString(),
        new Date(searchForm.endDate).toISOString(),
      ];
    }

    const response = await getAgentList(params);
    console.log('API Response:', {
      listLength: response.list.length,
      pagination: response.pagination,
    });

    rawTableData.value = response.list;
    paginationReactive.total = response.pagination.total;

    // Update grand total from API summary
    if (response.summary) {
      grandTotal.value = {
        memberCount: response.summary.totalMembers || 0,
        downlineCount: response.summary.totalDownlines || 0,
        commissionTotal: response.summary.totalCommission || 0,
        claimedCommission: response.summary.totalClaimed || 0,
        unclaimedCommission: response.summary.totalUnclaimed || 0,
      };
    }

    console.log('Updated pagination state:', {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      total: paginationReactive.total,
    });

    // Fetch rebate summaries first, then filter so "累计领取" uses API values
    await fetchRebateSummaries();
    tableData.value = applyClientFilters(rawTableData.value);
  } catch (error) {
    console.error('获取代理列表失败:', error);
    notification.error({
      content: $t('agency.agentList.loadListFailed'),
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// 获取会员层级数据
const fetchMemberTiers = async () => {
  try {
    const response = await getMemberTiersApi({
      isActive: true,
      pageSize: 100, // Get all active tiers
    });
    memberTiers.value = sortMemberTiersForDisplay(response.list);
  } catch (error) {
    console.error('获取会员层级失败:', error);
    notification.error({
      content: $t('agency.agentList.loadTiersFailed'),
      duration: 3000,
    });
  }
};

// Fetch active agent modes
const fetchAgentModes = async () => {
  try {
    const response = await agentModeApi.getAgentModeList({
      isEnabled: true, // Only get enabled/active agent modes
      pageSize: 100, // Get all active modes
      sortBy: 'id', // Sort by ID
      sortOrder: 'asc', // Ascending order
    });
    agentModes.value = response.data.list;

    // Set default mode to first available agent mode
    if (agentModes.value.length > 0 && formData.mode === null) {
      formData.mode = agentModes.value[0].id;
    }
  } catch (error) {
    console.error('获取代理模式失败:', error);
    notification.error({
      content: $t('agency.agentList.loadModesFailed'),
      duration: 3000,
    });
  }
};

// Fetch rebate summaries for commission display
const fetchRebateSummaries = async () => {
  try {
    const response = await getAgentRebateSummariesApi();
    rebateSummaries.value = response.data;
    console.log(
      '📊 Rebate summaries loaded:',
      Object.keys(response.data).length,
      'agents',
    );
  } catch (error) {
    console.error('获取代理返佣数据失败:', error);
    // Don't show error notification as this is supplementary data
    // The agent list will still work with fallback values
  }
};

// 事件处理
const handleSearch = () => {
  paginationReactive.page = 1;
  fetchData();
};

const handleImport = () => {
  message.info($t('agency.agentList.importDeveloping'));
};

const handleExport = () => {
  message.info($t('agency.agentList.exportDeveloping'));
};

const handleToggleStatus = async (agentId: number, isActive: boolean) => {
  try {
    await updateAgent(agentId, { isActive });
    message.success(isActive ? $t('agency.agentList.agentEnabled') : $t('agency.agentList.agentDisabled'));
    fetchData();
  } catch (error) {
    console.error('更新代理状态失败:', error);
    message.error($t('agency.agentList.updateStatusFailed'));
  }
};

const handleReset = () => {
  Object.assign(searchForm, {
    startDate: null,
    endDate: null,
    keywordField: 'agentId',
    keyword: '',
    metricField: null,
    metricMin: null,
    metricMax: null,
    commissionMode: null,
    registrationSource: null,
    sortBy: null,
    agentMethod: null,
    agentType: null,
    superiorAgent: null,
  });
  fetchData();
};

const handleViewUserDetail = (record: AgentRecord) => {
  void openUserDetailByAgentRecord(record);
};

const openUserDetailByAgentRecord = async (record: AgentRecord) => {
  try {
    const externalUserId = String(record.userID || '').trim();

    if (externalUserId) {
      const response = await getUserListApi({
        page: 1,
        pageSize: 1,
        searchField: 'userID',
        searchMode: 'exact',
        searchValue: externalUserId,
      });

      const matchedUser = response?.list?.[0];
      if (matchedUser?.id) {
        selectedUserId.value = Number(matchedUser.id);
        userDetailModalVisible.value = true;
        return;
      }
    }

    // Fallback: some environments may already return internal ID in row.id
    selectedUserId.value = Number(record.id);
    userDetailModalVisible.value = true;
  } catch (error) {
    console.error('打开用户详情失败:', error);
    message.error($t('agency.agentList.openUserDetailFailed'));
  }
};

const applyClientFilters = (rows: AgentRecord[]) => {
  return rows.filter((row) => {
    const keyword = searchForm.keyword.trim();
    if (keyword) {
      const keywordMatcher: Record<string, string> = {
        agentId: String(row.userID || row.agentId || row.id || ''),
        referralCode: String(row.referralCode || ''),
        username: String(row.username || ''),
        invitedById: String(row.invitedByCode || ''),
        invitedByUsername: String(row.invitedByUsername || ''),
        topAgentId: String(row.topAgentCode || ''),
        topAgentUsername: String(row.topAgentUsername || ''),
      };
      const target = (keywordMatcher[searchForm.keywordField] || '').toLowerCase();
      if (!target.includes(keyword.toLowerCase())) {
        return false;
      }
    }

    if (
      searchForm.commissionMode &&
      row.commissionMode !== searchForm.commissionMode
    ) {
      return false;
    }

    if (searchForm.agentMethod && row.mode !== searchForm.agentMethod) {
      return false;
    }

    if (
      searchForm.registrationSource &&
      row.registrationSource !== searchForm.registrationSource
    ) {
      return false;
    }

    if (searchForm.metricField) {
      const getter = metricValueGetters[searchForm.metricField];
      const value = getter ? getter(row) : 0;
      if (
        searchForm.metricMin !== null &&
        value < Number(searchForm.metricMin)
      ) {
        return false;
      }
      if (
        searchForm.metricMax !== null &&
        value > Number(searchForm.metricMax)
      ) {
        return false;
      }
    }

    return true;
  });
};

const handleCreate = () => {
  isEdit.value = false;
  currentRecord.value = null;
  resetForm();
  modalVisible.value = true;
};

// 查看代理详情
const handleViewAgentDetail = (record: AgentRecord) => {
  selectedAgentId.value = record.id;
  agentDetailModalVisible.value = true;
};

// 查看直属会员（跳转到所有会员页面并预填上级代理）
const handleViewDirectMembers = (record: AgentRecord) => {
  // 🔧 Users are invited by userID (9-digit), so use that for filtering
  // Fallback to username if userID is not available
  const agentIdentifier = record.userID || record.username || '';

  if (!agentIdentifier) {
    message.warning($t('agency.agentList.cannotGetAgent'));
    return;
  }

  // Navigate to all members page with pre-filled superior agent filter
  // Use upper_agent_id if we have userID, otherwise use upper_agent_account
  const searchField = record.userID ? 'upper_agent_id' : 'upper_agent_account';

  router.push({
    path: '/user-management/all-members',
    query: {
      searchField: searchField,
      searchValue: agentIdentifier,
      // ✅ FIX: Don't set dateQuickSelect - show all downlines without date filter
    },
  });
};

const handleEdit = (record: AgentRecord) => {
  isEdit.value = true;
  currentRecord.value = record;
  Object.assign(formData, {
    username: record.username,
    referralCode: record.referralCode,
    level: record.level,
    invitedByCode: record.invitedByCode || '',
    topAgentCode: record.topAgentCode || '',
    hierarchyLevel: record.hierarchyLevel,
    mode: record.mode,
    registrationSource: record.registrationSource,
    currency: record.currency,
    commissionMode: record.commissionMode,
    isActive: record.isActive,
  });
  modalVisible.value = true;
};

const handleDelete = async (id: number) => {
  try {
    await deleteAgent(id);
    notification.success({
      content: $t('common.deleteSuccess'),
      duration: 3000,
    });
    fetchData();
  } catch (error) {
    console.error('删除失败:', error);
    notification.error({
      content: $t('common.operationFailed'),
      duration: 3000,
    });
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;

    if (isEdit.value && currentRecord.value) {
      const updateData: UpdateAgentParams = {
        username: formData.username,
        referralCode: formData.referralCode,
        level: Number(formData.level) || 1,
        invitedByCode: formData.invitedByCode || undefined,
        topAgentCode: formData.topAgentCode || undefined,
        hierarchyLevel: formData.hierarchyLevel,
        mode: 'REFERRAL' as 'MANUAL' | 'REFERRAL', // All agent modes from database map to REFERRAL
        registrationSource: formData.registrationSource,
        currency: formData.currency,
        commissionMode: formData.commissionMode,
        isActive: formData.isActive,
      };
      await updateAgent(currentRecord.value.id, updateData);
      notification.success({
        content: $t('agency.agentList.updateSuccess'),
        duration: 3000,
      });
    } else {
      const createData: CreateAgentParams = {
        agentId: genAgentId(),
        username: formData.username,
        referralCode:
          formData.referralCode &&
          /^([A-Z0-9]{6,20})$/.test(formData.referralCode)
            ? formData.referralCode
            : genReferralCode(),
        level: Number(formData.level) || 1,
        invitedByCode: formData.invitedByCode || undefined,
        topAgentCode: formData.topAgentCode || undefined,
        hierarchyLevel: formData.hierarchyLevel,
        mode: 'REFERRAL' as 'MANUAL' | 'REFERRAL', // All agent modes from database map to REFERRAL
        registrationSource: formData.registrationSource,
        currency: formData.currency,
        commissionMode: formData.commissionMode,
        isActive: formData.isActive,
      };
      await createAgent(createData);
      notification.success({
        content: $t('agency.agentList.createSuccess'),
        duration: 3000,
      });
    }

    modalVisible.value = false;
    fetchData();
  } catch (error) {
    console.error('提交失败:', error);
    notification.error({
      content: $t('agency.agentList.submitFailed'),
      duration: 3000,
    });
  } finally {
    submitting.value = false;
  }
};

// Note: handlePageChange and handlePageSizeChange moved to SmartDataGrid handlers above

const resetForm = () => {
  Object.assign(formData, {
    username: '',
    referralCode: '',
    loginPassword: '',
    withdrawalPassword: '',
    level: null,
    agentTag: '默认标签',
    directForcedLevel: null,
    directForcedTag: '默认标签',
    invitedByCode: '',
    topAgentCode: '',
    hierarchyLevel: 1,
    mode: agentModes.value.length > 0 ? agentModes.value[0].id : null, // Set to first available agent mode
    registrationSource: '推广注册',
    currency: 'BRL',
    commissionMode: '不限制',
    isActive: true,
  });
};

function genReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return '7KI' + code;
}

function genAgentId(): string {
  // Generate 9-digit random number
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

// 初始化
onMounted(() => {
  const q = route.query;
  const qs = q.agentDateStart as string | undefined;
  const qe = q.agentDateEnd as string | undefined;
  if (qs && qe) {
    const s = Number(qs);
    const e = Number(qe);
    if (!Number.isNaN(s) && !Number.isNaN(e)) {
      searchForm.startDate = s;
      searchForm.endDate = e;
    }
  }

  // 📅 Set default today date range in UTC-3 (America/Sao_Paulo) timezone
  // Only set if not already set (preserve user's selection)
  if (!searchForm.startDate && !searchForm.endDate) {
    const tz = getDisplayTimezone(); // Defaults to 'America/Sao_Paulo' (UTC-3)
    const now = getNowInTimezone(tz);

    // Get today's start (00:00:00) and end (23:59:59) in UTC-3 timezone
    const todayStartUTC = convertTimezoneToUTC(
      now.year,
      now.month,
      now.day,
      0,
      0,
      0,
      tz,
    );
    const todayEndUTC = convertTimezoneToUTC(
      now.year,
      now.month,
      now.day,
      23,
      59,
      59,
      tz,
    );

    searchForm.startDate = todayStartUTC.getTime();
    searchForm.endDate = todayEndUTC.getTime();

    console.log('📅 Set default date range (UTC-3):', {
      timezone: tz,
      today: `${now.year}-${now.month}-${now.day}`,
      start: todayStartUTC.toISOString(),
      end: todayEndUTC.toISOString(),
    });
  }

  fetchData();
  fetchMemberTiers();
  fetchAgentModes();
});
</script>

<style scoped>
.n-card {
  margin: 16px 0;
}
</style>
