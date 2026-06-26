<template>
  <div class="member-tier-management p-4">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        {{ $t('user.memberTier.pageTitle') }}
      </h1>
      <p class="mt-1 text-gray-600">
        {{ $t('user.memberTier.pageSubtitle') }}
      </p>
    </div>

    <!-- Tier Type Tabs -->
    <n-card class="mb-4">
      <n-tabs
        v-model:value="activeTab"
        type="line"
        animated
        @update:value="handleTabChange"
      >
        <n-tab name="auto_upgrade" :tab="$t('user.memberTier.autoUpgrade')">
        </n-tab>
        <n-tab name="fixed_tier" :tab="$t('user.memberTier.fixedTier')"> </n-tab>
      </n-tabs>
    </n-card>

    <!-- Filters and Search -->
    <n-card class="mb-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="min-w-64 flex-1">
          <n-input
            v-model:value="searchKeyword"
            :placeholder="$t('user.memberTier.searchPlaceholder')"
            clearable
            @input="handleSearch"
          />
        </div>

        <n-select
          v-model:value="statusFilter"
          :placeholder="$t('user.memberTier.statusFilter')"
          clearable
          style="width: 120px"
          :options="statusOptions"
          @update:value="handleFilter"
        />

        <n-select
          v-model:value="sortBy"
          :placeholder="$t('user.memberTier.sortBy')"
          style="width: 150px"
          :options="sortOptions"
          @update:value="handleSort"
        />

        <n-button @click="handleResetFilters">
          {{ $t('user.memberTier.resetFilters') }}
        </n-button>
      </div>
    </n-card>

    <!-- 🚀 NEW: SmartDataGrid Component -->
    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      :scroll-x="1400"
      :height="600"
      size="small"
      row-key="id"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="handleRefresh"
      @row-click="handleRowClick"
    >
      <template #actionBar>
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="handleCreateTier">
                  {{ $t('user.memberTier.addTier') }}
                </n-button>
                <n-button type="info" @click="handleRefreshStatistics">
                  {{ $t('user.memberTier.refreshStats') }}
                </n-button>
              </div>

              <!-- 当前标签页信息 -->
              <div class="text-sm text-gray-600">
                {{
                  $t('user.memberTier.recordCount', [
                    activeTabLabel,
                    paginationReactive.total,
                  ])
                }}
              </div>
            </div>

            <div class="flex gap-2">
              <!-- 刷新按钮 -->
              <n-button size="small" @click="handleRefresh">
                {{ $t('user.memberTier.refreshData') }}
              </n-button>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- Create/Edit Modal -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="modalTitle"
      style="width: 900px; max-height: 80vh"
      :mask-closable="false"
    >
      <n-scrollbar style="max-height: 60vh">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-placement="left"
          label-width="120px"
          class="pr-4"
        >
          <!-- Basic Information -->
          <n-divider title-placement="left">
            {{ $t('user.memberTier.basicInfo') }}
          </n-divider>

          <n-form-item :label="$t('user.memberTier.tierType')" path="tierType">
            <n-select
              v-model:value="formData.tierType"
              :options="tierTypeOptions"
              :disabled="isEditing"
              :placeholder="$t('user.memberTier.selectTierType')"
            />
          </n-form-item>

          <n-form-item :label="$t('user.memberTier.tierName')" path="tierName">
            <n-input
              v-model:value="formData.tierName"
              :placeholder="$t('user.memberTier.enterTierName')"
            />
          </n-form-item>

          <n-form-item :label="$t('user.memberTier.tierCode')" path="tierCode">
            <n-input
              v-model:value="formData.tierCode"
              :placeholder="$t('user.memberTier.enterTierCode')"
              :disabled="isEditing"
            />
          </n-form-item>

          <n-form-item :label="$t('common.description')" path="description">
            <n-input
              v-model:value="formData.description"
              type="textarea"
              :placeholder="$t('user.memberTier.enterDescription')"
              :rows="2"
            />
          </n-form-item>

          <n-form-item :label="$t('user.memberTier.keyTags')" path="keyTags">
            <n-dynamic-tags
              v-model:value="formData.keyTags"
              :placeholder="$t('user.memberTier.addTag')"
            />
          </n-form-item>

          <n-form-item :label="$t('user.memberTier.sortOrder')" path="sortOrder">
            <n-input-number
              v-model:value="formData.sortOrder"
              :placeholder="$t('user.memberTier.sortOrder')"
              :min="0"
              style="width: 150px"
            />
          </n-form-item>

          <!-- Auto Upgrade Criteria (only for auto_upgrade type) -->
          <template v-if="formData.tierType === 'auto_upgrade'">
            <n-divider title-placement="left">
              {{ $t('user.memberTier.upgradeCriteria') }}
            </n-divider>

            <n-form-item
              :label="$t('user.memberTier.minDeposit')"
              path="minDepositAmount"
            >
              <n-input-number
                v-model:value="formData.minDepositAmount"
                :placeholder="$t('user.memberTier.minDeposit')"
                :min="0"
                :precision="2"
                style="width: 200px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>

            <n-form-item
              :label="$t('user.memberTier.minBet')"
              path="minBetAmount"
            >
              <n-input-number
                v-model:value="formData.minBetAmount"
                :placeholder="$t('user.memberTier.minBet')"
                :min="0"
                :precision="2"
                style="width: 200px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>

            <n-form-item
              :label="$t('user.memberTier.minValidBet')"
              path="minValidBetAmount"
            >
              <n-input-number
                v-model:value="formData.minValidBetAmount"
                :placeholder="$t('user.memberTier.minValidBet')"
                :min="0"
                :precision="2"
                style="width: 200px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>

            <n-form-item
              :label="$t('user.memberTier.evaluationPeriod')"
              path="evaluationPeriodDays"
            >
              <n-input-number
                v-model:value="formData.evaluationPeriodDays"
                :placeholder="$t('user.memberTier.evaluationDays')"
                :min="1"
                style="width: 150px"
              >
                <template #suffix>{{ $t('user.memberTier.daysSuffix') }}</template>
              </n-input-number>
            </n-form-item>
          </template>

          <!-- Benefits -->
          <n-divider title-placement="left">
            {{ $t('user.memberTier.tierBenefits') }}
          </n-divider>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item
              :label="$t('user.memberTier.depositBonusRate')"
              path="depositBonusRate"
            >
              <n-input-number
                v-model:value="formData.depositBonusRate"
                :placeholder="$t('user.memberTier.depositBonusRate')"
                :min="0"
                :max="1"
                :precision="4"
                :step="0.0001"
                style="width: 150px"
              >
                <template #suffix>%</template>
              </n-input-number>
            </n-form-item>

            <n-form-item
              :label="$t('user.memberTier.rebateRate')"
              path="rebateRate"
            >
              <n-input-number
                v-model:value="formData.rebateRate"
                :placeholder="$t('user.memberTier.rebateRate')"
                :min="0"
                :max="1"
                :precision="4"
                :step="0.0001"
                style="width: 150px"
              >
                <template #suffix>%</template>
              </n-input-number>
            </n-form-item>

            <n-form-item
              :label="$t('user.memberTier.withdrawLimit')"
              path="withdrawLimit"
            >
              <n-input-number
                v-model:value="formData.withdrawLimit"
                :placeholder="$t('user.memberTier.withdrawLimit')"
                :min="0"
                :precision="2"
                style="width: 150px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>

            <n-form-item
              :label="$t('user.memberTier.dailyWithdrawLimit')"
              path="dailyWithdrawLimit"
            >
              <n-input-number
                v-model:value="formData.dailyWithdrawLimit"
                :placeholder="$t('user.memberTier.dailyWithdrawLimit')"
                :min="0"
                :precision="2"
                style="width: 150px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>

            <n-form-item
              :label="$t('user.memberTier.birthdayBonus')"
              path="birthdayBonus"
            >
              <n-input-number
                v-model:value="formData.birthdayBonus"
                :placeholder="$t('user.memberTier.birthdayBonus')"
                :min="0"
                :precision="2"
                style="width: 150px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>

            <n-form-item
              :label="$t('user.memberTier.monthlyBonus')"
              path="monthlyBonus"
            >
              <n-input-number
                v-model:value="formData.monthlyBonus"
                :placeholder="$t('user.memberTier.monthlyBonus')"
                :min="0"
                :precision="2"
                style="width: 150px"
              >
                <template #suffix>BRL</template>
              </n-input-number>
            </n-form-item>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item
              :label="$t('user.memberTier.prioritySupport')"
              path="prioritySupport"
            >
              <n-switch v-model:value="formData.prioritySupport" />
            </n-form-item>

            <n-form-item
              :label="$t('user.memberTier.exclusivePromotions')"
              path="exclusivePromotions"
            >
              <n-switch v-model:value="formData.exclusivePromotions" />
            </n-form-item>
          </div>

          <!-- Status and Appearance -->
          <n-divider title-placement="left">
            {{ $t('user.memberTier.statusSettings') }}
          </n-divider>

          <div class="grid grid-cols-2 gap-4">
            <n-form-item
              :label="$t('user.memberTier.activeStatus')"
              path="isActive"
            >
              <n-switch v-model:value="formData.isActive" />
            </n-form-item>

            <n-form-item
              :label="$t('user.memberTier.defaultTier')"
              path="isDefault"
            >
              <n-switch v-model:value="formData.isDefault" />
            </n-form-item>

            <n-form-item
              :label="$t('user.memberTier.backgroundColor')"
              path="backgroundColor"
            >
              <n-color-picker v-model:value="formData.backgroundColor" />
            </n-form-item>

            <n-form-item
              :label="$t('user.memberTier.textColor')"
              path="textColor"
            >
              <n-color-picker v-model:value="formData.textColor" />
            </n-form-item>
          </div>
        </n-form>
      </n-scrollbar>

      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEditing ? $t('user.memberTier.update') : $t('common.create') }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Member List Modal -->
    <n-modal
      v-model:show="showMemberModal"
      preset="card"
      :title="$t('user.memberTier.memberListTitle')"
      style="width: 1000px; height: 80vh"
      :mask-closable="false"
    >
      <TierMemberList
        v-if="showMemberModal"
        :tier-id="selectedTierId"
        :tier-name="selectedTierName"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import {
  ref,
  reactive,
  computed,
  onMounted,
  h,
  defineAsyncComponent,
} from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(
  () => import('../../../components/smart/SmartDataGrid/index.vue'),
);
import {
  NButton,
  NCard,
  NTabs,
  NTab,
  NInput,
  NSelect,
  NModal,
  NForm,
  NFormItem,
  NDivider,
  NInputNumber,
  NDynamicTags,
  NSwitch,
  NColorPicker,
  NScrollbar,
  NTag,
  NSpace,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';

import {
  getMemberTiersApi,
  createMemberTierApi,
  updateMemberTierApi,
  deleteMemberTierApi,
  updateAllTierStatisticsApi,
  type MemberTier,
  type MemberTierListParams,
  type CreateMemberTierParams,
} from '#/api/core/memberTier';
const TierMemberList = defineAsyncComponent(
  () => import('./components/TierMemberList.vue'),
);

// ===================================
// REACTIVE DATA
// ===================================

const message = useMessage();

// Table and pagination (simplified for SmartDataGrid)
const loading = ref(false);
const tableData = ref<MemberTier[]>([]);
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// Filters and search
const activeTab = ref<'auto_upgrade' | 'fixed_tier'>('auto_upgrade');
const searchKeyword = ref('');
const statusFilter = ref<boolean | null>(null);
const sortBy = ref('id');

// Modal states
const showModal = ref(false);
const showMemberModal = ref(false);
const selectedTierId = ref<number>(0);
const selectedTierName = ref('');

// Form
const formRef = ref();
const submitting = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const formData = reactive<CreateMemberTierParams>({
  tierType: 'auto_upgrade',
  tierName: '',
  tierCode: '',
  description: '',
  keyTags: [],
  sortOrder: 0,

  // Upgrade criteria
  minDepositAmount: undefined,
  minBetAmount: undefined,
  minValidBetAmount: undefined,
  minCommissionAmount: undefined,
  evaluationPeriodDays: undefined,

  // Benefits
  depositBonusRate: 0,
  rebateRate: 0,
  withdrawLimit: 0,
  dailyWithdrawLimit: 0,
  monthlyWithdrawLimit: 0,
  birthdayBonus: 0,
  monthlyBonus: 0,
  prioritySupport: false,
  exclusivePromotions: false,

  // Status
  isActive: true,
  isDefault: false,
  backgroundColor: '#f0f0f0',
  textColor: '#333333',
});

// ===================================
// COMPUTED PROPERTIES
// ===================================

const modalTitle = computed(() =>
  isEditing.value
    ? $t('user.memberTier.editTier')
    : $t('user.memberTier.createTier'),
);

const activeTabLabel = computed(() =>
  activeTab.value === 'auto_upgrade'
    ? $t('user.memberTier.autoUpgrade')
    : $t('user.memberTier.fixedTier'),
);

const tierTypeOptions = computed(() => [
  { label: $t('user.memberTier.autoUpgrade'), value: 'auto_upgrade' },
  { label: $t('user.memberTier.fixedTier'), value: 'fixed_tier' },
]);

const statusOptions = computed(
  () =>
    [
      { label: $t('common.enabled'), value: true },
      { label: $t('common.disabled'), value: false },
    ] as const,
);

const sortOptions = computed(() => [
  { label: $t('user.memberTier.sortOrderCol'), value: 'sortOrder' },
  { label: $t('user.memberTier.tierName'), value: 'tierName' },
  { label: $t('user.memberTier.currentMemberCount'), value: 'currentMemberCount' },
  { label: $t('user.memberTier.upgradeCount'), value: 'totalUpgradeCount' },
  { label: $t('common.createTime'), value: 'createdAt' },
]);

const formRules = computed(() => ({
  tierType: {
    required: true,
    message: $t('user.memberTier.selectTierTypeRequired'),
    trigger: 'blur',
  },
  tierName: {
    required: true,
    message: $t('user.memberTier.enterTierNameRequired'),
    trigger: 'blur',
  },
  tierCode: {
    required: true,
    message: $t('user.memberTier.enterTierCodeRequired'),
    trigger: 'blur',
  },
}));

const columns = computed<DataTableColumns<MemberTier>>(() => [
  {
    title: 'ID',
    key: 'id',
    width: 60,
    align: 'center',
  },
  {
    title: $t('user.memberTier.tierTypeCol'),
    key: 'tierType',
    width: 100,
    render: (row) => {
      const isAuto = row.tierType === 'auto_upgrade';
      return h(
        NTag,
        {
          type: isAuto ? 'success' : 'info',
          size: 'small',
        },
        {
          default: () =>
            isAuto
              ? $t('user.memberTier.autoUpgrade')
              : $t('user.memberTier.fixedTier'),
        },
      );
    },
  },
  {
    title: $t('user.memberTier.tierNameCol'),
    key: 'tierName',
    width: 120,
    render: (row) => {
      return h(
        'div',
        {
          style: {
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: row.backgroundColor || '#f0f0f0',
            color: row.textColor || '#333333',
            fontWeight: 'bold',
            textAlign: 'center',
          },
        },
        row.tierName,
      );
    },
  },
  {
    title: $t('user.memberTier.descriptionCol'),
    key: 'description',
    width: 100,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('user.memberTier.keyTagsCol'),
    key: 'keyTags',
    width: 80,
    render: (row) => {
      const tags = row.keyTags || [];
      if (tags.length === 0) {
        return h('span', { class: 'text-gray-400' }, '-');
      }
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () =>
            tags.map((tag) =>
              h(NTag, { size: 'small', type: 'info' }, { default: () => tag }),
            ),
        },
      );
    },
  },
  {
    title: $t('user.memberTier.upgradeCount'),
    key: 'totalUpgradeCount',
    width: 100,
    align: 'center',
    render: (row) => {
      const count = row.totalUpgradeCount || 0;
      return h(
        'span',
        { class: 'font-semibold text-green-600' },
        count.toLocaleString(),
      );
    },
  },
  {
    title: $t('user.memberTier.minDepositReq'),
    key: 'minDepositAmount',
    width: 120,
    align: 'right',
    render: (row) => {
      const amount = row.minDepositAmount || 0;
      return h(
        'span',
        { class: 'font-mono text-blue-600' },
        `R$ ${amount.toFixed(2)}`,
      );
    },
  },
  {
    title: $t('user.memberTier.tierMemberCount'),
    key: 'currentMemberCount',
    width: 100,
    align: 'center',
    render: (row) => {
      const count = row.currentMemberCount || 0;
      return h(
        NButton,
        {
          text: true,
          type: 'primary',
          size: 'small',
          onClick: () => handleViewMembers(row.id, row.tierName),
        },
        {
          default: () =>
            h(
              'span',
              { class: 'font-semibold' },
              `${count.toLocaleString()} ${$t('user.memberTier.people')}`,
            ),
        },
      );
    },
  },
  {
    title: $t('common.status'),
    key: 'isActive',
    width: 80,
    align: 'center',
    render: (row) => {
      return h(
        NTag,
        {
          type: row.isActive ? 'success' : 'error',
          size: 'small',
        },
        {
          default: () =>
            row.isActive ? $t('common.enabled') : $t('common.disabled'),
        },
      );
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 120,
    align: 'center',
    fixed: 'right',
    render: (row) => {
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => handleEdit(row),
              },
              {
                default: () => $t('common.edit'),
              },
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handleDelete(row.id),
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'error',
                    },
                    {
                      default: () => $t('common.delete'),
                    },
                  ),
                default: () => $t('user.memberTier.confirmDeleteTier'),
              },
            ),
          ],
        },
      );
    },
  },
]);

// ===================================
// METHODS
// ===================================

const loadData = async () => {
  loading.value = true;
  try {
    const params: MemberTierListParams = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      tierType: activeTab.value,
      isActive: statusFilter.value ?? undefined,
      search: searchKeyword.value || undefined,
      sortBy: sortBy.value,
      sortOrder: 'asc',
    };

    const response = await getMemberTiersApi(params);

    tableData.value = response.list;
    paginationReactive.total = response.pagination.total;
  } catch (error) {
    message.error($t('user.memberTier.loadFailed'));
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
  }
};

const handleTabChange = (value: string) => {
  activeTab.value = value as 'auto_upgrade' | 'fixed_tier';
  paginationReactive.page = 1;
  loadData();
};

const handleSearch = () => {
  paginationReactive.page = 1;
  loadData();
};

const handleFilter = () => {
  paginationReactive.page = 1;
  loadData();
};

const handleSort = () => {
  paginationReactive.page = 1;
  loadData();
};

const handleResetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = null;
  sortBy.value = 'id';
  paginationReactive.page = 1;
  loadData();
};

// SmartDataGrid event handlers
const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadData();
};

const handleRefresh = () => {
  loadData();
};

const handleRowClick = (tier: MemberTier) => {
  console.log('Member tier row clicked:', tier);
  // Optional: Auto-open edit modal on row click
  // handleEdit(tier);
};

// Note: handlePageChange and handlePageSizeChange moved to SmartDataGrid handlers above

const handleCreateTier = () => {
  isEditing.value = false;
  editingId.value = null;
  resetForm();
  formData.tierType = activeTab.value;
  showModal.value = true;
};

const handleEdit = (tier: MemberTier) => {
  isEditing.value = true;
  editingId.value = tier.id;

  // Fill form with tier data
  Object.assign(formData, {
    tierType: tier.tierType,
    tierName: tier.tierName,
    tierCode: tier.tierCode,
    description: tier.description,
    keyTags: [...tier.keyTags],
    sortOrder: tier.sortOrder,

    minDepositAmount: tier.minDepositAmount,
    minBetAmount: tier.minBetAmount,
    minValidBetAmount: tier.minValidBetAmount,
    minCommissionAmount: tier.minCommissionAmount,
    evaluationPeriodDays: tier.evaluationPeriodDays,

    depositBonusRate: tier.depositBonusRate,
    rebateRate: tier.rebateRate,
    withdrawLimit: tier.withdrawLimit,
    dailyWithdrawLimit: tier.dailyWithdrawLimit,
    monthlyWithdrawLimit: tier.monthlyWithdrawLimit,
    birthdayBonus: tier.birthdayBonus,
    monthlyBonus: tier.monthlyBonus,
    prioritySupport: tier.prioritySupport,
    exclusivePromotions: tier.exclusivePromotions,

    isActive: tier.isActive,
    isDefault: tier.isDefault,
    backgroundColor: tier.backgroundColor,
    textColor: tier.textColor,
    iconUrl: tier.iconUrl,
  });

  showModal.value = true;
};

const handleDelete = async (id: number) => {
  try {
    await deleteMemberTierApi(id);
    message.success($t('user.memberTier.deleteSuccess'));
    loadData();
  } catch (error) {
    message.error($t('user.memberTier.deleteFailed'));
    console.error('Error deleting tier:', error);
  }
};

const handleViewMembers = (tierId: number, tierName: string) => {
  selectedTierId.value = tierId;
  selectedTierName.value = tierName;
  showMemberModal.value = true;
};

const handleRefreshStatistics = async () => {
  try {
    await updateAllTierStatisticsApi();
    message.success($t('user.memberTier.statsRefreshed'));
    loadData();
  } catch (error) {
    message.error($t('user.memberTier.statsRefreshFailed'));
    console.error('Error refreshing statistics:', error);
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;

    if (isEditing.value && editingId.value) {
      await updateMemberTierApi(editingId.value, formData);
      message.success($t('user.memberTier.updateSuccess'));
    } else {
      await createMemberTierApi(formData);
      message.success($t('user.memberTier.createSuccess'));
    }

    showModal.value = false;
    loadData();
  } catch (error) {
    if (error?.message) {
      message.error(error.message);
    } else {
      message.error(
        isEditing.value
          ? $t('user.memberTier.updateFailed')
          : $t('user.memberTier.createFailed'),
      );
    }
    console.error('Error submitting form:', error);
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  showModal.value = false;
  resetForm();
};

const resetForm = () => {
  Object.assign(formData, {
    tierType: 'auto_upgrade',
    tierName: '',
    tierCode: '',
    description: '',
    keyTags: [],
    sortOrder: 0,

    minDepositAmount: undefined,
    minBetAmount: undefined,
    minValidBetAmount: undefined,
    minCommissionAmount: undefined,
    evaluationPeriodDays: undefined,

    depositBonusRate: 0,
    rebateRate: 0,
    withdrawLimit: 0,
    dailyWithdrawLimit: 0,
    monthlyWithdrawLimit: 0,
    birthdayBonus: 0,
    monthlyBonus: 0,
    prioritySupport: false,
    exclusivePromotions: false,

    isActive: true,
    isDefault: false,
    backgroundColor: '#f0f0f0',
    textColor: '#333333',
    iconUrl: undefined,
  });

  formRef.value?.restoreValidation();
};

// ===================================
// LIFECYCLE
// ===================================

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.member-tier-management {
  background: #f5f5f5;
  min-height: 100vh;
}

:deep(.n-data-table-th) {
  background: #fafafa;
  font-weight: 600;
}

:deep(.n-data-table-td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.n-data-table-tr:hover .n-data-table-td) {
  background: #f8f9fa;
}

:deep(.n-tabs .n-tab) {
  padding: 12px 20px;
}

:deep(.n-card) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.n-form-item-label) {
  font-weight: 500;
}

:deep(.n-divider .n-divider__title) {
  font-weight: 600;
  color: #1f2937;
}
</style>
