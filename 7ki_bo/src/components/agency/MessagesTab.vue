<template>
  <div class="messages-tab">
    <!-- Message Summary -->
    <n-card title="消息概览" class="mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="stat-value">{{ totalMessages }}</div>
          <div class="stat-label">总消息数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ unreadMessages }}</div>
          <div class="stat-label">未读消息</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ systemMessages }}</div>
          <div class="stat-label">系统消息</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ todayMessages }}</div>
          <div class="stat-label">今日消息</div>
        </div>
      </div>
    </n-card>

    <!-- Action Buttons -->
    <n-card title="操作" class="mb-4">
      <div class="flex flex-wrap gap-2">
        <n-button type="primary" @click="handleComposeMessage">
          发送消息
        </n-button>
        <n-button type="info" @click="handleMarkAllRead">
          全部标记已读
        </n-button>
        <n-button type="warning" @click="handleExportMessages">
          导出消息
        </n-button>
        <n-button @click="handleRefresh">
          刷新
        </n-button>
      </div>
    </n-card>

    <!-- Messages Table -->
    <n-card title="消息列表">
      <n-data-table
        :columns="columns"
        :data="messages"
        :pagination="pagination"
        :loading="loading"
        size="small"
        :row-key="(row) => row.id"
      />
    </n-card>

    <!-- Compose Message Modal -->
    <n-modal v-model:show="showComposeModal" preset="card" title="发送消息" style="width: 600px">
      <n-form
        ref="formRef"
        :model="messageForm"
        :rules="rules"
        label-placement="left"
        label-width="120px"
      >
        <n-form-item label="消息类型" path="type">
          <n-select v-model:value="messageForm.type" :options="messageTypeOptions" />
        </n-form-item>
        
        <n-form-item label="标题" path="title">
          <n-input v-model:value="messageForm.title" placeholder="请输入消息标题" />
        </n-form-item>
        
        <n-form-item label="内容" path="content">
          <n-input
            v-model:value="messageForm.content"
            type="textarea"
            placeholder="请输入消息内容"
            :rows="6"
          />
        </n-form-item>
        
        <n-form-item label="优先级" path="priority">
          <n-select v-model:value="messageForm.priority" :options="priorityOptions" />
        </n-form-item>
        
        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="messageForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </n-form-item>
      </n-form>
      
      <template #action>
        <div class="flex gap-2">
          <n-button @click="showComposeModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmitMessage" :loading="submitting">
            发送
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
  agentId: 0
});

const message = useMessage();

// Reactive data
const loading = ref(false);
const submitting = ref(false);
const showComposeModal = ref(false);
const messages = ref<Message[]>([]);

// Mock data
const mockMessages: Message[] = [
  {
    id: 1,
    type: 'system',
    title: '系统维护通知',
    content: '系统将于今晚22:00-24:00进行维护，期间可能影响正常使用。',
    priority: 'high',
    status: 'unread',
    sender: 'system',
    recipient: 'testagent',
    sendTime: '2024-12-01T10:00:00Z',
    remark: '重要系统通知'
  },
  {
    id: 2,
    type: 'commission',
    title: '佣金发放通知',
    content: '您的代理佣金 R$ 500.00 已发放到账户，请注意查收。',
    priority: 'normal',
    status: 'read',
    sender: 'system',
    recipient: 'testagent',
    sendTime: '2024-12-01T11:00:00Z',
    readTime: '2024-12-01T11:30:00Z',
    remark: '佣金相关'
  },
  {
    id: 3,
    type: 'activity',
    title: '新活动上线',
    content: '新的代理推广活动已上线，参与可获得额外奖励。',
    priority: 'normal',
    status: 'unread',
    sender: 'admin',
    recipient: 'testagent',
    sendTime: '2024-12-01T12:00:00Z',
    remark: '活动推广'
  }
];

const messageForm = reactive<MessageForm>({
  type: 'system',
  title: '',
  content: '',
  priority: 'normal',
  remark: ''
});

// Options
const messageTypeOptions = [
  { label: '系统消息', value: 'system' },
  { label: '佣金通知', value: 'commission' },
  { label: '活动通知', value: 'activity' },
  { label: '安全提醒', value: 'security' },
  { label: '其他消息', value: 'other' }
];

const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '普通', value: 'normal' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' }
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
    loadMessages();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    loadMessages();
  },
});

// Computed
const totalMessages = computed(() => messages.value.length);

const unreadMessages = computed(() => 
  messages.value.filter(msg => msg.status === 'unread').length
);

const systemMessages = computed(() => 
  messages.value.filter(msg => msg.type === 'system').length
);

const todayMessages = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return messages.value.filter(msg => new Date(msg.sendTime) >= today).length;
});

// Table columns
const columns: DataTableColumns<Message> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center'
  },
  {
    title: '类型',
    key: 'type',
    width: 100,
    render: (row) => {
      const typeMap = {
        'system': { label: '系统消息', type: 'info', icon: '⚙️' },
        'commission': { label: '佣金通知', type: 'success', icon: '💰' },
        'activity': { label: '活动通知', type: 'warning', icon: '🎁' },
        'security': { label: '安全提醒', type: 'error', icon: '🔒' },
        'other': { label: '其他消息', type: 'default', icon: '📝' }
      };
      const typeInfo = typeMap[row.type as keyof typeof typeMap] || { label: row.type, type: 'default', icon: '❓' };
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-lg' }, typeInfo.icon),
        h(NTag, { type: typeInfo.type, size: 'small' }, { default: () => typeInfo.label })
      ]);
    }
  },
  {
    title: '标题',
    key: 'title',
    width: 200,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '优先级',
    key: 'priority',
    width: 100,
    render: (row) => {
      const priorityMap = {
        'low': { label: '低', type: 'default' },
        'normal': { label: '普通', type: 'info' },
        'high': { label: '高', type: 'warning' },
        'urgent': { label: '紧急', type: 'error' }
      };
      const priority = priorityMap[row.priority as keyof typeof priorityMap] || { label: row.priority, type: 'default' };
      return h(NTag, { type: priority.type, size: 'small' }, { default: () => priority.label });
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap = {
        'unread': { label: '未读', type: 'warning', icon: '📬' },
        'read': { label: '已读', type: 'success', icon: '📭' }
      };
      const status = statusMap[row.status as keyof typeof statusMap] || { label: row.status, type: 'default', icon: '❓' };
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-sm' }, status.icon),
        h(NTag, { type: status.type, size: 'small' }, { default: () => status.label })
      ]);
    }
  },
  {
    title: '发送者',
    key: 'sender',
    width: 120
  },
  {
    title: '发送时间',
    key: 'sendTime',
    width: 180,
    render: (row) => {
      return h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, formatDateTime(row.sendTime)),
        row.readTime ? h('div', { class: 'text-xs text-gray-500' }, `已读: ${formatDateTime(row.readTime)}`) : null
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
          type: 'info',
          onClick: () => handleViewMessage(row)
        }, { default: () => '查看' }),
        h(NButton, {
          size: 'tiny',
          type: row.status === 'unread' ? 'success' : 'warning',
          onClick: () => handleToggleReadStatus(row)
        }, { default: () => row.status === 'unread' ? '标记已读' : '标记未读' }),
        h(NButton, {
          size: 'tiny',
          type: 'error',
          onClick: () => handleDeleteMessage(row.id)
        }, { default: () => '删除' })
      ]);
    }
  }
];

// Form validation rules
const rules = {
  type: {
    required: true,
    message: '请选择消息类型',
    trigger: 'blur'
  },
  title: {
    required: true,
    message: '请输入消息标题',
    trigger: 'blur'
  },
  content: {
    required: true,
    message: '请输入消息内容',
    trigger: 'blur'
  }
};

// Methods
const loadMessages = async () => {
  loading.value = true;
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    messages.value = [...mockMessages];
    pagination.itemCount = messages.value.length;
  } catch (error) {
    message.error('加载消息失败');
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newMessage: Message = {
      id: Date.now(),
      ...messageForm,
      status: 'unread',
      recipient: 'testagent',
      sendTime: new Date().toISOString()
    };
    
    messages.value.unshift(newMessage);
    message.success('消息发送成功');
    showComposeModal.value = false;
    
    // Reset form
    Object.assign(messageForm, {
      type: 'system',
      title: '',
      content: '',
      priority: 'normal',
      remark: ''
    });
    
    loadMessages();
  } catch (error) {
    message.error('发送失败');
  } finally {
    submitting.value = false;
  }
};

const handleViewMessage = (msg: Message) => {
  if (msg.status === 'unread') {
    msg.status = 'read';
    msg.readTime = new Date().toISOString();
  }
  message.info(`消息内容: ${msg.content}`);
};

const handleToggleReadStatus = (msg: Message) => {
  msg.status = msg.status === 'unread' ? 'read' : 'unread';
  if (msg.status === 'read') {
    msg.readTime = new Date().toISOString();
  } else {
    msg.readTime = undefined;
  }
  message.success(`消息已${msg.status === 'read' ? '标记为已读' : '标记为未读'}`);
};

const handleDeleteMessage = (id: number) => {
  const index = messages.value.findIndex(msg => msg.id === id);
  if (index !== -1) {
    messages.value.splice(index, 1);
    message.success('消息删除成功');
    loadMessages();
  }
};

const handleMarkAllRead = () => {
  messages.value.forEach(msg => {
    if (msg.status === 'unread') {
      msg.status = 'read';
      msg.readTime = new Date().toISOString();
    }
  });
  message.success('全部消息已标记为已读');
};

const handleExportMessages = () => {
  message.info('导出消息功能开发中...');
};

const handleRefresh = () => {
  loadMessages();
  message.success('已刷新');
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
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
