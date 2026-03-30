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
        <n-form-item label="第三方渠道" path="rtpVendor">
          <n-select
            v-model:value="formData.rtpVendor"
            :options="vendorSelectOptions"
            placeholder="选择对接厂商"
            :disabled="vendorSelectOptions.length === 0"
          />
       
        </n-form-item>

        <n-form-item label="RTP值" path="Rtp">
          <n-select
            v-model:value="formData.Rtp"
            :options="rtpSelectOptions"
            placeholder="选择RTP值"
            filterable
          />
          <template #feedback>{{ rtpFeedback }}</template>
        </n-form-item>

       

        <n-form-item v-if="isHg" label="RTP类型" path="gamePattern">
          <n-select
            v-model:value="formData.gamePattern"
            :options="hgPatternOptions"
            placeholder="game_pattern 1–5"
            :disabled="hgSetRtpLocked"
          />
          <template v-if="hgSetRtpLocked" #feedback>
            设置非 0 RTP 后必填（对应厂商 game_pattern）
          </template>
        </n-form-item>

        <n-form-item v-if="isHg" label="游戏类型" path="gameType">
          <n-select
            v-model:value="formData.gameType"
            :options="hgGameTypeOptions"
            placeholder="0–4"
            :disabled="hgSetRtpLocked"
          />
          <template v-if="hgSetRtpLocked" #feedback>
            设置非 0 RTP 后必填（game_type）
          </template>
        </n-form-item>

        <n-form-item v-if="isHg" label="单局最高倍数" path="maxMultiple">
          <n-input-number
            v-model:value="formData.maxMultiple"
            :min="0"
            :max="10000"
            :precision="0"
            clearable
            placeholder="留空默认 100；非 0 时 1–10000"
            class="w-full max-w-md"
            :disabled="hgSetRtpLocked"
          />
        </n-form-item>

        <n-form-item v-if="isHg" label="单局最高赢取" path="maxWinPoints">
          <n-input-number
            v-model:value="formData.maxWinPoints"
            :min="0"
            :max="100000000"
            :precision="0"
            clearable
            placeholder="留空默认 1000000；非 0 时 1–100000000"
            class="w-full max-w-md"
            :disabled="hgSetRtpLocked"
          />
        </n-form-item>

        <n-form-item v-if="isHg" label="解除RTP管控" path="removeRtp">
          <n-select
            v-model:value="formData.removeRtp"
            :options="hgRemoveRtpOptions"
            clearable
            placeholder="不设置则不解控"
            :disabled="hgSetRtpLocked"
          />
        </n-form-item>

        <n-form-item v-if="isHg" label="RTP上限" path="personWinMaxRtp">
          <n-input-number
            v-model:value="formData.personWinMaxRtp"
            :min="0"
            :max="1000"
            :precision="0"
            clearable
            placeholder="留空默认 1000；非 0 时 1–1000"
            class="w-full max-w-md"
            :disabled="hgSetRtpLocked"
          />
        </n-form-item>

        <n-form-item v-if="isHg" label="游戏" path="GameId">
          <n-select
            v-model:value="formData.GameId"
            multiple
            filterable
            remote
            :options="gameOptions"
            :loading="gamesLoading"
            :remote-method="handleSearchGames"
            placeholder="搜索并选择游戏，或 ALL"
            clearable
            max-tag-count="responsive"
            @update:value="handleGameSelect"
            @scroll="handleScroll"
          />
         
        </n-form-item>

        <n-form-item>
          <div class="flex gap-3">
            <n-button
              type="primary"
              :loading="loading"
              @click="handleSubmit"
              :disabled="!canSubmit || vendorSelectOptions.length === 0"
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
import { ref, reactive, computed, onMounted, h, watch } from 'vue';
import {
  NAlert,
  NCard,
  NForm,
  NFormItem,
  NSelect,
  NButton,
  NDataTable,
  NTag,
  NInputNumber,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  getPlayerRtpHistoryApi,
  getPlayerRtpVendorsApi,
  searchGamesWithPagination,
  setPlayerRtpApi,
  type PlayerRtpVendorOption,
} from '#/api/core/player-rtp';

interface Props {
  userId: number;
  userDetail?: any;
}

const props = defineProps<Props>();

const message = useMessage();
const formRef = ref();
const loading = ref(false);
const historyLoading = ref(false);
const rtpVendors = ref<PlayerRtpVendorOption[]>([]);

const agRtpSelectOptions = [
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

const HG_RTP_WHITELIST = new Set([
  10, 20, 30, 40, 50, 60, 70, 80, 85, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
  102, 105, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 220, 240, 260, 280, 300,
  500, 750, 1000,
]);

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

const hgRemoveRtpOptions = hgRtpSelectOptions;

const formData = reactive({
  rtpVendor: null as string | null,
  Rtp: null as number | null,
  gamePattern: 1,
  gameType: 0,
  maxMultiple: null as number | null,
  maxWinPoints: null as number | null,
  removeRtp: null as number | null,
  personWinMaxRtp: null as number | null,
  GameId: ['ALL'] as string[],
});

const isHg = computed(() => formData.rtpVendor === 'hg');

/** HG setRtp 专用项：RTP 为 0（取消）或未选时禁用，避免误以为「只有三栏」 */
const hgSetRtpLocked = computed(
  () => isHg.value && (formData.Rtp === null || formData.Rtp === 0),
);

const gamesLoading = ref(false);
const gameOptions = ref<Array<{ label: string; value: string }>>([]);
const currentPage = ref(1);
const hasMoreGames = ref(true);
const currentSearchQuery = ref('');

const rtpSelectOptions = computed(() => {
  if (formData.rtpVendor === 'hg') {
    return [
      { label: '0（取消 → cancelRtp）', value: 0 },
      ...hgRtpSelectOptions,
    ];
  }
  return agRtpSelectOptions;
});

const rtpFeedback = computed(() => {
  if (formData.rtpVendor === 'hg') {
    return formData.Rtp === 0
      ? '取消：见下方蓝色说明，并填写「游戏」gameid'
      : '设置：走 /api/v1/player/setRtp；下方 HG 参数已启用';
  }
  return 'AG / 默认渠道：0 表示取消；其它为 10–97';
});

watch(
  () => formData.rtpVendor,
  (v) => {
    if (v !== 'hg') {
      formData.GameId = ['ALL'];
    }
    const r = formData.Rtp;
    if (r == null) return;
    if (v === 'hg') {
      if (r !== 0 && !HG_RTP_WHITELIST.has(r)) {
        formData.Rtp = 94;
      }
    } else if (r !== 0 && (r < 10 || r > 97)) {
      formData.Rtp = 94;
    }
    formRef.value?.restoreValidation();
  },
);

watch(
  () => formData.Rtp,
  () => {
    formRef.value?.restoreValidation();
  },
);

const vendorSelectOptions = computed(() =>
  rtpVendors.value.map((v) => ({ label: v.label, value: v.id })),
);

const loadInitialGames = async () => {
  gamesLoading.value = true;
  currentPage.value = 1;
  try {
    const result = await searchGamesWithPagination('', 1);
    gameOptions.value = [
      { label: 'ALL（全部slots游戏）', value: 'ALL' },
      ...result.map((game: { gameName: string; gameId: string }) => ({
        label: game.gameName,
        value: String(game.gameId),
      })),
    ];
  } catch (e) {
    console.error('Failed to load games', e);
  } finally {
    gamesLoading.value = false;
  }
};

const handleSearchGames = async (query: string) => {
  if (!query || query.length < 2) {
    await loadInitialGames();
    return;
  }
  currentSearchQuery.value = query;
  currentPage.value = 1;
  hasMoreGames.value = true;
  gamesLoading.value = true;
  try {
    const result = await searchGamesWithPagination(query, 1);
    gameOptions.value = [
      { label: 'ALL（全部slots游戏）', value: 'ALL' },
      ...result.map((game: { gameName: string; gameId: string }) => ({
        label: game.gameName,
        value: String(game.gameId),
      })),
    ];
    hasMoreGames.value = result.length >= 20;
  } catch (e) {
    console.error('Failed to search games', e);
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
    if (!result?.length) {
      hasMoreGames.value = false;
      return;
    }
    const extra = result.map((game: { gameName: string; gameId: string }) => ({
      label: game.gameName,
      value: String(game.gameId),
    }));
    gameOptions.value = [...gameOptions.value, ...extra];
    hasMoreGames.value = result.length >= 20;
  } catch (e) {
    console.error('Failed to load more games', e);
  } finally {
    gamesLoading.value = false;
  }
};

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 5) {
    loadMoreGames();
  }
};

const handleGameSelect = (value: string[]) => {
  if (value?.includes('ALL') && value.length > 1) {
    if (value[value.length - 1] === 'ALL') {
      formData.GameId = ['ALL'];
    } else {
      formData.GameId = value.filter((g) => g !== 'ALL');
    }
  }
};

// Form validation rules
const rules: Record<string, unknown> = {
  rtpVendor: {
    required: true,
    message: '请选择第三方渠道',
    trigger: 'change',
  },
  gamePattern: {
    trigger: 'change',
    validator: (_rule: unknown, value: number) => {
      if (!isHg.value || formData.Rtp === null || formData.Rtp === 0) return true;
      if (value == null || ![1, 2, 3, 4, 5].includes(value)) {
        return new Error('请选择 game_pattern（1–5）');
      }
      return true;
    },
  },
  gameType: {
    trigger: 'change',
    validator: (_rule: unknown, value: number) => {
      if (!isHg.value || formData.Rtp === null || formData.Rtp === 0) return true;
      if (value == null || ![0, 1, 2, 3, 4].includes(value)) {
        return new Error('请选择 game_type（0–4）');
      }
      return true;
    },
  },
  maxMultiple: {
    trigger: ['blur', 'change'],
    validator: (_rule: unknown, value: number | null) => {
      if (!isHg.value || formData.Rtp === null || formData.Rtp === 0) return true;
      if (value == null) return true;
      const n = Math.round(Number(value));
      if (n !== 0 && (n < 1 || n > 10_000)) {
        return new Error('须为 0 或 1–10000');
      }
      return true;
    },
  },
  maxWinPoints: {
    trigger: ['blur', 'change'],
    validator: (_rule: unknown, value: number | null) => {
      if (!isHg.value || formData.Rtp === null || formData.Rtp === 0) return true;
      if (value == null) return true;
      const n = Math.round(Number(value));
      if (n !== 0 && (n < 1 || n > 100_000_000)) {
        return new Error('须为 0 或 1–100000000');
      }
      return true;
    },
  },
  removeRtp: {
    trigger: 'change',
    validator: (_rule: unknown, value: number | null) => {
      if (!isHg.value || formData.Rtp === null || formData.Rtp === 0) return true;
      if (value == null) return true;
      return HG_RTP_WHITELIST.has(value)
        ? true
        : new Error('remove_rtp 须在 HG 白名单内');
    },
  },
  personWinMaxRtp: {
    trigger: ['blur', 'change'],
    validator: (_rule: unknown, value: number | null) => {
      if (!isHg.value || formData.Rtp === null || formData.Rtp === 0) return true;
      if (value == null) return true;
      const n = Math.round(Number(value));
      if (n !== 0 && (n < 1 || n > 1000)) {
        return new Error('须为 0 或 1–1000');
      }
      return true;
    },
  },
  Rtp: {
    required: true,
    type: 'number',
    message: '请选择RTP值',
    trigger: 'change',
    validator: (_rule: unknown, value: number) => {
      if (value == null) return new Error('请选择RTP值');
      if (isHg.value && value !== 0 && !HG_RTP_WHITELIST.has(value)) {
        return new Error('当前 RTP 不在 HG 白名单内');
      }
      if (!isHg.value) {
        if (value === 0) return true;
        if (value >= 10 && value <= 97) return true;
        return new Error('AG RTP 须为 0 或 10–97');
      }
      return true;
    },
  },
  GameId: {
    trigger: 'change',
    validator: (_rule: unknown, value: string[]) => {
      if (!isHg.value) return true;
      if (!value?.length) return new Error('请选择游戏范围');
      if (!value.includes('ALL') && value.length > 50) {
        return new Error('单次最多 50 个 gameid');
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
    title: '渠道',
    key: 'rtpVendor',
    width: 120,
    ellipsis: { tooltip: true },
    render: (row) => {
      const v = row.response?._metadata?.rtpVendor;
      return v != null && v !== '' ? String(v) : '—';
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
  if (
    formData.rtpVendor == null ||
    formData.rtpVendor === '' ||
    formData.Rtp === null ||
    !props.userDetail?.account
  ) {
    return false;
  }
  if (formData.rtpVendor === 'hg') {
    return formData.GameId.length > 0;
  }
  return true;
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

    const gameIds = isHg.value
      ? formData.GameId.includes('ALL')
        ? 'ALL'
        : formData.GameId.join(',')
      : 'ALL';

    const payload: {
      userAccount: string;
      Rtp: number;
      GameId: string;
      rtpVendor: string;
      gamePattern?: number;
      gameType?: number;
      PersonWinMaxMult?: number;
      PersonWinMaxScore?: number;
      RemoveRTP?: number;
      PersonWinMaxRtp?: number;
    } = {
      userAccount: props.userDetail.account,
      Rtp: formData.Rtp!,
      GameId: gameIds,
      rtpVendor: formData.rtpVendor!,
    };

    if (isHg.value && formData.Rtp !== 0) {
      payload.gamePattern = formData.gamePattern;
      payload.gameType = formData.gameType;
      if (formData.maxMultiple != null) {
        payload.PersonWinMaxMult = Math.round(formData.maxMultiple);
      }
      if (formData.maxWinPoints != null) {
        payload.PersonWinMaxScore = Math.round(formData.maxWinPoints);
      }
      if (formData.removeRtp != null) {
        payload.RemoveRTP = formData.removeRtp;
      }
      if (formData.personWinMaxRtp != null) {
        payload.PersonWinMaxRtp = Math.round(formData.personWinMaxRtp);
      }
    }

    const result = await setPlayerRtpApi(payload);

    message.success(
      `RTP设置成功！影响的玩家数: ${result.data?.PidList?.length || 0}`,
    );

    pagination.page = 1;
    await loadHistory();
  } catch (error: any) {
    message.error(`RTP设置失败: ${error?.message || '未知错误'}`);
    console.error('Set RTP error:', error);
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  formData.Rtp = null;
  formData.rtpVendor = rtpVendors.value[0]?.id ?? null;
  formData.gamePattern = 1;
  formData.gameType = 0;
  formData.maxMultiple = null;
  formData.maxWinPoints = null;
  formData.removeRtp = null;
  formData.personWinMaxRtp = null;
  formData.GameId = ['ALL'];
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
    });

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
    });

    if (result.data && result.data.length > 0) {
      const lastConfig = result.data[0];
      if (!lastConfig) return;

      formData.Rtp = lastConfig.rtp ?? null;
      const metaV = lastConfig.response?._metadata?.rtpVendor;
      if (
        typeof metaV === 'string' &&
        metaV &&
        rtpVendors.value.some((x) => x.id === metaV)
      ) {
        formData.rtpVendor = metaV;
      }

      const req = lastConfig.response?.request as Record<string, unknown> | undefined;
      if (formData.rtpVendor === 'hg') {
        if (req && typeof req === 'object') {
          if (req.game_pattern != null) {
            formData.gamePattern = Number(req.game_pattern);
          }
          if (req.game_type != null) {
            formData.gameType = Number(req.game_type);
          }
          if (req.gameid != null && String(req.gameid).trim() !== '') {
            const s = String(req.gameid).trim();
            formData.GameId =
              s.toUpperCase() === 'ALL'
                ? ['ALL']
                : s.split(',').map((x) => x.trim()).filter(Boolean);
          }
          if (req.remove_rtp != null && req.remove_rtp !== '') {
            formData.removeRtp = Number(req.remove_rtp);
          }
          if (req.person_win_max_rtp != null && req.person_win_max_rtp !== '') {
            formData.personWinMaxRtp = Number(req.person_win_max_rtp);
          }
        }
        if (
          (!req?.gameid || String(req.gameid).trim() === '') &&
          lastConfig.gameId
        ) {
          const s = String(lastConfig.gameId).trim();
          formData.GameId =
            s.toUpperCase() === 'ALL'
              ? ['ALL']
              : s.split(',').map((x) => x.trim()).filter(Boolean);
        }
        if (lastConfig.personWinMaxMult != null) {
          formData.maxMultiple = lastConfig.personWinMaxMult;
        }
        if (lastConfig.personWinMaxScore != null) {
          formData.maxWinPoints = lastConfig.personWinMaxScore;
        }
        if (lastConfig.removeRtp != null) {
          formData.removeRtp = lastConfig.removeRtp;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load last player RTP config:', error);
  }
};

const loadRtpVendors = async () => {
  try {
    rtpVendors.value = await getPlayerRtpVendorsApi();
    if (rtpVendors.value.length === 0) {
      message.warning(
        '未配置可用 RTP 第三方渠道（AG / GAME_PROVIDER / PLAYER_RTP_EXTRA_VENDORS_JSON）',
      );
      formData.rtpVendor = null;
      return;
    }
    if (formData.rtpVendor == null || formData.rtpVendor === '') {
      formData.rtpVendor = rtpVendors.value[0]!.id;
    }
  } catch (error) {
    console.error('Load RTP vendors error:', error);
    message.error('加载 RTP 渠道列表失败');
  }
};

// Initialize
onMounted(async () => {
  if (props.userId) {
    await loadRtpVendors();
    await loadInitialGames();
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
