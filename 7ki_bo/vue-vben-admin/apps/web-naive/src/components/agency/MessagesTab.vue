<template>
  <div class="messages-tab">
    <n-card :title="$t('agency.messages.overview')" class="mb-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="stat-card">
          <div class="stat-value">{{ totalMessages }}</div>
          <div class="stat-label">{{ $t('agency.messages.totalMessages') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ unreadMessages }}</div>
          <div class="stat-label">{{ $t('agency.messages.unreadMessages') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ systemMessages }}</div>
          <div class="stat-label">{{ $t('agency.messages.systemMessages') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ todayMessages }}</div>
          <div class="stat-label">{{ $t('agency.messages.todayMessages') }}</div>
        </div>
      </div>
    </n-card>

    <n-card :title="$t('common.actions')" class="mb-4">
      <div class="flex flex-wrap gap-2">
        <n-button type="primary" @click="handleComposeMessage">
          {{ $t('agency.messages.sendMessage') }}
        </n-button>
        <n-button type="info" @click="handleMarkAllRead">
          {{ $t('agency.messages.markAllRead') }}
        </n-button>
        <n-button type="warning" @click="handleExportMessages">
          {{ $t('agency.messages.exportMessages') }}
        </n-button>
        <n-button @click="handleRefresh"> {{ $t('common.refresh') }} </n-button>
      </div>
    </n-card>

    <n-card :title="$t('agency.messages.messageList')">
      <n-data-table
        :columns="columns"
        :data="messages"
        :pagination="pagination"
        :loading="loading"
        size="small"
        :row-key="(row) => row.id"
      />
    </n-card>

    <n-modal
      v-model:show="showComposeModal"
      preset="card"
      :title="$t('agency.messages.sendMessage')"
      style="width: 600px"
    >
      <n-form
        ref="formRef"
        :model="messageForm"
        :rules="rules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item :label="$t('agency.messages.messageType')" path="type">
          <n-select
            v-model:value="messageForm.type"
            :options="messageTypeOptions"
          />
        </n-form-item>

        <n-form-item :label="$t('agency.messages.title')" path="title">
          <n-input
            v-model:value="messageForm.title"
            :placeholder="$t('agency.messages.enterTitle')"
          />
        </n-form-item>

        <n-form-item :label="$t('agency.messages.content')" path="content">
          <n-input
            v-model:value="messageForm.content"
            type="textarea"
            :placeholder="$t('agency.messages.enterContent')"
            :rows="6"
          />
        </n-form-item>

        <n-form-item :label="$t('agency.messages.priority')" path="priority">
          <n-select
            v-model:value="messageForm.priority"
            :options="priorityOptions"
          />
        </n-form-item>

        <n-form-item :label="$t('common.remark')" path="remark">
          <n-input
            v-model:value="messageForm.remark"
            type="textarea"
            :placeholder="$t('agency.withdrawAccount.enterRemark')"
            :rows="3"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <div class="flex gap-2">
          <n-button @click="showComposeModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            @click="handleSubmitMessage"
            :loading="submitting"
          >
            {{ $t('agency.messages.send') }}
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
import { formatDateTimeInTimezone } from '#/utils/timezoneUtils';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';

interface Props {
  agentId?: number;
}

interface Message {
  id: number;
  type: string;
  title: string;
  content: string;
  priority: string;
  status: string;
  sender: string;
  recipient: string;
  sendTime: string;
  readTime?: string;
  remark?: string;
}

interface MessageForm {
  type: string;
  title: string;
  content: string;
  priority: string;
  remark: string;
}

const props = withDefaults(defineProps<Props>(), {
  agentId: 0,
});

const message = useMessage();
const loading = ref(false);
const submitting = ref(false);
const showComposeModal = ref(false);
const messages = ref<Message[]>([]);

const mockMessages: Message[] = [
  {
    id: 1,
    type: 'system',
    title: 'System Maintenance',
    content: 'System maintenance scheduled tonight 22:00-24:00.',
    priority: 'high',
    status: 'unread',
    sender: 'system',
    recipient: 'testagent',
    sendTime: '2024-12-01T10:00:00Z',
    remark: 'Important system notice',
  },
  {
    id: 2,
    type: 'commission',
    title: 'Commission Payout',
    content: 'Your commission R$ 500.00 has been credited.',
    priority: 'normal',
    status: 'read',
    sender: 'system',
    recipient: 'testagent',
    sendTime: '2024-12-01T11:00:00Z',
    readTime: '2024-12-01T11:30:00Z',
    remark: 'Commission related',
  },
  {
    id: 3,
    type: 'activity',
    title: 'New Activity',
    content: 'A new agent promotion activity is now live.',
    priority: 'normal',
    status: 'unread',
    sender: 'admin',
    recipient: 'testagent',
    sendTime: '2024-12-01T12:00:00Z',
    remark: 'Activity promotion',
  },
];

const messageForm = reactive<MessageForm>({
  type: 'system',
  title: '',
  content: '',
  priority: 'normal',
  remark: '',
});

const messageTypeOptions = computed(() => [
  { label: $t('agency.messages.systemMessage'), value: 'system' },
  { label: $t('agency.messages.commissionNotice'), value: 'commission' },
  { label: $t('agency.messages.activityNotice'), value: 'activity' },
  { label: $t('agency.messages.securityAlert'), value: 'security' },
  { label: $t('agency.messages.otherMessage'), value: 'other' },
]);

const priorityOptions = computed(() => [
  { label: $t('agency.messages.low'), value: 'low' },
  { label: $t('agency.messages.normal'), value: 'normal' },
  { label: $t('agency.messages.high'), value: 'high' },
  { label: $t('agency.messages.urgent'), value: 'urgent' },
]);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: { itemCount: number }) =>
    $t('agency.withdrawAccount.totalRecords', [info.itemCount]),
  onUpdatePage: (page: number) => {
    pagination.page = page;
    loadMessages();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadMessages();
  },
});

const totalMessages = computed(() => messages.value.length);
const unreadMessages = computed(
  () => messages.value.filter((msg) => msg.status === 'unread').length,
);
const systemMessages = computed(
  () => messages.value.filter((msg) => msg.type === 'system').length,
);
const todayMessages = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return messages.value.filter((msg) => new Date(msg.sendTime) >= today)
    .length;
});

const getMessageTypeInfo = (type: string) => {
  const map: Record<string, { label: string; type: string; icon: string }> = {
    system: {
      label: $t('agency.messages.systemMessage'),
      type: 'info',
      icon: '⚙️',
    },
    commission: {
      label: $t('agency.messages.commissionNotice'),
      type: 'success',
      icon: '💰',
    },
    activity: {
      label: $t('agency.messages.activityNotice'),
      type: 'warning',
      icon: '🎁',
    },
    security: {
      label: $t('agency.messages.securityAlert'),
      type: 'error',
      icon: '🔒',
    },
    other: {
      label: $t('agency.messages.otherMessage'),
      type: 'default',
      icon: '📝',
    },
  };
  return map[type] || { label: type, type: 'default', icon: '❓' };
};

const columns = computed<DataTableColumns<Message>>(() => [
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  {
    title: $t('common.type'),
    key: 'type',
    width: 100,
    render: (row) => {
      const typeInfo = getMessageTypeInfo(row.type);
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
    title: $t('agency.messages.title'),
    key: 'title',
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: $t('agency.messages.priority'),
    key: 'priority',
    width: 100,
    render: (row) => {
      const priorityMap: Record<string, { label: string; type: string }> = {
        low: { label: $t('agency.messages.low'), type: 'default' },
        normal: { label: $t('agency.messages.normal'), type: 'info' },
        high: { label: $t('agency.messages.high'), type: 'warning' },
        urgent: { label: $t('agency.messages.urgent'), type: 'error' },
      };
      const priority = priorityMap[row.priority] || {
        label: row.priority,
        type: 'default',
      };
      return h(
        NTag,
        { type: priority.type as any, size: 'small' },
        { default: () => priority.label },
      );
    },
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap: Record<string, { label: string; type: string; icon: string }> = {
        unread: {
          label: $t('agency.messages.unread'),
          type: 'warning',
          icon: '📬',
        },
        read: {
          label: $t('agency.messages.read'),
          type: 'success',
          icon: '📭',
        },
      };
      const status = statusMap[row.status] || {
        label: row.status,
        type: 'default',
        icon: '❓',
      };
      return h('div', { class: 'flex items-center gap-2' }, [
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
    title: $t('agency.messages.sender'),
    key: 'sender',
    width: 120,
  },
  {
    title: $t('agency.messages.sendTime'),
    key: 'sendTime',
    width: 180,
    render: (row) => {
      return h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, renderTzDateTime(row.sendTime)),
        row.readTime
          ? h(
              'div',
              { class: 'text-xs text-gray-500' },
              $t('agency.messages.readAt', [
                formatDateTimeInTimezone(row.readTime),
              ]),
            )
          : null,
      ]);
    },
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
    render: (row) => {
      return h('div', { class: 'flex gap-1' }, [
        h(
          NButton,
          {
            size: 'tiny',
            type: 'info',
            onClick: () => handleViewMessage(row),
          },
          { default: () => $t('common.view') },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: row.status === 'unread' ? 'success' : 'warning',
            onClick: () => handleToggleReadStatus(row),
          },
          {
            default: () =>
              row.status === 'unread'
                ? $t('agency.messages.markRead')
                : $t('agency.messages.markUnread'),
          },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: 'error',
            onClick: () => handleDeleteMessage(row.id),
          },
          { default: () => $t('common.delete') },
        ),
      ]);
    },
  },
]);

const rules = computed(() => ({
  type: {
    required: true,
    message: $t('agency.messages.selectMessageType'),
    trigger: 'blur',
  },
  title: {
    required: true,
    message: $t('agency.messages.enterTitleRequired'),
    trigger: 'blur',
  },
  content: {
    required: true,
    message: $t('agency.messages.enterContentRequired'),
    trigger: 'blur',
  },
}));

const loadMessages = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    messages.value = [...mockMessages];
    pagination.itemCount = messages.value.length;
  } catch {
    message.error($t('agency.messages.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleComposeMessage = () => {
  showComposeModal.value = true;
};

const handleSubmitMessage = async () => {
  try {
    submitting.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newMessage: Message = {
      id: Date.now(),
      ...messageForm,
      status: 'unread',
      recipient: 'testagent',
      sendTime: new Date().toISOString(),
    };
    messages.value.unshift(newMessage);
    message.success($t('agency.messages.sendSuccess'));
    showComposeModal.value = false;
    Object.assign(messageForm, {
      type: 'system',
      title: '',
      content: '',
      priority: 'normal',
      remark: '',
    });
    loadMessages();
  } catch {
    message.error($t('agency.messages.sendFailed'));
  } finally {
    submitting.value = false;
  }
};

const handleViewMessage = (msg: Message) => {
  if (msg.status === 'unread') {
    msg.status = 'read';
    msg.readTime = new Date().toISOString();
  }
  message.info(`${$t('agency.messages.messageContent')}${msg.content}`);
};

const handleToggleReadStatus = (msg: Message) => {
  msg.status = msg.status === 'unread' ? 'read' : 'unread';
  if (msg.status === 'read') {
    msg.readTime = new Date().toISOString();
  } else {
    msg.readTime = undefined;
  }
  message.success(
    $t('agency.messages.marked', [
      msg.status === 'read'
        ? $t('agency.shared.markedAsRead')
        : $t('agency.shared.markedAsUnread'),
    ]),
  );
};

const handleDeleteMessage = (id: number) => {
  const index = messages.value.findIndex((msg) => msg.id === id);
  if (index !== -1) {
    messages.value.splice(index, 1);
    message.success($t('agency.messages.deleteSuccess'));
    loadMessages();
  }
};

const handleMarkAllRead = () => {
  messages.value.forEach((msg) => {
    if (msg.status === 'unread') {
      msg.status = 'read';
      msg.readTime = new Date().toISOString();
    }
  });
  message.success($t('agency.messages.allMarkedRead'));
};

const handleExportMessages = () => {
  message.info($t('agency.messages.exportDeveloping'));
};

const handleRefresh = () => {
  loadMessages();
  message.success($t('agency.messages.refreshed'));
};

onMounted(() => {
  loadMessages();
});
</script>

<style scoped>
.messages-tab {
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

.text-gray-500 {
  color: #6b7280;
}
</style>
