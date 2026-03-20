<template>
  <div class="merchant-rtp-page">
    <n-card :bordered="false" class="mb-4">
      <n-alert type="info" title="说明" class="mb-4">
        <template #default>
          <ul>
            <li>✅ First-Match：从上到下匹配到的第一条规则生效</li>
            <li>✅ 支持条件：未入金 / 入金金额阈值、游戏范围</li>
            <li>✅ 支持：保存/加载后端条件RTP配置（演示联动）</li>
          </ul>
        </template>
      </n-alert>

      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="入金条件" path="depositCondition">
          <n-select
            v-model:value="formData.depositCondition"
            :options="depositConditionOptions"
            placeholder="请选择"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.depositCondition === 'GTE_AMOUNT'"
          label="累计入金金额 >= 阈值"
          path="depositMinAmount"
        >
          <n-input-number
            v-model:value="formData.depositMinAmount"
            :min="0"
            :max="100000000"
            placeholder="例如 500"
            :precision="2"
          />
        </n-form-item>

        <n-form-item label="RTP值" path="rtp">
          <n-select
            v-model:value="formData.rtp"
            :options="rtpOptions"
            placeholder="选择 RTP"
            filterable
          />
          <template #feedback> 当前权限：RTP 支持 10-97</template>
        </n-form-item>

        <n-form-item label="游戏范围" path="games">
          <n-select
            v-model:value="formData.games"
            multiple
            filterable
            remote
            clearable
            :options="gameOptions"
            :loading="gamesLoading"
            placeholder="选择游戏（可多选），或选择 ALL"
            :remote-method="handleSearchGames"
            @update:value="handleGameSelect"
            max-tag-count="responsive"
          />
          <template #feedback>
            如果包含 `ALL`，表示适用于全部 slots 游戏
          </template>
        </n-form-item>

        <n-form-item>
          <n-space>
            <n-button
              type="primary"
              @click="handleAddRule"
              :loading="submitting"
            >
              添加规则
            </n-button>
            <n-button @click="handleResetForm" :disabled="submitting">
              重置表单
            </n-button>
          </n-space>
        </n-form-item>
      </n-form>

      <div class="mt-4 flex gap-3 flex-wrap">
        <n-button
          size="small"
          type="primary"
          @click="handleLoadFromBackend"
          :disabled="submitting"
          :loading="loadingFromBackend"
        >
          加载后端配置
        </n-button>
        <n-button size="small" @click="handleTemplateA" :disabled="submitting">
          模板：未入金
        </n-button>
        <n-button
          size="small"
          type="warning"
          @click="handleTemplateB"
          :disabled="submitting"
        >
          模板：入金>=阈值
        </n-button>
        <n-button
          size="small"
          type="error"
          @click="handleClearRules"
          :disabled="submitting"
        >
          清空全部规则
        </n-button>
        <n-button
          size="small"
          type="success"
          @click="handleSaveToBackend"
          :disabled="submitting || rulesList.length === 0"
          :loading="savingToBackend"
        >
          保存到后端
        </n-button>
      </div>
    </n-card>

    <n-card :bordered="false" class="mb-4" title="规则列表（First-Match）">
      <template #header-extra>
        <n-tag type="info" size="small">规则数：{{ rulesList.length }}</n-tag>
      </template>

      <n-data-table
        :columns="ruleColumns"
        :data="rulesList"
        :bordered="false"
        size="small"
        :pagination="false"
      />

      <div v-if="rulesList.length === 0" class="mt-4 p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-white">
        <div class="text-slate-700 font-semibold">暂无规则</div>
        <div class="text-sm text-slate-500 mt-2">使用上方表单添加第一条规则</div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, h } from 'vue';
import {
  useMessage,
  NTag,
  NCard,
  NAlert,
  NForm,
  NFormItem,
  NInputNumber,
  NSelect,
  NSpace,
  NButton,
  NDataTable,
  type FormInst,
  type DataTableColumns,
} from 'naive-ui';
import {
  getConditionalPlayerRtpConfigApi,
  setConditionalPlayerRtpConfigApi,
  type ConditionalPlayerRtpConfigPayload,
  searchGamesWithPagination,
} from '#/api/core/player-rtp';

type DepositConditionType = 'NO_DEPOSIT' | 'GTE_AMOUNT';

type Rule = {
  id: string;
  enabled: boolean;
  depositCondition: DepositConditionType;
  depositMinAmount?: number;
  rtp: number;
  games: string[];
};

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const loadingFromBackend = ref(false);
const savingToBackend = ref(false);

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

const depositConditionOptions = [
  { label: '未入金（累计入金=0）', value: 'NO_DEPOSIT' },
  { label: '入金金额 >= 阈值', value: 'GTE_AMOUNT' },
];

const gamesLoading = ref(false);
const gameOptions = ref<Array<{ label: string; value: string }>>([]);
const currentPage = ref(1);

const loadInitialGames = async () => {
  gamesLoading.value = true;
  currentPage.value = 1;
  try {
    const result = await searchGamesWithPagination('', 1);
    gameOptions.value = [
      { label: 'ALL（全部slots游戏）', value: 'ALL' },
      ...result.map((game: any) => ({
        label: game.gameName,
        value: String(game.gameId),
      })),
    ];
  } catch (e) {
    console.error('Failed to load initial games', e);
  } finally {
    gamesLoading.value = false;
  }
};

const handleSearchGames = async (query: string) => {
  if (!query || query.length < 2) return loadInitialGames();
  gamesLoading.value = true;
  try {
    const result = await searchGamesWithPagination(query, 1);
    gameOptions.value = [
      { label: 'ALL（全部slots游戏）', value: 'ALL' },
      ...result.map((game: any) => ({
        label: game.gameName,
        value: String(game.gameId),
      })),
    ];
  } catch (e) {
    console.error('Failed to search games', e);
  } finally {
    gamesLoading.value = false;
  }
};

const defaultGames = ['ALL'];
const formData = reactive({
  depositCondition: 'NO_DEPOSIT' as DepositConditionType,
  depositMinAmount: 500,
  rtp: 94,
  games: [...defaultGames] as string[],
});

const rules: any = {
  depositCondition: {
    required: true,
    message: '请选择入金条件',
    trigger: 'change',
  },
  depositMinAmount: {
    type: 'number',
    message: '请输入入金阈值',
    trigger: 'change',
  },
  rtp: {
    required: true,
    type: 'number',
    message: '请选择 RTP',
    trigger: 'change',
  },
  games: {
    required: true,
    type: 'array',
    message: '请选择游戏范围',
    trigger: 'change',
  },
};

const handleGameSelect = (value: string[] | string) => {
  const list = Array.isArray(value) ? value : [value];
  if (list.includes('ALL')) {
    formData.games = ['ALL'];
  } else {
    formData.games = list;
  }
};

const rulesList = ref<Rule[]>([]);

const buildPayload = (): ConditionalPlayerRtpConfigPayload => {
  return {
    demoType: 'conditional_player_rtp',
    priority: 'first-match-wins',
    rules: rulesList.value.map((r, idx) => ({
      id: r.id,
      enabled: r.enabled,
      priority: idx + 1,
      conditions: {
        // This demo page doesn't expose "new registration <= X days".
        registrationDaysMax: 0,
        depositCondition: r.depositCondition,
        depositMinAmount:
          r.depositCondition === 'GTE_AMOUNT' ? r.depositMinAmount : undefined,
      },
      result: {
        rtp: r.rtp,
        games: Array.from(r.games || []),
      },
    })),
  };
};

const handleSaveToBackend = async () => {
  try {
    if (rulesList.value.length === 0) {
      message.warning('暂无规则可保存');
      return;
    }
    savingToBackend.value = true;
    const payload = buildPayload();
    const resp = await setConditionalPlayerRtpConfigApi(payload);
    if (resp?.code === 0) {
      message.success('已保存到后端');
    } else {
      message.error(resp?.error || '保存失败');
    }
  } catch (e: any) {
    message.error(e?.message || '保存失败');
  } finally {
    savingToBackend.value = false;
  }
};

const handleLoadFromBackend = async () => {
  try {
    loadingFromBackend.value = true;
    const resp = await getConditionalPlayerRtpConfigApi();
    if (resp?.code !== 0) {
      message.error(resp?.error || '加载失败');
      return;
    }

    const backendRules = resp?.data?.rules || [];
    rulesList.value = backendRules.map((rule: any) => {
        const depositCondition =
          rule?.conditions?.depositCondition === 'GTE_AMOUNT'
            ? 'GTE_AMOUNT'
            : 'NO_DEPOSIT';
      return {
        id: String(rule?.id ?? ''),
        enabled: Boolean(rule?.enabled),
        depositCondition,
        depositMinAmount:
          depositCondition === 'GTE_AMOUNT' ? rule?.conditions?.depositMinAmount : undefined,
        rtp: Number(rule?.result?.rtp ?? 0),
        games: Array.isArray(rule?.result?.games) ? rule.result.games : ['ALL'],
      } as Rule;
    });

    message.success('已加载后端配置');
  } catch (e: any) {
    message.error(e?.message || '加载失败');
  } finally {
    loadingFromBackend.value = false;
  }
};

const moveRule = (index: number, delta: number) => {
  const target = index + delta;
  if (target < 0 || target >= rulesList.value.length) return;
  const list = rulesList.value.slice();
  const item = list.splice(index, 1)[0];
  if (!item) return;
  list.splice(target, 0, item);
  rulesList.value = list;
};

const handleToggleRule = (id: string) => {
  rulesList.value = rulesList.value.map((r) =>
    r.id === id ? { ...r, enabled: !r.enabled } : r,
  );
};

const handleDeleteRule = (id: string) => {
  rulesList.value = rulesList.value.filter((r) => r.id !== id);
};

const signatureKey = (rule: Rule) => {
  const gamesKey = rule.games.includes('ALL') ? 'ALL' : [...rule.games].sort().join(',');
  const depKey =
    rule.depositCondition === 'NO_DEPOSIT'
      ? '0'
      : String(rule.depositMinAmount ?? 0);
  return `${rule.depositCondition}|${depKey}|${gamesKey}`;
};

const conflictRuleIds = computed<Set<string>>(() => {
  const sigToRtps = new Map<string, Set<number>>();
  for (const r of rulesList.value) {
    if (!r.enabled) continue;
    const sig = signatureKey(r);
    if (!sigToRtps.has(sig)) sigToRtps.set(sig, new Set());
    sigToRtps.get(sig)!.add(r.rtp);
  }
  const conflicts = new Set<string>();
  for (const r of rulesList.value) {
    if (!r.enabled) continue;
    const sig = signatureKey(r);
    const rtps = sigToRtps.get(sig);
    if (rtps && rtps.size >= 2) conflicts.add(r.id);
  }
  return conflicts;
});

// simulator removed

const handleAddRule = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitting.value = true;

    const rule: Rule = {
      id: String(Date.now()) + Math.random().toString(16).slice(2),
      enabled: true,
      depositCondition: formData.depositCondition,
      depositMinAmount:
        formData.depositCondition === 'GTE_AMOUNT'
          ? formData.depositMinAmount
          : undefined,
      rtp: formData.rtp,
      games: Array.from(formData.games || []),
    };

    if (!rule.games.length) rule.games = ['ALL'];
    if (rule.games.includes('ALL')) rule.games = ['ALL'];

    rulesList.value = [...rulesList.value, rule];
    message.success('已添加规则');
  } catch (e) {
    message.error('表单校验失败，请检查输入');
  } finally {
    submitting.value = false;
  }
};

const handleResetForm = () => {
  formData.depositCondition = 'NO_DEPOSIT';
  formData.depositMinAmount = 500;
  formData.rtp = 94;
  formData.games = [...defaultGames];
  message.info('已重置表单');
};

const handleClearRules = () => {
  rulesList.value = [];
  message.info('已清空全部规则');
};

const handleTemplateA = () => {
  formData.depositCondition = 'NO_DEPOSIT';
  formData.games = [...defaultGames];
  formData.rtp = 94;
  handleAddRule();
};

const handleTemplateB = () => {
  formData.depositCondition = 'GTE_AMOUNT';
  formData.depositMinAmount = 500;
  formData.games = [...defaultGames];
  formData.rtp = 20;
  handleAddRule();
};

// developer mode removed

const ruleColumns: DataTableColumns<Rule> = [
  {
    title: '优先级',
    key: 'priority',
    width: 100,
    align: 'center',
    render: (_row, index) => index + 1,
  },
  {
    title: '入金条件',
    key: 'depositCondition',
    width: 240,
    render: (row) => {
      if (row.depositCondition === 'NO_DEPOSIT') return '未入金';
      return `入金>=${row.depositMinAmount ?? 0}`;
    },
  },
  {
    title: 'RTP',
    key: 'rtp',
    width: 100,
    align: 'center',
    render: (row) => {
      const conflict = conflictRuleIds.value.has(row.id);
      return h('div', { class: 'flex items-center justify-center gap-2' }, [
        h(NTag, { type: 'info', size: 'small' }, { default: () => row.rtp }),
        conflict ? h('span', { class: 'text-orange-600 font-semibold' }, '⚠️') : null,
      ]);
    },
  },
  {
    title: '游戏',
    key: 'games',
    width: 220,
    render: (row) => (row.games.includes('ALL') ? 'ALL' : row.games.join(',')),
  },
  {
    title: '启用',
    key: 'enabled',
    width: 90,
    align: 'center',
    render: (row) => (row.enabled ? '是' : '否'),
  },
  {
    title: '操作',
    key: 'actions',
    width: 320,
    render: (_row, index) => {
      const row = rulesList.value[index];
      if (!row) return null;
      return h(NSpace, { size: 'small' }, () => [
        h(
          NButton,
          {
            size: 'tiny',
            disabled: index === 0,
            onClick: () => moveRule(index, -1),
          },
          { default: () => '上移' },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            disabled: index === rulesList.value.length - 1,
            onClick: () => moveRule(index, 1),
          },
          { default: () => '下移' },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: 'info',
            onClick: () => handleToggleRule(row.id),
          },
          { default: () => (row.enabled ? '禁用' : '启用') },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: 'error',
            onClick: () => handleDeleteRule(row.id),
          },
          { default: () => '删除' },
        ),
      ]);
    },
  },
];

onMounted(async () => {
  await loadInitialGames();
  await handleLoadFromBackend();
});
</script>

<style scoped>
.merchant-rtp-page {
  padding: 20px;
}

ul {
  padding-left: 18px;
  margin-bottom: 0;
}
</style>

