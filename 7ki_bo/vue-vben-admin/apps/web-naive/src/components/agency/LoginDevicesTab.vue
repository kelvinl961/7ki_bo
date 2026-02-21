<template>
  <div class="login-devices-tab">
    <!-- Device Summary -->
    <n-card title="登录设备概览" class="mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="stat-value">{{ totalDevices }}</div>
          <div class="stat-label">总设备数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeDevices }}</div>
          <div class="stat-label">活跃设备</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ uniqueIPs }}</div>
          <div class="stat-label">唯一IP数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ lastLoginDays }}</div>
          <div class="stat-label">最后登录天数</div>
        </div>
      </div>
    </n-card>

    <!-- Action Buttons -->
    <n-card title="操作" class="mb-4">
      <div class="flex flex-wrap gap-2">
        <n-button type="primary" @click="handleAddDevice">
          添加设备
        </n-button>
        <n-button type="info" @click="handleBatchVerify">
          批量验证
        </n-button>
        <n-button type="warning" @click="handleExportDevices">
          导出设备
        </n-button>
        <n-button @click="handleRefresh">
          刷新
        </n-button>
      </div>
    </n-card>

    <!-- Login Devices Table -->
    <n-card title="登录设备列表">
      <n-data-table
        :columns="columns"
        :data="loginDevices"
        :pagination="pagination"
        :loading="loading"
        size="small"
        :row-key="(row) => row.id"
      />
    </n-card>

    <!-- Add/Edit Device Modal -->
    <n-modal v-model:show="showDeviceModal" preset="card" title="登录设备" style="width: 600px">
      <n-form
        ref="formRef"
        :model="deviceForm"
        :rules="rules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item label="设备名称" path="name">
          <n-input v-model:value="deviceForm.name" placeholder="请输入设备名称" />
        </n-form-item>
        
        <n-form-item label="设备类型" path="type">
          <n-select v-model:value="deviceForm.type" :options="deviceTypeOptions" />
        </n-form-item>
        
        <n-form-item label="操作系统" path="os">
          <n-input v-model:value="deviceForm.os" placeholder="请输入操作系统" />
        </n-form-item>
        
        <n-form-item label="浏览器" path="browser">
          <n-input v-model:value="deviceForm.browser" placeholder="请输入浏览器" />
        </n-form-item>
        
        <n-form-item label="IP地址" path="ipAddress">
          <n-input v-model:value="deviceForm.ipAddress" placeholder="请输入IP地址" />
        </n-form-item>
        
        <n-form-item label="状态" path="status">
          <n-select v-model:value="deviceForm.status" :options="statusOptions" />
        </n-form-item>
        
        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="deviceForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </n-form-item>
      </n-form>
      
      <template #action>
        <div class="flex gap-2">
          <n-button @click="showDeviceModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmitDevice" :loading="submitting">
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
  type DataTableColumns 
} from 'naive-ui';
import type { AgentRecord } from '#/api/agency/agent';
import { getAgentLoginDevicesApi } from '#/api/agency/agent-details';

interface Props {
  agentId?: number;
}

interface LoginDevice {
  id: number;
  name: string;
  type: string;
  os: string;
  browser: string;
  ipAddress: string;
  status: string;
  lastLoginTime: string;
  loginCount: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeviceForm {
  name: string;
  type: string;
  os: string;
  browser: string;
  ipAddress: string;
  status: string;
  remark: string;
}

const props = withDefaults(defineProps<Props>(), {
  agentId: 0
});

const message = useMessage();

// Reactive data
const loading = ref(false);
const submitting = ref(false);
const showDeviceModal = ref(false);
const isEdit = ref(false);
const currentDeviceId = ref<number | null>(null);

// Real data from API
const loginDevices = ref<LoginDevice[]>([]);

const deviceForm = reactive<DeviceForm>({
  name: '',
  type: 'desktop',
  os: '',
  browser: '',
  ipAddress: '',
  status: 'active',
  remark: ''
});

// Options
const deviceTypeOptions = [
  { label: '桌面设备', value: 'desktop' },
  { label: '移动设备', value: 'mobile' },
  { label: '平板设备', value: 'tablet' },
  { label: '未知设备', value: 'unknown' }
];

const statusOptions = [
  { label: '活跃', value: 'active' },
  { label: '停用', value: 'inactive' },
  { label: '待验证', value: 'pending' }
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
    loadDevices();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadDevices();
  },
});

// Computed
const totalDevices = computed(() => loginDevices.value.length);

const activeDevices = computed(() => 
  loginDevices.value.filter(device => device.status === 'active').length
);

const uniqueIPs = computed(() => {
  const ips = new Set(loginDevices.value.map(device => device.ipAddress));
  return ips.size;
});

const lastLoginDays = computed(() => {
  const lastLogin = loginDevices.value
    .map(device => new Date(device.lastLoginTime))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  
  if (!lastLogin) return 0;
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Table columns
const columns: DataTableColumns<LoginDevice> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center'
  },
  {
    title: '设备名称',
    key: 'name',
    width: 150
  },
  {
    title: '设备类型',
    key: 'type',
    width: 100,
    render: (row) => {
      const typeMap = {
        'desktop': { label: '桌面设备', type: 'info', icon: '💻' },
        'mobile': { label: '移动设备', type: 'success', icon: '📱' },
        'tablet': { label: '平板设备', type: 'warning', icon: '📱' },
        'unknown': { label: '未知设备', type: 'default', icon: '❓' }
      };
      const typeInfo = typeMap[row.type as keyof typeof typeMap] || { label: row.type, type: 'default', icon: '❓' };
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-lg' }, typeInfo.icon),
        h(NTag, { type: typeInfo.type, size: 'small' }, { default: () => typeInfo.label })
      ]);
    }
  },
  {
    title: '操作系统',
    key: 'os',
    width: 120
  },
  {
    title: '浏览器',
    key: 'browser',
    width: 100
  },
  {
    title: 'IP地址',
    key: 'ipAddress',
    width: 120,
    render: (row) => {
      return h('span', { class: 'text-xs font-mono text-gray-600' }, row.ipAddress);
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap = {
        'active': { label: '活跃', type: 'success', icon: '✅' },
        'inactive': { label: '停用', type: 'error', icon: '❌' },
        'pending': { label: '待验证', type: 'warning', icon: '⏳' }
      };
      const status = statusMap[row.status as keyof typeof statusMap] || { label: row.status, type: 'default', icon: '❓' };
      return h('div', { class: 'flex items-center justify-center gap-1' }, [
        h('span', { class: 'text-sm' }, status.icon),
        h(NTag, { type: status.type, size: 'small' }, { default: () => status.label })
      ]);
    }
  },
  {
    title: '最后登录',
    key: 'lastLoginTime',
    width: 180,
    render: (row) => {
      return h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, formatDateTime(row.lastLoginTime)),
        h('div', { class: 'text-xs text-gray-500' }, `${row.loginCount} 次登录`)
      ]);
    }
  },
  {
    title: '备注',
    key: 'remark',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (row) => {
      return h('div', { class: 'flex gap-1' }, [
        h(NButton, {
          size: 'tiny',
          type: 'primary',
          onClick: () => handleEditDevice(row)
        }, { default: () => '编辑' }),
        h(NButton, {
          size: 'tiny',
          type: row.status === 'active' ? 'warning' : 'success',
          onClick: () => handleToggleStatus(row)
        }, { default: () => row.status === 'active' ? '停用' : '启用' }),
        h(NButton, {
          size: 'tiny',
          type: 'error',
          onClick: () => handleDeleteDevice(row.id)
        }, { default: () => '删除' })
      ]);
    }
  }
];

// Form validation rules
const rules = {
  name: {
    required: true,
    message: '请输入设备名称',
    trigger: 'blur'
  },
  type: {
    required: true,
    message: '请选择设备类型',
    trigger: 'blur'
  },
  ipAddress: {
    required: true,
    message: '请输入IP地址',
    trigger: 'blur'
  }
};

// Methods
const loadDevices = async () => {
  loading.value = true;
  try {
    const response = await getAgentLoginDevicesApi(props.agentId, {
      page: pagination.page,
      pageSize: pagination.pageSize
    });
    
    loginDevices.value = response.list;
    pagination.itemCount = response.pagination.total;
  } catch (error) {
    message.error('加载设备失败');
    console.error('Failed to load devices:', error);
  } finally {
    loading.value = false;
  }
};

const handleAddDevice = () => {
  isEdit.value = false;
  currentDeviceId.value = null;
  resetForm();
  showDeviceModal.value = true;
};

const handleEditDevice = (device: LoginDevice) => {
  isEdit.value = true;
  currentDeviceId.value = device.id;
  Object.assign(deviceForm, {
    name: device.name,
    type: device.type,
    os: device.os,
    browser: device.browser,
    ipAddress: device.ipAddress,
    status: device.status,
    remark: device.remark || ''
  });
  showDeviceModal.value = true;
};

const handleSubmitDevice = async () => {
  try {
    submitting.value = true;
    
    if (isEdit.value && currentDeviceId.value) {
      // Update existing device
      const index = loginDevices.value.findIndex(dev => dev.id === currentDeviceId.value);
      if (index !== -1) {
        Object.assign(loginDevices.value[index], {
          ...deviceForm,
          updatedAt: new Date().toISOString()
        });
      }
      message.success('设备更新成功');
    } else {
      // Add new device
      const newDevice: LoginDevice = {
        id: Date.now(),
        ...deviceForm,
        lastLoginTime: new Date().toISOString(),
        loginCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      loginDevices.value.push(newDevice);
      message.success('设备添加成功');
    }
    
    showDeviceModal.value = false;
    loadDevices();
  } catch (error) {
    message.error('操作失败');
  } finally {
    submitting.value = false;
  }
};

const handleToggleStatus = (device: LoginDevice) => {
  device.status = device.status === 'active' ? 'inactive' : 'active';
  device.updatedAt = new Date().toISOString();
  message.success(`设备已${device.status === 'active' ? '启用' : '停用'}`);
};

const handleDeleteDevice = (id: number) => {
  const index = loginDevices.value.findIndex(dev => dev.id === id);
  if (index !== -1) {
    loginDevices.value.splice(index, 1);
    message.success('设备删除成功');
    loadDevices();
  }
};

const handleBatchVerify = () => {
  message.info('批量验证功能开发中...');
};

const handleExportDevices = () => {
  message.info('导出设备功能开发中...');
};

const handleRefresh = () => {
  loadDevices();
  message.success('已刷新');
};

const resetForm = () => {
  Object.assign(deviceForm, {
    name: '',
    type: 'desktop',
    os: '',
    browser: '',
    ipAddress: '',
    status: 'active',
    remark: ''
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

onMounted(() => {
  loadDevices();
});
</script>

<style scoped>
.login-devices-tab {
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

.text-xs {
  font-size: 0.75rem;
}

.font-medium {
  font-weight: 500;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}
</style>
