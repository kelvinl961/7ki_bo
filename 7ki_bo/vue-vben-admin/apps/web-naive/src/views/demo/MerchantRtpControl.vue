<template>
  <div class="merchant-rtp-page">
    <n-card title="商户RTP调控V2" class="mb-4">
      <n-alert type="info" title="说明" class="mb-4">
        <template #default>
          <ul>
            <li>✅ 商户级别的RTP调控</li>
            <li>✅ 支持单个游戏或全部游戏调控</li>
          </ul>
        </template>
      </n-alert>

      <!-- RTP Control Form -->
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="RTP值" path="Rtp">
          <n-select
            v-model:value="formData.Rtp"
            :options="rtpOptions"
            placeholder="选择RTP值"
            filterable
          />
          <template #feedback> 注意：当前运营商权限支持10-97的RTP值 </template>
        </n-form-item>

        <n-form-item label="游戏" path="GameId">
          <n-select
            v-model:value="formData.GameId"
            multiple
            filterable
            remote
            :options="gameOptions"
            :loading="gamesLoading"
            :remote-method="handleSearchGames"
            placeholder="搜索并选择游戏（可多选），或选择 ALL"
            clearable
            max-tag-count="responsive"
            @update:value="handleGameSelect"
            @scroll="handleScroll"
          />
          <template #feedback>
            可以选择多个游戏，或选择 ALL 应用到全部slots游戏
          </template>
        </n-form-item>

        <n-form-item>
          <n-space>
            <n-button
              type="primary"
              @click="handleSubmit"
              :loading="submitting"
            >
              设置RTP
            </n-button>
            <n-button @click="handleReset"> 重置 </n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- History Table -->
    <n-card title="操作历史">
      <n-data-table
        :columns="historyColumns"
        :data="historyData"
        :loading="historyLoading"
        :pagination="pagination"
        :scroll-x="1400"
        remote
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue';
import {
  NTag,
  NCard,
  NAlert,
  NForm,
  NFormItem,
  NSelect,
  NSpace,
  NDataTable,
  NButton,
  useMessage,
  type FormInst,
  type DataTableColumns,
} from 'naive-ui';
import { requestClient } from '#/api/request';
import { searchGamesWithPagination } from '#/api/core/player-rtp';

// Message
const message = useMessage();

// Form
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const gamesLoading = ref(false);
const historyLoading = ref(false);

// Game options state
const gameOptions = ref<Array<{ label: string; value: string }>>([]);
const currentPage = ref(1);
const hasMoreGames = ref(true);
const currentSearchQuery = ref('');

// Form data
const formData = reactive({
  Rtp: null as number | null,
  GameId: ['ALL'] as string[],
});

// RTP options (Max 97 - Operator Permission Limit)
const rtpOptions = [
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

// Form rules
const rules = {
  Rtp: {
    required: true,
    type: 'number',
    message: '请选择RTP值',
    trigger: 'change',
  },
  GameId: {
    required: true,
    type: 'array',
    message: '请选择游戏',
    trigger: 'change',
    validator: (_rule: any, value: string[]) => {
      if (!value || value.length === 0) {
        return new Error('请至少选择一个游戏');
      }
      return true;
    },
  },
};

// Game search handlers
const handleSearchGames = async (query: string) => {
  currentSearchQuery.value = query;
  currentPage.value = 1;
  hasMoreGames.value = true;

  if (!query || query.length < 2) {
    await loadInitialGames();
    return;
  }

  gamesLoading.value = true;
  try {
    const result = await searchGamesWithPagination(query, 1);
    gameOptions.value = [
      { label: 'ALL（全部slots游戏）', value: 'ALL' },
      ...result.map((game: any) => ({
        label: game.gameName,
        value: game.gameId,
      })),
    ];
    hasMoreGames.value = result.length >= 20;
  } catch (error) {
    console.error('Failed to search games:', error);
  } finally {
    gamesLoading.value = false;
  }
};

const loadInitialGames = async () => {
  gamesLoading.value = true;
  currentPage.value = 1;
  currentSearchQuery.value = '';
  hasMoreGames.value = true;

  try {
    const result = await searchGamesWithPagination('', 1);
    gameOptions.value = [
      { label: 'ALL（全部slots游戏）', value: 'ALL' },
      ...result.map((game: any) => ({
        label: game.gameName,
        value: game.gameId,
      })),
    ];
    hasMoreGames.value = result.length >= 20;
  } catch (error) {
    console.error('Failed to load initial games:', error);
  } finally {
    gamesLoading.value = false;
  }
};

const loadMoreGames = async () => {
  if (!hasMoreGames.value || gamesLoading.value) return;

  gamesLoading.value = true;
  try {
    currentPage.value += 1;
    const result = await searchGamesWithPagination(
      currentSearchQuery.value,
      currentPage.value,
    );

    if (!result || result.length === 0) {
      hasMoreGames.value = false;
      return;
    }

    const newGames = result.map((game: any) => ({
      label: game.gameName,
      value: game.gameId,
    }));

    gameOptions.value = [...gameOptions.value, ...newGames];
    hasMoreGames.value = result.length >= 20;
  } catch (error) {
    console.error('Failed to load more games:', error);
  } finally {
    gamesLoading.value = false;
  }
};

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;

  if (scrollTop + clientHeight >= scrollHeight - 5) {
    loadMoreGames();
  }
};

const handleGameSelect = (value: string[]) => {
  if (value && value.includes('ALL') && value.length > 1) {
    if (
      formData.GameId.length < value.length &&
      value[value.length - 1] === 'ALL'
    ) {
      formData.GameId = ['ALL'];
    } else {
      formData.GameId = value.filter((g) => g !== 'ALL');
    }
  }
};

// Form handlers
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    submitting.value = true;

    const gameIds = Array.isArray(formData.GameId)
      ? formData.GameId.join(',')
      : formData.GameId;

    const requestData: any = {
      Rtp: formData.Rtp!,
      GameId: gameIds,
    };

    const response = await requestClient.post(
      '/v1/operator/setRtp',
      requestData,
    );

    console.log('🔍 Frontend received response:', response);
    console.log('🔍 Response code:', response?.code);
    console.log('🔍 Response error:', response?.error);
    console.log('🔍 Response data:', response?.data);

    if (response && response.code === 0) {
      message.success('商户RTP设置成功');

      // Reset to page 1 to see the new record
      pagination.page = 1;
      await loadHistory();
      // Don't reset form - keep the latest saved values displayed
    } else {
      console.log('❌ Frontend showing error because response.code !== 0');
      message.error(response?.error || '商户RTP设置失败');
    }
  } catch (error: any) {
    console.error('Set merchant RTP error:', error);
    if (error && !error.message?.includes('验证')) {
      message.error(error.message || '商户RTP设置失败');
    }
  } finally {
    submitting.value = false;
  }
};

const handleReset = () => {
  formData.Rtp = null;
  formData.GameId = ['ALL'];
};

// History table
const historyData = ref<any[]>([]);
const historyTotal = ref(0);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page;
    loadHistory();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadHistory();
  },
});

const historyColumns: DataTableColumns<any> = [
  { title: '时间', key: 'createdAt', width: 180, ellipsis: { tooltip: true } },
  { title: 'RTP', key: 'rtp', width: 80, align: 'center' },
  { title: '游戏ID', key: 'gameId', width: 200, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      const statusMap: Record<
        string,
        { label: string; type: 'success' | 'error' | 'warning' }
      > = {
        success: { label: '成功', type: 'success' },
        failed: { label: '失败', type: 'error' },
        pending: { label: '处理中', type: 'warning' },
      };
      const status = statusMap[row.status] || {
        label: row.status,
        type: 'warning',
      };
      return h(NTag, { type: status.type }, { default: () => status.label });
    },
  },
  {
    title: '操作人',
    key: 'operator',
    width: 120,
    render: (row) => row.operator || '-',
  },
];

const loadHistory = async () => {
  historyLoading.value = true;
  try {
    const response = await requestClient.get('/v1/operator/rtp-history', {
      params: {
        page: pagination.page,
        limit: pagination.pageSize,
      },
    });

    console.log('🔍 Full response:', response);
    console.log('🔍 Response keys:', Object.keys(response || {}));
    console.log(
      '🔍 Response.data type:',
      typeof response?.data,
      'isArray:',
      Array.isArray(response?.data),
    );
    console.log('🔍 Response.pagination:', response?.pagination);

    // Handle response data
    const dataArray = response?.data || response;
    if (dataArray && Array.isArray(dataArray)) {
      historyData.value = dataArray.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt).toLocaleString('zh-CN'),
      }));

      console.log('✅ History data loaded:', historyData.value.length, 'items');
    }

    // Update pagination total from backend response
    if (response?.pagination) {
      const total = response.pagination.total || 0;
      historyTotal.value = total;
      pagination.itemCount = total;
      console.log(
        '✅ Pagination updated - Total:',
        total,
        'Current page:',
        pagination.page,
        'Page size:',
        pagination.pageSize,
      );
    } else {
      console.warn('⚠️ No pagination object found in response');
      // Fallback: use data length as a temporary measure
      pagination.itemCount = dataArray?.length || 0;
    }
  } catch (error) {
    console.error('Failed to load history:', error);
    message.error('加载操作历史失败');
  } finally {
    historyLoading.value = false;
  }
};

// Load last saved configuration from API
const loadLastConfig = async () => {
  try {
    const response = await requestClient.get('/v1/operator/rtp-history', {
      params: {
        page: 1,
        limit: 1,
      },
    });

    const dataArray = response?.data || response;
    if (dataArray && Array.isArray(dataArray) && dataArray.length > 0) {
      const lastConfig = dataArray[0];
      console.log('📥 Loading last saved merchant RTP config:', lastConfig);

      formData.Rtp = lastConfig.rtp || null;
      formData.GameId = lastConfig.gameId
        ? lastConfig.gameId.split(',')
        : ['ALL'];

      console.log('✅ Last merchant RTP config loaded into form:', {
        Rtp: formData.Rtp,
        GameId: formData.GameId,
      });
    }
  } catch (error) {
    console.error('Failed to load last merchant RTP config:', error);
  }
};

// Initialize
onMounted(async () => {
  loadInitialGames();
  await loadLastConfig(); // Load last saved config from API
  loadHistory();
});
</script>

<style scoped>
.merchant-rtp-page {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
