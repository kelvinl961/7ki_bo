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
          <template #feedback>
            当前运营商权限支持10-97的RTP值
          </template>
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

        <n-form-item label="解除RTP值" path="RemoveRTP">
          <n-select
            v-model:value="formData.RemoveRTP"
            :options="rtpOptions"
            placeholder="选择解除RTP管控的值（可选）"
            clearable
            filterable
          />
          <template #feedback>
            当用户RTP达到此值将解除用户的RTP控制（可选）
          </template>
        </n-form-item>

        <n-form-item label="购买RTP" path="BuyRTP">
          <n-select
            v-model:value="formData.BuyRTP"
            :options="buyRtpOptions"
            placeholder="选择购买RTP值（可选）"
            clearable
            filterable
          />
          <template #feedback>
            购买RTP开关权限未开启时设置非0值将会报错（可选）
          </template>
        </n-form-item>

        <n-form-item label="最大赢钱倍数" path="PersonWinMaxMult">
          <n-input-number
            v-model:value="formData.PersonWinMaxMult"
            :min="0"
            :max="10000"
            placeholder="输入最大赢钱倍数"
            style="width: 100%"
          />
          <template #feedback>
            非0值时，最小值为1，最大值为10000，默认值100（可选）
          </template>
        </n-form-item>

        <n-form-item label="最大赢钱数" path="PersonWinMaxScore">
          <n-input-number
            v-model:value="formData.PersonWinMaxScore"
            :min="0"
            :max="100000000"
            placeholder="输入最大赢钱数"
            style="width: 100%"
          />
          <template #feedback>
            非0值时，最小值为1，最大值为100000000，默认值1000000（可选）
          </template>
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
            <n-button @click="handleReset">
              重置表单
            </n-button>
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
import { ref, reactive, computed, onMounted, watch, h } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NButton,
  NDataTable,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import { setPlayerRtpApi, getPlayerRtpHistoryApi } from '#/api/core/player-rtp';
import { requestClient } from '#/api/request';

interface Props {
  userId: number;
  userDetail?: any;
}

const props = defineProps<Props>();

const message = useMessage();
const formRef = ref();
const loading = ref(false);
const historyLoading = ref(false);
const gamesLoading = ref(false);
const gameOptions = ref<Array<{ label: string; value: string }>>([]);
const currentPage = ref(1);
const hasMoreGames = ref(true);
const currentSearchQuery = ref('');

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
  { label: '0（关闭）', value: 0 },
  { label: '10（凄惨型）', value: 10 },
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

// Form data
const formData = reactive({
  Rtp: null as number | null,
  GameId: ['ALL'] as string[],
  RemoveRTP: null as number | null,
  BuyRTP: null as number | null,
  PersonWinMaxMult: 100,
  PersonWinMaxScore: 1000000,
});

// Form validation rules
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
      return h(NTag, { type: 'info', size: 'small' }, { default: () => row.rtp });
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
      return row.removeRtp ? h(NTag, { type: 'warning', size: 'small' }, { default: () => row.removeRtp }) : '-';
    },
  },
  {
    title: '购买RTP',
    key: 'buyRtp',
    width: 80,
    align: 'center',
    render: (row) => {
      return row.buyRtp ? h(NTag, { type: 'success', size: 'small' }, { default: () => row.buyRtp }) : '-';
    },
  },
  {
    title: '最大赢钱倍数',
    key: 'personWinMaxMult',
    width: 120,
    align: 'center',
    render: (row) => {
      return row.personWinMaxMult !== null && row.personWinMaxMult !== undefined ? row.personWinMaxMult : 100;
    },
  },
  {
    title: '最大赢钱数',
    key: 'personWinMaxScore',
    width: 120,
    align: 'center',
    render: (row) => {
      return row.personWinMaxScore !== null && row.personWinMaxScore !== undefined ? row.personWinMaxScore : 1000000;
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
      const statusMap: Record<string, { type: 'success' | 'error' | 'warning'; text: string }> = {
        success: { type: 'success', text: '成功' },
        failed: { type: 'error', text: '失败' },
        pending: { type: 'warning', text: '处理中' },
      };
      const status = statusMap[row.status] || { type: 'warning', text: row.status };
      return h(NTag, { type: status.type, size: 'small' }, { default: () => status.text });
    },
  },
];

// Computed
const canSubmit = computed(() => {
  return formData.Rtp !== null && formData.GameId && formData.GameId.length > 0 && props.userDetail?.account;
});

// Methods
const handleSearchGames = async (query: string) => {
  console.log('🔍 handleSearchGames called with query:', query);
  
  // Reset pagination when search query changes
  currentSearchQuery.value = query;
  currentPage.value = 1;
  hasMoreGames.value = true;
  
  if (!query || query.length < 2) {
    // Load initial games
    await loadInitialGames();
    return;
  }

  gamesLoading.value = true;
  try {
    const result = await searchGamesWithPagination(query, 1);
    console.log('✅ Search result:', result);
    
    if (!result || result.length === 0) {
      message.warning('没有找到匹配的游戏');
      // Keep ALL option even when no results
      gameOptions.value = [{ label: 'ALL（全部slots游戏）', value: 'ALL' }];
      hasMoreGames.value = false;
      return;
    }
    
    // Add search results, keep ALL option
    gameOptions.value = [
      { label: 'ALL（全部slots游戏）', value: 'ALL' },
      ...result.map((game: any) => ({
        label: game.gameName,
        value: game.gameId,
      }))
    ];
    
    // Check if there are more results
    hasMoreGames.value = result.length >= 20;
  } catch (error) {
    console.error('❌ Search games error:', error);
    message.error('搜索游戏失败');
    gameOptions.value = [{ label: 'ALL（全部slots游戏）', value: 'ALL' }];
    hasMoreGames.value = false;
  } finally {
    gamesLoading.value = false;
  }
};

const searchGamesWithPagination = async (query: string, page: number) => {
  const response = await requestClient.get('/v1/player/search-games', {
    params: {
      search: query || '',
      limit: 20,
      page: page
    }
  });
  
  console.log('🎮 searchGamesWithPagination response:', response);
  
  // Handle different response formats
  if (response && response.data && Array.isArray(response.data)) {
    return response.data;
  } else if (Array.isArray(response)) {
    return response;
  } else if (response && response.data) {
    return response.data;
  }
  
  return [];
};

const handleScroll = async (e: Event) => {
  const target = e.target as HTMLElement;
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;
  
  // Check if scrolled near bottom (within 50px)
  if (scrollTop + clientHeight >= scrollHeight - 50 && !gamesLoading.value && hasMoreGames.value) {
    console.log('📜 Loading more games...');
    await loadMoreGames();
  }
};

const loadInitialGames = async () => {
  console.log('🎮 Loading initial games...');
  gamesLoading.value = true;
  currentPage.value = 1;
  currentSearchQuery.value = '';
  hasMoreGames.value = true;
  
  try {
    const result = await searchGamesWithPagination('', 1);
    console.log('✅ Initial games loaded:', result);
    
    if (!result || result.length === 0) {
      console.warn('⚠️ No games found in database');
      gameOptions.value = [{ label: 'ALL（全部slots游戏）', value: 'ALL' }];
      message.warning('未找到可用游戏，只能选择 ALL');
      hasMoreGames.value = false;
      return;
    }
    
    // Add "ALL" option at the beginning
    gameOptions.value = [
      { label: 'ALL（全部slots游戏）', value: 'ALL' },
      ...result.map((game: any) => ({
        label: game.gameName,
        value: game.gameId,
      }))
    ];
    
    // Check if there are more results
    hasMoreGames.value = result.length >= 20;
    console.log('✅ Game options set:', gameOptions.value.length, 'options');
  } catch (error) {
    console.error('❌ Load games error:', error);
    message.error('加载游戏列表失败');
    // Fallback to just ALL option
    gameOptions.value = [{ label: 'ALL（全部slots游戏）', value: 'ALL' }];
    hasMoreGames.value = false;
  } finally {
    gamesLoading.value = false;
  }
};

const loadMoreGames = async () => {
  if (!hasMoreGames.value || gamesLoading.value) return;
  
  console.log('📜 Loading more games, page:', currentPage.value + 1);
  gamesLoading.value = true;
  
  try {
    currentPage.value += 1;
    const result = await searchGamesWithPagination(currentSearchQuery.value, currentPage.value);
    
    if (!result || result.length === 0) {
      hasMoreGames.value = false;
      console.log('✅ No more games to load');
      return;
    }
    
    // Append new games to existing options (skip ALL option)
    const newGames = result.map((game: any) => ({
      label: game.gameName,
      value: game.gameId,
    }));
    
    gameOptions.value = [...gameOptions.value, ...newGames];
    
    // Check if there are more results
    hasMoreGames.value = result.length >= 20;
    console.log('✅ Loaded more games, total now:', gameOptions.value.length);
  } catch (error) {
    console.error('❌ Load more games error:', error);
    hasMoreGames.value = false;
  } finally {
    gamesLoading.value = false;
  }
};

const handleGameSelect = (value: string[]) => {
  console.log('Selected games:', value);
  
  // If "ALL" is selected, clear other selections
  if (value && value.includes('ALL') && value.length > 1) {
    // If ALL was just added, keep only ALL
    if (formData.GameId.length < value.length && value[value.length - 1] === 'ALL') {
      formData.GameId = ['ALL'];
    } else {
      // If another game was added after ALL, remove ALL
      formData.GameId = value.filter(g => g !== 'ALL');
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  if (!props.userDetail?.account) {
    message.error('无法获取玩家账号');
    return;
  }

  try {
    await formRef.value.validate();
    loading.value = true;

    // Prepare request data using the current user's ID
    // Join multiple game IDs with comma
    const gameIds = Array.isArray(formData.GameId) ? formData.GameId.join(',') : formData.GameId;
    
    const requestData: any = {
      userAccount: props.userDetail.account, // Use the user account instead of ID
      Rtp: formData.Rtp!,
      GameId: gameIds,
    };

    // Add optional fields
    if (formData.RemoveRTP !== null && formData.RemoveRTP !== undefined) {
      requestData.RemoveRTP = formData.RemoveRTP;
    }

    if (formData.BuyRTP !== null && formData.BuyRTP !== undefined) {
      requestData.BuyRTP = formData.BuyRTP;
    }

    // Always send PersonWinMaxMult and PersonWinMaxScore (with defaults)
    requestData.PersonWinMaxMult = formData.PersonWinMaxMult;
    requestData.PersonWinMaxScore = formData.PersonWinMaxScore;

    // Call API
    const result = await setPlayerRtpApi(requestData);

    message.success(`RTP设置成功！影响的玩家数: ${result.data?.PidList?.length || 0}`);
    
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
  formData.GameId = ['ALL'];
  formData.RemoveRTP = null;
  formData.BuyRTP = null;
  formData.PersonWinMaxMult = 100;
  formData.PersonWinMaxScore = 1000000;
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
    console.log(`✅ Loaded ${result.data?.length || 0} of ${result.total || 0} RTP history records for user: ${props.userDetail.account}`);
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
      
      console.log('📥 Loading last saved player RTP config:', lastConfig);
      
      // Load RTP value
      formData.Rtp = lastConfig.rtp || null;
      
      // Load GameId (split comma-separated string into array)
      formData.GameId = lastConfig.gameId ? lastConfig.gameId.split(',') : ['ALL'];
      
      // Load RemoveRTP (handle null/undefined properly)
      formData.RemoveRTP = lastConfig.removeRtp !== undefined && lastConfig.removeRtp !== null 
        ? lastConfig.removeRtp 
        : null;
      
      // Load BuyRTP (handle null/undefined properly)
      formData.BuyRTP = lastConfig.buyRtp !== undefined && lastConfig.buyRtp !== null 
        ? lastConfig.buyRtp 
        : null;
      
      // Load PersonWinMaxMult (use ?? operator for proper null handling)
      formData.PersonWinMaxMult = lastConfig.personWinMaxMult ?? 100;
      
      // Load PersonWinMaxScore (use ?? operator for proper null handling)
      formData.PersonWinMaxScore = lastConfig.personWinMaxScore ?? 1000000;
      
      console.log('✅ Last player RTP config loaded into form:', {
        Rtp: formData.Rtp,
        GameId: formData.GameId,
        RemoveRTP: formData.RemoveRTP,
        BuyRTP: formData.BuyRTP,
        PersonWinMaxMult: formData.PersonWinMaxMult,
        PersonWinMaxScore: formData.PersonWinMaxScore,
      });
    }
  } catch (error) {
    console.error('Failed to load last player RTP config:', error);
  }
};

// Initialize
onMounted(async () => {
  // Load initial games
  loadInitialGames();
  
  // Load last saved config from API
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

