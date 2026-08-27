<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="
      readOnly
        ? $t('activity.common.readOnlyDetail')
        : createMode
          ? $t('activity.luckyWheelEdit.k6dfb')
          : $t('activity.common.readOnlyModify')
    "
    class="lucky-wheel-edit-modal"
    :style="{ width: '1180px', maxWidth: '96vw' }"
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
          :label-width="156"
          label-align="right"
          require-mark-placement="right-hanging"
          size="medium"
        >
          <n-form-item :label="$t('activity.luckyWheel.k5e01')" required>
            <n-input
              v-if="createMode && !readOnly"
              v-model:value="form.currency"
              :placeholder="'BRL'"
              class="lw-input-compact"
            />
            <span v-else class="lw-readonly-text">{{ form.currency || '—' }}</span>
          </n-form-item>

          <n-form-item :label="$t('activity.luckyWheelEdit.k8f6c')">
            <span class="lw-readonly-text">{{ wheelTypeText }}</span>
          </n-form-item>

          <n-form-item :label="$t('activity.luckyWheelEdit.k8d452')" required>
            <n-space :size="8" align="center">
              <n-date-picker
                v-model:value="form.startsAt"
                type="datetime"
                :disabled="readOnly"
                :placeholder="$t('activity.detailModal.k6d3b5')"
                class="lw-input-date"
                clearable
              />
              <span class="lw-hint">-</span>
              <n-date-picker
                v-model:value="form.endsAt"
                type="datetime"
                :disabled="readOnly"
                :placeholder="$t('activity.detailModal.k6d3b6')"
                class="lw-input-date"
                clearable
              />
            </n-space>
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
            <div class="lw-hint lw-mt">{{ $t('activity.luckyWheelEdit.k8d447') }}</div>
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

          <div class="lw-asset-section" :class="{ 'lw-asset-section--readonly': readOnly }">
            <div class="lw-prize-section__title lw-asset-section__title">
              {{ $t('activity.luckyWheelEdit.k8d44') }}
            </div>

            <div class="lw-asset-group">
              <div class="lw-asset-group__title">{{ $t('activity.luckyWheelEdit.assetGroupWheel') }}</div>
              <div class="lw-asset-grid">
                <n-form-item :label="$t('activity.luckyWheelEdit.k8d442')" label-placement="top">
                  <MediaLibrarySelector
                    v-model="form.bannerAssetUrl"
                    category="promotion"
                    :accept-types="['image']"
                    :placeholder="$t('activity.luckyWheelEdit.k8d446')"
                  />
                </n-form-item>
                <n-form-item :label="$t('activity.luckyWheelEdit.k8d443')" label-placement="top">
                  <MediaLibrarySelector
                    v-model="form.wheelAssetUrl"
                    category="promotion"
                    :accept-types="['image']"
                    :placeholder="$t('activity.luckyWheelEdit.k8d446')"
                  />
                </n-form-item>
                <n-form-item :label="$t('activity.luckyWheelEdit.spinAsset')" label-placement="top">
                  <MediaLibrarySelector
                    v-model="form.spinAssetUrl"
                    category="promotion"
                    :accept-types="['image']"
                    :placeholder="$t('activity.luckyWheelEdit.k8d446')"
                  />
                </n-form-item>
                <n-form-item :label="$t('activity.luckyWheelEdit.frameAsset')" label-placement="top">
                  <MediaLibrarySelector
                    v-model="form.frameAssetUrl"
                    category="promotion"
                    :accept-types="['image']"
                    :placeholder="$t('activity.luckyWheelEdit.k8d446')"
                  />
                </n-form-item>
                <n-form-item :label="$t('activity.luckyWheelEdit.k8d444')" label-placement="top">
                  <MediaLibrarySelector
                    v-model="form.pointerAssetUrl"
                    category="promotion"
                    :accept-types="['image']"
                    :placeholder="$t('activity.luckyWheelEdit.k8d446')"
                  />
                </n-form-item>
              </div>
            </div>

            <div class="lw-asset-group">
              <div class="lw-asset-group__title">{{ $t('activity.luckyWheelEdit.assetGroupWin') }}</div>
              <div class="lw-asset-grid">
                <n-form-item :label="$t('activity.luckyWheelEdit.winEffectAsset')" label-placement="top">
                  <MediaLibrarySelector
                    v-model="form.winEffectAssetUrl"
                    category="promotion"
                    :accept-types="['image']"
                    :placeholder="$t('activity.luckyWheelEdit.k8d446')"
                  />
                </n-form-item>
                <n-form-item :label="$t('activity.luckyWheelEdit.modalTopAsset')" label-placement="top">
                  <MediaLibrarySelector
                    v-model="form.modalTopAssetUrl"
                    category="promotion"
                    :accept-types="['image']"
                    :placeholder="$t('activity.luckyWheelEdit.k8d446')"
                  />
                </n-form-item>
                <n-form-item :label="$t('activity.luckyWheelEdit.modalBottomAsset')" label-placement="top">
                  <MediaLibrarySelector
                    v-model="form.modalBottomAssetUrl"
                    category="promotion"
                    :accept-types="['image']"
                    :placeholder="$t('activity.luckyWheelEdit.k8d446')"
                  />
                </n-form-item>
              </div>
            </div>
          </div>

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
              :scroll-x="980"
            />

            <div v-if="!readOnly" class="lw-prize-section__footer">
              <n-button type="primary" size="small" @click="handleGenerateProbabilities">{{ $t('activity.luckyWheelEdit.k751f') }}</n-button>
            </div>
          </div>

          <n-form-item :label="$t('activity.luckyWheelEdit.k5927')" class="lw-mt">
            <n-space align="center" :size="8" wrap>
              <n-switch
                v-model:value="form.grandPrizeAnnouncement"
                :disabled="readOnly"
              />
              <span class="lw-hint">{{ $t('activity.luckyWheelEdit.announceMin') }}</span>
              <n-input-number
                v-model:value="form.grandPrizeAnnouncementThreshold"
                :min="0"
                :precision="2"
                :show-button="false"
                :disabled="readOnly || !form.grandPrizeAnnouncement"
                class="lw-input-compact"
              />
            </n-space>
          </n-form-item>

          <n-form-item :label="$t('activity.luckyWheelEdit.k7206')">
            <n-space align="center" :size="8" wrap>
              <n-switch
                v-model:value="form.screenBurstNotification"
                :disabled="readOnly"
              />
              <span class="lw-hint">{{ $t('activity.luckyWheelEdit.announceMin') }}</span>
              <n-input-number
                v-model:value="form.screenBurstNotificationThreshold"
                :min="0"
                :precision="2"
                :show-button="false"
                :disabled="readOnly || !form.screenBurstNotification"
                class="lw-input-compact"
              />
            </n-space>
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
  NSpace,
  NDatePicker,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import { createLuckyWheelItemApi, putLuckyWheelItemApi } from '#/api/core/lucky-wheel-admin';
import MediaLibrarySelector from '#/components/MediaLibrarySelector.vue';
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
  createMode?: boolean;
  defaultCurrency?: string;
}>();

const emit = defineEmits<{
  saved: [wheel: LuckyWheelItem];
}>();

const visible = defineModel<boolean>('show', { default: false });
const message = useMessage();
const saving = ref(false);

const readOnly = computed(() => Boolean(props.readOnly));
const createMode = computed(() => Boolean(props.createMode));
const prizeCountOptions = LUCKY_WHEEL_PRIZE_COUNT_OPTIONS;

const prizeTypeOptions = [
  { label: $t('activity.luckyWheelEdit.k56fa'), value: 'fixed_bonus' },
  { label: $t('activity.luckyWheelEdit.randomBonus'), value: 'random_bonus' },
  { label: $t('activity.luckyWheelEdit.k5b9e'), value: 'physical' },
  { label: $t('activity.luckyWheelEdit.k8c22'), value: 'none' },
  { label: $t('activity.luckyWheelEdit.displayOnly'), value: 'display_only' },
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
  grandPrizeAnnouncementThreshold: null as number | null,
  screenBurstNotification: false,
  screenBurstNotificationThreshold: null as number | null,
  bannerAssetUrl: '',
  wheelAssetUrl: '',
  frameAssetUrl: '',
  pointerAssetUrl: '',
  modalTopAssetUrl: '',
  modalBottomAssetUrl: '',
  spinAssetUrl: '',
  winEffectAssetUrl: '',
  startsAt: null as number | null,
  endsAt: null as number | null,
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
              if (v === 'display_only' || v === 'none') {
                row.reward = null;
                row.randomMin = null;
                row.randomMax = null;
              }
              if (v === 'display_only') {
                row.realProbability = 0;
              }
            },
          }),
  },
  {
    title: $t('activity.luckyWheelEdit.k59564'),
    key: 'reward',
    width: 220,
    render: (row) => {
      if (readOnly.value) {
        if (row.prizeType === 'random_bonus') {
          return `${row.randomMin ?? '—'} ~ ${row.randomMax ?? '—'}`;
        }
        if (row.prizeType === 'physical') {
          return row.physicalName || row.reward || '—';
        }
        if (row.prizeType === 'none' || row.prizeType === 'display_only') return '—';
        return row.reward ?? '—';
      }
      if (row.prizeType === 'random_bonus') {
        return h(NSpace, { align: 'center', size: 4 }, () => [
          h(NInputNumber, {
            value: row.randomMin ?? null,
            size: 'small',
            min: 0,
            precision: 2,
            showButton: false,
            style: { width: '88px' },
            onUpdateValue: (v: number | null) => {
              row.randomMin = v;
            },
          }),
          h('span', { class: 'lw-hint' }, '~'),
          h(NInputNumber, {
            value: row.randomMax ?? null,
            size: 'small',
            min: 0,
            precision: 2,
            showButton: false,
            style: { width: '88px' },
            onUpdateValue: (v: number | null) => {
              row.randomMax = v;
            },
          }),
        ]);
      }
      if (row.prizeType === 'physical') {
        return h(NSpace, { vertical: true, size: 4 }, () => [
          h(NInput, {
            value: row.physicalName ?? '',
            size: 'small',
            placeholder: $t('activity.luckyWheelEdit.k5b9e'),
            onUpdateValue: (v: string) => {
              row.physicalName = v;
            },
          }),
          h(NInputNumber, {
            value: row.reward,
            size: 'small',
            min: 0,
            precision: 2,
            showButton: false,
            placeholder: $t('activity.luckyWheelEdit.k771f'),
            onUpdateValue: (v: number | null) => {
              row.reward = v;
            },
          }),
        ]);
      }
      if (row.prizeType === 'none' || row.prizeType === 'display_only') {
        return h('span', { class: 'lw-hint' }, '—');
      }
      return h(NInputNumber, {
        value: row.reward,
        size: 'small',
        min: 0,
        precision: 2,
        showButton: false,
        onUpdateValue: (v: number | null) => {
          row.reward = v;
        },
      });
    },
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
    width: 220,
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
      return h('div', { class: 'lw-prize-icon-cell' }, [
        h(MediaLibrarySelector, {
          modelValue: row.iconUrl || '',
          category: 'promotion',
          acceptTypes: ['image'],
          placeholder: $t('activity.luckyWheelEdit.k8d446'),
          'onUpdate:modelValue': (url: string) => {
            row.iconUrl = url || null;
          },
        }),
      ]);
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
  form.grandPrizeAnnouncementThreshold = w.grandPrizeAnnouncementThreshold;
  form.screenBurstNotification = w.screenBurstNotification;
  form.screenBurstNotificationThreshold = w.screenBurstNotificationThreshold;
  form.bannerAssetUrl = w.bannerAssetUrl ?? '';
  form.wheelAssetUrl = w.wheelAssetUrl ?? '';
  form.frameAssetUrl = w.frameAssetUrl ?? '';
  form.pointerAssetUrl = w.pointerAssetUrl ?? '';
  form.modalTopAssetUrl = w.modalTopAssetUrl ?? '';
  form.modalBottomAssetUrl = w.modalBottomAssetUrl ?? '';
  form.spinAssetUrl = w.spinAssetUrl ?? '';
  form.winEffectAssetUrl = w.winEffectAssetUrl ?? '';
  form.startsAt = w.startsAt ? Date.parse(w.startsAt) : null;
  form.endsAt = w.endsAt ? Date.parse(w.endsAt) : null;
}

function applyCreateDefaults() {
  const now = Date.now();
  form.id = '';
  form.currency = props.defaultCurrency || 'BRL';
  form.nameMode = 'custom';
  form.name = '';
  form.wheelType = 'custom';
  form.luckyValueCost = 10;
  form.showProbabilityAndCost = 'show';
  form.realCost = null;
  form.displayCost = null;
  form.enabled = true;
  form.prizeCount = 8;
  form.prizes = createPrizeSlots(8);
  form.grandPrizeAnnouncement = false;
  form.grandPrizeAnnouncementThreshold = null;
  form.screenBurstNotification = false;
  form.screenBurstNotificationThreshold = null;
  form.bannerAssetUrl = '';
  form.wheelAssetUrl = '';
  form.frameAssetUrl = '';
  form.pointerAssetUrl = '';
  form.modalTopAssetUrl = '';
  form.modalBottomAssetUrl = '';
  form.spinAssetUrl = '';
  form.winEffectAssetUrl = '';
  form.startsAt = now;
  form.endsAt = now + 7 * 24 * 60 * 60 * 1000;
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
  if (!form.prizes.some((p) => p.prizeType !== 'display_only')) {
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

watch(
  () => form.nameMode,
  (mode) => {
    if (mode === 'system') {
      form.name = wheelTypeText.value;
    }
  },
);

watch(visible, (v) => {
  if (!v) return;
  if (createMode.value) {
    applyCreateDefaults();
    return;
  }
  if (props.wheel) applyWheel(props.wheel);
});

watch(
  () => props.wheel,
  (w) => {
    if (visible.value && !createMode.value && w) applyWheel(w);
  },
);

function toIsoOrNull(value: number | null): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  return new Date(value).toISOString();
}

async function handleSave() {
  if (readOnly.value) return;
  if ((createMode.value || form.nameMode === 'custom') && !form.name.trim()) {
    message.warning($t('activity.luckyWheelEdit.k8bf74'));
    return;
  }
  if (!form.luckyValueCost || form.luckyValueCost < 1) {
    message.warning($t('activity.luckyWheelEdit.k8bf75'));
    return;
  }
  if (createMode.value && (!form.startsAt || !form.endsAt)) {
    message.warning($t('activity.luckyWheelEdit.k8bf76'));
    return;
  }
  if (form.startsAt && form.endsAt && form.endsAt < form.startsAt) {
    message.warning($t('activity.luckyWheelEdit.k8bf77'));
    return;
  }
  saving.value = true;
  try {
    const payload = {
      currency: form.currency.trim() || 'BRL',
      wheelType: form.wheelType,
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
      grandPrizeAnnouncementThreshold: form.grandPrizeAnnouncementThreshold,
      screenBurstNotification: form.screenBurstNotification,
      screenBurstNotificationThreshold: form.screenBurstNotificationThreshold,
      bannerAssetUrl: form.bannerAssetUrl.trim() || null,
      wheelAssetUrl: form.wheelAssetUrl.trim() || null,
      frameAssetUrl: form.frameAssetUrl.trim() || null,
      pointerAssetUrl: form.pointerAssetUrl.trim() || null,
      modalTopAssetUrl: form.modalTopAssetUrl.trim() || null,
      modalBottomAssetUrl: form.modalBottomAssetUrl.trim() || null,
      spinAssetUrl: form.spinAssetUrl.trim() || null,
      winEffectAssetUrl: form.winEffectAssetUrl.trim() || null,
      startsAt: toIsoOrNull(form.startsAt),
      endsAt: toIsoOrNull(form.endsAt),
    };
    const saved = createMode.value
      ? await createLuckyWheelItemApi(payload)
      : await putLuckyWheelItemApi(form.id, payload);
    const normalized = normalizeLuckyWheelItem(saved) ?? {
      ...(props.wheel ?? ({} as LuckyWheelItem)),
      ...payload,
      id: saved.id,
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
  padding: 24px 28px 16px;
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
  width: 420px;
  max-width: 100%;
}
.lw-input-compact {
  width: 160px;
}
.lw-input-date {
  width: 220px;
  max-width: 100%;
}
.lw-prize-section {
  margin: 12px 0 20px;
  padding-left: 0;
}
.lw-asset-section {
  margin: 4px 0 20px;
}
.lw-asset-section__title {
  margin-bottom: 12px;
}
.lw-asset-group {
  margin-bottom: 12px;
  padding: 12px 14px 4px;
  border: 1px solid rgb(229 231 235);
  border-radius: 10px;
  background: rgb(249 250 251);
}
.lw-asset-group:last-child {
  margin-bottom: 0;
}
.lw-asset-group__title {
  font-size: 13px;
  font-weight: 600;
  color: rgb(55 65 81);
  margin-bottom: 8px;
}
.lw-asset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 20px;
}
.lw-asset-section--readonly :deep(.file-actions),
.lw-asset-section--readonly :deep(.upload-area) {
  pointer-events: none;
}
.lw-asset-section--readonly :deep(.file-actions) {
  display: none;
}
.lw-prize-section__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
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
  margin-top: 12px;
}
.lucky-wheel-edit-modal :deep(.n-form-item) {
  margin-bottom: 18px;
}
.lucky-wheel-edit-modal :deep(.n-form-item-label) {
  padding-right: 18px;
}
.lucky-wheel-edit-modal :deep(.n-data-table-wrapper) {
  border-radius: 10px;
}
:deep(.lw-prize-icon-cell) {
  min-width: 180px;
}
:deep(.lw-prize-icon-cell .upload-area) {
  min-height: 56px;
  padding: 8px;
}
:deep(.lw-prize-icon-cell .upload-icon) {
  font-size: 18px;
}
:deep(.lw-prize-icon-cell .upload-text) {
  font-size: 12px;
}
:deep(.lw-prize-icon-cell .file-preview) {
  width: 48px;
  height: 48px;
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
