<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="$t('activity.activityList.k6d3e')"
    :style="{ width: '760px', maxWidth: '96vw' }"
    :mask-closable="false"
    :close-on-esc="false"
    @after-leave="resetForm"
  >
    <div class="distribute-modal-body">
      <!-- Activity name -->
      <n-form-item :label="$t('activity.rewardReport.k6d3b')" label-placement="left" :label-width="90">
        <span class="form-value-text">{{ activity?.title || activity?.config?.title || '—' }}</span>
      </n-form-item>

      <!-- Add mode switch -->
      <n-form-item :label="$t('activity.distributeReward.k6dfb')" label-placement="left" :label-width="90">
        <n-radio-group v-model:value="form.addMode">
          <n-radio value="manual">{{ $t('activity.distributeReward.k591a') }}</n-radio>
          <n-radio value="batch">{{ $t('activity.formModal.k6279') }}</n-radio>
        </n-radio-group>
      </n-form-item>

      <!-- Account type -->
      <n-form-item
        :label="form.addMode === 'manual' ? $t('activity.common.memberType') : $t('activity.common.accountType')"
        label-placement="left"
        :label-width="90"
      >
        <n-radio-group v-model:value="form.accountType">
          <n-radio value="account">{{ $t('activity.rewardReport.k4f1a3') }}</n-radio>
          <n-radio value="userID">{{ $t('activity.rewardReport.k4f1a2') }}</n-radio>
        </n-radio-group>
      </n-form-item>

      <!-- Manual mode: textarea + reward fields -->
      <template v-if="form.addMode === 'manual'">
        <n-form-item label="" label-placement="left" :label-width="90">
          <n-input
            v-model:value="form.memberInput"
            type="textarea"
            :placeholder="form.accountType === 'account'
              ? $t('activity.common.multiAccountHint')
              : $t('activity.common.multiIdHint')"
            :rows="4"
            :maxlength="20000"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item :label="$t('activity.common.rewardAmountLabel')" label-placement="left" :label-width="90">
          <n-input-number
            v-model:value="form.rewardAmount"
            :placeholder="$t('activity.formModal.k8bf73')"
            :min="0.01"
            :precision="2"
            style="width: 320px"
          />
        </n-form-item>

        <n-form-item :label="$t('activity.common.auditMultiplierLabel')" label-placement="left" :label-width="90">
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
      <n-form-item :label="$t('activity.distributeReward.k5956')" label-placement="left" :label-width="120">
        <n-radio-group v-model:value="form.platformScope">
          <n-radio value="all">{{ $t('activity.formModal.k4e0d4') }}</n-radio>
          <n-radio value="include">{{ $t('activity.formModal.k4ec52') }}</n-radio>
          <n-radio value="exclude">{{ $t('activity.formModal.k6392') }}</n-radio>
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
              <div v-if="platformsLoading" class="platform-loading">{{ $t('activity.distributeReward.k52a04') }}</div>
              <div v-else class="platform-list">
                <n-checkbox
                  :checked="isAllCategorySelected(cat.value)"
                  :indeterminate="isCategoryIndeterminate(cat.value)"
                  @update:checked="toggleAllCategory(cat.value, $event)"
                >{{ $t('activity.formModal.k5168') }}</n-checkbox>
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
                    <span
                      v-if="platform.subCount > 0"
                      class="sub-game-link"
                    >
                      {{ $t('activity.distributeReward.expandSubGames') }}
                    </span>
                  </div>
                </div>
                <n-empty v-if="getPlatformsByCategory(cat.value).length === 0" size="small" :description="$t('activity.distributeReward.k6682')" />
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </n-form-item>

      <!-- Double reward toggle -->
      <n-form-item :label="$t('activity.distributeReward.k52a0')" label-placement="left" :label-width="90">
        <n-switch v-model:value="form.doubleReward" />
      </n-form-item>

      <!-- Double reward fields (only when toggle is on, manual mode) -->
      <template v-if="form.doubleReward && form.addMode === 'manual'">
        <n-form-item :label="$t('activity.distributeReward.k52a02')" label-placement="left" :label-width="120">
          <n-input-number
            v-model:value="form.doubleRewardMultiplier"
            :min="1"
            :precision="2"
            style="width: 320px"
          />
        </n-form-item>
        <n-form-item :label="$t('activity.distributeReward.k52a03')" label-placement="left" :label-width="120">
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
        <n-form-item :label="$t('activity.distributeReward.k4e0a')" label-placement="left" :label-width="90">
          <n-radio-group v-model:value="form.skipOnError">
            <n-radio :value="false">{{ $t('activity.distributeReward.k4e25k6570') }}</n-radio>
            <n-radio :value="true">{{ $t('activity.distributeReward.k81eak5c42') }}</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-form-item :label="$t('activity.common.batchUploadLabel')" label-placement="left" :label-width="90">
          <n-upload
            accept=".xlsx,.xls,.csv"
            :max="1"
            :show-file-list="true"
            :custom-request="handleFileUpload"
            @change="handleUploadChange"
            @remove="() => handleFileRemove()"
          >
            <n-button type="primary">{{ $t('activity.distributeReward.k6570') }}</n-button>
          </n-upload>
        </n-form-item>

        <!-- Upload instructions -->
        <div class="upload-instructions">
          <p class="instructions-title">{{ $t('activity.distributeReward.k4f7f') }}</p>
          <ul>
            <li>{{ $t('activity.distributeReward.k5efa000000k8d85') }}</li>
            <li>{{ $t('activity.distributeReward.k4e0ak6587Xlsx') }}</li>
            <li>{{ $t('activity.distributeReward.k4e0a2') }}</li>
            <li>
              <a class="template-link" @click.prevent="handleDownloadTemplate">{{ $t('activity.distributeReward.k6a21') }}</a>
            </li>
          </ul>
        </div>

        <!-- Parsed data preview -->
        <div v-if="batchPreview.length > 0" class="batch-preview">
          <p class="preview-title">{{ $t('activity.distributeReward.k5df2') }}<b>{{ batchPreview.length }}</b>{{ $t('activity.distributeReward.k6761') }}<n-tag v-if="batchErrors.length > 0" type="error" size="small" style="margin-left:8px">
              {{ $t('activity.common.batchErrors', [batchErrors.length]) }}
            </n-tag>
          </p>
          <n-data-table
            :columns="previewColumns"
            :data="batchPreview.slice(0, 10)"
            size="small"
            :bordered="false"
            style="max-height: 200px; overflow-y: auto"
          />
          <p v-if="batchPreview.length > 10" class="preview-more">
            {{ $t('activity.distributeReward.onlyShowFirst10', [batchPreview.length]) }}
          </p>
        </div>
      </template>

      <!-- Notes (manual mode) -->
      <template v-if="form.addMode === 'manual'">
        <n-form-item :label="$t('activity.distributeReward.k524d')" label-placement="left" :label-width="90">
          <n-input
            v-model:value="form.frontendNote"
            :placeholder="$t('activity.distributeReward.k8bf7')"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item :label="$t('activity.distributeReward.k540e')" label-placement="left" :label-width="90">
          <n-input
            v-model:value="form.backendNote"
            :placeholder="$t('activity.distributeReward.k8bf72')"
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
        :title="$t('activity.common.distributeComplete', [distributeResults.successCount, distributeResults.failCount])"
        closable
        @close="distributeResults = null"
      />
      <div v-if="distributeResults.failCount > 0" class="failed-list">
        <p class="failed-title">{{ $t('activity.distributeReward.k5931') }}</p>
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
        <n-button @click="handleCancel">{{ $t('activity.activityList.k53d6') }}</n-button>
        <n-button type="primary" :loading="submitting" :disabled="submitting" @click="handleSubmit">{{ $t('activity.noviceWelfareGlobal.k786e') }}</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, h, watch } from 'vue';
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
    message.error($t('activity.distributeReward.k52a05'));
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
  { title: $t('activity.distributeReward.k884c'), key: 'rowIndex', width: 50 },
  { title: $t('activity.rewardReport.k4f1a2'), key: 'userID', width: 100 },
  { title: $t('activity.rewardReport.k4f1a3'), key: 'account', width: 120 },
  { title: $t('activity.formModal.k5956'), key: 'rewardAmount', width: 100 },
  { title: $t('activity.formModal.k7a3d2'), key: 'auditMultiplier', width: 100 },
  { title: $t('activity.distributeReward.k524d'), key: 'frontendNote', width: 100 },
  { title: $t('activity.distributeReward.k540e'), key: 'backendNote', width: 100 },
  {
    title: $t('activity.activityList.k72b6'),
    key: '_error',
    width: 120,
    render: (row: BatchRow) =>
      row._error
        ? h(NTag, { type: 'error', size: 'small' }, { default: () => row._error })
        : h(NTag, { type: 'success', size: 'small' }, { default: () => $t('activity.distributeReward.k6b63') }),
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
  { title: $t('activity.distributeReward.k4f1a'), key: 'identifier', width: 150 },
  {
    title: $t('activity.distributeReward.k7ed3'),
    key: 'error',
    render: (row: DistributeRewardsResult) =>
      h(NTag, { type: 'error', size: 'small' }, { default: () => row.error || $t('activity.common.unknownError') }),
  },
];

const submitting = ref(false);

// ─── File handling ───────────────────────────────────────────────────────────
function handleUploadChange(data: {
  file: UploadFileInfo;
  fileList: UploadFileInfo[];
}) {
  handleFileChange(data);
}

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
    message.error($t('activity.distributeReward.k4ec5XlsxXlsCsvk6587'));
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
      message.error($t('activity.distributeReward.k89e3k8bf7'));
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

      if (!identifier) row._error = $t('activity.common.missingMemberId');
      else if (isNaN(amt) || amt <= 0) row._error = $t('activity.common.invalidRewardAmount');
      else if (mult < 0) row._error = $t('activity.common.invalidAuditMultiplier');

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
      message.warning($t('activity.distributeReward.k8bf73'));
      return;
    }
    if (!form.rewardAmount || form.rewardAmount <= 0) {
      message.warning($t('activity.distributeReward.k8bf74'));
      return;
    }

    const identifiers = form.memberInput
      .split(/[,，\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (identifiers.length === 0) {
      message.warning($t('activity.distributeReward.k672a'));
      return;
    }
    if (identifiers.length > 200) {
      message.warning($t('activity.distributeReward.k5355'));
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
      message.warning($t('activity.distributeReward.k8bf75'));
      return;
    }
    const hasErrors = batchErrors.value.length > 0;
    if (hasErrors && !form.skipOnError) {
      message.warning($t('activity.common.batchErrorWarning', [batchErrors.value.length]));
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
      message.warning($t('activity.distributeReward.k6ca1'));
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
      message.success($t('activity.common.distributeAllSuccess', [result.successCount]));
      emit('success');
      visible.value = false;
    } else if (result.successCount > 0) {
      message.warning($t('activity.common.distributePartial', [result.successCount, result.failCount]));
    } else {
      message.error($t('activity.common.distributeFailed'));
    }
  } catch (err: any) {
    message.error(err?.message || $t('activity.labels.distributeFailed'));
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
