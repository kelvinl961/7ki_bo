<template>
  <div class="other-customer-service-tab p-4">
    <n-space vertical :size="16">
      <!-- Action Buttons -->
      <n-space justify="end">
        <n-button type="primary" @click="showEditModal(null)">
          <template #icon>
            <span>+</span>
          </template>
          新增客服
        </n-button>
      </n-space>

      <!-- Customer Service List -->
      <n-spin :show="loading">
        <n-data-table
          :columns="columns"
          :data="customerServiceList"
          :pagination="false"
          :bordered="false"
        />
      </n-spin>
    </n-space>

    <!-- Edit/Create Modal -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editingId ? '编辑客服' : '新增客服'"
      style="width: 800px"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="top"
      >
        <n-form-item label="币种（支持多选）" path="currencies">
          <n-select
            v-model:value="formData.currencies"
            multiple
            :options="currencyOptions"
            placeholder="选择币种"
          />
        </n-form-item>

        <n-form-item label="IM选择" path="imType">
          <n-space vertical style="width: 100%">
            <n-radio-group v-model:value="formData.imType">
              <n-space>
                <n-radio value="LINE">
                  <n-space align="center" :size="8">
                    <n-avatar
                      size="small"
                      :src="imIconUrls.LINE"
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3E💬%3C/text%3E%3C/svg%3E"
                    />
                    <span>LINE</span>
                  </n-space>
                </n-radio>
                <n-radio value="TELEGRAM">
                  <n-space align="center" :size="8">
                    <n-avatar
                      size="small"
                      :src="imIconUrls.TELEGRAM"
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3E✈️%3C/text%3E%3C/svg%3E"
                    />
                    <span>Telegram</span>
                  </n-space>
                </n-radio>
                <n-radio value="WECHAT">
                  <n-space align="center" :size="8">
                    <n-avatar
                      size="small"
                      :src="imIconUrls.WECHAT"
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3E💬%3C/text%3E%3C/svg%3E"
                    />
                    <span>WeChat</span>
                  </n-space>
                </n-radio>
                <n-radio value="WHATSAPP">
                  <n-space align="center" :size="8">
                    <n-avatar
                      size="small"
                      :src="imIconUrls.WHATSAPP"
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3E📱%3C/text%3E%3C/svg%3E"
                    />
                    <span>WhatsApp</span>
                  </n-space>
                </n-radio>
                <n-radio value="SKYPE">
                  <n-space align="center" :size="8">
                    <n-avatar
                      size="small"
                      :src="imIconUrls.SKYPE"
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3ES%3C/text%3E%3C/svg%3E"
                    />
                    <span>Skype</span>
                  </n-space>
                </n-radio>
                <n-radio value="FACEBOOK">
                  <n-space align="center" :size="8">
                    <n-avatar
                      size="small"
                      :src="imIconUrls.FACEBOOK"
                      fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='18' font-size='18'%3EF%3C/text%3E%3C/svg%3E"
                    />
                    <span>Facebook</span>
                  </n-space>
                </n-radio>
                <n-radio value="CUSTOM">
                  <n-space align="center" :size="8">
                    <n-button size="small">+ 自定义</n-button>
                  </n-space>
                </n-radio>
              </n-space>
            </n-radio-group>

            <n-upload
              v-if="formData.imType === 'CUSTOM'"
              :max="1"
              list-type="image-card"
              accept="image/*"
              @before-upload="handleUpload"
            >
              上传自定义IM图标 (144px × 144px)
            </n-upload>
          </n-space>
        </n-form-item>

        <n-form-item label="客服昵称" path="serviceName">
          <n-input
            v-model:value="formData.serviceName"
            placeholder="输入客服昵称（如：AAA）"
            maxlength="255"
          />
        </n-form-item>

        <n-form-item label="客服账号" path="serviceAccount">
          <n-input
            v-model:value="formData.serviceAccount"
            placeholder="输入客服账号（如：abc123）"
            maxlength="255"
          />
          <div class="mt-2 text-sm text-gray-500">
            {{ imTypeDescription }}
          </div>
        </n-form-item>

        <n-form-item label="自动生成链接" v-if="formData.imType !== 'CUSTOM'">
          <n-input
            :value="generatedLink"
            disabled
            placeholder="链接将根据IM类型和账号自动生成"
          />
        </n-form-item>

        <template v-if="formData.imType === 'CUSTOM'">
          <n-form-item label="Android链接" path="androidLink">
            <n-input
              v-model:value="formData.androidLink"
              placeholder="输入Android链接"
            />
          </n-form-item>

          <n-form-item label="iOS链接" path="iosLink">
            <n-input
              v-model:value="formData.iosLink"
              placeholder="输入iOS链接"
            />
          </n-form-item>

          <n-form-item label="PC链接" path="pcLink">
            <n-input v-model:value="formData.pcLink" placeholder="输入PC链接" />
          </n-form-item>
        </template>

        <n-form-item label="会员层级（支持多选）" path="memberLevels">
          <n-spin :show="loadingMemberTiers">
            <n-checkbox-group
              v-model:value="formData.memberLevels"
              @update:value="handleMemberTierChange"
            >
              <n-space vertical>
                <n-checkbox value="ALL">全部层级</n-checkbox>
                <n-space wrap>
                  <n-checkbox
                    v-for="tier in memberTierOptions"
                    :key="tier.value"
                    :value="tier.value"
                  >
                    {{ tier.label }}
                  </n-checkbox>
                </n-space>
              </n-space>
            </n-checkbox-group>
          </n-spin>
        </n-form-item>

        <n-form-item label="是否启用">
          <n-switch v-model:value="formData.isEnabled" />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="submitForm" :loading="saving">
            确认
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted, nextTick } from 'vue';
import {
  NSpace,
  NButton,
  NDataTable,
  NSpin,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NRadioGroup,
  NRadio,
  NCheckboxGroup,
  NCheckbox,
  NSwitch,
  NInputNumber,
  NAvatar,
  NUpload,
  NTag,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  getCustomerServiceIMConfigs,
  createCustomerServiceIMConfig,
  updateCustomerServiceIMConfig,
  deleteCustomerServiceIMConfig,
  type CustomerServiceIMConfig,
} from '#/api/operations/customerService';
import { getActiveMemberTiersApi } from '#/api/core/memberTier';

const message = useMessage();

// Loading states
const loading = ref(false);
const saving = ref(false);
const loadingMemberTiers = ref(false);

// Modal state
const showModal = ref(false);
const editingId = ref<number | null>(null);

// Form reference
const formRef = ref();

// Customer service list
const customerServiceList = ref<CustomerServiceIMConfig[]>([]);

// Member tiers
const memberTierOptions = ref<Array<{ label: string; value: string }>>([]);

// Flag to prevent recursive updates
const isUpdatingMemberTiers = ref(false);

// IM Icon URLs
const imIconUrls = {
  LINE: 'https://9dmu7h-6909-ppp.s3.sa-east-1.amazonaws.com/siteadmin/upload/img/LINE.png',
  TELEGRAM:
    'https://9dmu7h-6909-ppp.s3.sa-east-1.amazonaws.com/siteadmin/upload/img/telegram.png',
  WECHAT:
    'https://9dmu7h-6909-ppp.s3.sa-east-1.amazonaws.com/siteadmin/upload/img/WeChat.png',
  WHATSAPP:
    'https://9dmu7h-6909-ppp.s3.sa-east-1.amazonaws.com/siteadmin/upload/img/WhtasApp.png',
  SKYPE:
    'https://9dmu7h-6909-ppp.s3.sa-east-1.amazonaws.com/siteadmin/upload/img/Skype.png',
  FACEBOOK:
    'https://9dmu7h-6909-ppp.s3.sa-east-1.amazonaws.com/siteadmin/upload/img/Facebook.png',
};

// Form data
const formData = ref<CustomerServiceIMConfig>({
  currencies: [],
  memberLevels: [],
  imType: 'TELEGRAM',
  serviceName: '',
  serviceAccount: '',
  androidLink: '',
  iosLink: '',
  pcLink: '',
  displayOrder: 0, // Keep for backend compatibility but don't show in UI
  isEnabled: true,
});

// Form validation rules
const formRules = {
  imType: { required: true, message: '请选择IM类型' },
  serviceName: { required: true, message: '请输入客服昵称' },
  serviceAccount: { required: true, message: '请输入客服账号' },
};

// Currency options - only BRL
const currencyOptions = [{ label: '巴西雷亚尔 (BRL)', value: 'BRL' }];

// IM type description
const imTypeDescription = computed(() => {
  switch (formData.value.imType) {
    case 'LINE':
      return '若选择系统自带的IM，账号则自动生成链接';
    case 'TELEGRAM':
      return '若选择系统自带的IM，账号则自动生成链接';
    case 'WHATSAPP':
      return '若选择系统自带的IM，账号则自动生成链接';
    case 'WECHAT':
      return '若选择系统自带的IM，账号则自动生成链接';
    case 'SKYPE':
      return '若选择系统自带的IM，账号则自动生成链接';
    case 'FACEBOOK':
      return '若选择系统自带的IM，账号则自动生成链接';
    case 'CUSTOM':
      return '若自定义IM，需自行输入链接';
    default:
      return '';
  }
});

// Computed property for auto-generated link
const generatedLink = computed(() => {
  const account = formData.value.serviceAccount || '';
  if (!account) return '';

  switch (formData.value.imType) {
    case 'LINE':
      return `https://line.me/R/ti/p/${account}`;
    case 'TELEGRAM':
      return `https://telegram.me/${account}`;
    case 'WHATSAPP':
      return `https://api.whatsapp.com/send?phone=${account}`;
    case 'WECHAT':
      return `weixin://${account}`;
    case 'SKYPE':
      return `skype:?chat${account}`;
    case 'FACEBOOK':
      return `https://www.facebook.com/${account}`;
    default:
      return '';
  }
});

// Table columns
const columns = computed<DataTableColumns<CustomerServiceIMConfig>>(() => [
  {
    title: 'IM',
    key: 'imType',
    width: 120,
    render: (row) => {
      const iconUrl = imIconUrls[row.imType as keyof typeof imIconUrls];
      return h(NSpace, { align: 'center', size: 8 }, () => [
        iconUrl
          ? h(NAvatar, {
              size: 'small',
              src: iconUrl,
              fallbackSrc:
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Ctext y="18" font-size="18"%3E💬%3C/text%3E%3C/svg%3E',
            })
          : null,
        h('span', row.imType),
      ]);
    },
  },
  {
    title: '昵称',
    key: 'serviceName',
    width: 150,
  },
  {
    title: '账号',
    key: 'serviceAccount',
    width: 200,
  },
  {
    title: '币种',
    key: 'currencies',
    width: 150,
    render: (row) => {
      if (!row.currencies || row.currencies.length === 0) {
        return '全部';
      }
      return row.currencies.join(', ');
    },
  },
  {
    title: '会员层级',
    key: 'memberLevels',
    width: 200,
    render: (row) => {
      if (!row.memberLevels || row.memberLevels.length === 0) {
        return '全部层级';
      }
      // If "ALL" is in the array, show "全部层级"
      if (row.memberLevels.includes('ALL')) {
        return '全部层级';
      }
      // Map tier IDs to tier names
      const tierNames = row.memberLevels.map((tierId: string) => {
        if (tierId === 'ALL') return '全部层级';
        const tier = memberTierOptions.value.find(
          (t) => t.value === String(tierId),
        );
        return tier ? tier.label : `Tier ${tierId}`;
      });
      return tierNames.join(', ');
    },
  },
  {
    title: '状态',
    key: 'isEnabled',
    width: 100,
    render: (row) => {
      return h(NTag, { type: row.isEnabled ? 'success' : 'error' }, () =>
        row.isEnabled ? '启用' : '禁用',
      );
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row) => {
      return h(NSpace, {}, () => [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => showEditModal(row.id!),
          },
          () => '修改',
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.id!),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', type: 'error' }, () => '删除'),
            default: () => '确定删除此客服配置吗？',
          },
        ),
      ]);
    },
  },
]);

// Load member tiers
const loadMemberTiers = async () => {
  loadingMemberTiers.value = true;
  try {
    const tiers = await getActiveMemberTiersApi();
    // Sort by ID
    const sorted = tiers.sort((a: any, b: any) => {
      return Number(a.id) - Number(b.id);
    });
    memberTierOptions.value = sorted.map((tier) => ({
      label: tier.tierName || tier.tierCode || `Tier ${tier.id}`,
      value: String(tier.id),
    }));
  } catch (error: any) {
    console.error('Failed to load member tiers:', error);
    message.warning('加载会员层级失败，请稍后重试');
  } finally {
    loadingMemberTiers.value = false;
  }
};

// Load customer service list
const loadList = async () => {
  loading.value = true;
  try {
    const response = await getCustomerServiceIMConfigs();
    // Request interceptor behavior:
    // - For code: 0 → returns data.data (array)
    // - For success: true → returns whole response object
    if (Array.isArray(response)) {
      // Interceptor extracted the array directly
      customerServiceList.value = response;
    } else if (response && response.success && Array.isArray(response.data)) {
      // success: true format
      customerServiceList.value = response.data;
    } else if (response && response.data && Array.isArray(response.data)) {
      // Fallback: direct data property
      customerServiceList.value = response.data;
    } else {
      customerServiceList.value = [];
    }
  } catch (error: any) {
    message.error(error.message || '加载客服列表失败');
    customerServiceList.value = [];
  } finally {
    loading.value = false;
  }
};

// Show edit modal
const showEditModal = async (id: number | null) => {
  editingId.value = id;

  // Ensure member tiers are loaded
  if (memberTierOptions.value.length === 0) {
    await loadMemberTiers();
  }

  if (id) {
    const config = customerServiceList.value.find((c) => c.id === id);
    if (config) {
      formData.value = {
        ...config,
        // Ensure memberLevels is an array
        memberLevels: Array.isArray(config.memberLevels)
          ? config.memberLevels
          : [],
        // Ensure currencies is an array
        currencies: Array.isArray(config.currencies) ? config.currencies : [],
      };
    }
  } else {
    formData.value = {
      currencies: [],
      memberLevels: [],
      imType: 'TELEGRAM',
      serviceName: '',
      serviceAccount: '',
      androidLink: '',
      iosLink: '',
      pcLink: '',
      displayOrder: 0, // Keep for backend compatibility
      isEnabled: true,
    };
  }

  showModal.value = true;
};

// Submit form
const submitForm = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  saving.value = true;
  try {
    if (editingId.value) {
      await updateCustomerServiceIMConfig(editingId.value, formData.value);
    } else {
      await createCustomerServiceIMConfig(formData.value);
    }

    message.success(editingId.value ? '更新成功' : '创建成功');
    showModal.value = false;
    await loadList();
  } catch (error: any) {
    message.error(error.message || '操作失败');
  } finally {
    saving.value = false;
  }
};

// Handle delete
const handleDelete = async (id: number) => {
  try {
    await deleteCustomerServiceIMConfig(id);
    message.success('删除成功');
    await loadList();
  } catch (error: any) {
    message.error(error.message || '删除失败');
  }
};

// Handle member tier change - SIMPLE VERSION
const handleMemberTierChange = (value: string[]) => {
  if (isUpdatingMemberTiers.value) return;

  const previousValue = formData.value.memberLevels || [];
  const currentValue = value || [];
  const hadAll = previousValue.includes('ALL');
  const hasAll = currentValue.includes('ALL');
  const allTierIds = memberTierOptions.value.map((t) => t.value);

  // User clicked "ALL" checkbox directly
  if (hadAll !== hasAll) {
    if (hasAll) {
      // Checked "ALL" - select all tiers
      formData.value.memberLevels = ['ALL', ...allTierIds];
    } else {
      // Unchecked "ALL" - clear all
      formData.value.memberLevels = [];
    }
    return;
  }

  // User clicked individual tier checkboxes
  const valueWithoutAll = currentValue.filter((v) => v !== 'ALL');
  const allTiersSelected =
    allTierIds.length > 0 &&
    allTierIds.every((id) => valueWithoutAll.includes(id));

  if (allTiersSelected) {
    // All individual tiers selected - add "ALL"
    formData.value.memberLevels = ['ALL', ...allTierIds];
  } else {
    // Not all selected - remove "ALL" if present
    formData.value.memberLevels = valueWithoutAll;
  }
};

// Handle upload
const handleUpload = (options: any) => {
  // Implement upload logic here
  message.info('上传功能待实现');
  return false;
};

onMounted(() => {
  loadList();
  loadMemberTiers();
});
</script>

<style scoped>
.other-customer-service-tab {
  max-width: 1400px;
}
.cursor-move {
  cursor: move;
}
</style>
