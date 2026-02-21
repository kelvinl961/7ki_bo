<template>
  <div class="associations-tab">
    <!-- Associations Summary -->
    <n-card title="关联账号概览" class="mb-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="stat-card">
          <div class="stat-value">{{ totalAssociations }}</div>
          <div class="stat-label">总关联数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeAssociations }}</div>
          <div class="stat-label">活跃关联</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ verifiedAssociations }}</div>
          <div class="stat-label">已验证关联</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pendingAssociations }}</div>
          <div class="stat-label">待验证关联</div>
        </div>
      </div>
    </n-card>

    <!-- Action Buttons -->
    <n-card title="操作" class="mb-4">
      <div class="flex flex-wrap gap-2">
        <n-button type="primary" @click="handleAddAssociation">
          添加关联
        </n-button>
        <n-button type="info" @click="handleBatchVerify"> 批量验证 </n-button>
        <n-button type="warning" @click="handleExportAssociations">
          导出关联
        </n-button>
        <n-button @click="handleRefresh"> 刷新 </n-button>
      </div>
    </n-card>

    <!-- Associations Table -->
    <n-card title="关联账号列表">
      <n-data-table
        :columns="columns"
        :data="associations"
        :pagination="pagination"
        :loading="loading"
        size="small"
        :row-key="(row) => row.id"
      />
    </n-card>

    <!-- Add/Edit Association Modal -->
    <n-modal
      v-model:show="showAssociationModal"
      preset="card"
      title="关联账号"
      style="width: 600px"
    >
      <n-form
        ref="formRef"
        :model="associationForm"
        :rules="rules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item label="关联类型" path="type">
          <n-select
            v-model:value="associationForm.type"
            :options="associationTypeOptions"
          />
        </n-form-item>

        <n-form-item label="关联账号" path="account">
          <n-input
            v-model:value="associationForm.account"
            placeholder="请输入关联账号"
          />
        </n-form-item>

        <n-form-item label="关联平台" path="platform">
          <n-input
            v-model:value="associationForm.platform"
            placeholder="请输入关联平台"
          />
        </n-form-item>

        <n-form-item label="关联原因" path="reason">
          <n-input
            v-model:value="associationForm.reason"
            type="textarea"
            placeholder="请输入关联原因"
            :rows="3"
          />
        </n-form-item>

        <n-form-item label="状态" path="status">
          <n-select
            v-model:value="associationForm.status"
            :options="statusOptions"
          />
        </n-form-item>

        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="associationForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <div class="flex gap-2">
          <n-button @click="showAssociationModal = false">取消</n-button>
          <n-button
            type="primary"
            @click="handleSubmitAssociation"
            :loading="submitting"
          >
            {{ isEdit ? '更新' : '添加' }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
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
import type { AgentRecord } from '#/api/agency/agent';

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

// Reactive data
const loading = ref(false);
const submitting = ref(false);
const showAssociationModal = ref(false);
const isEdit = ref(false);
const currentAssociationId = ref<number | null>(null);

// Mock data
const associations = ref<Association[]>([
  {
    id: 1,
    type: 'bank',
    account: '6222021234567890123',
    platform: '中国工商银行',
    reason: '主要银行账户关联',
    status: 'active',
    remark: '用于提现和充值',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    type: 'alipay',
    account: 'zhangsan@alipay.com',
    platform: '支付宝',
    reason: '移动支付关联',
    status: 'active',
    remark: '日常小额交易',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    type: 'wechat',
    account: 'zhangsan_wechat',
    platform: '微信支付',
    reason: '社交支付关联',
    status: 'pending',
    remark: '待验证身份',
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

// Options
const associationTypeOptions = [
  { label: '银行账户', value: 'bank' },
  { label: '支付宝', value: 'alipay' },
  { label: '微信支付', value: 'wechat' },
  { label: '其他平台', value: 'other' },
];

const statusOptions = [
  { label: '活跃', value: 'active' },
  { label: '停用', value: 'inactive' },
  { label: '待验证', value: 'pending' },
];

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: any) => `共 ${info.itemCount} 条`,
  onUpdatePage: (page: number) => {
    pagination.page = page;
    loadAssociations();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    loadAssociations();
  },
});

// Computed
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

// Table columns
const columns: DataTableColumns<Association> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center',
  },
  {
    title: '关联类型',
    key: 'type',
    width: 120,
    render: (row) => {
      const typeMap = {
        bank: { label: '银行账户', type: 'info', icon: '🏦' },
        alipay: { label: '支付宝', type: 'success', icon: '💳' },
        wechat: { label: '微信支付', type: 'success', icon: '💬' },
        other: { label: '其他平台', type: 'default', icon: '🔗' },
      };
      const typeInfo = typeMap[row.type as keyof typeof typeMap] || {
        label: row.type,
        type: 'default',
        icon: '❓',
      };
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-lg' }, typeInfo.icon),
        h(
          NTag,
          { type: typeInfo.type, size: 'small' },
          { default: () => typeInfo.label },
        ),
      ]);
    },
  },
  {
    title: '关联账号',
    key: 'account',
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '关联平台',
    key: 'platform',
    width: 150,
  },
  {
    title: '关联原因',
    key: 'reason',
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap = {
        active: { label: '活跃', type: 'success', icon: '✅' },
        inactive: { label: '停用', type: 'error', icon: '❌' },
        pending: { label: '待验证', type: 'warning', icon: '⏳' },
      };
      const status = statusMap[row.status as keyof typeof statusMap] || {
        label: row.status,
        type: 'default',
        icon: '❓',
      };
      return h('div', { class: 'flex items-center justify-center gap-1' }, [
        h('span', { class: 'text-sm' }, status.icon),
        h(
          NTag,
          { type: status.type, size: 'small' },
          { default: () => status.label },
        ),
      ]);
    },
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 180,
    render: (row) => {
      return h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, formatDateTime(row.createdAt)),
      ]);
    },
  },
  {
    title: '备注',
    key: 'remark',
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (row) => {
      return h('div', { class: 'flex gap-1' }, [
        h(
          NButton,
          {
            size: 'tiny',
            type: 'primary',
            onClick: () => handleEditAssociation(row),
          },
          { default: () => '编辑' },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: row.status === 'active' ? 'warning' : 'success',
            onClick: () => handleToggleStatus(row),
          },
          { default: () => (row.status === 'active' ? '停用' : '启用') },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: 'error',
            onClick: () => handleDeleteAssociation(row.id),
          },
          { default: () => '删除' },
        ),
      ]);
    },
  },
];

// Form validation rules
const rules = {
  type: {
    required: true,
    message: '请选择关联类型',
    trigger: 'blur',
  },
  account: {
    required: true,
    message: '请输入关联账号',
    trigger: 'blur',
  },
  platform: {
    required: true,
    message: '请输入关联平台',
    trigger: 'blur',
  },
  reason: {
    required: true,
    message: '请输入关联原因',
    trigger: 'blur',
  },
};

// Methods
const loadAssociations = async () => {
  loading.value = true;
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    pagination.itemCount = associations.value.length;
  } catch (error) {
    message.error('加载关联账号失败');
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
      // Update existing association
      const index = associations.value.findIndex(
        (assoc) => assoc.id === currentAssociationId.value,
      );
      if (index !== -1) {
        Object.assign(associations.value[index], {
          ...associationForm,
          updatedAt: new Date().toISOString(),
        });
      }
      message.success('关联账号更新成功');
    } else {
      // Add new association
      const newAssociation: Association = {
        id: Date.now(),
        ...associationForm,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      associations.value.push(newAssociation);
      message.success('关联账号添加成功');
    }

    showAssociationModal.value = false;
    loadAssociations();
  } catch (error) {
    message.error('操作失败');
  } finally {
    submitting.value = false;
  }
};

const handleToggleStatus = (association: Association) => {
  association.status = association.status === 'active' ? 'inactive' : 'active';
  association.updatedAt = new Date().toISOString();
  message.success(
    `关联账号已${association.status === 'active' ? '启用' : '停用'}`,
  );
};

const handleDeleteAssociation = (id: number) => {
  const index = associations.value.findIndex((assoc) => assoc.id === id);
  if (index !== -1) {
    associations.value.splice(index, 1);
    message.success('关联账号删除成功');
    loadAssociations();
  }
};

const handleBatchVerify = () => {
  message.info('批量验证功能开发中...');
};

const handleExportAssociations = () => {
  message.info('导出关联账号功能开发中...');
};

const handleRefresh = () => {
  loadAssociations();
  message.success('已刷新');
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

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
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
