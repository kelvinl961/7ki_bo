<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="readOnly ? '详情' : '修改'"
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
          <n-form-item label="币种">
            <span class="lw-readonly-text">{{ form.currency || '—' }}</span>
          </n-form-item>

          <n-form-item label="转盘类型">
            <span class="lw-readonly-text">{{ wheelTypeText }}</span>
          </n-form-item>

          <n-form-item label="转盘开关">
            <n-switch v-model:value="form.enabled" :disabled="readOnly" />
          </n-form-item>

          <n-form-item label="转盘名称" required>
            <n-space vertical :size="10">
              <n-radio-group
                v-model:value="form.nameMode"
                :disabled="readOnly"
                class="lw-radio-row"
              >
                <n-radio value="system">系统自带</n-radio>
                <n-radio value="custom">自定义</n-radio>
              </n-radio-group>
              <n-input
                v-model:value="form.name"
                :disabled="readOnly || form.nameMode === 'system'"
                :placeholder="wheelTypeText"
                class="lw-input-name"
              />
            </n-space>
          </n-form-item>

          <n-form-item label="消耗幸运值" required>
            <n-space align="center" :size="8">
              <n-input-number
                v-model:value="form.luckyValueCost"
                :min="1"
                :precision="0"
                :show-button="false"
                :disabled="readOnly"
                class="lw-input-compact"
              />
              <span class="lw-hint">幸运值/次</span>
            </n-space>
          </n-form-item>

          <n-form-item label="真实成本" required>
            <n-space align="center" :size="8" wrap>
              <n-input-number
                v-model:value="form.realCost"
                :min="0"
                :precision="2"
                :show-button="false"
                :disabled="readOnly"
                class="lw-input-compact"
              />
              <span class="lw-hint">/次</span>
              <n-button
                v-if="!readOnly"
                type="primary"
                size="small"
                @click="handleCalcRealCost"
              >
                计算真实成本
              </n-button>
            </n-space>
          </n-form-item>

          <n-form-item label="展示成本" required>
            <n-space align="center" :size="8" wrap>
              <n-input-number
                v-model:value="form.displayCost"
                :min="0"
                :precision="2"
                :show-button="false"
                :disabled="readOnly"
                class="lw-input-compact"
              />
              <span class="lw-hint">/次</span>
              <n-button
                v-if="!readOnly"
                type="primary"
                size="small"
                @click="handleCalcDisplayCost"
              >
                计算展示成本
              </n-button>
            </n-space>
          </n-form-item>

          <n-form-item label="奖项数量" required>
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

          <n-form-item label="是否公开概率和成本" required>
            <n-radio-group
              v-model:value="form.showProbabilityAndCost"
              :disabled="readOnly"
              class="lw-radio-row"
            >
              <n-radio value="show">展示</n-radio>
              <n-radio value="hide">不展示</n-radio>
            </n-radio-group>
          </n-form-item>

          <div class="lw-prize-section">
            <div class="lw-prize-section__toolbar">
              <span class="lw-prize-section__title">奖项配置</span>
              <n-button
                v-if="!readOnly"
                type="primary"
                size="small"
                @click="handleGenerateProbabilities"
              >
                生成中奖概率
              </n-button>
            </div>

            <n-data-table
              :columns="prizeColumns"
              :data="form.prizes"
              :bordered="true"
              size="small"
              :scroll-x="860"
            />

            <div v-if="!readOnly" class="lw-prize-section__footer">
              <n-button type="primary" size="small" @click="handleGenerateProbabilities">
                生成中奖概率
              </n-button>
            </div>
          </div>

          <n-form-item label="大奖公告" class="lw-mt">
            <n-switch
              v-model:value="form.grandPrizeAnnouncement"
              :disabled="readOnly"
            />
          </n-form-item>

          <n-form-item label="爆屏通知">
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
        <n-button @click="visible = false">{{ readOnly ? '关闭' : '取消' }}</n-button>
        <n-button
          v-if="!readOnly"
          type="primary"
          :loading="saving"
          @click="handleSave"
        >
          保存
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
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
  { label: '固定奖金', value: 'fixed_bonus' },
  { label: '实物', value: 'physical' },
  { label: '幸运值', value: 'lucky_value' },
  { label: '谢谢参与', value: 'none' },
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
    title: '奖项',
    key: 'index',
    width: 56,
    render: (_, index) => index + 1,
  },
  {
    title: '类型',
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
    title: '奖励',
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
    title: '真实中奖概率',
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
    title: '展示中奖概率',
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
    title: '奖励图标',
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
    message.warning('请先填写各奖项奖励金额');
    return;
  }
  form.prizes = generateWheelProbabilities(form.prizes);
  message.success('已生成中奖概率');
}

function handleCalcRealCost() {
  if (!form.prizes.some((p) => p.realProbability != null)) {
    message.warning('请先生成或填写真实中奖概率');
    return;
  }
  form.realCost = calcWheelRealCost(form.prizes);
}

function handleCalcDisplayCost() {
  if (!form.prizes.some((p) => p.displayProbability != null)) {
    message.warning('请先生成或填写展示中奖概率');
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
    message.warning('请输入自定义转盘名称');
    return;
  }
  if (!form.luckyValueCost || form.luckyValueCost < 1) {
    message.warning('请填写消耗幸运值');
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
    message.success('保存成功');
    visible.value = false;
  } catch (e) {
    console.error(e);
    message.error('保存失败');
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
