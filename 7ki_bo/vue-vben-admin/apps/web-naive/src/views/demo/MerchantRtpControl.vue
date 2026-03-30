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
        <n-form-item label="对接厂商" path="rtpVendor">
          <n-select
            v-model:value="formData.rtpVendor"
            :options="vendorOptions"
            placeholder="根据已启用的游戏平台加载"
            :disabled="vendorOptions.length === 0"
            @update:value="onVendorChange"
          />
          
        </n-form-item>

        

        <n-form-item
          v-if="formData.rtpVendor === 'HG'"
          label="RTP类型"
          path="gamePattern"
        >
          <n-select
            v-model:value="formData.gamePattern"
            :options="hgPatternOptions"
            placeholder="game_pattern 1–5"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.rtpVendor === 'HG'"
          label="游戏类型 "
          path="gameType"
        >
          <n-select
            v-model:value="formData.gameType"
            :options="hgGameTypeOptions"
            placeholder="0–4"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.rtpVendor === 'HG'"
          label="单局最高倍数 "
          path="maxMultiple"
        >
          <n-input-number
            v-model:value="formData.maxMultiple"
            :min="0"
            :max="10000"
            :precision="0"
            clearable
            placeholder="留空默认 100；非 0 时范围 1–10000"
            class="w-full max-w-md"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.rtpVendor === 'HG'"
          label="单局最高赢取 "
          path="maxWinPoints"
        >
          <n-input-number
            v-model:value="formData.maxWinPoints"
            :min="0"
            :max="100000000"
            :precision="0"
            clearable
            placeholder="留空默认 1000000；非 0 时范围 1–100000000"
            class="w-full max-w-md"
          />
        </n-form-item>

        <n-form-item label="RTP值" path="Rtp">
          <n-select
            v-model:value="formData.Rtp"
            :options="rtpOptionsEffective"
            placeholder="选择RTP值"
            filterable
          />
          <template #feedback>
            {{
              formData.rtpVendor === 'HG'
                ? 'HG 白名单档位；运营商权限不同可能仅支持 10–97 或 120–1000 等子集'
                : '注意：AG 支持 0、10–97 的 RTP 值'
            }}
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

        <n-form-item>
          <n-space>
            <n-button
              type="primary"
              :disabled="!formData.rtpVendor || vendorOptions.length === 0"
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
import { ref, reactive, onMounted, h, computed, watch } from 'vue';
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
  NInputNumber,
  NText,
  useMessage,
  type FormInst,
  type DataTableColumns,
} from 'naive-ui';
import { requestClient } from '#/api/request';
import { searchGamesWithPagination } from '#/api/core/player-rtp';
import { getMerchantRtpVendorsApi } from '#/api/core/merchant-rtp';

/** HG operator setRtp allowed RTP values (subset aligned with backend hgRtpSpec) */
const HG_RTP_WHITELIST = new Set([
  10, 20, 30, 40, 50, 60, 70, 80, 85, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
  102, 105, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 220, 240, 260, 280, 300,
  500, 750, 1000,
]);

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

const vendorOptions = ref<Array<{ label: string; value: string }>>([]);
/** Enabled platforms from API (isEnabled=true), for reference */
const enabledPlatforms = ref<
  Array<{
    platformId: string;
    platformName: string;
    rtpIntegration: string;
    apiConfigured: boolean;
  }>
>([]);

// Form data
const formData = reactive({
  rtpVendor: null as string | null,
  gamePattern: 1 as number,
  gameType: 0 as number,
  maxMultiple: null as number | null,
  maxWinPoints: null as number | null,
  Rtp: null as number | null,
  GameId: ['ALL'] as string[],
});

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

const hgPatternOptions = [
  { label: '1 波动型', value: 1 },
  { label: '2 仿正型', value: 2 },
  { label: '3 混合型', value: 3 },
  { label: '4 稳定型', value: 4 },
  { label: '5 高中奖率', value: 5 },
];

const hgGameTypeOptions = [
  { label: '0 拉霸/电子游戏', value: 0 },
  { label: '1 Mini游戏', value: 1 },
  { label: '2 视讯游戏', value: 2 },
  { label: '3 捕鱼游戏', value: 3 },
  { label: '4 彩票游戏', value: 4 },
];

const hgRtpSelectOptions = [...HG_RTP_WHITELIST].sort((a, b) => a - b).map((v) => ({
  label: String(v),
  value: v,
}));

const rtpOptionsEffective = computed(() => {
  if (formData.rtpVendor !== 'HG') return rtpOptions;
  return hgRtpSelectOptions;
});

watch(
  () => formData.rtpVendor,
  (v) => {
    if (v === 'HG' && formData.Rtp != null && !HG_RTP_WHITELIST.has(formData.Rtp)) {
      formData.Rtp = null;
    }
  },
);

const onVendorChange = () => {
  formRef.value?.restoreValidation();
};

// Form rules
const rules = {
  rtpVendor: {
    required: true,
    message: '请选择对接厂商',
    trigger: 'change',
  },
  gamePattern: {
    trigger: 'change',
    validator: (_rule: unknown, value: number) => {
      if (formData.rtpVendor !== 'HG') return true;
      if (value == null || ![1, 2, 3, 4, 5].includes(value)) {
        return new Error('请选择 game_pattern');
      }
      return true;
    },
  },
  gameType: {
    trigger: 'change',
    validator: (_rule: unknown, value: number) => {
      if (formData.rtpVendor !== 'HG') return true;
      if (value == null || ![0, 1, 2, 3, 4].includes(value)) {
        return new Error('请选择 game_type');
      }
      return true;
    },
  },
  maxMultiple: {
    trigger: ['blur', 'change'],
    validator: (_rule: unknown, value: number | null) => {
      if (formData.rtpVendor !== 'HG') return true;
      if (value == null) return true;
      const n = Math.round(Number(value));
      if (n !== 0 && (n < 1 || n > 10_000)) {
        return new Error('max_multiple 须为 0 或 1–10000');
      }
      return true;
    },
  },
  maxWinPoints: {
    trigger: ['blur', 'change'],
    validator: (_rule: unknown, value: number | null) => {
      if (formData.rtpVendor !== 'HG') return true;
      if (value == null) return true;
      const n = Math.round(Number(value));
      if (n !== 0 && (n < 1 || n > 100_000_000)) {
        return new Error('max_win_points 须为 0 或 1–100000000');
      }
      return true;
    },
  },
  Rtp: {
    trigger: 'change',
    validator: (_rule: unknown, value: number | null) => {
      if (value == null) return new Error('请选择RTP值');
      if (formData.rtpVendor === 'HG' && !HG_RTP_WHITELIST.has(value)) {
        return new Error('当前 RTP 不在 HG 白名单内');
      }
      return true;
    },
  },
  GameId: {
    trigger: 'change',
    validator: (_rule: unknown, value: string[]) => {
      if (!value || value.length === 0) {
        return new Error('请至少选择一个游戏');
      }
      if (!value.includes('ALL') && value.length > 50) {
        return new Error('批量调控单次最多 50 个游戏（gameid 逗号分隔）');
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

    let response: { code?: number; error?: string; data?: unknown };

    if (formData.rtpVendor === 'HG') {
      const body: Record<string, unknown> = {
        game_pattern: formData.gamePattern,
        rtp: formData.Rtp!,
        gameid: gameIds,
        game_type: formData.gameType,
      };
      if (formData.maxMultiple != null) {
        body.max_multiple = Math.round(formData.maxMultiple);
      }
      if (formData.maxWinPoints != null) {
        body.max_win_points = Math.round(formData.maxWinPoints);
      }
      response = await requestClient.post('/v2/operator/setRtp', body);
    } else {
      const requestData: Record<string, unknown> = {
        Rtp: formData.Rtp!,
        GameId: gameIds,
      };
      response = await requestClient.post('/v1/operator/setRtp', requestData);
    }

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
  formData.rtpVendor = vendorOptions.value[0]?.value ?? null;
  formData.gamePattern = 1;
  formData.gameType = 0;
  formData.maxMultiple = null;
  formData.maxWinPoints = null;
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
  {
    title: '厂商',
    key: 'gamePattern',
    width: 120,
    ellipsis: { tooltip: true },
    render: (row) => {
      const gp = row.gamePattern;
      if (typeof gp === 'string' && gp.startsWith('HG:')) return 'HG';
      return 'AG';
    },
  },
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

      const gp = lastConfig.gamePattern;
      if (typeof gp === 'string' && gp.startsWith('HG:')) {
        formData.rtpVendor = 'HG';
        const pat = parseInt(gp.slice(3), 10);
        if ([1, 2, 3, 4, 5].includes(pat)) {
          formData.gamePattern = pat;
        }
        if (lastConfig.maxMultiple != null) {
          formData.maxMultiple = Number(lastConfig.maxMultiple);
        } else {
          formData.maxMultiple = null;
        }
        if (lastConfig.maxWinPoints != null) {
          formData.maxWinPoints = Number(lastConfig.maxWinPoints);
        } else {
          formData.maxWinPoints = null;
        }
        const req = lastConfig.response?.request;
        if (req && typeof req.game_type === 'number') {
          formData.gameType = req.game_type;
        }
      } else {
        formData.rtpVendor = vendorOptions.value.some((v) => v.value === 'AG')
          ? 'AG'
          : (vendorOptions.value[0]?.value ?? null);
        formData.maxMultiple = null;
        formData.maxWinPoints = null;
      }

      console.log('✅ Last merchant RTP config loaded into form:', {
        rtpVendor: formData.rtpVendor,
        Rtp: formData.Rtp,
        GameId: formData.GameId,
      });
    }
  } catch (error) {
    console.error('Failed to load last merchant RTP config:', error);
  }
};

const loadRtpVendors = async () => {
  try {
    const { vendors, platforms } = await getMerchantRtpVendorsApi();
    enabledPlatforms.value = platforms.map((p) => ({
      platformId: p.platformId,
      platformName: p.platformName,
      rtpIntegration: p.rtpIntegration,
      apiConfigured: p.apiConfigured,
    }));
    vendorOptions.value = vendors.map((v) => ({ label: v.label, value: v.id }));
    if (!formData.rtpVendor && vendorOptions.value.length > 0) {
      formData.rtpVendor = vendorOptions.value[0]!.value;
    }
    if (vendorOptions.value.length === 0) {
      message.warning(
        '无可用商户 RTP 渠道：需存在 isEnabled=true 且 platformId 为 AG/AG_* 或 HG/HG_* 的平台，并已配置对应 API',
      );
    }
  } catch (e) {
    console.error('loadRtpVendors', e);
    message.error('加载厂商列表失败');
  }
};

// Initialize
onMounted(async () => {
  await loadRtpVendors();
  loadInitialGames();
  await loadLastConfig();
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
