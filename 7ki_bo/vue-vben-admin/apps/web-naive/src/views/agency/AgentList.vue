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
            >日</n-button
          >
          <n-button
            :type="activeTab === 'week' ? 'primary' : 'default'"
            @click="activeTab = 'week'"
            >周</n-button
          >
          <n-button
            :type="activeTab === 'month' ? 'primary' : 'default'"
            @click="activeTab = 'month'"
            >月</n-button
          >
        </n-button-group>

        <!-- Date Range -->
        <div style="display: flex; gap: 4px; align-items: center">
          <span style="font-size: 12px">开始时间</span>
          <n-date-picker
            v-model:value="searchForm.startDate"
            type="datetime"
            placeholder="选择时间"
            style="width: 200px"
          />
        </div>
        <div style="display: flex; gap: 4px; align-items: center">
          <span style="font-size: 12px">结束时间</span>
          <n-date-picker
            v-model:value="searchForm.endDate"
            type="datetime"
            placeholder="选择时间"
            style="width: 200px"
          />
        </div>

        <!-- Filters -->
        <n-select
          v-model:value="searchForm.label"
          placeholder="标签标签"
          style="width: 150px"
          :options="labelOptions"
          clearable
        />
        <n-select
          v-model:value="searchForm.registrationSource"
          placeholder="父注册邀请金、可用余额"
          style="width: 200px"
          :options="registrationSourceOptions"
          clearable
        />
        <n-select
          v-model:value="searchForm.totalInvites"
          placeholder="累计邀请"
          style="width: 150px"
          :options="totalInvitesOptions"
          clearable
        />
        <n-select
          v-model:value="searchForm.profitLoss"
          placeholder="盈亏问题"
          style="width: 150px"
          :options="profitLossOptions"
          clearable
        />
        <n-select
          v-model:value="searchForm.sortBy"
          placeholder="金额排序用户式"
          style="width: 150px"
          :options="sortOptions"
          clearable
        />
        <n-select
          v-model:value="searchForm.agentMethod"
          placeholder="全部代理用方式"
          style="width: 150px"
          :options="agentMethodOptions"
          clearable
        />
        <n-select
          v-model:value="searchForm.agentType"
          placeholder="全部代理类型报"
          style="width: 150px"
          :options="agentTypeOptions"
          clearable
        />
        <n-select
          v-model:value="searchForm.superiorAgent"
          placeholder="全部上线粤家"
          style="width: 150px"
          :options="superiorAgentOptions"
          clearable
        />

        <!-- Search button -->
        <n-button type="primary" @click="handleSearch">搜索</n-button>
      </div>

      <!-- Action buttons -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px">
        <n-button type="primary" @click="handleCreate">
          <template #icon>
            <span>+</span>
          </template>
          新增代理
        </n-button>
        <n-button @click="handleImport">
          <template #icon>
            <span>↓</span>
          </template>
          导入代理
        </n-button>
        <n-button @click="handleExport">
          <template #icon>
            <span>↑</span>
          </template>
          分出提取
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
            <span style="font-weight: bold; width: 80px">小计</span>
            <span>直属会员: {{ pageSubtotal.memberCount }}</span>
            <span>下级代理: {{ pageSubtotal.downlineCount }}</span>
            <span>累计佣金: {{ pageSubtotal.commissionTotal.toFixed(2) }}</span>
            <span
              >累计领取: {{ pageSubtotal.claimedCommission.toFixed(2) }}</span
            >
            <span
              >未领取: {{ pageSubtotal.unclaimedCommission.toFixed(2) }}</span
            >
          </n-space>
          <!-- 总计 (Grand Total) -->
          <n-space :size="24">
            <span style="font-weight: bold; width: 80px">总计</span>
            <span>直属会员: {{ grandTotal.memberCount }}</span>
            <span>下级代理: {{ grandTotal.downlineCount }}</span>
            <span>累计佣金: {{ grandTotal.commissionTotal.toFixed(2) }}</span>
            <span>累计领取: {{ grandTotal.claimedCommission.toFixed(2) }}</span>
            <span>未领取: {{ grandTotal.unclaimedCommission.toFixed(2) }}</span>
          </n-space>
        </n-space>
      </div>
    </n-card>

    <!-- 新增/编辑代理弹窗 -->
    <n-modal
      v-model:show="modalVisible"
      preset="card"
      title="新增代理"
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
              label="* 代理币种"
              path="currency"
              :show-feedback="true"
            >
              <n-select
                v-model:value="formData.currency"
                :options="currencyOptions"
                placeholder="巴西(BRL)"
              />
            </n-form-item>
          </n-gi>

          <!-- 代理模式 -->
          <n-gi>
            <n-form-item label="代理模式" path="mode">
              <n-select
                v-model:value="formData.mode"
                :options="modeOptions"
                placeholder="一级代理"
              />
            </n-form-item>
          </n-gi>

          <!-- 代理账号 -->
          <n-gi>
            <n-form-item
              label="* 代理账号"
              path="username"
              :show-feedback="true"
            >
              <n-input
                v-model:value="formData.username"
                placeholder="请输入代理账号"
              />
            </n-form-item>
          </n-gi>

          <!-- 登录密码 -->
          <n-gi>
            <n-form-item
              label="* 登录密码"
              path="loginPassword"
              :show-feedback="true"
            >
              <n-input
                v-model:value="formData.loginPassword"
                type="password"
                placeholder="请输入登录密码"
              />
            </n-form-item>
          </n-gi>

          <!-- 提现密码 -->
          <n-gi>
            <n-form-item
              label="提现密码"
              path="withdrawalPassword"
              :show-feedback="true"
            >
              <n-input
                v-model:value="formData.withdrawalPassword"
                type="password"
                placeholder="请输入限6位纯数字密码"
              />
            </n-form-item>
          </n-gi>

          <!-- 代理本人层级 -->
          <n-gi>
            <n-form-item
              label="* 代理本人层级"
              path="level"
              :show-feedback="true"
            >
              <n-select
                v-model:value="formData.level"
                :options="memberTierOptions"
                placeholder="请选择代理本人层级"
              />
            </n-form-item>
          </n-gi>

          <!-- 代理本人标签 -->
          <n-gi>
            <n-form-item label="代理本人标签" path="agentTag">
              <n-select
                v-model:value="formData.agentTag"
                :options="agentTagOptions"
                placeholder="默认标签"
              />
            </n-form-item>
          </n-gi>

          <!-- 直属强制绑定层级 -->
          <n-gi>
            <n-form-item
              label="* 直属强制绑定层级"
              path="directForcedLevel"
              :show-feedback="true"
            >
              <n-select
                v-model:value="formData.directForcedLevel"
                :options="memberTierOptions"
                placeholder="请选择直属强制绑定层级"
              />
            </n-form-item>
          </n-gi>

          <!-- 直属强制绑定标签 -->
          <n-gi>
            <n-form-item label="直属强制绑定标签" path="directForcedTag">
              <n-select
                v-model:value="formData.directForcedTag"
                :options="directForcedTagOptions"
                placeholder="默认标签"
              />
            </n-form-item>
          </n-gi>

          <!-- 代理提佣方式 -->
          <n-gi>
            <n-form-item
              label="* 代理提佣方式"
              path="commissionMode"
              :show-feedback="true"
            >
              <n-select
                v-model:value="formData.commissionMode"
                :options="commissionModeOptions"
                placeholder="不限制（自由领取）"
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
        <n-button @click="modalVisible = false">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          确认
        </n-button>
      </div>
    </n-modal>

    <!-- 代理详情弹窗 -->
    <AgentDetailModal
      v-model:visible="agentDetailModalVisible"
      :agent-id="selectedAgentId"
      @refresh="fetchData"
    />
  </Page>
</template>

<script setup lang="ts">
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
import { getMemberTiersApi, type MemberTier } from '#/api/core/memberTier';
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
const currentRecord = ref<AgentRecord | null>(null);

// 代理详情弹窗
const agentDetailModalVisible = ref(false);
const selectedAgentId = ref<number>(0);

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
  label: null as string | null,
  registrationSource: null as string | null,
  totalInvites: null as string | null,
  profitLoss: null as string | null,
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
const agentTagOptions = [{ label: '默认标签', value: '默认标签' }];

const directForcedTagOptions = [{ label: '默认标签', value: '默认标签' }];

const commissionModeOptions = [
  { label: '不限制（自由领取）', value: '不限制' },
  { label: '按比例', value: '按比例' },
  { label: '固定金额', value: '固定金额' },
];

// Filter options for the new search form
const labelOptions = [
  { label: '默认标签', value: '默认标签' },
  { label: 'VIP标签', value: 'VIP标签' },
];

const registrationSourceOptions = [
  { label: '推广注册', value: '推广注册' },
  { label: '手动注册', value: '手动注册' },
];

const totalInvitesOptions = [
  { label: '全部', value: null },
  { label: '大于10', value: '>10' },
  { label: '大于50', value: '>50' },
  { label: '大于100', value: '>100' },
];

const profitLossOptions = [
  { label: '全部', value: null },
  { label: '盈利', value: 'profit' },
  { label: '亏损', value: 'loss' },
];

const sortOptions = [
  { label: '默认排序', value: null },
  { label: '金额升序', value: 'amount_asc' },
  { label: '金额降序', value: 'amount_desc' },
];

const agentMethodOptions = [
  { label: '全部代理用方式', value: null },
  { label: '推广代理', value: 'REFERRAL' },
  { label: '手动代理', value: 'MANUAL' },
];

const agentTypeOptions = [
  { label: '全部代理类型', value: null },
  { label: '一级代理', value: '1' },
  { label: '二级代理', value: '2' },
];

const superiorAgentOptions = [{ label: '全部上级', value: null }];

// 表格列配置
const columns: DataTableColumns<AgentRecord> = [
  {
    type: 'selection',
    width: 40,
  },
  {
    title: '币种',
    key: 'currency',
    width: 60,
    render: (row) => row.currency || 'BRL',
  },
  {
    title: '代理ID',
    key: 'agentId',
    width: 100,
    render: (row) => row.agentId || row.id,
  },
  {
    title: '代理账号',
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
    title: '代理方式',
    key: 'mode',
    width: 100,
    align: 'center',
    render: (row) => (row.mode === 'MANUAL' ? '人工代理' : '推广注册'),
  },
  {
    title: '上级代理',
    key: 'invitedByUsername',
    width: 120,
    render: (row) => row.invitedByUsername || '-',
  },
  {
    title: '顶层代理',
    key: 'topAgentUsername',
    width: 120,
    render: (row) => row.topAgentUsername || '-',
  },
  {
    title: '所属层数',
    key: 'hierarchyLevel',
    width: 80,
    align: 'center',
    render: (row) => row.hierarchyLevel || 1,
  },
  {
    title: '顶层代理',
    key: 'registrationSource',
    width: 100,
    render: (row) => row.registrationSource || '推广注册',
  },
  {
    title: '所属层数',
    key: 'memberCount',
    width: 80,
    align: 'center',
    render: (row) => row.memberCount || row.otherCount || 0,
  },
  {
    title: '代理模式',
    key: 'commissionMode',
    width: 120,
    render: (row) => row.commissionMode || '一级代理',
  },
  {
    title: '直属数',
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
    title: '其他数',
    key: 'secondGenerationCount',
    width: 80,
    align: 'center',
    render: (row) => row.secondGenerationCount || 0,
  },
  {
    title: '累计佣金',
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
    title: '累计领取',
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
    title: '未领取',
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
    title: '成为代理时间',
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
    title: '提佣方式',
    key: 'bindingMethod',
    width: 160,
    render: (row) => `不限制（${row.commissionMode || '自由领取'}）`,
  },
  {
    title: '推广链接',
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
                window.$message?.success('推广链接已复制');
              },
            },
            '📋',
          ),
        ],
      );
    },
  },
  {
    title: '访问量',
    key: 'visitCount',
    width: 80,
    align: 'center',
    render: (row) => row.visitCount || 0,
  },
  {
    title: '推广状态',
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
    title: '操作',
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
        { default: () => '详情 查看 >' },
      );
    },
  },
];

// 表单验证规则
const rules = computed(() => {
  return {
    username: [{ required: true, message: '请输入代理账号', trigger: 'blur' }],
    loginPassword: [
      { required: true, message: '请输入登录密码', trigger: 'blur' },
    ],
    withdrawalPassword: [
      {
        pattern: /^\d{6}$/,
        message: '提现密码必须为6位数字',
        trigger: 'blur',
      },
    ],
    currency: [{ required: true, message: '请选择代理币种', trigger: 'blur' }],
    level: [{ required: true, message: '请选择代理本人层级', trigger: 'blur' }],
    directForcedLevel: [
      { required: true, message: '请选择直属强制绑定层级', trigger: 'blur' },
    ],
    commissionMode: [
      { required: true, message: '请选择代理提佣方式', trigger: 'blur' },
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
      (sum, row) => sum + Number(row.commissionTotal || 0),
      0,
    ),
    claimedCommission: tableData.value.reduce(
      (sum, row) => sum + Number(row.claimedCommission || 0),
      0,
    ),
    unclaimedCommission: tableData.value.reduce(
      (sum, row) => sum + Number(row.unclaimedCommission || 0),
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

    tableData.value = response.list;
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

    // Fetch rebate summaries to update commission displays
    await fetchRebateSummaries();
  } catch (error) {
    console.error('获取代理列表失败:', error);
    notification.error({
      content: '获取代理列表失败',
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
    memberTiers.value = response.list;
  } catch (error) {
    console.error('获取会员层级失败:', error);
    notification.error({
      content: '获取会员层级失败',
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
      content: '获取代理模式失败',
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
  message.info('导入代理功能开发中...');
};

const handleExport = () => {
  message.info('导出功能开发中...');
};

const handleToggleStatus = async (agentId: number, isActive: boolean) => {
  try {
    await updateAgent(agentId, { isActive });
    message.success(isActive ? '已启用代理' : '已停用代理');
    fetchData();
  } catch (error) {
    console.error('更新代理状态失败:', error);
    message.error('更新代理状态失败');
  }
};

const handleReset = () => {
  Object.assign(searchForm, {
    startDate: null,
    endDate: null,
    label: null,
    registrationSource: null,
    totalInvites: null,
    profitLoss: null,
    sortBy: null,
    agentMethod: null,
    agentType: null,
    superiorAgent: null,
  });
  fetchData();
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
    message.warning('无法获取代理信息');
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
      content: '删除成功',
      duration: 3000,
    });
    fetchData();
  } catch (error) {
    console.error('删除失败:', error);
    notification.error({
      content: '删除失败',
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
        content: '更新成功',
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
        content: '创建成功',
        duration: 3000,
      });
    }

    modalVisible.value = false;
    fetchData();
  } catch (error) {
    console.error('提交失败:', error);
    notification.error({
      content: '提交失败',
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
