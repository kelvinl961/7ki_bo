<template>
  <div class="merchant-rtp-page">
    <n-card title="商户RTP调控V2" class="mb-4">
      <n-alert type="info" title="说明" class="mb-4">
        <template #default>
          <ul>
            <li>✅ 商户级别的RTP调控</li>
            <li>
              ✅
              支持设置游戏类型模式（心跳型、波动型、仿正型、混合型、稳定型、高中奖率、超高中奖率）
            </li>
            <li>✅ 支持单个游戏或全部游戏调控</li>
            <li>✅ 支持购买RTP和最大赢钱限制设置</li>
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
        <n-form-item label="游戏类型" path="GamePattern">
          <n-select
            v-model:value="formData.GamePattern"
            :options="gamePatternOptions"
            placeholder="选择游戏类型模式"
          />
        </n-form-item>

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

        <n-form-item label="购买RTP" path="BuyRTP">
          <n-select
            v-model:value="formData.BuyRTP"
            :options="buyRtpOptions"
            placeholder="选择购买RTP（非必填）"
            clearable
          />
          <template #feedback>
            如果不填则值为0（默认值），当购买rtp开关权限未开启时设置此值为非0值时将会报错
          </template>
        </n-form-item>

        <n-form-item label="最大赢钱倍数" path="MaxMultiple">
          <n-input-number
            v-model:value="formData.MaxMultiple"
            placeholder="最大赢钱倍数"
            :min="1"
            :max="10000"
            :default-value="100"
            style="width: 100%"
          />
          <template #feedback> 非必填项，默认值100，范围1-10000 </template>
        </n-form-item>

        <n-form-item label="最大赢钱数" path="MaxWinPoints">
          <n-input-number
            v-model:value="formData.MaxWinPoints"
            placeholder="最大赢钱数"
            :min="1"
            :max="100000000"
            :default-value="1000000"
            style="width: 100%"
          />
          <template #feedback>
            非必填项，默认值1000000，范围1-100000000
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
  NButton,
  NTag,
  NCard,
  NAlert,
  NForm,
  NFormItem,
  NSelect,
  NInputNumber,
  NSpace,
  NDataTable,
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
  GamePattern: null as number | null,
  Rtp: null as number | null,
  GameId: ['ALL'] as string[],
  BuyRTP: 0,
  MaxMultiple: 100,
  MaxWinPoints: 1000000,
});

// Game pattern options
const gamePatternOptions = [
  { label: '心跳型', value: 1 },
  { label: '波动型', value: 2 },
  { label: '仿正型', value: 3 },
  { label: '混合型', value: 4 },
  { label: '稳定型', value: 5 },
  { label: '高中奖率', value: 6 },
  { label: '超高中奖率', value: 7 },
];

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

// Buy RTP options
const buyRtpOptions = [
  { label: '0 (默认)', value: 0 },
  { label: '10 (凄惨型)', value: 10 },
  { label: '20', value: 20 },
  { label: '30', value: 30 },
  { label: '40', value: 40 },
  { label: '50', value: 50 },
  { label: '60', value: 60 },
  { label: '70', value: 70 },
  { label: '80', value: 80 },
  { label: '85', value: 85 },
  { label: '90', value: 90 },
];

// Form rules
const rules = {
  GamePattern: {
    required: true,
    type: 'number',
    message: '请选择游戏类型',
    trigger: 'change',
  },
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
      GamePattern: formData.GamePattern!,
      Rtp: formData.Rtp!,
      GameId: gameIds,
    };

    // Add optional fields
    if (formData.BuyRTP !== undefined && formData.BuyRTP !== null) {
      requestData.BuyRTP = formData.BuyRTP;
    }
    if (formData.MaxMultiple !== undefined && formData.MaxMultiple !== null) {
      requestData.MaxMultiple = formData.MaxMultiple;
    }
    if (formData.MaxWinPoints !== undefined && formData.MaxWinPoints !== null) {
      requestData.MaxWinPoints = formData.MaxWinPoints;
    }

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
  formData.GamePattern = null;
  formData.Rtp = null;
  formData.GameId = ['ALL'];
  formData.BuyRTP = 0;
  formData.MaxMultiple = 100;
  formData.MaxWinPoints = 1000000;
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
  {
    title: '游戏类型',
    key: 'gamePattern',
    width: 120,
    render: (row) => {
      const pattern = gamePatternOptions.find(
        (p) => p.value === row.gamePattern,
      );
      return pattern?.label || row.gamePattern;
    },
  },
  { title: 'RTP', key: 'rtp', width: 80, align: 'center' },
  { title: '游戏ID', key: 'gameId', width: 200, ellipsis: { tooltip: true } },
  { title: '购买RTP', key: 'buyRtp', width: 100, align: 'center' },
  {
    title: '最大赢钱倍数',
    key: 'maxMultiple',
    width: 120,
    align: 'center',
    render: (row) =>
      row.maxMultiple !== null && row.maxMultiple !== undefined
        ? row.maxMultiple
        : 100,
  },
  {
    title: '最大赢钱数',
    key: 'maxWinPoints',
    width: 120,
    align: 'center',
    render: (row) =>
      row.maxWinPoints !== null && row.maxWinPoints !== undefined
        ? row.maxWinPoints
        : 1000000,
  },
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

      // Parse gamePattern from string to number
      formData.GamePattern = parseInt(lastConfig.gamePattern) || null;

      // Load RTP value
      formData.Rtp = lastConfig.rtp || null;

      // Load GameId (split comma-separated string into array)
      formData.GameId = lastConfig.gameId
        ? lastConfig.gameId.split(',')
        : ['ALL'];

      // Load BuyRTP (use ?? operator for proper null/0 handling)
      formData.BuyRTP = lastConfig.buyRtp ?? 0;

      // Load MaxMultiple (use ?? operator for proper null handling)
      formData.MaxMultiple = lastConfig.maxMultiple ?? 100;

      // Load MaxWinPoints (use ?? operator for proper null handling)
      formData.MaxWinPoints = lastConfig.maxWinPoints ?? 1000000;

      console.log('✅ Last merchant RTP config loaded into form:', {
        GamePattern: formData.GamePattern,
        Rtp: formData.Rtp,
        GameId: formData.GameId,
        BuyRTP: formData.BuyRTP,
        MaxMultiple: formData.MaxMultiple,
        MaxWinPoints: formData.MaxWinPoints,
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
