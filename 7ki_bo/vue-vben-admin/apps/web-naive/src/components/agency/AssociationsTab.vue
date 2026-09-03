<template>
  <div class="associations-tab">
    <n-card :title="$t('agency.associations.overview')" class="mb-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="stat-card">
          <div class="stat-value">{{ totalAssociations }}</div>
          <div class="stat-label">
            {{ $t('agency.associations.totalAssociations') }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeAssociations }}</div>
          <div class="stat-label">
            {{ $t('agency.associations.activeAssociations') }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ verifiedAssociations }}</div>
          <div class="stat-label">
            {{ $t('agency.associations.verifiedAssociations') }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pendingAssociations }}</div>
          <div class="stat-label">
            {{ $t('agency.associations.pendingAssociations') }}
          </div>
        </div>
      </div>
    </n-card>

    <n-card :title="$t('common.actions')" class="mb-4">
      <div class="flex flex-wrap gap-2">
        <n-button type="primary" @click="handleAddAssociation">
          {{ $t('agency.associations.addAssociation') }}
        </n-button>
        <n-button type="info" @click="handleBatchVerify">
          {{ $t('agency.associations.batchVerify') }}
        </n-button>
        <n-button type="warning" @click="handleExportAssociations">
          {{ $t('agency.associations.exportAssociations') }}
        </n-button>
        <n-button @click="handleRefresh"> {{ $t('common.refresh') }} </n-button>
      </div>
    </n-card>

    <n-card :title="$t('agency.associations.associationList')">
      <n-data-table
        :columns="columns"
        :data="associations"
        :pagination="pagination"
        :loading="loading"
        size="small"
        :row-key="(row) => row.id"
      />
    </n-card>

    <n-modal
      v-model:show="showAssociationModal"
      preset="card"
      :title="$t('agency.associations.associationTitle')"
      style="width: 600px"
    >
      <n-form
        ref="formRef"
        :model="associationForm"
        :rules="rules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item
          :label="$t('agency.associations.associationType')"
          path="type"
        >
          <n-select
            v-model:value="associationForm.type"
            :options="associationTypeOptions"
          />
        </n-form-item>

        <n-form-item
          :label="$t('agency.associations.associationAccount')"
          path="account"
        >
          <n-input
            v-model:value="associationForm.account"
            :placeholder="$t('agency.associations.enterAssociationAccount')"
          />
        </n-form-item>

        <n-form-item
          :label="$t('agency.associations.associationPlatform')"
          path="platform"
        >
          <n-input
            v-model:value="associationForm.platform"
            :placeholder="$t('agency.associations.enterAssociationPlatform')"
          />
        </n-form-item>

        <n-form-item
          :label="$t('agency.associations.associationReason')"
          path="reason"
        >
          <n-input
            v-model:value="associationForm.reason"
            type="textarea"
            :placeholder="$t('agency.associations.enterAssociationReason')"
            :rows="3"
          />
        </n-form-item>

        <n-form-item :label="$t('common.status')" path="status">
          <n-select
            v-model:value="associationForm.status"
            :options="statusOptions"
          />
        </n-form-item>

        <n-form-item :label="$t('common.remark')" path="remark">
          <n-input
            v-model:value="associationForm.remark"
            type="textarea"
            :placeholder="$t('agency.withdrawAccount.enterRemark')"
            :rows="3"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <div class="flex gap-2">
          <n-button @click="showAssociationModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            @click="handleSubmitAssociation"
            :loading="submitting"
          >
            {{ isEdit ? $t('agency.shared.update') : $t('common.add') }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, h, onMounted } from 'vue';
import {
  NCard,
  NButton,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';

interface Props {
  agentId?: number;
}

interface Association {
  id: number;
  type: string;
  account: string;
  platform: string;
  reason: string;
  status: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

interface AssociationForm {
  type: string;
  account: string;
  platform: string;
  reason: string;
  status: string;
  remark: string;
}

const props = withDefaults(defineProps<Props>(), {
  agentId: 0,
});

const message = useMessage();
const loading = ref(false);
const submitting = ref(false);
const showAssociationModal = ref(false);
const isEdit = ref(false);
const currentAssociationId = ref<number | null>(null);

const associations = ref<Association[]>([
  {
    id: 1,
    type: 'bank',
    account: '6222021234567890123',
    platform: 'ICBC',
    reason: 'Primary bank account',
    status: 'active',
    remark: 'Withdrawal and deposit',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    type: 'alipay',
    account: 'zhangsan@alipay.com',
    platform: 'Alipay',
    reason: 'Mobile payment',
    status: 'active',
    remark: 'Daily transactions',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    type: 'wechat',
    account: 'zhangsan_wechat',
    platform: 'WeChat Pay',
    reason: 'Social payment',
    status: 'pending',
    remark: 'Pending verification',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
]);

const associationForm = reactive<AssociationForm>({
  type: 'bank',
  account: '',
  platform: '',
  reason: '',
  status: 'pending',
  remark: '',
});

const associationTypeOptions = computed(() => [
  { label: $t('agency.associations.bankAccount'), value: 'bank' },
  { label: $t('agency.associations.alipay'), value: 'alipay' },
  { label: $t('agency.associations.wechatPay'), value: 'wechat' },
  { label: $t('agency.associations.otherPlatform'), value: 'other' },
]);

const statusOptions = computed(() => [
  { label: $t('agency.associations.active'), value: 'active' },
  { label: $t('agency.associations.inactive'), value: 'inactive' },
  { label: $t('agency.associations.pending'), value: 'pending' },
]);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: { itemCount: number }) =>
    $t('agency.associations.totalRecords', [info.itemCount]),
  onUpdatePage: (page: number) => {
    pagination.page = page;
    loadAssociations();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadAssociations();
  },
});

const totalAssociations = computed(() => associations.value.length);
const activeAssociations = computed(
  () => associations.value.filter((assoc) => assoc.status === 'active').length,
);
const verifiedAssociations = computed(
  () => associations.value.filter((assoc) => assoc.status === 'active').length,
);
const pendingAssociations = computed(
  () => associations.value.filter((assoc) => assoc.status === 'pending').length,
);

const getTypeInfo = (type: string) => {
  const map: Record<string, { label: string; type: string; icon: string }> = {
    bank: {
      label: $t('agency.associations.bankAccount'),
      type: 'info',
      icon: '🏦',
    },
    alipay: {
      label: $t('agency.associations.alipay'),
      type: 'success',
      icon: '💳',
    },
    wechat: {
      label: $t('agency.associations.wechatPay'),
      type: 'success',
      icon: '💬',
    },
    other: {
      label: $t('agency.associations.otherPlatform'),
      type: 'default',
      icon: '🔗',
    },
  };
  return map[type] || { label: type, type: 'default', icon: '❓' };
};

const getStatusInfo = (status: string) => {
  const map: Record<string, { label: string; type: string; icon: string }> = {
    active: {
      label: $t('agency.associations.active'),
      type: 'success',
      icon: '✅',
    },
    inactive: {
      label: $t('agency.associations.inactive'),
      type: 'error',
      icon: '❌',
    },
    pending: {
      label: $t('agency.associations.pending'),
      type: 'warning',
      icon: '⏳',
    },
  };
  return map[status] || { label: status, type: 'default', icon: '❓' };
};

const columns = computed<DataTableColumns<Association>>(() => [
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  {
    title: $t('agency.associations.associationType'),
    key: 'type',
    width: 120,
    render: (row) => {
      const typeInfo = getTypeInfo(row.type);
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-lg' }, typeInfo.icon),
        h(
          NTag,
          { type: typeInfo.type as any, size: 'small' },
          { default: () => typeInfo.label },
        ),
      ]);
    },
  },
  {
    title: $t('agency.associations.associationAccount'),
    key: 'account',
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: $t('agency.associations.associationPlatform'),
    key: 'platform',
    width: 150,
  },
  {
    title: $t('agency.associations.associationReason'),
    key: 'reason',
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    render: (row) => {
      const status = getStatusInfo(row.status);
      return h('div', { class: 'flex items-center justify-center gap-1' }, [
        h('span', { class: 'text-sm' }, status.icon),
        h(
          NTag,
          { type: status.type as any, size: 'small' },
          { default: () => status.label },
        ),
      ]);
    },
  },
  {
    title: $t('common.createTime'),
    key: 'createdAt',
    width: 180,
    render: (row) =>
      h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, renderTzDateTime(row.createdAt)),
      ]),
  },
  {
    title: $t('common.remark'),
    key: 'remark',
    ellipsis: true,
    tooltip: true,
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (row) =>
      h('div', { class: 'flex gap-1' }, [
        h(
          NButton,
          {
            size: 'tiny',
            type: 'primary',
            onClick: () => handleEditAssociation(row),
          },
          { default: () => $t('common.edit') },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: row.status === 'active' ? 'warning' : 'success',
            onClick: () => handleToggleStatus(row),
          },
          {
            default: () =>
              row.status === 'active'
                ? $t('common.disable')
                : $t('common.enable'),
          },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: 'error',
            onClick: () => handleDeleteAssociation(row.id),
          },
          { default: () => $t('common.delete') },
        ),
      ]),
  },
]);

const rules = computed(() => ({
  type: {
    required: true,
    message: $t('agency.associations.selectAssociationType'),
    trigger: 'blur',
  },
  account: {
    required: true,
    message: $t('agency.associations.enterAssociationAccountRequired'),
    trigger: 'blur',
  },
  platform: {
    required: true,
    message: $t('agency.associations.enterAssociationPlatformRequired'),
    trigger: 'blur',
  },
  reason: {
    required: true,
    message: $t('agency.associations.enterAssociationReasonRequired'),
    trigger: 'blur',
  },
}));

const loadAssociations = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    pagination.itemCount = associations.value.length;
  } catch {
    message.error($t('agency.associations.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleAddAssociation = () => {
  isEdit.value = false;
  currentAssociationId.value = null;
  resetForm();
  showAssociationModal.value = true;
};

const handleEditAssociation = (association: Association) => {
  isEdit.value = true;
  currentAssociationId.value = association.id;
  Object.assign(associationForm, {
    type: association.type,
    account: association.account,
    platform: association.platform,
    reason: association.reason,
    status: association.status,
    remark: association.remark || '',
  });
  showAssociationModal.value = true;
};

const handleSubmitAssociation = async () => {
  try {
    submitting.value = true;
    if (isEdit.value && currentAssociationId.value) {
      const index = associations.value.findIndex(
        (assoc) => assoc.id === currentAssociationId.value,
      );
      if (index !== -1) {
        Object.assign(associations.value[index], {
          ...associationForm,
          updatedAt: new Date().toISOString(),
        });
      }
      message.success($t('agency.associations.updateSuccess'));
    } else {
      associations.value.push({
        id: Date.now(),
        ...associationForm,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      message.success($t('agency.associations.addSuccess'));
    }
    showAssociationModal.value = false;
    loadAssociations();
  } catch {
    message.error($t('agency.associations.opFailed'));
  } finally {
    submitting.value = false;
  }
};

const handleToggleStatus = (association: Association) => {
  association.status = association.status === 'active' ? 'inactive' : 'active';
  association.updatedAt = new Date().toISOString();
  message.success(
    $t('agency.associations.statusUpdated', [
      association.status === 'active'
        ? $t('common.enable')
        : $t('common.disable'),
    ]),
  );
};

const handleDeleteAssociation = (id: number) => {
  const index = associations.value.findIndex((assoc) => assoc.id === id);
  if (index !== -1) {
    associations.value.splice(index, 1);
    message.success($t('agency.associations.deleteSuccess'));
    loadAssociations();
  }
};

const handleBatchVerify = () => {
  message.info($t('agency.associations.batchVerifyDeveloping'));
};

const handleExportAssociations = () => {
  message.info($t('agency.associations.exportDeveloping'));
};

const handleRefresh = () => {
  loadAssociations();
  message.success($t('agency.associations.refreshed'));
};

const resetForm = () => {
  Object.assign(associationForm, {
    type: 'bank',
    account: '',
    platform: '',
    reason: '',
    status: 'pending',
    remark: '',
  });
};

onMounted(() => {
  loadAssociations();
});
</script>

<style scoped>
.associations-tab {
  padding: 16px;
}

.mb-4 {
  margin-bottom: 1rem;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
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

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}
</style>
