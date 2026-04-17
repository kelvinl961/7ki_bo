<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="modalTitle"
    class="provident-fund-modal"
    :style="{ width: '920px', maxWidth: '96vw' }"
    :bordered="false"
    :mask-closable="false"
    :segmented="{ content: true, footer: 'soft' }"
    :content-style="{ padding: '0' }"
  >
    <n-scrollbar class="pf-scroll" style="max-height: min(74vh, 760px)">
      <div class="pf-scroll-inner">
        <n-form
          :model="form"
          label-placement="left"
          :label-width="212"
          label-align="right"
          require-mark-placement="right-hanging"
          class="provident-fund-setting-form"
          size="medium"
        >
          <section class="pf-section">
            <div class="pf-section__title">基础规则</div>
            <n-form-item label="公积金名称" path="nameMode" required>
              <n-space vertical :size="10">
                <n-radio-group
                  v-model:value="form.nameMode"
                  name="pf-name-mode"
                  class="pf-radio-row"
                >
                  <n-radio value="system">系统自带</n-radio>
                  <n-radio value="custom">自定义</n-radio>
                </n-radio-group>
                <n-input
                  v-model:value="form.displayName"
                  placeholder="公积金"
                  :disabled="form.nameMode === 'system'"
                  class="pf-input-name"
                  clearable
                />
              </n-space>
            </n-form-item>

            <n-form-item label="选择币种" required>
              <n-checkbox-group v-model:value="form.currencies">
                <div class="pf-currency-group">
                  <n-checkbox
                    v-for="opt in currencyOptions"
                    :key="opt"
                    :value="opt"
                    :label="opt"
                  />
                </div>
              </n-checkbox-group>
            </n-form-item>

            <n-form-item label="获得公积金充值要求">
              <div class="pf-deposit-table-wrap">
                <table class="pf-deposit-table">
                  <thead>
                    <tr>
                      <th>币种</th>
                      <th>单笔充值 ≥</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in form.currencies" :key="c">
                      <td>
                        <span class="pf-currency-tag">{{ c }}</span>
                      </td>
                      <td>
                        <n-input-number
                          v-model:value="form.depositMinByCurrency[c]"
                          :min="0"
                          :precision="2"
                          :show-button="false"
                          placeholder="0.00"
                          class="pf-input-compact"
                        />
                      </td>
                    </tr>
                    <tr v-if="form.currencies.length === 0">
                      <td colspan="2" class="pf-deposit-empty">
                        请先勾选币种
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </n-form-item>

            <n-form-item label="赠送方式" required>
              <div class="pf-inline-field">
                <span class="pf-inline-field__hint">每笔充值，赠送比例</span>
                <n-input-number
                  v-model:value="form.giftRatioPercent"
                  :min="0"
                  :max="100"
                  :precision="0"
                  class="pf-input-gift"
                />
                <span class="pf-inline-field__suffix">%</span>
              </div>
            </n-form-item>

            <n-form-item>
              <template #label>
                <span class="pf-label-with-tip">
                  累计赠送封顶
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <n-icon
                        size="16"
                        class="pf-tip-icon"
                      >
                        <HelpCircleOutline />
                      </n-icon>
                    </template>
                    累计赠送达到该上限后，后续充值不再赠送公积金（0 表示不封顶，以业务规则为准）
                  </n-tooltip>
                </span>
              </template>
              <n-input-number
                v-model:value="form.cumulativeGiftCap"
                :min="0"
                :precision="0"
                class="pf-input-compact"
              />
            </n-form-item>

            <n-form-item>
              <template #label>
                <span class="pf-label-with-tip">
                  赠送次数
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <n-icon
                        size="16"
                        class="pf-tip-icon"
                      >
                        <HelpCircleOutline />
                      </n-icon>
                    </template>
                    每位用户可获赠次数上限（0 表示不限制次数，以业务规则为准）
                  </n-tooltip>
                </span>
              </template>
              <n-input-number
                v-model:value="form.giftFrequency"
                :min="0"
                :precision="0"
                class="pf-input-compact"
              />
            </n-form-item>
          </section>

          <n-divider dashed class="pf-divider">
            <span class="pf-divider__text">取出条件</span>
          </n-divider>

          <section class="pf-section pf-section--tight">
            <n-form-item label="有赠送公积金的充值要求投注倍数" required>
              <n-input-number
                v-model:value="form.betMultipleWithGift"
                :min="0"
                :precision="2"
                :show-button="false"
                class="pf-input-compact"
              />
            </n-form-item>

            <n-form-item label="超封顶无赠送的新充值打码要求" required>
              <n-input-number
                v-model:value="form.wagerNewDepositAfterCap"
                :min="0"
                :precision="0"
                class="pf-input-compact"
              />
            </n-form-item>

            <n-form-item label="打码限定平台" class="pf-form-item-platform">
              <n-space vertical :size="14" class="pf-platform-block">
                <n-radio-group
                  v-model:value="form.platformRestriction"
                  class="pf-radio-row"
                >
                  <n-radio value="all_platforms">不限制</n-radio>
                  <n-radio value="specific_platforms">指定平台</n-radio>
                  <n-radio value="exclude_platforms">排除勾选平台</n-radio>
                </n-radio-group>
                <div
                  v-if="
                    form.platformRestriction === 'specific_platforms' ||
                    form.platformRestriction === 'exclude_platforms'
                  "
                  class="pf-platform-shell"
                >
                  <PlatformGameSelector
                    v-model="form.selectedPlatforms"
                    :wagering-platform="form.platformRestriction"
                    @validation-change="platformSelectionValid = $event"
                  />
                </div>
              </n-space>
            </n-form-item>
          </section>
        </n-form>
      </div>
    </n-scrollbar>

    <template #footer>
      <div class="pf-footer">
        <n-space justify="end" :size="12">
          <n-button class="pf-btn-cancel" @click="visible = false">
            取消
          </n-button>
          <n-button
            type="primary"
            class="pf-btn-save"
            :loading="saving"
            @click="handleSave"
          >
            保存
          </n-button>
        </n-space>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import {
  NModal,
  NScrollbar,
  NForm,
  NFormItem,
  NRadioGroup,
  NRadio,
  NSpace,
  NInput,
  NInputNumber,
  NCheckboxGroup,
  NCheckbox,
  NButton,
  NDivider,
  NTooltip,
  NIcon,
  useMessage,
} from 'naive-ui';
import { HelpCircleOutline } from '@vicons/ionicons5';
import PlatformGameSelector from '#/components/activity/PlatformGameSelector.vue';
import type { SelectedPlatform } from '#/api/activity/platformSelection';
import {
  type ProvidentFundFormSnapshot,
  cloneSnapshot,
  defaultProvidentFundSnapshot,
} from './providentFundTypes';

const props = withDefaults(
  defineProps<{
    /** 新增 / 编辑 */
    mode?: 'create' | 'edit';
    /** 编辑时传入的完整配置 */
    initialSnapshot?: ProvidentFundFormSnapshot | null;
  }>(),
  {
    mode: 'create',
    initialSnapshot: null,
  },
);

const emit = defineEmits<{
  saved: [snapshot: ProvidentFundFormSnapshot];
}>();

const visible = defineModel<boolean>('show', { default: false });

const message = useMessage();
const saving = ref(false);
const platformSelectionValid = ref(true);

const modalTitle = computed(() =>
  props.mode === 'edit' ? '编辑公积金' : '新增公积金',
);

const currencyOptions = ['BRL', 'USD', 'EUR', 'CNY'] as const;

const form = reactive({
  nameMode: 'system' as 'system' | 'custom',
  displayName: '公积金',
  currencies: ['BRL'] as string[],
  depositMinByCurrency: {} as Record<string, number | null>,
  giftRatioPercent: 100,
  cumulativeGiftCap: 0,
  giftFrequency: 0,
  betMultipleWithGift: 60,
  wagerNewDepositAfterCap: 15,
  platformRestriction: 'specific_platforms' as
    | 'all_platforms'
    | 'specific_platforms'
    | 'exclude_platforms',
  selectedPlatforms: [] as SelectedPlatform[],
});

function applySnapshot(s: ProvidentFundFormSnapshot) {
  const snap = cloneSnapshot(s);
  form.nameMode = snap.nameMode;
  form.displayName = snap.displayName;
  form.currencies = [...snap.currencies];
  form.depositMinByCurrency = { ...snap.depositMinByCurrency };
  form.giftRatioPercent = snap.giftRatioPercent;
  form.cumulativeGiftCap = snap.cumulativeGiftCap;
  form.giftFrequency = snap.giftFrequency;
  form.betMultipleWithGift = snap.betMultipleWithGift;
  form.wagerNewDepositAfterCap = snap.wagerNewDepositAfterCap;
  form.platformRestriction = snap.platformRestriction;
  form.selectedPlatforms = snap.selectedPlatforms?.length
    ? (JSON.parse(
        JSON.stringify(snap.selectedPlatforms),
      ) as SelectedPlatform[])
    : [];
  ensureDepositKeys();
}

function resetForm() {
  applySnapshot(defaultProvidentFundSnapshot());
}

function toSnapshot(): ProvidentFundFormSnapshot {
  return cloneSnapshot({
    nameMode: form.nameMode,
    displayName: form.displayName,
    currencies: [...form.currencies],
    depositMinByCurrency: { ...form.depositMinByCurrency },
    giftRatioPercent: form.giftRatioPercent,
    cumulativeGiftCap: form.cumulativeGiftCap,
    giftFrequency: form.giftFrequency,
    betMultipleWithGift: form.betMultipleWithGift,
    wagerNewDepositAfterCap: form.wagerNewDepositAfterCap,
    platformRestriction: form.platformRestriction,
    selectedPlatforms: JSON.parse(
      JSON.stringify(form.selectedPlatforms),
    ) as SelectedPlatform[],
  });
}

function ensureDepositKeys() {
  for (const c of form.currencies) {
    if (form.depositMinByCurrency[c] === undefined) {
      form.depositMinByCurrency[c] = 0;
    }
  }
  for (const key of Object.keys(form.depositMinByCurrency)) {
    if (!form.currencies.includes(key)) {
      delete form.depositMinByCurrency[key];
    }
  }
}

watch(
  () => [...form.currencies],
  () => ensureDepositKeys(),
  { immediate: true },
);

watch(
  () => form.nameMode,
  (mode) => {
    if (mode === 'system') {
      form.displayName = '公积金';
    }
  },
);

watch(
  () => form.platformRestriction,
  (mode) => {
    if (mode === 'all_platforms') {
      form.selectedPlatforms = [];
    }
  },
);

watch(
  () => visible.value,
  (open) => {
    if (!open) {
      platformSelectionValid.value = true;
      return;
    }
    if (props.mode === 'edit' && props.initialSnapshot) {
      applySnapshot(props.initialSnapshot);
    } else {
      resetForm();
    }
  },
);

async function handleSave() {
  if (
    (form.platformRestriction === 'specific_platforms' ||
      form.platformRestriction === 'exclude_platforms') &&
    !platformSelectionValid.value
  ) {
    message.warning('请完善打码限定平台选择');
    return;
  }
  if (!form.currencies.length) {
    message.warning('请至少选择一个币种');
    return;
  }
  saving.value = true;
  try {
    // TODO: 对接公积金设置保存接口
    await new Promise((r) => setTimeout(r, 400));
    emit('saved', toSnapshot());
    message.success('保存成功');
    visible.value = false;
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.pf-scroll-inner {
  padding: 20px 24px 8px;
}

.provident-fund-setting-form :deep(.n-form-item-feedback-wrapper) {
  min-height: 0;
}

.provident-fund-setting-form :deep(.n-form-item-label) {
  font-weight: 500;
  color: rgb(55 65 81);
  white-space: normal;
  line-height: 1.45;
  align-items: flex-start;
  padding-top: 6px;
}

.provident-fund-setting-form :deep(.n-form-item) {
  margin-bottom: 18px;
}

.pf-section--tight :deep(.n-form-item) {
  margin-bottom: 16px;
}

.pf-form-item-platform :deep(.n-form-item) {
  margin-bottom: 0;
}

.pf-section__title {
  font-size: 13px;
  font-weight: 600;
  color: rgb(107 114 128);
  letter-spacing: 0.02em;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgb(243 244 246);
}

.pf-radio-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.pf-input-name {
  max-width: 320px;
}

.pf-currency-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
}

.pf-deposit-table-wrap {
  border-radius: 10px;
  border: 1px solid rgb(229 231 235);
  background: rgb(249 250 251);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
  overflow: hidden;
  max-width: 420px;
}

.pf-deposit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.pf-deposit-table thead {
  background: rgb(243 244 246);
}

.pf-deposit-table th {
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  color: rgb(75 85 99);
  border-bottom: 1px solid rgb(229 231 235);
}

.pf-deposit-table td {
  padding: 10px 14px;
  vertical-align: middle;
  border-bottom: 1px solid rgb(229 231 235 / 0.85);
  background: rgb(255 255 255);
}

.pf-deposit-table tbody tr:last-child td {
  border-bottom: none;
}

.pf-currency-tag {
  display: inline-flex;
  align-items: center;
  min-width: 56px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgb(239 246 255);
  color: rgb(29 78 216);
  font-weight: 600;
  font-size: 13px;
}

.pf-deposit-empty {
  text-align: center;
  color: rgb(156 163 175);
  font-size: 13px;
  padding: 20px !important;
}

.pf-inline-field {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.pf-inline-field__hint {
  font-size: 13px;
  color: rgb(107 114 128);
}

.pf-inline-field__suffix {
  font-size: 14px;
  color: rgb(75 85 99);
  font-weight: 500;
}

.pf-input-compact {
  width: 168px;
}

.pf-input-gift {
  width: 112px;
}

.pf-label-with-tip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1.35;
}

.pf-tip-icon {
  color: rgb(59 130 246);
  cursor: help;
  flex-shrink: 0;
  vertical-align: middle;
}

.pf-divider {
  margin: 8px 0 20px;
}

.pf-divider__text {
  font-size: 13px;
  font-weight: 600;
  color: rgb(55 65 81);
  padding: 0 8px;
}

.pf-platform-block {
  width: 100%;
}

.pf-platform-shell {
  border-radius: 12px;
  border: 1px solid rgb(229 231 235);
  background: rgb(255 255 255);
  padding: 12px 14px 10px;
  box-shadow: inset 0 1px 0 rgb(255 255 255);
}

/* 减轻嵌套平台选择区的厚重感 */
.pf-platform-shell :deep(.platform-game-selector .space-y-4) {
  gap: 0.75rem;
}

.pf-platform-shell :deep(.platform-game-selector .mb-3.flex) {
  gap: 8px;
}

.pf-platform-shell :deep(.platform-game-selector .mb-3.flex .n-button) {
  border-radius: 6px;
}

.pf-platform-shell :deep(.n-tabs .n-tabs-nav) {
  padding: 2px;
  background: rgb(243 244 246);
  border-radius: 8px;
}

.pf-platform-shell :deep(.grid.max-h-80) {
  max-height: min(280px, 40vh);
  gap: 8px;
}

.pf-platform-shell :deep(.rounded-lg.border) {
  border-color: rgb(229 231 235) !important;
}

.pf-footer {
  padding: 12px 20px 16px;
}

.pf-btn-cancel {
  min-width: 88px;
  border-radius: 8px;
}

.pf-btn-save {
  min-width: 96px;
  border-radius: 8px;
}

/* 卡片标题区 */
.provident-fund-modal :deep(.n-card-header) {
  padding: 16px 20px 12px;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.provident-fund-modal :deep(.n-card__content) {
  padding-top: 0;
}
</style>
