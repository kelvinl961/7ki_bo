<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="readOnly ? $t('activity.common.readOnlyDetail') : $t('activity.common.readOnlyModify')"
    class="lucky-wheel-edit-modal"
    :style="{ width: '920px', maxWidth: '98vw' }"
    :bordered="false"
    :mask-closable="readOnly"
    :segmented="{ content: true, footer: 'soft' }"
    :content-style="{ padding: '0' }"
  >
    <n-scrollbar style="max-height: min(76vh, 780px)">
      <div class="lw-edit-inner">
        <n-form
          :model="form"
          label-placement="left"
          :label-width="168"
          label-align="right"
          require-mark-placement="right-hanging"
          size="medium"
        >
          <n-form-item :label="$t('activity.luckyWheel.k5e01')">
            <span class="lw-readonly-text">{{ form.currency || '—' }}</span>
          </n-form-item>

          <n-form-item :label="$t('activity.luckyWheelEdit.k8f6c')">
            <span class="lw-readonly-text">{{ wheelTypeText }}</span>
          </n-form-item>

          <n-form-item :label="$t('activity.luckyWheelEdit.k8f6c2')">
            <n-switch v-model:value="form.enabled" :disabled="readOnly" />
          </n-form-item>

          <n-form-item :label="$t('activity.luckyWheelEdit.k8f6c3')" required>
            <n-space vertical :size="10">
              <n-radio-group
                v-model:value="form.nameMode"
                :disabled="readOnly"
                class="lw-radio-row"
              >
                <n-radio value="system">{{ $t('activity.formModal.k7cfb') }}</n-radio>
                <n-radio value="custom">{{ $t('activity.detailModal.k81ea') }}</n-radio>
              </n-radio-group>
              <n-input
                v-model:value="form.name"
                :disabled="readOnly || form.nameMode === 'system'"
                :placeholder="wheelTypeText"
                class="lw-input-name"
              />
            </n-space>
          </n-form-item>

          <n-form-item :label="$t('activity.luckyWheelEdit.k6d88')" required>
            <n-space align="center" :size="8">
              <n-input-number
                v-model:value="form.luckyValueCost"
                :min="1"
                :precision="0"
                :show-button="false"
                :disabled="readOnly"
                class="lw-input-compact"
              />
              <span class="lw-hint">{{ $t('activity.luckyWheelEdit.k5e78k6b21') }}</span>
            </n-space>
          </n-form-item>

          <n-form-item :label="$t('activity.luckyWheelEdit.k771f')" required>
            <n-space align="center" :size="8" wrap>
              <n-input-number
                v-model:value="form.realCost"
                :min="0"
                :precision="2"
                :show-button="false"
                :disabled="readOnly"
                class="lw-input-compact"
              />
              <span class="lw-hint">{{ $t('activity.common.perTime') }}</span>
              <n-button
                v-if="!readOnly"
                type="primary"
                size="small"
                @click="handleCalcRealCost"
              >{{ $t('activity.luckyWheelEdit.k8ba1') }}</n-button>
            </n-space>
          </n-form-item>

          <n-form-item :label="$t('activity.luckyWheelEdit.k5c55')" required>
            <n-space align="center" :size="8" wrap>
              <n-input-number
                v-model:value="form.displayCost"
                :min="0"
                :precision="2"
                :show-button="false"
                :disabled="readOnly"
                class="lw-input-compact"
              />
              <span class="lw-hint">{{ $t('activity.common.perTime') }}</span>
              <n-button
                v-if="!readOnly"
                type="primary"
                size="small"
                @click="handleCalcDisplayCost"
              >{{ $t('activity.luckyWheelEdit.k8ba12') }}</n-button>
            </n-space>
          </n-form-item>

          <n-form-item :label="$t('activity.luckyWheelEdit.k5956')" required>
            <n-radio-group
              v-model:value="form.prizeCount"
              :disabled="readOnly"
              class="lw-radio-row"
              @update:value="onPrizeCountChange"
            >
              <n-radio
                v-for="n in prizeCountOptions"
                :key="n"
                :value="n"
              >
                {{ n }}
              </n-radio>
            </n-radio-group>
          </n-form-item>

          <n-form-item :label="$t('activity.luckyWheelEdit.k662f')" required>
            <n-radio-group
              v-model:value="form.showProbabilityAndCost"
              :disabled="readOnly"
              class="lw-radio-row"
            >
              <n-radio value="show">{{ $t('activity.formModal.k5c5511') }}</n-radio>
              <n-radio value="hide">{{ $t('activity.formModal.k4e0d5') }}</n-radio>
            </n-radio-group>
          </n-form-item>

          <div class="lw-prize-section">
            <div class="lw-prize-section__toolbar">
              <span class="lw-prize-section__title">{{ $t('activity.luckyWheelEdit.k59562') }}</span>
              <n-button
                v-if="!readOnly"
                type="primary"
                size="small"
                @click="handleGenerateProbabilities"
              >{{ $t('activity.luckyWheelEdit.k751f') }}</n-button>
            </div>

            <n-data-table
              :columns="prizeColumns"
              :data="form.prizes"
              :bordered="true"
              size="small"
              :scroll-x="860"
            />

            <div v-if="!readOnly" class="lw-prize-section__footer">
              <n-button type="primary" size="small" @click="handleGenerateProbabilities">{{ $t('activity.luckyWheelEdit.k751f') }}</n-button>
            </div>
          </div>

          <n-form-item :label="$t('activity.luckyWheelEdit.k5927')" class="lw-mt">
            <n-switch
              v-model:value="form.grandPrizeAnnouncement"
              :disabled="readOnly"
            />
          </n-form-item>

          <n-form-item :label="$t('activity.luckyWheelEdit.k7206')">
            <n-switch
              v-model:value="form.screenBurstNotification"
              :disabled="readOnly"
            />
          </n-form-item>
        </n-form>
      </div>
    </n-scrollbar>

    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button @click="visible = false">{{ readOnly ? $t('activity.common.readOnlyClose') : $t('activity.common.readOnlyCancel') }}</n-button>
        <n-button
          v-if="!readOnly"
          type="primary"
          :loading="saving"
          @click="handleSave"
        >{{ $t('activity.luckyWheelEdit.k4fdd') }}</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { computed, h, reactive, ref, watch } from 'vue';
import {
  NModal,
  NScrollbar,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NButton,
  NDataTable,
  NSwitch,
  NSelect,
  NUpload,
  NSpace,
  useMessage,
  type DataTableColumns,
  type UploadFileInfo,
} from 'naive-ui';
import { putLuckyWheelItemApi } from '#/api/core/lucky-wheel-admin';
import {
  LUCKY_WHEEL_PRIZE_COUNT_OPTIONS,
  type LuckyWheelItem,
  type LuckyWheelPrizeItem,
  type LuckyWheelPrizeType,
  calcWheelDisplayCost,
  calcWheelRealCost,
  createPrizeSlots,
  generateWheelProbabilities,
  normalizeLuckyWheelItem,
  wheelTypeLabel,
} from './luckyWheelTypes';

const props = defineProps<{
  wheel: LuckyWheelItem | null;
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  saved: [wheel: LuckyWheelItem];
}>();

const visible = defineModel<boolean>('show', { default: false });
const message = useMessage();
const saving = ref(false);

const readOnly = computed(() => Boolean(props.readOnly));
const prizeCountOptions = LUCKY_WHEEL_PRIZE_COUNT_OPTIONS;

const prizeTypeOptions = [
  { label: $t('activity.luckyWheelEdit.k56fa'), value: 'fixed_bonus' },
  { label: $t('activity.luckyWheelEdit.k5b9e'), value: 'physical' },
  { label: $t('activity.rewardReport.k5e782'), value: 'lucky_value' },
  { label: $t('activity.luckyWheelEdit.k8c22'), value: 'none' },
];

const form = reactive({
  id: '',
  currency: '',
  name: '',
  nameMode: 'system' as 'system' | 'custom',
  wheelType: 'silver' as LuckyWheelItem['wheelType'],
  luckyValueCost: null as number | null,
  showProbabilityAndCost: 'show' as 'show' | 'hide',
  realCost: null as number | null,
  displayCost: null as number | null,
  enabled: false,
  prizeCount: 4,
  prizes: [] as LuckyWheelPrizeItem[],
  grandPrizeAnnouncement: false,
  screenBurstNotification: false,
});

const wheelTypeText = computed(() =>
  form.wheelType ? wheelTypeLabel(form.wheelType) : '—',
);

const prizeColumns = computed<DataTableColumns<LuckyWheelPrizeItem>>(() => [
  {
    title: $t('activity.luckyWheelEdit.k59563'),
    key: 'index',
    width: 56,
    render: (_, index) => index + 1,
  },
  {
    title: $t('activity.formModal.k7c7b'),
    key: 'prizeType',
    width: 120,
    render: (row) =>
      readOnly.value
        ? prizeTypeOptions.find((o) => o.value === row.prizeType)?.label ?? '—'
        : h(NSelect, {
            value: row.prizeType,
            size: 'small',
            options: prizeTypeOptions,
            onUpdateValue: (v: LuckyWheelPrizeType) => {
              row.prizeType = v;
            },
          }),
  },
  {
    title: $t('activity.luckyWheelEdit.k59564'),
    key: 'reward',
    width: 110,
    render: (row) =>
      readOnly.value
        ? (row.reward ?? '—')
        : h(NInputNumber, {
            value: row.reward,
            size: 'small',
            min: 0,
            precision: 2,
            showButton: false,
            onUpdateValue: (v: number | null) => {
              row.reward = v;
            },
          }),
  },
  {
    title: $t('activity.luckyWheelEdit.k771f2'),
    key: 'realProbability',
    width: 150,
    render: (row) =>
      readOnly.value
        ? formatPercent(row.realProbability)
        : h(NSpace, { align: 'center', size: 4 }, () => [
            h(NInputNumber, {
              value: row.realProbability,
              size: 'small',
              min: 0,
              max: 100,
              precision: 6,
              showButton: false,
              style: { width: '110px' },
              onUpdateValue: (v: number | null) => {
                row.realProbability = v;
              },
            }),
            h('span', { class: 'lw-hint' }, '%'),
          ]),
  },
  {
    title: $t('activity.luckyWheelEdit.k5c552'),
    key: 'displayProbability',
    width: 150,
    render: (row) =>
      readOnly.value
        ? formatPercent(row.displayProbability)
        : h(NSpace, { align: 'center', size: 4 }, () => [
            h(NInputNumber, {
              value: row.displayProbability,
              size: 'small',
              min: 0,
              max: 100,
              precision: 6,
              showButton: false,
              style: { width: '110px' },
              onUpdateValue: (v: number | null) => {
                row.displayProbability = v;
              },
            }),
            h('span', { class: 'lw-hint' }, '%'),
          ]),
  },
  {
    title: $t('activity.luckyWheelEdit.k59565'),
    key: 'iconUrl',
    width: 100,
    render: (row) => {
      if (readOnly.value) {
        return row.iconUrl
          ? h('img', {
              src: row.iconUrl,
              class: 'lw-prize-icon',
              alt: 'icon',
            })
          : '—';
      }
      return h(
        NUpload,
        {
          accept: 'image/*',
          max: 1,
          showFileList: false,
          onChange: ({ file }: { file: UploadFileInfo }) =>
            handleIconUpload(row, file),
        },
        {
          default: () =>
            row.iconUrl
              ? h('div', { class: 'lw-prize-icon-wrap' }, [
                  h('img', { src: row.iconUrl, class: 'lw-prize-icon', alt: 'icon' }),
                ])
              : h('div', { class: 'lw-prize-icon-placeholder' }, '+'),
        },
      );
    },
  },
]);

function formatPercent(v: number | null) {
  if (v === null || v === undefined) return '—';
  return `${v}%`;
}

function applyWheel(w: LuckyWheelItem) {
  form.id = w.id;
  form.currency = w.currency;
  form.nameMode = w.nameMode;
  form.name = w.nameMode === 'system' ? wheelTypeLabel(w.wheelType) : w.name;
  form.wheelType = w.wheelType;
  form.luckyValueCost = w.luckyValueCost;
  form.showProbabilityAndCost = w.showProbabilityAndCost;
  form.realCost = w.realCost;
  form.displayCost = w.displayCost;
  form.enabled = w.enabled;
  form.prizeCount = w.prizeCount || w.prizes.length || 4;
  form.prizes = w.prizes?.length
    ? JSON.parse(JSON.stringify(w.prizes))
    : createPrizeSlots(form.prizeCount);
  form.grandPrizeAnnouncement = w.grandPrizeAnnouncement;
  form.screenBurstNotification = w.screenBurstNotification;
}

function onPrizeCountChange(count: number) {
  const current = [...form.prizes];
  if (count > current.length) {
    form.prizes = [
      ...current,
      ...createPrizeSlots(count - current.length).map((p, i) => ({
        ...p,
        id: `prize-${current.length + i + 1}`,
      })),
    ];
  } else {
    form.prizes = current.slice(0, count);
  }
}

function handleGenerateProbabilities() {
  if (!form.prizes.some((p) => p.reward != null && p.reward > 0)) {
    message.warning($t('activity.luckyWheelEdit.k8bf7'));
    return;
  }
  form.prizes = generateWheelProbabilities(form.prizes);
  message.success($t('activity.luckyWheelEdit.k5df2'));
}

function handleCalcRealCost() {
  if (!form.prizes.some((p) => p.realProbability != null)) {
    message.warning($t('activity.luckyWheelEdit.k8bf72'));
    return;
  }
  form.realCost = calcWheelRealCost(form.prizes);
}

function handleCalcDisplayCost() {
  if (!form.prizes.some((p) => p.displayProbability != null)) {
    message.warning($t('activity.luckyWheelEdit.k8bf73'));
    return;
  }
  form.displayCost = calcWheelDisplayCost(form.prizes);
}

function handleIconUpload(row: LuckyWheelPrizeItem, file: UploadFileInfo) {
  const raw = file.file;
  if (!raw) return;
  const reader = new FileReader();
  reader.onload = () => {
    row.iconUrl = typeof reader.result === 'string' ? reader.result : null;
  };
  reader.readAsDataURL(raw);
}

watch(
  () => form.nameMode,
  (mode) => {
    if (mode === 'system') {
      form.name = wheelTypeText.value;
    }
  },
);

watch(visible, (v) => {
  if (v && props.wheel) applyWheel(props.wheel);
});

watch(
  () => props.wheel,
  (w) => {
    if (visible.value && w) applyWheel(w);
  },
);

async function handleSave() {
  if (readOnly.value) return;
  if (form.nameMode === 'custom' && !form.name.trim()) {
    message.warning($t('activity.luckyWheelEdit.k8bf74'));
    return;
  }
  if (!form.luckyValueCost || form.luckyValueCost < 1) {
    message.warning($t('activity.luckyWheelEdit.k8bf75'));
    return;
  }
  saving.value = true;
  try {
    const payload = {
      name: form.nameMode === 'system' ? wheelTypeText.value : form.name.trim(),
      nameMode: form.nameMode,
      enabled: form.enabled,
      luckyValueCost: form.luckyValueCost,
      showProbabilityAndCost: form.showProbabilityAndCost,
      realCost: form.realCost,
      displayCost: form.displayCost,
      prizeCount: form.prizeCount,
      prizes: form.prizes,
      grandPrizeAnnouncement: form.grandPrizeAnnouncement,
      screenBurstNotification: form.screenBurstNotification,
    };
    const updated = await putLuckyWheelItemApi(form.id, payload);
    const normalized = normalizeLuckyWheelItem(updated) ?? {
      ...props.wheel!,
      ...payload,
    };
    emit('saved', normalized);
    message.success($t('activity.luckyWheelEdit.k4fdd2'));
    visible.value = false;
  } catch (e) {
    console.error(e);
    message.error($t('activity.luckyWheelEdit.k4fdd3'));
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.lw-edit-inner {
  padding: 20px 24px 12px;
}
.lw-readonly-text {
  font-size: 14px;
  color: rgb(55 65 81);
}
.lw-hint {
  font-size: 13px;
  color: rgb(107 114 128);
}
.lw-radio-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.lw-input-name {
  max-width: 320px;
}
.lw-input-compact {
  width: 140px;
}
.lw-prize-section {
  margin: 8px 0 16px;
  padding-left: 168px;
}
.lw-prize-section__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.lw-prize-section__title {
  font-size: 14px;
  font-weight: 500;
  color: rgb(55 65 81);
}
.lw-prize-section__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.lw-mt {
  margin-top: 8px;
}
:deep(.lw-prize-icon-wrap),
:deep(.lw-prize-icon-placeholder) {
  width: 48px;
  height: 48px;
  border: 1px dashed rgb(209 213 219);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  background: rgb(249 250 251);
  color: rgb(156 163 175);
  font-size: 20px;
}
:deep(.lw-prize-icon) {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
}
.lucky-wheel-edit-modal :deep(.n-card-header) {
  padding: 16px 20px 12px;
  font-size: 17px;
  font-weight: 600;
}
</style>
