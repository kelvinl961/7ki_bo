<template>
  <div class="merchant-rtp-page">
    <n-card :bordered="false" class="mb-4">
      <n-alert type="info" title="说明" class="mb-4">
        <template #default>
          <ul>
            <li>✅ First-Match：从上到下匹配到的第一条规则生效</li>
            <li>✅ 规则类型：仅入金 / 仅活动领奖（每条规则独立）</li>
            <li>✅ 支持条件：未入金 / 入金金额阈值、可选「所选活动历史累计已领奖 &gt; 阈值」、游戏范围</li>
            <li>✅ 支持：保存/加载后端条件RTP配置（演示联动）</li>
            <li>
              ✅ HG 可选「取消 RTP」：规则里 <code>hgPlayerAction: cancelRtp</code>，注册/入金命中后自动调厂商
              <code>/api/v2/player/cancelRtp</code>（无需手动 BO）
            </li>
            <li>✅ 可同时选 <strong>AG + HG</strong>：保存为 <code>applyVendors</code>，自动应用会依次调用两厂商（双厂商时 RTP 须同时满足 AG 与 HG set 规则）</li>
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
        <n-form-item label="规则类型" path="ruleType">
          <n-select
            v-model:value="formData.ruleType"
            :options="ruleTypeOptions"
            placeholder="请选择规则类型"
          />
          <template #feedback>
            每条规则只做一件事：要么仅入金，要么仅活动领奖累计。
          </template>
        </n-form-item>

        <n-form-item v-if="formData.ruleType === 'DEPOSIT_ONLY'" label="入金条件" path="depositCondition">
          <n-select
            v-model:value="formData.depositCondition"
            :options="depositConditionOptions"
            placeholder="请选择"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.ruleType !== 'ACTIVITY_CLAIM_ONLY' && formData.depositCondition === 'GTE_AMOUNT'"
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

        <n-form-item
          v-if="formData.ruleType === 'ACTIVITY_CLAIM_ONLY'"
          label="累计已领奖（所选活动）"
          path="activityRewardRule"
        >
          <n-space vertical :size="8" class="w-full max-w-2xl">
            <n-select
              v-model:value="formData.activityIds"
              multiple
              filterable
              :options="activityOptions"
              :loading="activitiesLoading"
              placeholder="可多选活动（与下方阈值同时设置才生效）"
              max-tag-count="responsive"
            />
            <n-input-number
              v-model:value="formData.activityRewardAmountGt"
              :min="0"
              :max="100000000"
              :precision="2"
              clearable
              placeholder="用户在这些活动中「历史累计」已领奖总额须严格大于此金额"
              class="w-full max-w-md"
            />
          </n-space>
          <template #feedback>
            按 promotion 库 <code>activity_rewards</code> 汇总：同一用户在所选活动下所有已发放记录金额相加（多活动则再相加）。领奖成功后会自动触发条件 RTP 重算。
          </template>
        </n-form-item>

        <n-form-item label="对接厂商" path="applyVendors">
          <n-select
            v-model:value="formData.applyVendors"
            multiple
            :options="vendorOptions"
            placeholder="可选 1–2 个（AG / HG）"
            :disabled="vendorOptions.length === 0"
            max-tag-count="responsive"
            @update:value="onApplyVendorsChange"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.applyVendors.includes('HG')"
          label="HG 动作"
          path="hgPlayerAction"
        >
          <n-radio-group v-model:value="formData.hgPlayerAction" name="hgPlayerAction">
            <n-space vertical>
              <n-radio value="setRtp">设置个人 RTP（setRtp）</n-radio>
              <n-radio value="cancelRtp">取消个人 RTP（cancelRtp / v2）</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item
          v-if="formData.applyVendors.includes('HG') && formData.hgPlayerAction === 'setRtp'"
          label="RTP类型"
          path="gamePattern"
        >
          <n-select
            v-model:value="formData.gamePattern"
            :options="hgPatternOptions"
            placeholder="1–5"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.applyVendors.includes('HG') && formData.hgPlayerAction === 'setRtp'"
          label="游戏类型"
          path="gameType"
        >
          <n-select
            v-model:value="formData.gameType"
            :options="hgGameTypeOptions"
            placeholder="0–4"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.applyVendors.includes('HG') && formData.hgPlayerAction === 'setRtp'"
          label="单局最高倍数"
          path="maxMultiple"
        >
          <n-input-number
            v-model:value="formData.maxMultiple"
            :min="0"
            :max="10000"
            :precision="0"
            clearable
            placeholder="留空默认 100"
            class="w-full max-w-md"
          />
        </n-form-item>

        <n-form-item
          v-if="formData.applyVendors.includes('HG') && formData.hgPlayerAction === 'setRtp'"
          label="单局最高赢取"
          path="maxWinPoints"
        >
          <n-input-number
            v-model:value="formData.maxWinPoints"
            :min="0"
            :max="100000000"
            :precision="0"
            clearable
            placeholder="留空默认 1000000"
            class="w-full max-w-md"
          />
        </n-form-item>

        <n-form-item
          v-if="!(formData.applyVendors.includes('HG') && formData.hgPlayerAction === 'cancelRtp')"
          label="RTP值"
          path="rtp"
        >
          <n-select
            v-model:value="formData.rtp"
            :options="rtpOptionsEffective"
            placeholder="选择 RTP"
            filterable
          />
          <template #feedback>
            {{
              formData.applyVendors.includes('AG') && formData.applyVendors.includes('HG')
                ? '双厂商：须同时在 AG（0 或 10–97）与 HG 白名单内'
                : formData.applyVendors.includes('HG')
                  ? 'HG 白名单档位；权限不同可能仅支持部分区间'
                  : 'AG：0、10–97'
            }}
          </template>
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
            含 ALL 为全部 slots；多选时单次最多 50 个 gameid。HG 取消 RTP 同样需要 gameid 列表
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
import { computed, onMounted, reactive, ref, h, watch } from 'vue';
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
  NRadio,
  NRadioGroup,
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
import { getMerchantRtpVendorsApi } from '#/api/core/merchant-rtp';
import { getActivityList, type Activity } from '#/api/activity';

type DepositConditionType = 'NO_DEPOSIT' | 'GTE_AMOUNT';
type RuleType = 'DEPOSIT_ONLY' | 'ACTIVITY_CLAIM_ONLY';

type RtpVendorId = 'AG' | 'HG';
type HgPlayerAction = 'setRtp' | 'cancelRtp';

type Rule = {
  id: string;
  enabled: boolean;
  ruleType: RuleType;
  depositCondition: DepositConditionType;
  depositMinAmount?: number;
  /** Optional: claimed activity reward sum for these activities must be > threshold */
  activityIds?: string[];
  activityRewardAmountGt?: number;
  /** 1–2 vendors applied in order when auto-eval runs */
  applyVendors: RtpVendorId[];
  /** HG only; AG 规则忽略 */
  hgPlayerAction?: HgPlayerAction;
  gamePattern?: number;
  gameType?: number;
  maxMultiple?: number | null;
  maxWinPoints?: number | null;
  rtp: number;
  games: string[];
};

const HG_RTP_WHITELIST = new Set([
  10, 20, 30, 40, 50, 60, 70, 80, 85, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
  102, 105, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 220, 240, 260, 280, 300,
  500, 750, 1000,
]);

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const loadingFromBackend = ref(false);
const savingToBackend = ref(false);

const agRtpOptions = [
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

const hgRtpSelectOptions = [...HG_RTP_WHITELIST].sort((a, b) => a - b).map((v) => ({
  label: String(v),
  value: v,
}));

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

const vendorOptions = ref<Array<{ label: string; value: RtpVendorId }>>([]);

const depositConditionOptions = [
  { label: '未入金（累计入金=0）', value: 'NO_DEPOSIT' },
  { label: '入金金额 >= 阈值', value: 'GTE_AMOUNT' },
];
const ruleTypeOptions = [
  { label: '仅入金条件', value: 'DEPOSIT_ONLY' },
  { label: '仅活动领奖条件', value: 'ACTIVITY_CLAIM_ONLY' },
];

const gamesLoading = ref(false);
const gameOptions = ref<Array<{ label: string; value: string }>>([]);
const currentPage = ref(1);

const activitiesLoading = ref(false);
const activityOptions = ref<Array<{ label: string; value: string }>>([]);

const loadActivitiesForRtpRule = async () => {
  activitiesLoading.value = true;
  try {
    const res = await getActivityList({ page: 1, pageSize: 500 });
    const list = (res as { list?: Activity[] })?.list ?? [];
    activityOptions.value = list.map((a) => ({
      label: `${a.id} — ${a.title ?? a.locales?.[0]?.title ?? a.type}`,
      value: String(a.id),
    }));
  } catch (e) {
    console.error('loadActivitiesForRtpRule', e);
    activityOptions.value = [];
  } finally {
    activitiesLoading.value = false;
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
  applyVendors: ['AG'] as RtpVendorId[],
  hgPlayerAction: 'setRtp' as HgPlayerAction,
  gamePattern: 1,
  gameType: 0,
  maxMultiple: null as number | null,
  maxWinPoints: null as number | null,
  ruleType: 'DEPOSIT_ONLY' as RuleType,
  depositCondition: 'NO_DEPOSIT' as DepositConditionType,
  depositMinAmount: 500,
  activityIds: [] as string[],
  activityRewardAmountGt: null as number | null,
  rtp: 94,
  games: [...defaultGames] as string[],
});

const rtpOptionsEffective = computed(() => {
  const hasAg = formData.applyVendors.includes('AG');
  const hasHg = formData.applyVendors.includes('HG');
  if (hasHg && !hasAg) return hgRtpSelectOptions;
  if (hasAg && !hasHg) return agRtpOptions;
  if (hasAg && hasHg) {
    return hgRtpSelectOptions.filter((o) => o.value >= 10 && o.value <= 97);
  }
  return agRtpOptions;
});

function onApplyVendorsChange(val: RtpVendorId[]) {
  const allowed = new Set(vendorOptions.value.map((o) => o.value));
  let next = [...new Set(val.filter((v) => allowed.has(v)))].slice(0, 2);
  if (next.length === 0) {
    next = [(vendorOptions.value[0]?.value ?? 'AG') as RtpVendorId];
  }
  formData.applyVendors = next;
  if (!next.includes('HG')) formData.hgPlayerAction = 'setRtp';
  formRef.value?.restoreValidation();
}

watch(
  () => [...formData.applyVendors],
  (vendors) => {
    const hasHg = vendors.includes('HG');
    const hasAg = vendors.includes('AG');
    if (!hasHg) formData.hgPlayerAction = 'setRtp';
    if (hasHg && formData.hgPlayerAction === 'setRtp' && !HG_RTP_WHITELIST.has(formData.rtp)) {
      formData.rtp = 94;
    }
    if (hasAg && !hasHg && formData.rtp !== 0 && (formData.rtp < 10 || formData.rtp > 97)) {
      formData.rtp = 94;
    }
    if (hasAg && hasHg && formData.hgPlayerAction === 'setRtp') {
      const v = formData.rtp;
      const ok = v >= 10 && v <= 97 && HG_RTP_WHITELIST.has(v);
      if (!ok) formData.rtp = 94;
    }
  },
);

watch(
  () => formData.ruleType,
  (t) => {
    if (t === 'DEPOSIT_ONLY') {
      formData.activityIds = [];
      formData.activityRewardAmountGt = null;
    } else if (t === 'ACTIVITY_CLAIM_ONLY') {
      formData.depositCondition = 'GTE_AMOUNT';
      formData.depositMinAmount = 0;
    }
    formRef.value?.restoreValidation();
  },
);

watch(
  () => formData.hgPlayerAction,
  (a) => {
    if (a === 'cancelRtp') {
      formData.rtp = 0;
    } else if (formData.applyVendors.includes('HG') && formData.rtp === 0) {
      formData.rtp = 94;
    }
    formRef.value?.restoreValidation();
  },
);

const rules: any = {
  ruleType: {
    required: true,
    message: '请选择规则类型',
    trigger: 'change',
  },
  applyVendors: {
    required: true,
    type: 'array',
    trigger: 'change',
    validator: (_rule: unknown, value: RtpVendorId[]) => {
      if (!value?.length) return new Error('请至少选择一个厂商');
      if (value.length > 2) return new Error('最多选择两个厂商');
      return true;
    },
  },
  gamePattern: {
    trigger: 'change',
    validator: (_rule: unknown, value: number) => {
      if (!formData.applyVendors.includes('HG') || formData.hgPlayerAction === 'cancelRtp') return true;
      if (value == null || ![1, 2, 3, 4, 5].includes(value)) {
        return new Error('请选择 game_pattern（1–5）');
      }
      return true;
    },
  },
  gameType: {
    trigger: 'change',
    validator: (_rule: unknown, value: number) => {
      if (!formData.applyVendors.includes('HG') || formData.hgPlayerAction === 'cancelRtp') return true;
      if (value == null || ![0, 1, 2, 3, 4].includes(value)) {
        return new Error('请选择 game_type（0–4）');
      }
      return true;
    },
  },
  maxMultiple: {
    trigger: ['blur', 'change'],
    validator: (_rule: unknown, value: number | null) => {
      if (!formData.applyVendors.includes('HG') || formData.hgPlayerAction === 'cancelRtp') return true;
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
      if (!formData.applyVendors.includes('HG') || formData.hgPlayerAction === 'cancelRtp') return true;
      if (value == null) return true;
      const n = Math.round(Number(value));
      if (n !== 0 && (n < 1 || n > 100_000_000)) {
        return new Error('须为 0 或 1–100000000');
      }
      return true;
    },
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
  activityRewardRule: {
    trigger: ['change', 'blur'],
    validator: () => {
      const ids = formData.activityIds ?? [];
      const gt = formData.activityRewardAmountGt;
      const hasActs = ids.length > 0;
      const hasGt = gt != null && Number.isFinite(Number(gt));
      if (formData.ruleType === 'DEPOSIT_ONLY') {
        return !hasActs && !hasGt ? true : new Error('仅入金条件时，请清空活动领奖条件');
      }
      if (formData.ruleType === 'ACTIVITY_CLAIM_ONLY' && !hasActs && !hasGt) {
        return new Error('请选择活动并设置领奖累计阈值');
      }
      if (!hasActs && !hasGt) return true;
      if (hasActs && !hasGt) return new Error('填写了活动时请填写领奖累计阈值');
      if (hasGt && !hasActs) return new Error('填写了阈值时请至少选择一个活动');
      if (hasGt && Number(gt) < 0) return new Error('阈值须 >= 0');
      if (ids.length > 50) return new Error('最多选择 50 个活动');
      return true;
    },
  },
  rtp: {
    required: true,
    type: 'number',
    message: '请选择 RTP',
    trigger: 'change',
    validator: (_rule: unknown, value: number) => {
      const hasAg = formData.applyVendors.includes('AG');
      const hasHg = formData.applyVendors.includes('HG');
      if (hasHg && formData.hgPlayerAction === 'cancelRtp') {
        return value === 0 ? true : new Error('取消规则 RTP 须为 0');
      }
      if (value == null) return new Error('请选择 RTP');
      if (hasHg && formData.hgPlayerAction === 'setRtp' && !HG_RTP_WHITELIST.has(value)) {
        return new Error('当前 RTP 不在 HG 白名单内');
      }
      if (hasAg) {
        if (value === 0) {
          if (hasHg && formData.hgPlayerAction === 'setRtp') {
            return new Error('AG+HG 同时 set 时 RTP 不能为 0（HG 无此档位）');
          }
          return true;
        }
        if (value >= 10 && value <= 97) {
          if (hasHg && formData.hgPlayerAction === 'setRtp' && !HG_RTP_WHITELIST.has(value)) {
            return new Error('双厂商时 RTP 须同时在 HG 白名单内');
          }
          return true;
        }
        return new Error('AG RTP 须为 0 或 10–97');
      }
      return true;
    },
  },
  games: {
    required: true,
    type: 'array',
    message: '请选择游戏范围',
    trigger: 'change',
    validator: (_rule: unknown, value: string[]) => {
      if (!value?.length) return new Error('请选择游戏范围');
      if (!value.includes('ALL') && value.length > 50) {
        return new Error('批量最多 50 个游戏');
      }
      return true;
    },
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

function normalizeApplyVendorsFromBackendResult(result: any): RtpVendorId[] {
  const raw = result?.applyVendors ?? result?.apply_vendors;
  if (Array.isArray(raw) && raw.length > 0) {
    const out: RtpVendorId[] = [];
    for (const x of raw) {
      const s = String(x).trim().toUpperCase();
      if (s === 'AG' || s === 'HG') out.push(s as RtpVendorId);
    }
    const u = [...new Set(out)];
    if (u.length > 0) return u.slice(0, 2);
  }
  return result?.rtpVendor === 'HG' ? ['HG'] : ['AG'];
}

const buildPayload = (): ConditionalPlayerRtpConfigPayload => {
  return {
    demoType: 'conditional_player_rtp',
    priority: 'first-match-wins',
    rules: rulesList.value.map((r, idx) => {
      const hasHg = r.applyVendors.includes('HG');
      const primary = r.applyVendors[0] ?? 'AG';
      return {
        id: r.id,
        enabled: r.enabled,
        priority: idx + 1,
        conditions: {
          ruleType: r.ruleType,
          registrationDaysMax: 0,
          depositCondition: r.depositCondition,
          depositMinAmount:
            r.depositCondition === 'GTE_AMOUNT' ? r.depositMinAmount : undefined,
          ...(r.activityIds?.length && r.activityRewardAmountGt != null
            ? {
                activityIds: [...r.activityIds],
                activityRewardAmountGt: r.activityRewardAmountGt,
              }
            : {}),
        },
        result: {
          rtp: hasHg && r.hgPlayerAction === 'cancelRtp' ? 0 : r.rtp,
          games: Array.from(r.games || []),
          rtpVendor: primary,
          applyVendors: [...r.applyVendors],
          ...(hasHg && r.hgPlayerAction === 'cancelRtp'
            ? { hgPlayerAction: 'cancelRtp' as const }
            : hasHg && r.hgPlayerAction === 'setRtp'
              ? {
                  gamePattern: r.gamePattern,
                  gameType: r.gameType,
                  ...(r.maxMultiple != null ? { maxMultiple: Math.round(r.maxMultiple) } : {}),
                  ...(r.maxWinPoints != null ? { maxWinPoints: Math.round(r.maxWinPoints) } : {}),
                }
              : {}),
        },
      };
    }),
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
    const respAny = resp as any;
    const code = respAny?.code;
    const errorText = respAny?.error;
    const msg = respAny?.data?.message ?? respAny?.message;

    // Interceptor might unwrap { code, error, data } into { message }.
    const ok = code === 0 || (!code && !errorText && typeof msg === 'string');
    if (ok) message.success('已保存到后端');
    else message.error(errorText || '保存失败');
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
    const respAny = resp as any;
    const code = respAny?.code;
    const errorText = respAny?.error;

    // Interceptor might return either:
    // 1) { code, error, data: { rules } }
    // 2) { demoType, priority, rules } (code unwrapped)
    if (code !== undefined && code !== 0) {
      message.error(errorText || '加载失败');
      return;
    }

    const backendRules = respAny?.data?.rules ?? respAny?.rules ?? [];
    rulesList.value = backendRules.map((rule: any) => {
      const depositCondition =
        rule?.conditions?.depositCondition === 'GTE_AMOUNT'
          ? 'GTE_AMOUNT'
          : 'NO_DEPOSIT';
      const hasActivityRuleBits =
        Array.isArray(rule?.conditions?.activityIds) &&
        rule.conditions.activityIds.length > 0 &&
        rule?.conditions?.activityRewardAmountGt != null;
      const ruleTypeRaw = String(rule?.conditions?.ruleType ?? '').toUpperCase();
      const ruleType: RuleType =
        ruleTypeRaw === 'ACTIVITY_CLAIM_ONLY'
          ? 'ACTIVITY_CLAIM_ONLY'
          : ruleTypeRaw === 'DEPOSIT_ONLY'
            ? 'DEPOSIT_ONLY'
            : hasActivityRuleBits
              ? 'ACTIVITY_CLAIM_ONLY'
              : 'DEPOSIT_ONLY';
      const applyVendors = normalizeApplyVendorsFromBackendResult(rule?.result);
      const hasHg = applyVendors.includes('HG');
      const hgPlayerAction: HgPlayerAction =
        hasHg && rule?.result?.hgPlayerAction === 'cancelRtp' ? 'cancelRtp' : 'setRtp';
      return {
        id: String(rule?.id ?? ''),
        enabled: Boolean(rule?.enabled),
        ruleType,
        depositCondition,
        depositMinAmount:
          depositCondition === 'GTE_AMOUNT' ? rule?.conditions?.depositMinAmount : undefined,
        activityIds: Array.isArray(rule?.conditions?.activityIds)
          ? rule.conditions.activityIds.map((x: unknown) => String(x))
          : undefined,
        activityRewardAmountGt:
          rule?.conditions?.activityRewardAmountGt != null &&
          rule?.conditions?.activityRewardAmountGt !== ''
            ? Number(rule.conditions.activityRewardAmountGt)
            : undefined,
        applyVendors,
        hgPlayerAction: hasHg ? hgPlayerAction : undefined,
        gamePattern:
          hasHg && hgPlayerAction === 'setRtp'
            ? Number(rule?.result?.gamePattern ?? 1)
            : undefined,
        gameType:
          hasHg && hgPlayerAction === 'setRtp'
            ? Number(rule?.result?.gameType ?? 0)
            : undefined,
        maxMultiple:
          hasHg &&
          hgPlayerAction === 'setRtp' &&
          rule?.result?.maxMultiple != null
            ? Number(rule.result.maxMultiple)
            : null,
        maxWinPoints:
          hasHg &&
          hgPlayerAction === 'setRtp' &&
          rule?.result?.maxWinPoints != null
            ? Number(rule.result.maxWinPoints)
            : null,
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
  const typeKey = rule.ruleType;
  const vendorKey = [...rule.applyVendors].sort().join('+');
  const hgKey =
    rule.applyVendors.includes('HG')
      ? `${rule.hgPlayerAction ?? 'setRtp'}|${rule.gamePattern ?? ''}|${rule.gameType ?? ''}|${rule.maxMultiple ?? ''}|${rule.maxWinPoints ?? ''}`
      : '';
  const actKey =
    rule.activityIds?.length && rule.activityRewardAmountGt != null
      ? `act:${[...rule.activityIds].sort().join(',')}|>${rule.activityRewardAmountGt}`
      : '';
  return `${vendorKey}|${typeKey}|${rule.depositCondition}|${depKey}|${gamesKey}|${hgKey}|${actKey}`;
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

    const hasHg = formData.applyVendors.includes('HG');
    const rule: Rule = {
      id: String(Date.now()) + Math.random().toString(16).slice(2),
      enabled: true,
      ruleType: formData.ruleType,
      depositCondition: formData.depositCondition,
      depositMinAmount:
        formData.depositCondition === 'GTE_AMOUNT'
          ? formData.depositMinAmount
          : undefined,
      activityIds:
        formData.activityIds?.length && formData.activityRewardAmountGt != null
          ? [...formData.activityIds]
          : undefined,
      activityRewardAmountGt:
        formData.activityIds?.length && formData.activityRewardAmountGt != null
          ? Number(formData.activityRewardAmountGt)
          : undefined,
      applyVendors: [...formData.applyVendors],
      hgPlayerAction: hasHg ? formData.hgPlayerAction : undefined,
      gamePattern:
        hasHg && formData.hgPlayerAction === 'setRtp' ? formData.gamePattern : undefined,
      gameType:
        hasHg && formData.hgPlayerAction === 'setRtp' ? formData.gameType : undefined,
      maxMultiple:
        hasHg && formData.hgPlayerAction === 'setRtp' ? formData.maxMultiple : null,
      maxWinPoints:
        hasHg && formData.hgPlayerAction === 'setRtp' ? formData.maxWinPoints : null,
      rtp:
        hasHg && formData.hgPlayerAction === 'cancelRtp' ? 0 : formData.rtp,
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
  formData.applyVendors = [(vendorOptions.value[0]?.value ?? 'AG') as RtpVendorId];
  formData.gamePattern = 1;
  formData.gameType = 0;
  formData.maxMultiple = null;
  formData.maxWinPoints = null;
  formData.ruleType = 'DEPOSIT_ONLY';
  formData.depositCondition = 'NO_DEPOSIT';
  formData.depositMinAmount = 500;
  formData.activityIds = [];
  formData.activityRewardAmountGt = null;
  formData.rtp = 94;
  formData.games = [...defaultGames];
  message.info('已重置表单');
};

const handleClearRules = () => {
  rulesList.value = [];
  message.info('已清空全部规则');
};

const handleTemplateA = () => {
  formData.ruleType = 'DEPOSIT_ONLY';
  formData.depositCondition = 'NO_DEPOSIT';
  formData.games = [...defaultGames];
  formData.rtp = 94;
  handleAddRule();
};

const handleTemplateB = () => {
  formData.ruleType = 'DEPOSIT_ONLY';
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
    title: '规则类型',
    key: 'ruleType',
    width: 140,
    render: (row) =>
      row.ruleType === 'DEPOSIT_ONLY'
        ? '仅入金'
        : '仅活动领奖',
  },
  {
    title: '入金 / 活动领奖',
    key: 'depositCondition',
    width: 280,
    render: (row) => {
      const dep = row.ruleType === 'ACTIVITY_CLAIM_ONLY'
        ? '—'
        : row.depositCondition === 'NO_DEPOSIT'
          ? '未入金'
          : `入金>=${row.depositMinAmount ?? 0}`;
      if (row.ruleType !== 'DEPOSIT_ONLY' && row.activityIds?.length && row.activityRewardAmountGt != null) {
        return `${dep}；累计领奖>${row.activityRewardAmountGt}（${row.activityIds.length}个活动）`;
      }
      return dep;
    },
  },
  {
    title: '厂商',
    key: 'applyVendors',
    width: 72,
    align: 'center',
    render: (row) => row.applyVendors.join('+'),
  },
  {
    title: 'HG 参数',
    key: 'hgMeta',
    width: 168,
    ellipsis: { tooltip: true },
    render: (row) => {
      if (!row.applyVendors.includes('HG')) return '—';
      if (row.hgPlayerAction === 'cancelRtp') return 'cancelRtp';
      const bits = [`pattern ${row.gamePattern ?? '-'}`, `type ${row.gameType ?? '-'}`];
      if (row.maxMultiple != null) bits.push(`max×${row.maxMultiple}`);
      if (row.maxWinPoints != null) bits.push(`max$${row.maxWinPoints}`);
      return bits.join(' · ');
    },
  },
  {
    title: 'RTP',
    key: 'rtp',
    width: 100,
    align: 'center',
    render: (row) => {
      const conflict = conflictRuleIds.value.has(row.id);
      const label =
        row.applyVendors.includes('HG') && row.hgPlayerAction === 'cancelRtp'
          ? '取消'
          : String(row.rtp);
      const tagType =
        row.applyVendors.includes('HG') && row.hgPlayerAction === 'cancelRtp'
          ? 'warning'
          : 'info';
      return h('div', { class: 'flex items-center justify-center gap-2' }, [
        h(NTag, { type: tagType, size: 'small' }, { default: () => label }),
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

const loadRtpVendors = async () => {
  try {
    const { vendors } = await getMerchantRtpVendorsApi();
    vendorOptions.value = vendors.map((v) => ({
      label: v.label,
      value: v.id as RtpVendorId,
    }));
    if (vendorOptions.value.length > 0) {
      const allowed = new Set(vendorOptions.value.map((o) => o.value));
      const next = formData.applyVendors.filter((v) => allowed.has(v));
      formData.applyVendors =
        next.length > 0 ? next : [vendorOptions.value[0]!.value];
    }
  } catch (e) {
    console.error('loadRtpVendors', e);
    vendorOptions.value = [
      { label: 'AG', value: 'AG' },
      { label: 'HG', value: 'HG' },
    ];
  }
};

onMounted(async () => {
  await loadRtpVendors();
  await loadInitialGames();
  await loadActivitiesForRtpRule();
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

