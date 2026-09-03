<template>
  <div class="login-devices-tab">
    <n-card :title="$t('agency.loginDevices.overview')" class="mb-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="stat-card">
          <div class="stat-value">{{ totalDevices }}</div>
          <div class="stat-label">{{ $t('agency.loginDevices.totalDevices') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeDevices }}</div>
          <div class="stat-label">{{ $t('agency.loginDevices.activeDevices') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ uniqueIPs }}</div>
          <div class="stat-label">{{ $t('agency.loginDevices.uniqueIps') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ lastLoginDays }}</div>
          <div class="stat-label">{{ $t('agency.loginDevices.lastLoginDays') }}</div>
        </div>
      </div>
    </n-card>

    <n-card :title="$t('common.actions')" class="mb-4">
      <div class="flex flex-wrap gap-2">
        <n-button type="primary" @click="handleAddDevice">
          {{ $t('agency.loginDevices.addDevice') }}
        </n-button>
        <n-button type="info" @click="handleBatchVerify">
          {{ $t('agency.loginDevices.batchVerify') }}
        </n-button>
        <n-button type="warning" @click="handleExportDevices">
          {{ $t('agency.loginDevices.exportDevices') }}
        </n-button>
        <n-button @click="handleRefresh"> {{ $t('common.refresh') }} </n-button>
      </div>
    </n-card>

    <n-card :title="$t('agency.loginDevices.deviceList')">
      <n-data-table
        :columns="columns"
        :data="loginDevices"
        :pagination="pagination"
        :loading="loading"
        size="small"
        :row-key="(row) => row.id"
      />
    </n-card>

    <n-modal
      v-model:show="showDeviceModal"
      preset="card"
      :title="$t('agency.loginDevices.deviceTitle')"
      style="width: 600px"
    >
      <n-form
        ref="formRef"
        :model="deviceForm"
        :rules="rules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item :label="$t('agency.loginDevices.deviceName')" path="name">
          <n-input
            v-model:value="deviceForm.name"
            :placeholder="$t('agency.loginDevices.enterDeviceName')"
          />
        </n-form-item>

        <n-form-item :label="$t('agency.loginDevices.deviceType')" path="type">
          <n-select
            v-model:value="deviceForm.type"
            :options="deviceTypeOptions"
          />
        </n-form-item>

        <n-form-item :label="$t('agency.loginDevices.operatingSystem')" path="os">
          <n-input
            v-model:value="deviceForm.os"
            :placeholder="$t('agency.loginDevices.enterOs')"
          />
        </n-form-item>

        <n-form-item :label="$t('agency.loginDevices.browser')" path="browser">
          <n-input
            v-model:value="deviceForm.browser"
            :placeholder="$t('agency.loginDevices.enterBrowser')"
          />
        </n-form-item>

        <n-form-item :label="$t('agency.loginDevices.ipAddress')" path="ipAddress">
          <n-input
            v-model:value="deviceForm.ipAddress"
            :placeholder="$t('agency.loginDevices.enterIp')"
          />
        </n-form-item>

        <n-form-item :label="$t('common.status')" path="status">
          <n-select
            v-model:value="deviceForm.status"
            :options="statusOptions"
          />
        </n-form-item>

        <n-form-item :label="$t('common.remark')" path="remark">
          <n-input
            v-model:value="deviceForm.remark"
            type="textarea"
            :placeholder="$t('agency.withdrawAccount.enterRemark')"
            :rows="3"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <div class="flex gap-2">
          <n-button @click="showDeviceModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            @click="handleSubmitDevice"
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
  agentId: 0,
});

const message = useMessage();
const loading = ref(false);
const submitting = ref(false);
const showDeviceModal = ref(false);
const isEdit = ref(false);
const currentDeviceId = ref<number | null>(null);
const loginDevices = ref<LoginDevice[]>([]);

const deviceForm = reactive<DeviceForm>({
  name: '',
  type: 'desktop',
  os: '',
  browser: '',
  ipAddress: '',
  status: 'active',
  remark: '',
});

const deviceTypeOptions = computed(() => [
  { label: $t('agency.loginDevices.desktop'), value: 'desktop' },
  { label: $t('agency.loginDevices.mobile'), value: 'mobile' },
  { label: $t('agency.loginDevices.tablet'), value: 'tablet' },
  { label: $t('agency.loginDevices.unknown'), value: 'unknown' },
]);

const statusOptions = computed(() => [
  { label: $t('agency.withdrawAccount.active'), value: 'active' },
  { label: $t('agency.withdrawAccount.inactive'), value: 'inactive' },
  { label: $t('agency.withdrawAccount.pending'), value: 'pending' },
]);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: { itemCount: number }) =>
    $t('agency.loginDevices.totalRecords', [info.itemCount]),
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

const totalDevices = computed(() => loginDevices.value.length);
const activeDevices = computed(
  () => loginDevices.value.filter((device) => device.status === 'active').length,
);
const uniqueIPs = computed(() => {
  const ips = new Set(loginDevices.value.map((device) => device.ipAddress));
  return ips.size;
});
const lastLoginDays = computed(() => {
  const lastLogin = loginDevices.value
    .map((device) => new Date(device.lastLoginTime))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  if (!lastLogin) return 0;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const getDeviceTypeInfo = (type: string) => {
  const map: Record<string, { label: string; type: string; icon: string }> = {
    desktop: {
      label: $t('agency.loginDevices.desktop'),
      type: 'info',
      icon: '💻',
    },
    mobile: {
      label: $t('agency.loginDevices.mobile'),
      type: 'success',
      icon: '📱',
    },
    tablet: {
      label: $t('agency.loginDevices.tablet'),
      type: 'warning',
      icon: '📱',
    },
    unknown: {
      label: $t('agency.loginDevices.unknown'),
      type: 'default',
      icon: '❓',
    },
  };
  return map[type] || { label: type, type: 'default', icon: '❓' };
};

const getStatusInfo = (status: string) => {
  const map: Record<string, { label: string; type: string; icon: string }> = {
    active: {
      label: $t('agency.withdrawAccount.active'),
      type: 'success',
      icon: '✅',
    },
    inactive: {
      label: $t('agency.withdrawAccount.inactive'),
      type: 'error',
      icon: '❌',
    },
    pending: {
      label: $t('agency.withdrawAccount.pending'),
      type: 'warning',
      icon: '⏳',
    },
  };
  return map[status] || { label: status, type: 'default', icon: '❓' };
};

const columns = computed<DataTableColumns<LoginDevice>>(() => [
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  {
    title: $t('agency.loginDevices.deviceName'),
    key: 'name',
    width: 150,
  },
  {
    title: $t('agency.loginDevices.deviceType'),
    key: 'type',
    width: 100,
    render: (row) => {
      const typeInfo = getDeviceTypeInfo(row.type);
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
    title: $t('agency.loginDevices.operatingSystem'),
    key: 'os',
    width: 120,
  },
  {
    title: $t('agency.loginDevices.browser'),
    key: 'browser',
    width: 100,
  },
  {
    title: $t('agency.loginDevices.ipAddress'),
    key: 'ipAddress',
    width: 120,
    render: (row) =>
      h('span', { class: 'text-xs font-mono text-gray-600' }, row.ipAddress),
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
    title: $t('agency.loginDevices.lastLogin'),
    key: 'lastLoginTime',
    width: 180,
    render: (row) =>
      h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, renderTzDateTime(row.lastLoginTime)),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          $t('agency.loginDevices.loginCount', [row.loginCount]),
        ),
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
            onClick: () => handleEditDevice(row),
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
            onClick: () => handleDeleteDevice(row.id),
          },
          { default: () => $t('common.delete') },
        ),
      ]),
  },
]);

const rules = computed(() => ({
  name: {
    required: true,
    message: $t('agency.loginDevices.enterDeviceNameRequired'),
    trigger: 'blur',
  },
  type: {
    required: true,
    message: $t('agency.loginDevices.selectDeviceType'),
    trigger: 'blur',
  },
  ipAddress: {
    required: true,
    message: $t('agency.loginDevices.enterIpRequired'),
    trigger: 'blur',
  },
}));

const loadDevices = async () => {
  loading.value = true;
  try {
    const response = await getAgentLoginDevicesApi(props.agentId, {
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
    loginDevices.value = response.list;
    pagination.itemCount = response.pagination.total;
  } catch (error) {
    message.error($t('agency.loginDevices.loadFailed'));
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
    remark: device.remark || '',
  });
  showDeviceModal.value = true;
};

const handleSubmitDevice = async () => {
  try {
    submitting.value = true;
    if (isEdit.value && currentDeviceId.value) {
      const index = loginDevices.value.findIndex(
        (dev) => dev.id === currentDeviceId.value,
      );
      if (index !== -1) {
        Object.assign(loginDevices.value[index], {
          ...deviceForm,
          updatedAt: new Date().toISOString(),
        });
      }
      message.success($t('agency.loginDevices.updateSuccess'));
    } else {
      loginDevices.value.push({
        id: Date.now(),
        ...deviceForm,
        lastLoginTime: new Date().toISOString(),
        loginCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      message.success($t('agency.loginDevices.addSuccess'));
    }
    showDeviceModal.value = false;
    loadDevices();
  } catch {
    message.error($t('agency.loginDevices.opFailed'));
  } finally {
    submitting.value = false;
  }
};

const handleToggleStatus = (device: LoginDevice) => {
  device.status = device.status === 'active' ? 'inactive' : 'active';
  device.updatedAt = new Date().toISOString();
  message.success(
    $t('agency.loginDevices.statusUpdated', [
      device.status === 'active'
        ? $t('common.enable')
        : $t('common.disable'),
    ]),
  );
};

const handleDeleteDevice = (id: number) => {
  const index = loginDevices.value.findIndex((dev) => dev.id === id);
  if (index !== -1) {
    loginDevices.value.splice(index, 1);
    message.success($t('agency.loginDevices.deleteSuccess'));
    loadDevices();
  }
};

const handleBatchVerify = () => {
  message.info($t('agency.loginDevices.batchVerifyDeveloping'));
};

const handleExportDevices = () => {
  message.info($t('agency.loginDevices.exportDeveloping'));
};

const handleRefresh = () => {
  loadDevices();
  message.success($t('agency.loginDevices.refreshed'));
};

const resetForm = () => {
  Object.assign(deviceForm, {
    name: '',
    type: 'desktop',
    os: '',
    browser: '',
    ipAddress: '',
    status: 'active',
    remark: '',
  });
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
  font-family:
    ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo,
    monospace;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}
</style>
