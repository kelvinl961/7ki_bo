<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="$t('activity.luckyWheelPublicConfig.k8f6c')"
    class="lucky-wheel-modal"
    :style="{ width: '980px', maxWidth: '98vw' }"
    :bordered="false"
    :mask-closable="false"
    :segmented="{ content: true, footer: 'soft' }"
    :content-style="{ padding: '0' }"
  >
    <n-scrollbar class="lw-scroll" style="max-height: min(74vh, 760px)">
      <div class="lw-scroll-inner">
        <n-form
          :model="form"
          label-placement="left"
          :label-width="212"
          label-align="right"
          require-mark-placement="right-hanging"
          class="lucky-wheel-setting-form"
          size="medium"
        >
          <section class="lw-section">
            <div class="lw-section__title">{{ $t('activity.luckyWheelPublicConfig.k5e782') }}</div>
            <n-form-item :label="$t('activity.luckyWheelPublicConfig.k83b7')" required>
              <n-space align="center" :size="8" wrap>
                <span class="lw-inline-field__hint">{{ $t('activity.formModal.k6bcf7') }}</span>
                <n-input-number
                  v-model:value="form.luckyValuePerBet"
                  :min="1"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k67091k5e78') }}</span>
              </n-space>
            </n-form-item>
            <n-form-item :label="$t('activity.luckyWheelPublicConfig.k5e78')" required>
              <n-space align="center" :size="8">
                <n-input-number
                  v-model:value="form.luckyValueValidDays"
                  :min="1"
                  :max="365"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.detailModal.k5929') }}</span>
              </n-space>
            </n-form-item>
          </section>

          <section class="lw-section lw-section--tight">
            <div class="lw-section__title lw-section__title--inline">{{ $t('activity.luckyWheelPublicConfig.k98862') }}</div>
            <n-form-item :label="$t('activity.luckyWheelPublicConfig.k7ec8')">
              <n-space vertical :size="10">
                <n-checkbox v-model:checked="form.claimEntrance.pc">{{ $t('activity.formModal.pC') }}</n-checkbox>
                <n-checkbox v-model:checked="form.claimEntrance.androidH5">{{ $t('activity.luckyWheelPublicConfig.androidH5') }}</n-checkbox>
                <n-checkbox v-model:checked="form.claimEntrance.iosH5">{{ $t('activity.luckyWheelPublicConfig.iOSH5') }}</n-checkbox>
                <div class="lw-claim-app-block">
                  <n-checkbox v-model:checked="form.claimEntrance.androidApp">{{ $t('activity.luckyWheelPublicConfig.androidAPP') }}</n-checkbox>
                  <n-checkbox v-model:checked="form.claimEntrance.iosApp">{{ $t('activity.luckyWheelPublicConfig.iOSAPP') }}</n-checkbox>
                  <div class="lw-claim-app-sub">
                    <n-checkbox v-model:checked="form.claimEntrance.appNative">{{ $t('activity.formModal.k539f') }}</n-checkbox>
                    <n-checkbox v-model:checked="form.claimEntrance.appSpeed">{{ $t('activity.formModal.k6781') }}</n-checkbox>
                    <n-checkbox v-model:checked="form.claimEntrance.appShell">{{ $t('activity.formModal.k9a6c') }}</n-checkbox>
                    <n-checkbox v-model:checked="form.claimEntrance.appPwa">{{ $t('activity.formModal.pWAAPP') }}</n-checkbox>
                    <n-checkbox v-model:checked="form.claimEntrance.appIosSigned">{{ $t('activity.luckyWheelPublicConfig.iOS') }}</n-checkbox>
                  </div>
                </div>
              </n-space>
            </n-form-item>
            <n-form-item :label="$t('activity.luckyWheelPublicConfig.k9886')">
              <n-space vertical :size="12">
                <n-space align="center" :size="10" wrap>
                  <n-checkbox
                    v-model:checked="form.claimEntrance.sameDeviceLimitEnabled"
                  />
                  <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k540c3') }}</span>
                  <n-input-number
                    v-model:value="form.claimEntrance.sameDeviceLimitCount"
                    :min="1"
                    :max="10000"
                    :precision="0"
                    :show-button="false"
                    class="lw-input-xs"
                    :disabled="!form.claimEntrance.sameDeviceLimitEnabled"
                  />
                  <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k6b21') }}</span>
                </n-space>
                <n-space align="center" :size="10" wrap>
                  <n-checkbox
                    v-model:checked="form.claimEntrance.sameFingerprintLimitEnabled"
                  />
                  <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k540c4') }}</span>
                  <n-input-number
                    v-model:value="form.claimEntrance.sameFingerprintLimitCount"
                    :min="1"
                    :max="10000"
                    :precision="0"
                    :show-button="false"
                    class="lw-input-xs"
                    :disabled="!form.claimEntrance.sameFingerprintLimitEnabled"
                  />
                  <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k6b21') }}</span>
                </n-space>
              </n-space>
            </n-form-item>
          </section>

          <n-divider dashed class="lw-divider">
            <span class="lw-divider__text">{{ $t('activity.luckyWheelPublicConfig.k66f4') }}</span>
          </n-divider>
          <section class="lw-section lw-section--tight">
            <div class="lw-checkbox-grid">
              <n-checkbox
                v-for="opt in moreRestrictionToggleOptions"
                :key="opt.id"
                :checked="form.moreRestrictions.includes(opt.id)"
                @update:checked="(v) => toggleMoreRestriction(opt.id, v)"
              >
                {{ opt.label }}
              </n-checkbox>
            </div>
            <n-form-item :label="$t('activity.luckyWheelPublicConfig.k540c')" class="lw-mt">
              <n-space align="center" :size="10" wrap>
                <n-checkbox
                  v-model:checked="form.moreRestrictionLimits.sameIpLimitEnabled"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k540c5') }}</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.sameIpLimitMax"
                  :min="1"
                  :max="10000"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                  :disabled="!form.moreRestrictionLimits.sameIpLimitEnabled"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k6b21') }}</span>
              </n-space>
            </n-form-item>
            <n-form-item :label="$t('activity.luckyWheelPublicConfig.k540c2')">
              <n-space align="center" :size="10" wrap>
                <n-checkbox
                  v-model:checked="form.moreRestrictionLimits.sameNameLimitEnabled"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k540c6') }}</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.sameNameLimitMax"
                  :min="1"
                  :max="10000"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                  :disabled="!form.moreRestrictionLimits.sameNameLimitEnabled"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k6b21') }}</span>
              </n-space>
            </n-form-item>
            <n-form-item :label="$t('activity.luckyWheelPublicConfig.k8fd1')">
              <n-space align="center" :size="8" wrap>
                <n-checkbox
                  v-model:checked="
                    form.moreRestrictionLimits.recentDaysMinRechargeCountEnabled
                  "
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k6700') }}</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysForRechargeRules"
                  :min="1"
                  :max="90"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k5929') }}</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysMinRechargeCount"
                  :min="1"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-compact"
                  :disabled="!form.moreRestrictionLimits.recentDaysMinRechargeCountEnabled"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k6b212') }}</span>
              </n-space>
            </n-form-item>
            <n-form-item :label="$t('activity.luckyWheelPublicConfig.k8fd12')">
              <n-space align="center" :size="8" wrap>
                <n-checkbox
                  v-model:checked="
                    form.moreRestrictionLimits.recentDaysMinRechargeAmountEnabled
                  "
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k6700') }}</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysForRechargeRules"
                  :min="1"
                  :max="90"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k59292') }}</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysMinRechargeAmount"
                  :min="0"
                  :precision="2"
                  :show-button="false"
                  class="lw-input-compact"
                  :disabled="!form.moreRestrictionLimits.recentDaysMinRechargeAmountEnabled"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k624d') }}</span>
              </n-space>
            </n-form-item>
            <n-form-item :label="$t('activity.luckyWheelPublicConfig.k8fd13')">
              <n-space align="center" :size="8" wrap>
                <n-checkbox
                  v-model:checked="
                    form.moreRestrictionLimits.recentDaysMinRechargeDaysEnabled
                  "
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k6700') }}</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysForRechargeRules"
                  :min="1"
                  :max="90"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k59293') }}</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysMinRechargeDays"
                  :min="1"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-compact"
                  :disabled="!form.moreRestrictionLimits.recentDaysMinRechargeDaysEnabled"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k59294') }}</span>
              </n-space>
            </n-form-item>
            <n-form-item :label="$t('activity.luckyWheelPublicConfig.k8fd14')">
              <n-space align="center" :size="8" wrap>
                <n-checkbox
                  v-model:checked="form.moreRestrictionLimits.recentDaysMinTurnoverEnabled"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k6700') }}</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysForRechargeRules"
                  :min="1"
                  :max="90"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k59295') }}</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysMinTurnover"
                  :min="0"
                  :precision="2"
                  :show-button="false"
                  class="lw-input-compact"
                  :disabled="!form.moreRestrictionLimits.recentDaysMinTurnoverEnabled"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k624d') }}</span>
              </n-space>
            </n-form-item>
            <n-form-item :label="$t('activity.luckyWheelPublicConfig.k6253')">
              <n-space align="center" :size="8" wrap>
                <n-checkbox
                  v-model:checked="
                    form.moreRestrictionLimits.recentDaysTurnoverMultiplierEnabled
                  "
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k6700') }}</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysForRechargeRules"
                  :min="1"
                  :max="90"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k59296') }}</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysTurnoverMultiplier"
                  :min="0"
                  :precision="2"
                  :show-button="false"
                  class="lw-input-compact"
                  :disabled="!form.moreRestrictionLimits.recentDaysTurnoverMultiplierEnabled"
                />
                <span class="lw-inline-field__hint">{{ $t('activity.luckyWheelPublicConfig.k500d') }}</span>
              </n-space>
            </n-form-item>
          </section>

          <n-divider dashed class="lw-divider">
            <span class="lw-divider__text">{{ $t('activity.detailModal.k53c2') }}</span>
          </n-divider>
          <section class="lw-section lw-section--tight">
            <n-form-item :label="$t('activity.detailModal.k53c2')" required>
              <n-space vertical :size="10" class="lw-claim-levels-wrap">
                <n-checkbox
                  :checked="allMemberTiersSelected"
                  @update:checked="onToggleAllMemberTiers"
                  :disabled="tiersLoading || memberTierOptions.length === 0"
                >{{ $t('activity.formModal.k51683') }}</n-checkbox>
                <div class="lw-checkbox-grid">
                  <n-checkbox
                    v-for="opt in memberTierOptions"
                    :key="opt.id"
                    :checked="form.memberTierIds.includes(opt.id)"
                    @update:checked="(v) => toggleMemberTier(opt.id, v)"
                    :disabled="tiersLoading"
                  >
                    {{ opt.label }}
                  </n-checkbox>
                </div>
              </n-space>
            </n-form-item>
          </section>

          <n-divider dashed class="lw-divider">
            <span class="lw-divider__text">{{ $t('activity.luckyWheelPublicConfig.k7a3d') }}</span>
          </n-divider>
          <section class="lw-section lw-section--tight">
            <n-form-item :label="$t('activity.formModal.k7a3d2')" required>
              <n-input-number
                v-model:value="form.auditMultiplier"
                :min="0"
                :max="50"
                :step="0.01"
                :precision="2"
                :show-button="false"
                class="lw-input-compact"
              />
            </n-form-item>
            <n-form-item :label="$t('activity.distributeReward.k5956')">
              <n-space vertical :size="12" style="width: 100%">
                <n-radio-group
                  v-model:value="form.auditPlatformRestriction"
                  class="lw-radio-row"
                >
                  <n-radio value="all_platforms">{{ $t('activity.formModal.k4e0d4') }}</n-radio>
                  <n-radio value="specific_platforms">{{ $t('activity.formModal.k4ec52') }}</n-radio>
                  <n-radio value="exclude_platforms">{{ $t('activity.formModal.k6392') }}</n-radio>
                </n-radio-group>
                <div
                  v-if="form.auditPlatformRestriction !== 'all_platforms'"
                  class="lw-platform-shell"
                >
                  <PlatformGameSelector
                    v-model:selected-platforms="form.auditSelectedPlatforms"
                    @validation-change="platformSelectionValid = $event"
                  />
                </div>
              </n-space>
            </n-form-item>
          </section>

          <n-divider dashed class="lw-divider">
            <span class="lw-divider__text">{{ $t('activity.formModal.k89c4') }}</span>
          </n-divider>
          <section class="lw-section lw-section--tight">
            <n-form-item :label="$t('activity.formModal.k89c4')" required>
              <n-space vertical :size="12" style="width: 100%">
                <n-radio-group
                  v-model:value="form.ruleDescriptionMode"
                  class="lw-radio-row"
                >
                  <n-radio value="custom">{{ $t('activity.detailModal.k81ea') }}</n-radio>
                  <n-radio value="system">{{ $t('activity.formModal.k7cfb') }}</n-radio>
                </n-radio-group>
                <n-input
                  v-if="form.ruleDescriptionMode === 'custom'"
                  v-model:value="form.ruleDescriptionCustom"
                  type="textarea"
                  :rows="6"
                  maxlength="10000"
                  show-count
                  :placeholder="$t('activity.luckyWheelPublicConfig.k8bf7')"
                  class="lw-rule-textarea"
                />
                <div v-else class="lw-system-rule-preview">
                  <div class="lw-system-rule-preview__label">{{ $t('activity.luckyWheelPublicConfig.k7cfb') }}</div>
                  <pre class="lw-system-rule-preview__body">{{ systemRulePreview }}</pre>
                </div>
              </n-space>
            </n-form-item>
          </section>
        </n-form>
      </div>
    </n-scrollbar>

    <template #footer>
      <div class="lw-footer flex justify-end gap-3">
        <n-button class="lw-btn-cancel" @click="visible = false">{{ $t('activity.activityList.k53d6') }}</n-button>
        <n-button class="lw-btn-save" type="primary" :loading="saving" @click="handleSave">{{ $t('activity.luckyWheelEdit.k4fdd') }}</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { computed, reactive, ref, watch } from 'vue';
import {
  NModal,
  NScrollbar,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NCheckbox,
  NRadio,
  NRadioGroup,
  NSpace,
  NButton,
  NDivider,
  useMessage,
} from 'naive-ui';
import PlatformGameSelector from '#/components/activity/PlatformGameSelector.vue';
import { putLuckyWheelAdminPublicConfigApi } from '#/api/core/lucky-wheel-admin';
import { getActiveMemberTiersApi } from '#/api/core/memberTier';
import { MORE_RESTRICTION_TOGGLE_OPTIONS } from './providentFundUiConstants';
import {
  type LuckyWheelPublicConfigSnapshot,
  cloneLuckyWheelPublicConfig,
  defaultLuckyWheelMoreRestrictionLimits,
  defaultLuckyWheelPublicConfig,
} from './luckyWheelTypes';
import { defaultClaimEntrance } from './providentFundTypes';

const props = withDefaults(
  defineProps<{
    initialSnapshot?: LuckyWheelPublicConfigSnapshot | null;
  }>(),
  { initialSnapshot: null },
);

const emit = defineEmits<{
  saved: [snapshot: LuckyWheelPublicConfigSnapshot];
}>();

const visible = defineModel<boolean>('show', { default: false });
const message = useMessage();
const saving = ref(false);
const platformSelectionValid = ref(true);
const tiersLoading = ref(false);
const memberTierOptions = ref<{ id: string; label: string }[]>([]);
const moreRestrictionToggleOptions = MORE_RESTRICTION_TOGGLE_OPTIONS;

const SYSTEM_RULE_PREVIEW = $t('activity.rulePreviews.luckyWheel');

const systemRulePreview = computed(() => SYSTEM_RULE_PREVIEW);

const form = reactive({
  luckyValuePerBet: 1,
  luckyValueValidDays: 31,
  claimEntrance: defaultClaimEntrance(),
  moreRestrictions: [] as string[],
  moreRestrictionLimits: defaultLuckyWheelMoreRestrictionLimits(),
  memberTierIds: [] as string[],
  auditMultiplier: 1,
  auditPlatformRestriction: 'all_platforms' as
    | 'all_platforms'
    | 'specific_platforms'
    | 'exclude_platforms',
  auditSelectedPlatforms: [] as LuckyWheelPublicConfigSnapshot['auditSelectedPlatforms'],
  ruleDescriptionMode: 'system' as 'system' | 'custom',
  ruleDescriptionCustom: '',
});

const allMemberTierIds = computed(() => memberTierOptions.value.map((i) => i.id));
const allMemberTiersSelected = computed(
  () =>
    allMemberTierIds.value.length > 0 &&
    allMemberTierIds.value.every((id) => form.memberTierIds.includes(id)),
);

function applySnapshot(s: LuckyWheelPublicConfigSnapshot) {
  const snap = cloneLuckyWheelPublicConfig(s);
  form.luckyValuePerBet = snap.luckyValuePerBet;
  form.luckyValueValidDays = snap.luckyValueValidDays;
  form.claimEntrance = { ...snap.claimEntrance };
  form.moreRestrictions = [...snap.moreRestrictions];
  form.moreRestrictionLimits = { ...snap.moreRestrictionLimits };
  form.memberTierIds = [...snap.memberTierIds];
  form.auditMultiplier = snap.auditMultiplier;
  form.auditPlatformRestriction = snap.auditPlatformRestriction;
  form.auditSelectedPlatforms = snap.auditSelectedPlatforms?.length
    ? JSON.parse(JSON.stringify(snap.auditSelectedPlatforms))
    : [];
  form.ruleDescriptionMode = snap.ruleDescriptionMode;
  form.ruleDescriptionCustom = snap.ruleDescriptionCustom;
}

function toSnapshot(): LuckyWheelPublicConfigSnapshot {
  return {
    luckyValuePerBet: form.luckyValuePerBet,
    luckyValueValidDays: form.luckyValueValidDays,
    claimEntrance: { ...form.claimEntrance },
    moreRestrictions: [...form.moreRestrictions],
    moreRestrictionLimits: { ...form.moreRestrictionLimits },
    memberTierIds: [...form.memberTierIds],
    auditMultiplier: form.auditMultiplier,
    auditPlatformRestriction: form.auditPlatformRestriction,
    auditSelectedPlatforms: JSON.parse(JSON.stringify(form.auditSelectedPlatforms)),
    ruleDescriptionMode: form.ruleDescriptionMode,
    ruleDescriptionCustom: form.ruleDescriptionCustom,
  };
}

function toggleMoreRestriction(id: string, checked: boolean) {
  if (checked) {
    if (!form.moreRestrictions.includes(id)) form.moreRestrictions.push(id);
  } else {
    form.moreRestrictions = form.moreRestrictions.filter((x) => x !== id);
  }
}

function toggleMemberTier(id: string, checked: boolean) {
  if (checked) {
    if (!form.memberTierIds.includes(id)) form.memberTierIds.push(id);
  } else {
    form.memberTierIds = form.memberTierIds.filter((x) => x !== id);
  }
}

function onToggleAllMemberTiers(checked: boolean) {
  form.memberTierIds = checked ? [...allMemberTierIds.value] : [];
}

async function loadMemberTiers() {
  tiersLoading.value = true;
  try {
    const tiers = await getActiveMemberTiersApi();
    memberTierOptions.value = tiers.map((tier) => ({
      id: String(tier.id),
      label: tier.tierName || tier.tierCode || $t('activity.common.tierLabel', [tier.id]),
    }));
    if (!form.memberTierIds.length && memberTierOptions.value.length) {
      form.memberTierIds = [...allMemberTierIds.value];
    } else if (form.memberTierIds.length) {
      const valid = new Set(allMemberTierIds.value);
      form.memberTierIds = form.memberTierIds.filter((id) => valid.has(id));
    }
  } catch (e) {
    console.error(e);
    message.error($t('activity.luckyWheelPublicConfig.k52a0'));
    memberTierOptions.value = [];
  } finally {
    tiersLoading.value = false;
  }
}

watch(visible, (v) => {
  if (!v) return;
  applySnapshot(props.initialSnapshot ?? defaultLuckyWheelPublicConfig());
  loadMemberTiers();
});

watch(
  () => props.initialSnapshot,
  (s) => {
    if (visible.value && s) applySnapshot(s);
  },
);

async function handleSave() {
  if (
    (form.auditPlatformRestriction === 'specific_platforms' ||
      form.auditPlatformRestriction === 'exclude_platforms') &&
    !platformSelectionValid.value
  ) {
    message.warning($t('activity.luckyWheelPublicConfig.k8bf72'));
    return;
  }
  if (!form.memberTierIds.length) {
    message.warning($t('activity.luckyWheelPublicConfig.k8bf73'));
    return;
  }
  saving.value = true;
  try {
    const snapshot = toSnapshot();
    await putLuckyWheelAdminPublicConfigApi(snapshot);
    emit('saved', snapshot);
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
.lw-scroll-inner {
  padding: 20px 24px 8px;
}
.lucky-wheel-setting-form :deep(.n-form-item-feedback-wrapper) {
  min-height: 0;
}
.lucky-wheel-setting-form :deep(.n-form-item-label) {
  font-weight: 500;
  color: rgb(55 65 81);
  white-space: normal;
  line-height: 1.45;
  align-items: flex-start;
  padding-top: 6px;
}
.lucky-wheel-setting-form :deep(.n-form-item) {
  margin-bottom: 18px;
}
.lw-section--tight :deep(.n-form-item) {
  margin-bottom: 16px;
}
.lw-section__title {
  font-size: 13px;
  font-weight: 600;
  color: rgb(107 114 128);
  letter-spacing: 0.02em;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgb(243 244 246);
}
.lw-section__title--inline {
  margin-top: 4px;
  margin-bottom: 10px;
}
.lw-checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px 14px;
}
.lw-claim-levels-wrap {
  width: 100%;
}
.lw-mt {
  margin-top: 12px;
}
.lw-input-xs {
  width: 92px;
}
.lw-input-compact {
  width: 168px;
}
.lw-claim-app-block {
  padding-left: 10px;
  border-left: 3px solid rgb(229 231 235);
}
.lw-claim-app-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 8px;
  padding-left: 12px;
}
.lw-inline-field__hint {
  font-size: 13px;
  color: rgb(107 114 128);
}
.lw-radio-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.lw-divider {
  margin: 8px 0 20px;
}
.lw-divider__text {
  font-size: 13px;
  font-weight: 600;
  color: rgb(55 65 81);
  padding: 0 8px;
}
.lw-platform-shell {
  border-radius: 12px;
  border: 1px solid rgb(229 231 235);
  background: rgb(255 255 255);
  padding: 12px 14px 10px;
}
.lw-rule-textarea {
  width: 100%;
}
.lw-system-rule-preview {
  border-radius: 10px;
  border: 1px solid rgb(229 231 235);
  background: rgb(249 250 251);
  padding: 12px 14px;
}
.lw-system-rule-preview__label {
  font-size: 12px;
  font-weight: 600;
  color: rgb(107 114 128);
  margin-bottom: 8px;
}
.lw-system-rule-preview__body {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: rgb(75 85 99);
  white-space: pre-wrap;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.lw-footer {
  padding: 12px 20px 16px;
}
.lw-btn-cancel {
  min-width: 88px;
}
.lw-btn-save {
  min-width: 96px;
}
.lucky-wheel-modal :deep(.n-card-header) {
  padding: 16px 20px 12px;
  font-size: 17px;
  font-weight: 600;
}
</style>
