<template>
  <div class="third-party-withdrawal">
    <!-- Header -->
    <div class="header-section">
      <n-card :bordered="false" class="rounded-16px shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">{{ $t('finance.thirdPartyPayout') }}</h2>
            <p class="mt-1 text-sm text-gray-600">
              第三方代付商户管理 (提现/出款)
            </p>
          </div>
          <div class="flex gap-3">
            <n-button type="primary" @click="fetchData" :loading="loading">
              <template #icon>
                <n-icon><ReloadOutline /></n-icon>
              </template>{{ $t('common.refresh') }}</n-button>
            <n-button type="success" @click="showAddProviderModal">
              <template #icon>
                <n-icon><AddOutline /></n-icon>
              </template>{{ $t('finance.addMerchant') }}</n-button>
          </div>
        </div>

        <!-- Search Filters -->
        <div
          class="filter-section mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <div class="filter-item">
            <n-form-item :label="$t('finance.payoutCurrency')">
              <n-select
                v-model:value="filters.currency"
                placeholder:placeholder="$t('finance.selectCurrency')"
                clearable
                size="small"
                :options="currencyOptions"
              />
            </n-form-item>
          </div>

          <div class="filter-item">
            <n-form-item :label="$t('finance.merchantStatus')">
              <n-select
                v-model:value="filters.status"
                placeholder:placeholder="$t('finance.selectStatus')"
                clearable
                size="small"
                :options="statusOptions"
              />
            </n-form-item>
          </div>

          <div class="filter-item">
            <n-form-item :label="$t('finance.thirdPartyPayout')">
              <n-input
                v-model:value="filters.providerName"
                placeholder:placeholder="$t('finance.enterMerchantName')"
                clearable
                size="small"
              />
            </n-form-item>
          </div>

          <div class="filter-item flex items-end">
            <n-button
              type="primary"
              @click="fetchData"
              size="small"
              class="mr-2"
            >
              <template #icon
                ><n-icon><SearchOutline /></n-icon
              ></template>{{ $t('common.search') }}</n-button>
            <n-button @click="resetFilters" size="small">{{ $t('common.reset') }}</n-button>
          </div>
        </div>
      </n-card>
    </div>

    <!-- SmartDataGrid -->
    <SmartDataGrid
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="paginationReactive"
      :scroll-x="2000"
      size="small"
      class="third-party-table"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @refresh="fetchData"
      @row-click="handleRowClick"
    >
      <template #actionBar>
        <n-card :bordered="false" class="rounded-16px shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- 主要操作按钮 -->
              <div class="flex gap-2">
                <n-button type="primary" @click="fetchData" :loading="loading">
                  <template #icon>
                    <n-icon><ReloadOutline /></n-icon>
                  </template>{{ $t('common.refresh') }}</n-button>
                <n-button type="success" @click="showAddProviderModal">
                  <template #icon>
                    <n-icon><AddOutline /></n-icon>
                  </template>{{ $t('finance.addMerchant') }}</n-button>
              </div>

              <!-- 信息显示 -->
              <div class="text-sm text-gray-600">
                共 {{ paginationReactive.total }} 个代付商户
                <n-tag type="info" size="small" class="ml-2">{{ $t('finance.thirdPartyPayout') }}</n-tag>
              </div>
            </div>
          </div>
        </n-card>
      </template>
    </SmartDataGrid>

    <!-- Add/Edit Provider Modal with Tabs -->
    <n-modal
      v-model:show="providerModal.show"
      preset="card"
      :title="providerModal.isEdit ? '修改代付商户' : '新增代付商户'"
      size="large"
      :style="{ width: '90%', maxWidth: '1000px' }"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="providerModal.data"
        :rules="formRules"
        label-placement="left"
        label-width="140px"
      >
        <n-tabs v-model:value="activeTab" type="line">
          <!-- Tab 1: Basic Info -->
          <n-tab-pane name="basic" :tab="$t('finance.basicInfo')">
            <div class="space-y-4">
              <n-grid :cols="2" :x-gap="24">
                <n-form-item-gi :label="$t('finance.payoutCurrency')" path="currency">
                  <n-select
                    v-model:value="providerModal.data.currency"
                    placeholder:placeholder="$t('finance.selectPayoutCurrency')"
                    :options="currencyOptions"
                  />
                </n-form-item-gi>
                <n-form-item-gi :label="$t('finance.thirdPartyPayout')" path="providerId">
                  <n-select
                    v-model:value="providerModal.data.providerId"
                    placeholder:placeholder="$t('finance.pleaseSelectThirdPartyPayout')"
                    :options="availableProviders"
                    @update:value="onProviderChange"
                  />
                </n-form-item-gi>
              </n-grid>

              <n-grid :cols="2" :x-gap="24">
                <n-form-item-gi :label="$t('finance.thirdPartyPlatformName')" path="platformName">
                  <n-input
                    v-model:value="providerModal.data.platformName"
                    placeholder:placeholder="$t('finance.enterThirdPartyPlatformName')"
                    maxlength="50"
                    show-count
                  />
                </n-form-item-gi>
                <n-form-item-gi :label="$t('finance.thirdPartyMerchantId')" path="merchantId">
                  <n-input
                    v-model:value="providerModal.data.merchantId"
                    placeholder:placeholder="$t('finance.enterThirdPartyMerchantId')"
                    maxlength="100"
                    show-count
                  />
                </n-form-item-gi>
              </n-grid>

              <n-form-item :label="$t('finance.thirdPartyMerchantKey')" path="merchantKey">
                <n-input
                  v-model:value="providerModal.data.merchantKey"
                  placeholder:placeholder="$t('finance.enterThirdPartyMerchantKey')"
                  type="password"
                  show-password-on="click"
                />
              </n-form-item>

              <n-form-item :label="$t('finance.callbackSuccessFlag')" path="successFlag">
                <n-input
                  v-model:value="providerModal.data.successFlag"
                  placeholder:placeholder="$t('finance.enterCallbackSuccessFlag')"
                  maxlength="255"
                  show-count
                />
              </n-form-item>

              <n-form-item :label="$t('finance.thirdPartyOrderUrl')" path="orderUrl">
                <n-input
                  v-model:value="providerModal.data.orderUrl"
                  placeholder:placeholder="$t('finance.enterThirdPartyOrderUrl')"
                />
              </n-form-item>

              <n-form-item :label="$t('finance.queryUrl')" path="queryUrl">
                <n-input
                  v-model:value="providerModal.data.queryUrl"
                  placeholder:placeholder="$t('finance.enterQueryUrl')"
                />
              </n-form-item>

              <n-form-item :label="$t('finance.balanceQueryUrl')" path="balanceQueryUrl">
                <n-input
                  v-model:value="providerModal.data.balanceQueryUrl"
                  placeholder:placeholder="$t('finance.enterBalanceQueryUrl')"
                />
              </n-form-item>

              <n-form-item :label="$t('finance.thirdPartyCallbackIp')" path="callbackIp">
                <n-input
                  v-model:value="providerModal.data.callbackIp"
                  placeholder:placeholder="$t('finance.enterThirdPartyCallbackIp')"
                />
              </n-form-item>

              <n-form-item :label="$t('finance.withdrawalMethod')" path="withdrawalMethods">
                <n-checkbox-group
                  v-model:value="providerModal.data.withdrawalMethods"
                >
                  <n-space>
                    <n-checkbox
                      v-for="method in withdrawalMethodOptions"
                      :key="method.value"
                      :value="method.value"
                      :label="method.label"
                    />
                  </n-space>
                </n-checkbox-group>
              </n-form-item>
            </div>
          </n-tab-pane>

          <!-- Tab 2: Limits & Settings -->
          <n-tab-pane name="limits" :tab="$t('finance.limitSettings')">
            <div class="space-y-4">
              <n-grid :cols="2" :x-gap="24">
                <n-form-item-gi :label="$t('finance.payoutLimit')" path="minLimit">
                  <n-input
                    v-model:value="providerModal.data.minLimit"
                    placeholder:placeholder="$t('finance.enterMinPayoutLimit')"
                  />
                </n-form-item-gi>
                <n-form-item-gi label="" path="maxLimit">
                  <n-input
                    v-model:value="providerModal.data.maxLimit"
                    placeholder:placeholder="$t('finance.enterMaxPayoutLimit')"
                  />
                </n-form-item-gi>
              </n-grid>

              <n-form-item :label="$t('common.remark')" path="remarks">
                <n-input
                  v-model:value="providerModal.data.remarks"
                  type="textarea"
                  placeholder:placeholder="$t('finance.pleaseEnterRemark')"
                  maxlength="1000"
                  show-count
                  :rows="4"
                />
              </n-form-item>

              <n-form-item :label="$t('finance.enableDisable')">
                <n-select
                  v-model:value="providerModal.data.statusOption"
                  :options="enableOptions"
                  placeholder:placeholder="$t('finance.on')"
                />
              </n-form-item>
            </div>
          </n-tab-pane>
        </n-tabs>
      </n-form>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button @click="providerModal.show = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            @click="saveProvider"
            :loading="providerModal.saving"
          >{{ $t('common.confirm') }}</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, onMounted, h } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const SmartDataGrid = defineAsyncComponent(
  () => import('../../components/smart/SmartDataGrid/index.vue'),
);
import {
  NButton,
  NCard,
  NDataTable,
  NInput,
  NSelect,
  NFormItem,
  NFormItemGi,
  NGrid,
  NModal,
  NTag,
  NIcon,
  NForm,
  NTabs,
  NTabPane,
  NCheckbox,
  NCheckboxGroup,
  NSpace,
  useMessage,
  useDialog,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import { ReloadOutline, SearchOutline, AddOutline } from '@vicons/ionicons5';
import {
  thirdPartyWithdrawalApi,
  type ThirdPartyWithdrawalProvider,
} from '#/api/finance/thirdPartyPayment';

const message = useMessage();
const dialog = useDialog();

// Form ref
const formRef = ref<FormInst>();
const activeTab = ref('basic');

// Data and state
const loading = ref(false);
const tableData = ref<ThirdPartyWithdrawalProvider[]>([]);
const balanceData = ref<Map<string, any>>(new Map()); // Store balance data by merchantId

// Filters
const filters = reactive({
  currency: null,
  status: null,
  providerName: '',
});

// Pagination - SmartDataGrid compatible
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// SmartDataGrid event handlers
const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  fetchData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  fetchData();
};

const handleRowClick = (_row: ThirdPartyWithdrawalProvider) => {
  // console.log('Row clicked:', row);
};

// Provider Modal
const providerModal = reactive({
  show: false,
  saving: false,
  isEdit: false,
  data: {
    id: '',
    currency: '',
    providerId: '',
    providerName: '',
    platformName: '',
    merchantId: '',
    merchantKey: '',
    successFlag: '',
    orderUrl: '',
    queryUrl: '',
    balanceQueryUrl: '',
    callbackIp: '',
    withdrawalMethods: [] as string[],
    minLimit: '',
    maxLimit: '',
    remarks: '',
    statusOption: 'enabled',
    enabled: true,
  } as any,
});

// Form validation rules
const formRules: FormRules = {
  currency: [{ required: true, message: $t('finance.pleaseSelectPayoutCurrency'), trigger: 'change' }],
  providerId: [
    { required: true, message: $t('finance.pleaseSelectThirdPartyPayout'), trigger: 'change' },
  ],
  platformName: [
    { required: true, message: $t('finance.pleaseEnterThirdPartyPlatformName'), trigger: 'blur' },
  ],
  merchantId: [
    { required: true, message: $t('finance.pleaseEnterThirdPartyMerchantId'), trigger: 'blur' },
  ],
  successFlag: [
    { required: true, message: $t('finance.pleaseEnterCallbackSuccessFlag'), trigger: 'blur' },
  ],
  orderUrl: [
    { required: true, message: $t('finance.pleaseEnterThirdPartyOrderUrl'), trigger: 'blur' },
  ],
  queryUrl: [{ required: true, message: $t('finance.pleaseEnterQueryUrl'), trigger: 'blur' }],
};

// Options
const currencyOptions = [
  { label: 'BTC', value: 'BTC' },
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

const statusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
];

// Available providers - simple static list
const availableProviders = [{ label: 'Pay4Z(BRL)', value: 'Pay4Z_BRL' }];

const withdrawalMethodOptions = [
  { label: 'PIX', value: 'PIX' },
  { label: $t('finance.bankTransfer'), value: 'BANK_TRANSFER' },
  { label: 'TED', value: 'TED' },
];

const enableOptions = [
  { label: $t('finance.on'), value: 'enabled' },
  { label: '停用', value: 'disabled' },
];

// Table columns (matching screenshot exactly)
const columns: DataTableColumns<ThirdPartyWithdrawalProvider> = [
  {
    title: $t('finance.thirdPartyPlatformName'),
    key: 'platformName',
    width: 150,
    render: (row) =>
      h('div', { class: 'text-center' }, row.platformName || '-'),
  },
  {
    title: $t('finance.thirdPartyPayout'),
    key: 'providerName',
    width: 150,
    render: (row) =>
      h('div', { class: 'text-center' }, row.providerName || '-'),
  },
  {
    title: $t('finance.thirdPartyMerchantId'),
    key: 'merchantId',
    width: 150,
    render: (row) =>
      h(
        'div',
        { class: 'text-center font-mono text-sm' },
        row.merchantId || '-',
      ),
  },
  {
    title: $t('finance.merchantBalance'),
    key: 'merchantBalance',
    width: 150,
    render: (row) => {
      const balance = balanceData.value.get(row.merchantId);
      if (!balance) {
        return h(
          'div',
          { class: 'text-center text-xs text-gray-400' },
          '加载中...',
        );
      }
      if (balance.error) {
        return h(
          'div',
          { class: 'text-center text-xs text-red-500' },
          '查询失败',
        );
      }
      return h('div', { class: 'text-center' }, [
        h(
          'div',
          { class: 'text-sm font-semibold text-gray-700' },
          balance.balance?.toFixed(2) || '0.00',
        ),
        h(
          'div',
          { class: 'text-xs text-gray-500 mt-1' },
          `可用: ${balance.balance?.toFixed(2) || '0.00'}`,
        ),
        h(
          'div',
          { class: 'text-xs text-gray-400' },
          `冻结: ${balance.frozenAmount?.toFixed(2) || '0.00'}`,
        ),
      ]);
    },
  },
  {
    title: $t('finance.withdrawalMethod'),
    key: 'withdrawalMethods',
    width: 120,
    render: (row) =>
      h(
        'div',
        { class: 'text-center' },
        (row.withdrawalMethods || []).length > 0
          ? (row.withdrawalMethods || []).map((method: string) =>
              h(
                NTag,
                {
                  type: 'info',
                  size: 'small',
                  style: { margin: '2px' },
                },
                { default: () => method },
              ),
            )
          : '-',
      ),
  },
  {
    title: $t('finance.payoutCurrency'),
    key: 'currency',
    width: 100,
    render: (row) =>
      h('div', { class: 'text-center font-medium' }, row.currency || '-'),
  },
  {
    title: $t('finance.minLimit'),
    key: 'minLimit',
    width: 100,
    render: (row) =>
      h('div', { class: 'text-center text-sm' }, row.minLimit || '0'),
  },
  {
    title: $t('finance.maxLimit'),
    key: 'maxLimit',
    width: 100,
    render: (row) =>
      h('div', { class: 'text-center text-sm' }, row.maxLimit || '∞'),
  },
  {
    title: $t('common.remark'),
    key: 'remarks',
    width: 120,
    render: (row) =>
      h('div', { class: 'text-center text-xs' }, row.remarks || '-'),
  },
  {
    title: $t('finance.operator'),
    key: 'operator',
    width: 100,
    render: (row) =>
      h(
        'div',
        { class: 'text-center text-sm' },
        row.createdBy || row.updatedBy || '-',
      ),
  },
  {
    title: $t('finance.actionsTime'),
    key: 'updatedAt',
    width: 160,
    render: (row) =>
      h(
        'div',
        { class: 'text-center text-xs' },
        row.updatedAt
          ? new Date(row.updatedAt)
              .toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })
              .replace(/\//g, '-')
          : '-',
      ),
  },
  {
    title: $t('finance.enable'),
    key: 'enabled',
    width: 100,
    render: (row) =>
      h('div', { class: 'text-center' }, [
        h(
          NTag,
          {
            type: row.enabled ? 'success' : 'error',
            size: 'small',
          },
          { default: () => (row.enabled ? '启用' : '停用') },
        ),
      ]),
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (row) =>
      h('div', { class: 'flex gap-1 justify-center' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => editProvider(row),
          },
          { default: () => $t('common.edit') },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            disabled: row.enabled,
            onClick: () => deleteProvider(row),
          },
          { default: () => $t('common.delete') },
        ),
      ]),
  },
];

// Methods
const fetchMerchantBalance = async (merchantId: string) => {
  try {
    console.log('💰 Fetching balance for merchant:', merchantId);
    const response =
      await thirdPartyWithdrawalApi.queryAccountBalance(merchantId);

    console.log('📥 API Response:', response);

    if (response.success && response.data) {
      balanceData.value.set(merchantId, response.data);
      console.log('✅ Balance loaded for merchant:', merchantId, {
        balance: response.data.balance,
        unsettledBalance: response.data.unsettledBalance,
        frozenAmount: response.data.frozenAmount,
        currency: response.data.currency,
      });
    } else {
      balanceData.value.set(merchantId, { error: true });
      console.warn(
        '⚠️ Failed to load balance for merchant:',
        merchantId,
        response,
      );
    }
  } catch (error) {
    console.error('❌ Error fetching balance for merchant:', merchantId, error);
    balanceData.value.set(merchantId, { error: true });
  }
};

const fetchAllBalances = async () => {
  // Fetch balances for all merchants in parallel
  const promises = tableData.value.map((provider) =>
    fetchMerchantBalance(provider.merchantId),
  );
  await Promise.allSettled(promises);
};

const fetchData = async () => {
  loading.value = true;
  try {
    console.log('🔄 Fetching third-party withdrawal providers...');
    const response = await thirdPartyWithdrawalApi.getProviders({
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
      ...filters,
    });

    if (response.success && response.data) {
      tableData.value = response.data.records || [];
      paginationReactive.total = response.data.total || 0;
      console.log('✅ Withdrawal providers loaded:', tableData.value.length);

      // Fetch balances for all merchants
      if (tableData.value.length > 0) {
        await fetchAllBalances();
      }
    } else {
      console.warn('⚠️ API response indicates failure:', response);
      tableData.value = [];
      message.warning(response.message || '暂无数据');
    }
  } catch (error) {
    console.error('❌ Fetch withdrawal providers error:', error);
    tableData.value = [];
    message.error($t('finance.failedToFetchData'));
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.currency = null;
  filters.status = null;
  filters.providerName = '';
  fetchData();
};

const showAddProviderModal = () => {
  providerModal.isEdit = false;
  providerModal.data = {
    id: '',
    currency: '',
    providerId: '',
    providerName: '',
    platformName: '',
    merchantId: '',
    merchantKey: '',
    successFlag: '',
    orderUrl: '',
    queryUrl: '',
    balanceQueryUrl: '',
    callbackIp: '',
    withdrawalMethods: [],
    minLimit: '',
    maxLimit: '',
    remarks: '',
    statusOption: 'enabled',
    enabled: true,
  };
  activeTab.value = 'basic';
  providerModal.show = true;
};

const editProvider = (provider: ThirdPartyWithdrawalProvider) => {
  providerModal.isEdit = true;
  providerModal.data = {
    ...provider,
    statusOption: provider.enabled ? 'enabled' : 'disabled',
  };
  activeTab.value = 'basic';
  providerModal.show = true;
};

const deleteProvider = (provider: ThirdPartyWithdrawalProvider) => {
  dialog.warning({
    title: $t('finance.deleteConfirmation'),
    content: `确认删除三方代付商户 "${provider.platformName}"？删除后无法恢复。`,
    positiveText: $t('finance.confirmDelete'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      try {
        const response = await thirdPartyWithdrawalApi.deleteProvider(
          provider.id!,
        );
        if (response.success) {
          message.success($t('finance.deleteSuccessful'));
          fetchData();
        } else {
          message.error(response.message || '删除失败');
        }
      } catch (error) {
        console.error('Delete provider error:', error);
        message.error($t('finance.deleteFailed'));
      }
    },
  });
};

const onProviderChange = (providerId: string) => {
  // Auto-fill provider information based on selection
  const provider = availableProviders.find((p) => p.value === providerId);
  if (provider) {
    providerModal.data.providerName = provider.label;
    providerModal.data.platformName = provider.label;
  }
};

const saveProvider = async () => {
  try {
    await formRef.value?.validate();
    providerModal.saving = true;

    // Prepare data
    const payload = {
      ...providerModal.data,
      enabled: providerModal.data.statusOption === 'enabled',
    };

    let response;
    if (providerModal.isEdit) {
      response = await thirdPartyWithdrawalApi.updateProvider(
        providerModal.data.id,
        payload,
      );
    } else {
      response = await thirdPartyWithdrawalApi.createProvider(payload);
    }

    if (response.success) {
      message.success(providerModal.isEdit ? '更新成功' : '新增成功');
      providerModal.show = false;
      fetchData();
    } else {
      message.error(response.message || '保存失败');
    }
  } catch (error: any) {
    console.error('Save provider error:', error);
    if (error?.errorInfo) {
      message.error($t('finance.pleaseCheckRequiredFields'));
    } else {
      message.error(`保存失败: ${error.message || '未知错误'}`);
    }
  } finally {
    providerModal.saving = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.third-party-withdrawal {
  padding: 16px;
}

.third-party-table :deep(.n-data-table-td) {
  white-space: nowrap;
}

.third-party-table :deep(.n-data-table-th) {
  background: #f8f9fa;
  font-weight: 600;
  text-align: center;
}

.third-party-table :deep(.n-data-table-td) {
  text-align: center;
}
</style>
