<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="派发奖励"
    :style="{ width: '760px', maxWidth: '96vw' }"
    :mask-closable="false"
    :close-on-esc="false"
    @after-leave="resetForm"
  >
    <div class="distribute-modal-body">
      <!-- Activity name -->
      <n-form-item label="活动名称" label-placement="left" :label-width="90">
        <span class="form-value-text">{{ activity?.title || activity?.config?.title || '—' }}</span>
      </n-form-item>

      <!-- Add mode switch -->
      <n-form-item label="添加方式" label-placement="left" :label-width="90">
        <n-radio-group v-model:value="form.addMode">
          <n-radio value="manual">多条添加</n-radio>
          <n-radio value="batch">批量导入</n-radio>
        </n-radio-group>
      </n-form-item>

      <!-- Account type -->
      <n-form-item
        :label="form.addMode === 'manual' ? '会员类型' : '账号类型'"
        label-placement="left"
        :label-width="90"
      >
        <n-radio-group v-model:value="form.accountType">
          <n-radio value="account">会员账号</n-radio>
          <n-radio value="userID">会员ID</n-radio>
        </n-radio-group>
      </n-form-item>

      <!-- Manual mode: textarea + reward fields -->
      <template v-if="form.addMode === 'manual'">
        <n-form-item label="" label-placement="left" :label-width="90">
          <n-input
            v-model:value="form.memberInput"
            type="textarea"
            :placeholder="form.accountType === 'account'
              ? '输入多条请用逗号拼接，最多支持200个会员账号'
              : '输入多条请用逗号拼接，最多支持200个会员ID'"
            :rows="4"
            :maxlength="20000"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="* 奖励金额" label-placement="left" :label-width="90">
          <n-input-number
            v-model:value="form.rewardAmount"
            placeholder="请输入奖励金额"
            :min="0.01"
            :precision="2"
            style="width: 320px"
          />
        </n-form-item>

        <n-form-item label="* 稽核倍数" label-placement="left" :label-width="90">
          <n-input-number
            v-model:value="form.auditMultiplier"
            :min="0"
            :precision="2"
            :default-value="1"
            style="width: 320px"
          />
        </n-form-item>
      </template>

      <!-- Platform scope -->
      <n-form-item label="奖金稽核指定平台" label-placement="left" :label-width="120">
        <n-radio-group v-model:value="form.platformScope">
          <n-radio value="all">不限制</n-radio>
          <n-radio value="include">仅限勾选平台</n-radio>
          <n-radio value="exclude">排除勾选平台</n-radio>
        </n-radio-group>
      </n-form-item>

      <!-- Platform tabs (shown when scope is include or exclude) -->
      <n-form-item
        v-if="form.platformScope !== 'all'"
        label=""
        label-placement="left"
        :label-width="90"
        class="platform-picker-item"
      >
        <div class="platform-picker">
          <n-tabs v-model:value="activePlatformTab" type="line" size="small" animated>
            <n-tab-pane
              v-for="cat in platformCategories"
              :key="cat.value"
              :name="cat.value"
              :tab="cat.label + (selectedCountByCategory(cat.value) > 0 ? `(${selectedCountByCategory(cat.value)})` : '')"
            >
              <div v-if="platformsLoading" class="platform-loading">
                加载平台中...
              </div>
              <div v-else class="platform-list">
                <n-checkbox
                  :checked="isAllCategorySelected(cat.value)"
                  :indeterminate="isCategoryIndeterminate(cat.value)"
                  @update:checked="toggleAllCategory(cat.value, $event)"
                >
                  全部平台
                </n-checkbox>
                <n-divider style="margin: 8px 0" />
                <div class="platform-grid">
                  <div
                    v-for="platform in getPlatformsByCategory(cat.value)"
                    :key="platform.id"
                    class="platform-row"
                  >
                    <n-checkbox
                      :checked="form.selectedPlatforms.includes(platform.id)"
                      @update:checked="togglePlatform(platform.id, $event)"
                    >
                      {{ platform.name }}
                    </n-checkbox>
                    <span v-if="platform.subCount > 0" class="sub-game-link">
                      展开子游戏 &gt;
                    </span>
                  </div>
                </div>
                <n-empty v-if="getPlatformsByCategory(cat.value).length === 0" size="small" description="暂无平台" />
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </n-form-item>

      <!-- Double reward toggle -->
      <n-form-item label="加倍奖励" label-placement="left" :label-width="90">
        <n-switch v-model:value="form.doubleReward" />
      </n-form-item>

      <!-- Double reward fields (only when toggle is on, manual mode) -->
      <template v-if="form.doubleReward && form.addMode === 'manual'">
        <n-form-item label="加倍奖励倍数" label-placement="left" :label-width="120">
          <n-input-number
            v-model:value="form.doubleRewardMultiplier"
            :min="1"
            :precision="2"
            style="width: 320px"
          />
        </n-form-item>
        <n-form-item label="加倍稽核倍数" label-placement="left" :label-width="120">
          <n-input-number
            v-model:value="form.doubleAuditMultiplier"
            :min="0"
            :precision="2"
            style="width: 320px"
          />
        </n-form-item>
      </template>

      <!-- Batch mode specific fields -->
      <template v-if="form.addMode === 'batch'">
        <n-form-item label="上传方式" label-placement="left" :label-width="90">
          <n-radio-group v-model:value="form.skipOnError">
            <n-radio :value="false">严格校验（数据格式全部正确才开始上传）</n-radio>
            <n-radio :value="true">自动跳过错误（层级不满足自动排除）</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="* 批量上传" label-placement="left" :label-width="90">
          <n-upload
            accept=".xlsx,.xls,.csv"
            :max="1"
            :show-file-list="true"
            :custom-request="handleFileUpload"
            @change="(data: { file: UploadFileInfo; fileList: UploadFileInfo[] }) => handleFileChange(data)"
            @remove="() => handleFileRemove()"
          >
            <n-button type="primary">数据上传</n-button>
          </n-upload>
        </n-form-item>

        <!-- Upload instructions -->
        <div class="upload-instructions">
          <p class="instructions-title">使用说明:</p>
          <ul>
            <li>建议每个文档会员数量为1,000,000以下，超出请批次上传</li>
            <li>上传文档的大小不超过50M，文件格式仅限.xlsx</li>
            <li>上传文档的字段顺序请按照规则顺序排序</li>
            <li>
              <a class="template-link" @click.prevent="handleDownloadTemplate">模板下载</a>
            </li>
          </ul>
        </div>

        <!-- Parsed data preview -->
        <div v-if="batchPreview.length > 0" class="batch-preview">
          <p class="preview-title">
            已解析 <b>{{ batchPreview.length }}</b> 条数据
            <n-tag v-if="batchErrors.length > 0" type="error" size="small" style="margin-left:8px">
              {{ batchErrors.length }} 条错误
            </n-tag>
          </p>
          <n-data-table
            :columns="previewColumns"
            :data="batchPreview.slice(0, 10)"
            size="small"
            :bordered="false"
            style="max-height: 200px; overflow-y: auto"
          />
          <p v-if="batchPreview.length > 10" class="preview-more">... 仅显示前10条</p>
        </div>
      </template>

      <!-- Notes (manual mode) -->
      <template v-if="form.addMode === 'manual'">
        <n-form-item label="前台备注" label-placement="left" :label-width="90">
          <n-input
            v-model:value="form.frontendNote"
            placeholder="请输入前台备注"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="后台备注" label-placement="left" :label-width="90">
          <n-input
            v-model:value="form.backendNote"
            placeholder="请输入后台备注"
            style="width: 100%"
          />
        </n-form-item>
      </template>
    </div>

    <!-- Distribution results -->
    <div v-if="distributeResults" class="distribute-results">
      <n-divider />
      <n-alert
        :type="distributeResults.failCount === 0 ? 'success' : 'warning'"
        :title="`派发完成：成功 ${distributeResults.successCount} 人，失败 ${distributeResults.failCount} 人`"
        closable
        @close="distributeResults = null"
      />
      <div v-if="distributeResults.failCount > 0" class="failed-list">
        <p class="failed-title">失败明细：</p>
        <n-data-table
          :columns="resultColumns"
          :data="distributeResults.results.filter((r) => !r.success)"
          size="small"
          :bordered="false"
          style="max-height: 200px; overflow-y: auto"
        />
      </div>
    </div>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" :loading="submitting" :disabled="submitting" @click="handleSubmit">
          确认
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, watch, onMounted, onUnmounted } from 'vue';
import {
  NModal,
  NFormItem,
  NInput,
  NInputNumber,
  NRadioGroup,
  NRadio,
  NSwitch,
  NButton,
  NSpace,
  NTabs,
  NTabPane,
  NCheckbox,
  NDivider,
  NUpload,
  NDataTable,
  NAlert,
  NTag,
  NEmpty,
  useMessage,
  type UploadCustomRequestOptions,
  type UploadFileInfo,
} from 'naive-ui';
import { getPlatformsWithGames } from '#/api/activity/platformSelection';
import { getEnabledGamePlatforms } from '#/api/game/gamePlatform';
import {
  distributeActivityRewards,
  type Activity,
  type DistributeMember,
  type DistributeRewardsResult,
} from '#/api/activity';
import {
  PLATFORM_TAB_CATEGORIES,
  normalizeGameTypeToTabCategory,
} from '#/utils/platformGameTypeCategory';
import { SITE_SCOPE_CHANGED_EVENT } from '#/utils/siteScope';

// ─── Props / Emits ─────────────────────────────────────────────────────────
const props = defineProps<{
  show: boolean;
  activity: Activity | null;
}>();

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void;
  (e: 'success'): void;
}>();

const message = useMessage();

// ─── Modal visibility ───────────────────────────────────────────────────────
const visible = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v),
});

// ─── Platform data ──────────────────────────────────────────────────────────
interface PlatformItem {
  id: string;
  name: string;
  category: string;
  subCount: number;
}

const platformCategories = PLATFORM_TAB_CATEGORIES;

const allPlatforms = ref<PlatformItem[]>([]);
const platformsLoading = ref(false);
const activePlatformTab = ref('chess_cards');

const getPlatformsByCategory = (cat: string): PlatformItem[] =>
  allPlatforms.value.filter((p) => p.category === cat);

const selectedCountByCategory = (cat: string): number =>
  getPlatformsByCategory(cat).filter((p) =>
    form.selectedPlatforms.includes(p.id),
  ).length;

const isAllCategorySelected = (cat: string): boolean => {
  const cats = getPlatformsByCategory(cat);
  return cats.length > 0 && cats.every((p) => form.selectedPlatforms.includes(p.id));
};

const isCategoryIndeterminate = (cat: string): boolean => {
  const cats = getPlatformsByCategory(cat);
  const selected = cats.filter((p) => form.selectedPlatforms.includes(p.id)).length;
  return selected > 0 && selected < cats.length;
};

const toggleAllCategory = (cat: string, checked: boolean) => {
  const ids = getPlatformsByCategory(cat).map((p) => p.id);
  if (checked) {
    form.selectedPlatforms = [...new Set([...form.selectedPlatforms, ...ids])];
  } else {
    form.selectedPlatforms = form.selectedPlatforms.filter((id) => !ids.includes(id));
  }
};

const togglePlatform = (id: string, checked: boolean) => {
  if (checked) {
    form.selectedPlatforms = [...form.selectedPlatforms, id];
  } else {
    form.selectedPlatforms = form.selectedPlatforms.filter((p) => p !== id);
  }
};

function mapRowToPlatformItem(p: {
  platformId?: string | number;
  id?: string | number;
  platformName?: string;
  name?: string;
  gameType?: string;
  subGameCount?: number;
}): PlatformItem {
  const dbId = p.platformId ?? p.id;
  return {
    id: String(dbId),
    name: p.platformName || p.name || String(dbId),
    category: normalizeGameTypeToTabCategory(p.gameType),
    subCount: p.subGameCount ?? 0,
  };
}

async function fetchPlatforms() {
  platformsLoading.value = true;
  try {
    let items: PlatformItem[] = [];

    try {
      const res = await getPlatformsWithGames();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        items = res.data.map((p) => mapRowToPlatformItem(p));
      }
    } catch (primaryErr) {
      console.warn('[DistributeReward] platform-selection load failed, using fallback', primaryErr);
    }

    if (items.length === 0) {
      const enabled = await getEnabledGamePlatforms();
      const rows = Array.isArray(enabled) ? enabled : [];
      items = rows.map((p) => mapRowToPlatformItem(p));
    }

    allPlatforms.value = items;

    const firstTabWithPlatforms = platformCategories.find((cat) =>
      items.some((p) => p.category === cat.value),
    );
    if (firstTabWithPlatforms) {
      activePlatformTab.value = firstTabWithPlatforms.value;
    }
  } catch (err) {
    console.error('[DistributeReward] Failed to load platforms:', err);
    message.error('加载平台列表失败');
    allPlatforms.value = [];
  } finally {
    platformsLoading.value = false;
  }
}

watch(
  () => props.show,
  (open) => {
    if (open) void fetchPlatforms();
  },
  { immediate: true },
);

function onSiteScopeChanged() {
  if (props.show) void fetchPlatforms();
}

onMounted(() => {
  window.addEventListener(SITE_SCOPE_CHANGED_EVENT, onSiteScopeChanged);
});

onUnmounted(() => {
  window.removeEventListener(SITE_SCOPE_CHANGED_EVENT, onSiteScopeChanged);
});

// ─── Form state ─────────────────────────────────────────────────────────────
const defaultForm = () => ({
  addMode: 'manual' as 'manual' | 'batch',
  accountType: 'account' as 'account' | 'userID',
  memberInput: '',
  rewardAmount: null as number | null,
  auditMultiplier: 1 as number,
  platformScope: 'all' as 'all' | 'include' | 'exclude',
  selectedPlatforms: [] as string[],
  doubleReward: false,
  doubleRewardMultiplier: 2 as number,
  doubleAuditMultiplier: 1 as number,
  frontendNote: '',
  backendNote: '',
  skipOnError: false,
});

const form = reactive(defaultForm());

// ─── Batch upload state ──────────────────────────────────────────────────────
interface BatchRow {
  rowIndex: number;
  userID: string;
  account: string;
  rewardAmount: string;
  auditMultiplier: string;
  frontendNote: string;
  backendNote: string;
  doubleRewardMultiplier: string;
  doubleAuditMultiplier: string;
  _error?: string;
}

const batchPreview = ref<BatchRow[]>([]);
const batchErrors = computed(() => batchPreview.value.filter((r) => r._error));
const uploadedFile = ref<File | null>(null);

const previewColumns = [
  { title: '行', key: 'rowIndex', width: 50 },
  { title: '会员ID', key: 'userID', width: 100 },
  { title: '会员账号', key: 'account', width: 120 },
  { title: '奖励金额', key: 'rewardAmount', width: 100 },
  { title: '稽核倍数', key: 'auditMultiplier', width: 100 },
  { title: '前台备注', key: 'frontendNote', width: 100 },
  { title: '后台备注', key: 'backendNote', width: 100 },
  {
    title: '状态',
    key: '_error',
    width: 120,
    render: (row: BatchRow) =>
      row._error
        ? h(NTag, { type: 'error', size: 'small' }, { default: () => row._error })
        : h(NTag, { type: 'success', size: 'small' }, { default: () => '正常' }),
  },
];

// ─── Results state ───────────────────────────────────────────────────────────
const distributeResults = ref<{
  results: DistributeRewardsResult[];
  successCount: number;
  failCount: number;
  total: number;
} | null>(null);

const resultColumns = [
  { title: '会员标识', key: 'identifier', width: 150 },
  {
    title: '结果',
    key: 'error',
    render: (row: DistributeRewardsResult) =>
      h(NTag, { type: 'error', size: 'small' }, { default: () => row.error || '未知错误' }),
  },
];

const submitting = ref(false);

// ─── File handling ───────────────────────────────────────────────────────────
function handleFileChange(options: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  uploadedFile.value = options.file.file ?? null;
  if (uploadedFile.value) {
    parseUploadedFile(uploadedFile.value);
  }
}

function handleFileRemove() {
  uploadedFile.value = null;
  batchPreview.value = [];
}

function handleFileUpload(options: UploadCustomRequestOptions) {
  // Prevent default upload; we handle it manually on submit
  options.onFinish();
}

async function parseUploadedFile(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
    message.error('仅支持 .xlsx / .xls / .csv 文件');
    return;
  }

  if (ext === 'csv') {
    const text = await file.text();
    parseCsvText(text);
  } else {
    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]!];
      if (!ws) return;
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      parseRowsArray(rows);
    } catch {
      message.error('解析Excel失败，请检查文件格式');
    }
  }
}

function parseCsvText(text: string) {
  const lines = text.replace(/^\uFEFF/, '').trim().split('\n');
  const rows = lines.map((l) => l.split(',').map((c) => c.trim().replaceAll('"', '')));
  parseRowsArray(rows);
}

function parseRowsArray(rows: any[][]) {
  // Expected: 会员ID, 会员账号, 奖励金额(必填), 稽核倍数(必填), 前台备注, 后台备注, 加倍奖金奖励倍数, 加倍奖金稽核倍数
  const dataRows = rows.slice(1); // skip header
  batchPreview.value = dataRows
    .filter((r) => r.some((c: any) => String(c).trim() !== ''))
    .map((r, i) => {
      const row: BatchRow = {
        rowIndex: i + 2,
        userID: String(r[0] ?? '').trim(),
        account: String(r[1] ?? '').trim(),
        rewardAmount: String(r[2] ?? '').trim(),
        auditMultiplier: String(r[3] ?? '').trim(),
        frontendNote: String(r[4] ?? '').trim(),
        backendNote: String(r[5] ?? '').trim(),
        doubleRewardMultiplier: String(r[6] ?? '').trim(),
        doubleAuditMultiplier: String(r[7] ?? '').trim(),
      };

      // Validate required fields
      const amt = parseFloat(row.rewardAmount);
      const mult = parseFloat(row.auditMultiplier) || 1;
      const identifier = form.accountType === 'userID' ? row.userID : row.account;

      if (!identifier) row._error = '缺少会员标识';
      else if (isNaN(amt) || amt <= 0) row._error = '奖励金额无效';
      else if (mult < 0) row._error = '稽核倍数无效';

      return row;
    });
}

// ─── Template download ───────────────────────────────────────────────────────
function handleDownloadTemplate() {
  if (!props.activity?.id) return;
  const headers = ['会员ID', '会员账号', '奖励金额(必填)', '稽核倍数(必填)', '前台备注', '后台备注', '加倍奖金奖励倍数', '加倍奖金稽核倍数'];
  const sample = ['', 'member001', '100', '1', '', '', '', ''];
  const bom = '\uFEFF';
  const csv = bom + [headers.join(','), sample.join(',')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Template_activityReward_zh.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

// ─── Submit ──────────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!props.activity?.id) return;

  let members: DistributeMember[] = [];

  if (form.addMode === 'manual') {
    if (!form.memberInput.trim()) {
      message.warning('请输入至少一个会员账号或ID');
      return;
    }
    if (!form.rewardAmount || form.rewardAmount <= 0) {
      message.warning('请输入有效的奖励金额');
      return;
    }

    const identifiers = form.memberInput
      .split(/[,，\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (identifiers.length === 0) {
      message.warning('未解析到有效的会员标识');
      return;
    }
    if (identifiers.length > 200) {
      message.warning('单次最多支持200个会员');
      return;
    }

    members = identifiers.map((id) => ({
      identifier: id,
      rewardAmount: form.rewardAmount!,
      auditMultiplier: form.auditMultiplier,
      frontendNote: form.frontendNote,
      backendNote: form.backendNote,
      doubleRewardMultiplier: form.doubleReward ? form.doubleRewardMultiplier : undefined,
      doubleAuditMultiplier: form.doubleReward ? form.doubleAuditMultiplier : undefined,
    }));
  } else {
    // Batch mode
    if (batchPreview.value.length === 0) {
      message.warning('请先上传数据文件');
      return;
    }
    const hasErrors = batchErrors.value.length > 0;
    if (hasErrors && !form.skipOnError) {
      message.warning(`有 ${batchErrors.value.length} 条数据存在错误，请修正后重新上传，或切换为"自动跳过错误"模式`);
      return;
    }

    members = batchPreview.value
      .filter((r) => !r._error)
      .map((r) => {
        const identifier = form.accountType === 'userID' ? r.userID : r.account;
        const m: DistributeMember = {
          identifier,
          rewardAmount: parseFloat(r.rewardAmount),
          auditMultiplier: parseFloat(r.auditMultiplier) || 1,
          frontendNote: r.frontendNote,
          backendNote: r.backendNote,
        };
        const parsedDoubleRewardMultiplier = parseFloat(r.doubleRewardMultiplier);
        if (!Number.isNaN(parsedDoubleRewardMultiplier) && parsedDoubleRewardMultiplier > 0) {
          m.doubleRewardMultiplier = parsedDoubleRewardMultiplier;
          m.doubleAuditMultiplier = parseFloat(r.doubleAuditMultiplier) || 1;
        }
        return m;
      });

    if (members.length === 0) {
      message.warning('没有有效的会员数据可提交');
      return;
    }
  }

  submitting.value = true;
  distributeResults.value = null;

  try {
    const result = await distributeActivityRewards(props.activity.id, {
      members,
      accountType: form.accountType,
      rewardAmount: form.rewardAmount ?? 0,
      auditMultiplier: form.auditMultiplier,
      platformScope: form.platformScope,
      selectedPlatforms: form.selectedPlatforms,
      doubleReward: form.doubleReward,
      frontendNote: form.frontendNote,
      backendNote: form.backendNote,
      skipOnError: form.skipOnError,
    });

    distributeResults.value = result;

    if (result.failCount === 0) {
      message.success(`派发成功！共 ${result.successCount} 人`);
      emit('success');
      visible.value = false;
    } else if (result.successCount > 0) {
      message.warning(`部分派发成功：成功 ${result.successCount} 人，失败 ${result.failCount} 人`);
    } else {
      message.error(`派发失败，请检查会员信息`);
    }
  } catch (err: any) {
    message.error(err?.message || '派发奖励失败，请稍后重试');
    console.error('Distribute rewards error:', err);
  } finally {
    submitting.value = false;
  }
}

function handleCancel() {
  visible.value = false;
}

function resetForm() {
  Object.assign(form, defaultForm());
  batchPreview.value = [];
  uploadedFile.value = null;
  distributeResults.value = null;
  activePlatformTab.value = 'chess_cards';
}
</script>

<style scoped>
.distribute-modal-body {
  padding: 0 4px;
}

.form-value-text {
  font-weight: 500;
  color: #333;
}

.platform-picker-item :deep(.n-form-item-label) {
  display: none;
}

.platform-loading {
  padding: 24px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.platform-picker {
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 0 12px 12px;
  background: #fafafa;
}

.platform-list {
  padding: 8px 0 0;
  min-height: 120px;
}

.platform-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.platform-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0;
}

.sub-game-link {
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
  white-space: nowrap;
}

.sub-game-link:hover {
  text-decoration: underline;
}

.upload-instructions {
  margin: 4px 0 12px;
  padding: 12px 16px;
  background: #f0f6ff;
  border-radius: 6px;
  border: 1px solid #d0e4ff;
}

.instructions-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

.upload-instructions ul {
  margin: 0;
  padding-left: 20px;
  color: #555;
  font-size: 13px;
  line-height: 1.8;
}

.template-link {
  color: #1890ff;
  cursor: pointer;
  text-decoration: underline;
}

.batch-preview {
  margin-top: 8px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 8px 12px;
}

.preview-title {
  font-size: 13px;
  margin-bottom: 6px;
  color: #555;
}

.preview-more {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: center;
}

.distribute-results {
  margin-top: 8px;
}

.failed-title {
  font-size: 13px;
  margin: 8px 0 4px;
  font-weight: 500;
  color: #d46b08;
}

.failed-list {
  margin-top: 8px;
}
</style>
