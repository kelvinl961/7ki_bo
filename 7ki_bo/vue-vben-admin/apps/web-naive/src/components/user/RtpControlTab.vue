<template>
  <div class="rtp-control-container">
    <n-card title="个人RTP调控" :bordered="false">
      <template #header-extra>
        <n-button size="small" @click="handleReset">重置</n-button>
      </template>

      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="150"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="RTP值" path="Rtp">
          <n-select
            v-model:value="formData.Rtp"
            :options="rtpOptions"
            placeholder="选择RTP值"
            filterable
          />
          <template #feedback> 当前运营商权限支持 0、10–97 的 RTP 值 </template>
        </n-form-item>

        <n-form-item>
          <div class="flex gap-3">
            <n-button
              type="primary"
              :loading="loading"
              @click="handleSubmit"
              :disabled="!canSubmit"
            >
              设置RTP
            </n-button>
            <n-button @click="handleReset"> 重置表单 </n-button>
          </div>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 历史记录 -->
    <n-card title="RTP设置历史" :bordered="false" class="mt-4">
      <template #header-extra>
        <n-button size="small" @click="loadHistory">刷新</n-button>
      </template>

      <n-data-table
        :columns="historyColumns"
        :data="historyData"
        :loading="historyLoading"
        :pagination="pagination"
        :bordered="false"
        size="small"
        remote
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NSelect,
  NButton,
  NDataTable,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import { setPlayerRtpApi, getPlayerRtpHistoryApi } from '#/api/core/player-rtp';

interface Props {
  userId: number;
  userDetail?: any;
}

const props = defineProps<Props>();

const message = useMessage();
const formRef = ref();
const loading = ref(false);
const historyLoading = ref(false);

// RTP options (Max 97 - Operator Permission Limit)
const rtpOptions = [
  { label: '0', value: 0 },
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '30', value: 30 },
  { label: '40', value: 40 },
  { label: '50', value: 50 },
  { label: '60', value: 60 },
  { label: '70', value: 70 },
  { label: '80', value: 80 },
  { label: '85', value: 85 },
  { label: '90', value: 90 },
  { label: '91', value: 91 },
  { label: '92', value: 92 },
  { label: '93', value: 93 },
  { label: '94', value: 94 },
  { label: '95', value: 95 },
  { label: '96', value: 96 },
  { label: '97', value: 97 },
];

// Form data
const formData = reactive({
  Rtp: null as number | null,
});

// Form validation rules
const rules = {
  Rtp: {
    required: true,
    type: 'number',
    message: '请选择RTP值',
    trigger: 'change',
  },
};

// History data
const historyData = ref<any[]>([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page;
    loadHistory(); // Reload when page changes
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadHistory(); // Reload when page size changes
  },
});

// History table columns
const historyColumns: DataTableColumns<any> = [
  {
    title: '设置时间',
    key: 'createdAt',
    width: 180,
    render: (row) => {
      return h('span', new Date(row.createdAt).toLocaleString('zh-CN'));
    },
  },
  {
    title: '玩家ID',
    key: 'userIds',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: 'RTP值',
    key: 'rtp',
    width: 80,
    align: 'center',
    render: (row) => {
      return h(
        NTag,
        { type: 'info', size: 'small' },
        { default: () => row.rtp },
      );
    },
  },
  {
    title: '游戏ID',
    key: 'gameId',
    width: 120,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '解除RTP',
    key: 'removeRtp',
    width: 80,
    align: 'center',
    render: (row) => {
      return row.removeRtp
        ? h(
            NTag,
            { type: 'warning', size: 'small' },
            { default: () => row.removeRtp },
          )
        : '-';
    },
  },
  {
    title: '购买RTP',
    key: 'buyRtp',
    width: 80,
    align: 'center',
    render: (row) => {
      return row.buyRtp
        ? h(
            NTag,
            { type: 'success', size: 'small' },
            { default: () => row.buyRtp },
          )
        : '-';
    },
  },
  {
    title: '最大赢钱倍数',
    key: 'personWinMaxMult',
    width: 120,
    align: 'center',
    render: (row) => {
      return row.personWinMaxMult !== null && row.personWinMaxMult !== undefined
        ? row.personWinMaxMult
        : 100;
    },
  },
  {
    title: '最大赢钱数',
    key: 'personWinMaxScore',
    width: 120,
    align: 'center',
    render: (row) => {
      return row.personWinMaxScore !== null &&
        row.personWinMaxScore !== undefined
        ? row.personWinMaxScore
        : 1000000;
    },
  },
  {
    title: '操作人',
    key: 'operator',
    width: 120,
    render: (row) => {
      return row.operator || '-';
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      const statusMap: Record<
        string,
        { type: 'success' | 'error' | 'warning'; text: string }
      > = {
        success: { type: 'success', text: '成功' },
        failed: { type: 'error', text: '失败' },
        pending: { type: 'warning', text: '处理中' },
      };
      const status = statusMap[row.status] || {
        type: 'warning',
        text: row.status,
      };
      return h(
        NTag,
        { type: status.type, size: 'small' },
        { default: () => status.text },
      );
    },
  },
];

// Computed
const canSubmit = computed(() => {
  return formData.Rtp !== null && props.userDetail?.account;
});

// Methods
const handleSubmit = async () => {
  if (!formRef.value) return;

  if (!props.userDetail?.account) {
    message.error('无法获取玩家账号');
    return;
  }

  try {
    await formRef.value.validate();
    loading.value = true;

    const requestData: any = {
      userAccount: props.userDetail.account,
      Rtp: formData.Rtp!,
      GameId: 'ALL',
    };

    // Call API
    const result = await setPlayerRtpApi(requestData);

    message.success(
      `RTP设置成功！影响的玩家数: ${result.data?.PidList?.length || 0}`,
    );

    // Reset to page 1 and reload history to show the new record at the top
    pagination.page = 1;
    await loadHistory();

    // Don't reset form - keep the latest saved values displayed
  } catch (error: any) {
    message.error(`RTP设置失败: ${error?.message || '未知错误'}`);
    console.error('Set RTP error:', error);
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  formData.Rtp = null;
  formRef.value?.restoreValidation();
};

const loadHistory = async () => {
  if (!props.userDetail?.account) return;

  historyLoading.value = true;
  try {
    // Filter history by user account
    const result = await getPlayerRtpHistoryApi({
      page: pagination.page,
      pageSize: pagination.pageSize,
      userAccount: props.userDetail.account,
    } as any);

    historyData.value = result.data || [];
    pagination.itemCount = result.total || 0; // Update total count for pagination
    console.log(
      `✅ Loaded ${result.data?.length || 0} of ${result.total || 0} RTP history records for user: ${props.userDetail.account}`,
    );
  } catch (error) {
    console.error('Load RTP history error:', error);
    // Don't show error message for history load failure
  } finally {
    historyLoading.value = false;
  }
};

// Load last saved configuration from API
const loadLastConfig = async () => {
  if (!props.userDetail?.account) return;

  try {
    // Get the most recent config for this specific user
    const result = await getPlayerRtpHistoryApi({
      page: 1,
      pageSize: 1,
      userAccount: props.userDetail.account,
    } as any);

    if (result.data && result.data.length > 0) {
      const lastConfig = result.data[0];
      if (!lastConfig) return;

      formData.Rtp = lastConfig.rtp || null;
    }
  } catch (error) {
    console.error('Failed to load last player RTP config:', error);
  }
};

// Initialize
onMounted(async () => {
  if (props.userId) {
    await loadLastConfig();
    loadHistory();
  }
});
</script>

<style scoped>
.rtp-control-container {
  padding: 16px;
}

.rtp-control-container :deep(.n-form-item-feedback) {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.mt-4 {
  margin-top: 16px;
}

.flex {
  display: flex;
}

.gap-3 {
  gap: 12px;
}
</style>
