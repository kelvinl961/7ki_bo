<template>
  <div class="conditional-rtp-demo">
    <n-card title="条件RTP调控（演示页）" class="mb-4">
      <n-alert type="info" title="说明" class="mb-4">
        <template #default>
          <ul class="space-y-1">
            <li>✅ 用“规则”方式配置 RTP：先匹配到的规则生效（从上到下）。</li>
            <li>✅ 支持：新注册（<= X天）、未入金 / 入金金额>=阈值、以及游戏范围（ALL或指定）。</li>
            <li>⚠️ 这是演示页：目前不会保存到后端，只会生成 JSON 供你验证/对接。</li>
          </ul>
        </template>
      </n-alert>

      <n-space vertical :size="16">
        <n-card title="1. 新建规则" :bordered="false">
          <n-form
            ref="ruleFormRef"
            :model="newRule"
            :rules="rules"
            label-placement="left"
            label-width="auto"
            require-mark-placement="right-hanging"
          >
            <n-grid :cols="2" :x-gap="16" :y-gap="12">
              <n-form-item label="注册条件（新注册<=X天）" path="registrationMaxDays">
                <n-input-number
                  v-model:value="newRule.registrationMaxDays"
                  :min="0"
                  :max="3650"
                  placeholder="例如 0=今天/1=近1天"
                />
              </n-form-item>

              <n-form-item label="入金条件" path="depositCondition">
                <n-select
                  v-model:value="newRule.depositCondition"
                  :options="depositConditionOptions"
                  placeholder="请选择"
                />
              </n-form-item>

              <n-form-item
                v-if="newRule.depositCondition === 'GTE_AMOUNT'"
                label="入金金额 >= 阈值"
                path="depositMinAmount"
              >
                <n-input-number
                  v-model:value="newRule.depositMinAmount"
                  :min="0"
                  :max="100000000"
                  placeholder="例如 50"
                  :precision="2"
                />
              </n-form-item>

              <n-form-item label="RTP值" path="rtp">
                <n-select
                  v-model:value="newRule.rtp"
                  :options="rtpOptions"
                  placeholder="选择RTP值"
                />
              </n-form-item>

              <n-form-item label="游戏范围" path="games">
                <n-select
                  v-model:value="newRule.games"
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
                  当选择包含 `ALL` 时，表示适用于所有 slots 游戏。
                </template>
              </n-form-item>
            </n-grid>

            <div class="mt-4 flex items-center gap-3">
              <n-button type="primary" :loading="submitting" @click="handleAddRule">
                添加到规则列表
              </n-button>
              <n-button @click="handleResetNewRule" :disabled="submitting">重置</n-button>
            </div>
          </n-form>
        </n-card>

        <n-card title="2. 规则列表（从上到下优先）" :bordered="false">
          <n-space class="mb-3" justify="space-between">
            <n-space>
              <n-tag type="info" size="small">规则数：{{ rulesList.length }}</n-tag>
            </n-space>
            <n-space>
              <n-button size="small" @click="handleAddExampleA" :disabled="submitting">
                一键：新注册&未入金
              </n-button>
              <n-button size="small" @click="handleAddExampleB" :disabled="submitting">
                一键：新注册&入金>=阈值
              </n-button>
              <n-button size="small" type="warning" @click="handleClearRules" :disabled="submitting">
                清空
              </n-button>
            </n-space>
          </n-space>

          <n-data-table
            :columns="ruleColumns"
            :data="rulesList"
            :bordered="false"
            size="small"
          />
        </n-card>

        <n-card title="3. 命中预览（演示）" :bordered="false">
          <n-grid :cols="2" :x-gap="16" :y-gap="12">
            <div>
              <div class="text-sm font-medium text-gray-700 mb-2">
                测试：注册天数 <=（用于判断是否新注册）
              </div>
              <n-input-number
                v-model:value="previewRegistrationDays"
                :min="0"
                :max="3650"
                placeholder="例如 0 或 1"
              />
            </div>

            <div>
              <div class="text-sm font-medium text-gray-700 mb-2">
                测试：累计入金金额（用于判断阈值）
              </div>
              <n-input-number
                v-model:value="previewDepositAmount"
                :min="0"
                :max="100000000"
                placeholder="例如 0 或 120"
                :precision="2"
              />
            </div>
          </n-grid>

          <n-divider />

          <div class="flex items-center gap-4">
            <n-tag type="success" size="large">预览结论</n-tag>
            <div v-if="matchedRule" class="text-sm">
              <div>命中规则：{{ matchedRuleLabel }}</div>
              <div class="mt-1">RTP：<span class="font-semibold text-green-600">{{ matchedRule.rtp }}</span></div>
              <div class="mt-1">
                游戏范围：
                <span class="font-medium">{{ matchedRule.games.includes('ALL') ? 'ALL（全部slots）' : matchedRule.games.join(', ') }}</span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">未命中任何规则（你可以调整规则顺序或条件）。</div>
          </div>

          <div class="mt-4">
            <n-button size="small" @click="handleCopyPayload" type="primary">
              复制规则JSON（供对接）
            </n-button>
          </div>
        </n-card>

        <n-card title="4. 生成的规则 JSON" :bordered="false">
          <n-input
            type="textarea"
            :rows="8"
            :value="generatedPayloadString"
            readonly
            class="font-mono text-xs"
          />
        </n-card>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { useMessage } from 'naive-ui';
import {
  NButton,
  NSpace,
} from 'naive-ui';
import type { FormInst, DataTableColumns } from 'naive-ui';
import { searchGamesWithPagination } from '#/api/core/player-rtp';

const message = useMessage();

const gameOptions = ref<Array<{ label: string; value: string }>>([]);
const gamesLoading = ref(false);
const hasMoreGames = ref(true);
const currentPage = ref(1);

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

type DepositConditionType = 'NO_DEPOSIT' | 'GTE_AMOUNT';

const depositConditionOptions = [
  { label: '未入金（入金金额 = 0）', value: 'NO_DEPOSIT' },
  { label: '入金金额 >= 阈值', value: 'GTE_AMOUNT' },
];

type GameScope = 'ALL' | string;

type Rule = {
  id: string;
  enabled: boolean;
  registrationMaxDays: number;
  depositCondition: DepositConditionType;
  depositMinAmount?: number;
  rtp: number;
  games: string[]; // 'ALL' or gameIds
};

const rulesList = ref<Rule[]>([]);

const defaultGames = ['ALL'];

const newRule = reactive({
  registrationMaxDays: 0,
  depositCondition: 'NO_DEPOSIT' as DepositConditionType,
  depositMinAmount: 50,
  rtp: 10,
  games: [...defaultGames] as string[],
});

const ruleFormRef = ref<FormInst | null>(null);
const submitting = ref(false);

const rules = {
  registrationMaxDays: {
    required: true,
    type: 'number',
    message: '请输入注册天数',
    trigger: 'change',
  },
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
    message: '请选择RTP值',
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
    newRule.games = ['ALL'];
  } else {
    newRule.games = list;
  }
};

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
    hasMoreGames.value = result.length >= 20;
  } catch (e) {
    console.error(e);
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
    console.error(e);
  } finally {
    gamesLoading.value = false;
  }
};

const handleResetNewRule = () => {
  newRule.registrationMaxDays = 0;
  newRule.depositCondition = 'NO_DEPOSIT';
  newRule.depositMinAmount = 50;
  newRule.rtp = 10;
  newRule.games = [...defaultGames];
  message.info('已重置新建规则表单');
};

const makeRuleLabel = (rule: Rule) => {
  const reg = `新注册<=${rule.registrationMaxDays}天`;
  const dep =
    rule.depositCondition === 'NO_DEPOSIT'
      ? '未入金'
      : `入金金额>=${rule.depositMinAmount ?? 0}`;
  const game = rule.games.includes('ALL') ? 'ALL（全部slots）' : `游戏IDs：${rule.games.join(',')}`;
  return `${reg} & ${dep} -> RTP=${rule.rtp}，${game}`;
};

const handleAddRule = async () => {
  if (!ruleFormRef.value) return;

  try {
    await ruleFormRef.value.validate();

    if (
      newRule.depositCondition === 'GTE_AMOUNT' &&
      (newRule.depositMinAmount === null ||
        newRule.depositMinAmount === undefined ||
        newRule.depositMinAmount < 0)
    ) {
      message.error('入金阈值无效，请检查输入');
      return;
    }

    submitting.value = true;
    const rule: Rule = {
      id: String(Date.now()) + Math.random().toString(16).slice(2),
      enabled: true,
      registrationMaxDays: newRule.registrationMaxDays,
      depositCondition: newRule.depositCondition,
      depositMinAmount:
        newRule.depositCondition === 'GTE_AMOUNT'
          ? newRule.depositMinAmount
          : undefined,
      rtp: newRule.rtp,
      games: Array.from(newRule.games || []),
    };
    if (!rule.games.length) rule.games = ['ALL'];
    if (rule.games.includes('ALL')) rule.games = ['ALL'];
    rulesList.value.push(rule);
    message.success('规则已添加');
  } catch (e) {
    message.error('表单校验失败，请检查输入');
  } finally {
    submitting.value = false;
  }
};

const handleClearRules = () => {
  rulesList.value = [];
  message.info('规则列表已清空');
};

const moveRule = (index: number, delta: number) => {
  const target = index + delta;
  if (target < 0 || target >= rulesList.value.length) return;
  const list = rulesList.value.slice();
  const [item] = list.splice(index, 1);
  list.splice(target, 0, item);
  rulesList.value = list;
};

const handleDeleteRule = (id: string) => {
  rulesList.value = rulesList.value.filter((r) => r.id !== id);
};

const handleToggleRule = (id: string) => {
  rulesList.value = rulesList.value.map((r) =>
    r.id === id ? { ...r, enabled: !r.enabled } : r,
  );
};

const handleAddExampleA = () => {
  newRule.registrationMaxDays = 0;
  newRule.depositCondition = 'NO_DEPOSIT';
  newRule.rtp = newRule.rtp ?? 10;
  newRule.games = ['ALL'];
  handleAddRule();
};

const handleAddExampleB = () => {
  newRule.registrationMaxDays = 0;
  newRule.depositCondition = 'GTE_AMOUNT';
  newRule.depositMinAmount = newRule.depositMinAmount ?? 50;
  newRule.rtp = newRule.rtp ?? 20;
  newRule.games = ['ALL'];
  handleAddRule();
};

const ruleColumns: DataTableColumns<Rule> = [
  {
    title: '启用',
    key: 'enabled',
    width: 90,
    align: 'center',
    render: (row) => row.enabled ? '是' : '否',
  },
  {
    title: '匹配条件',
    key: 'match',
    minWidth: 360,
    render: (row) => makeRuleLabel(row),
  },
  {
    title: 'RTP',
    key: 'rtp',
    width: 90,
    align: 'center',
    render: (row) => row.rtp,
  },
  {
    title: '游戏',
    key: 'games',
    width: 260,
    render: (row) =>
      row.games.includes('ALL') ? 'ALL' : row.games.join(','),
  },
  {
    title: '操作',
    key: 'actions',
    width: 240,
    render: (row: Rule, rowIndex: number) =>
      h(NSpace, { size: 'small' }, [
        h(NButton, {
          size: 'tiny',
          disabled: rowIndex === 0,
          onClick: () => moveRule(rowIndex, -1),
        }, { default: () => '上移' }),
        h(NButton, {
          size: 'tiny',
          disabled: rowIndex === rulesList.value.length - 1,
          onClick: () => moveRule(rowIndex, 1),
        }, { default: () => '下移' }),
        h(NButton, {
          size: 'tiny',
          type: row.enabled ? 'default' : 'info',
          onClick: () => handleToggleRule(row.id),
        }, { default: () => (row.enabled ? '禁用' : '启用') }),
        h(NButton, {
          size: 'tiny',
          type: 'error',
          onClick: () => handleDeleteRule(row.id),
        }, { default: () => '删除' }),
      ]),
  },
];

const previewRegistrationDays = ref<number>(0);
const previewDepositAmount = ref<number>(0);

const matchedRule = computed(() => {
  const testReg = previewRegistrationDays.value;
  const testDep = previewDepositAmount.value;
  for (const rule of rulesList.value) {
    if (!rule.enabled) continue;
    const regOk = testReg <= rule.registrationMaxDays;
    if (!regOk) continue;

    if (rule.depositCondition === 'NO_DEPOSIT') {
      const depOk = testDep <= 0;
      if (!depOk) continue;
    } else {
      const min = rule.depositMinAmount ?? 0;
      if (testDep < min) continue;
    }

    return rule;
  }
  return null;
});

const matchedRuleLabel = computed(() => {
  if (!matchedRule.value) return '';
  return makeRuleLabel(matchedRule.value);
});

const generatedPayload = computed(() => {
  return {
    demoType: 'conditional_player_rtp',
    priority: 'first-match-wins',
    rules: rulesList.value.map((r, idx) => ({
      id: r.id,
      enabled: r.enabled,
      priority: idx + 1,
      conditions: {
        registrationDaysMax: r.registrationMaxDays,
        depositCondition: r.depositCondition,
        depositMinAmount: r.depositMinAmount,
      },
      result: {
        rtp: r.rtp,
        games: r.games,
      },
    })),
  };
});

const generatedPayloadString = computed(() =>
  JSON.stringify(generatedPayload.value, null, 2),
);

const handleCopyPayload = async () => {
  try {
    await navigator.clipboard.writeText(generatedPayloadString.value);
    message.success('规则JSON已复制到剪贴板');
  } catch (e) {
    message.error('复制失败：请检查浏览器权限');
  }
};

onMounted(async () => {
  await loadInitialGames();
});
</script>

<style scoped>
.conditional-rtp-demo {
  padding: 16px;
}
</style>

