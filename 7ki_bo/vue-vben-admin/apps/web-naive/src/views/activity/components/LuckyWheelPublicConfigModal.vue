<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="转盘公共配置"
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
            <div class="lw-section__title">幸运值配置</div>
            <n-form-item label="获得幸运值" required>
              <n-space align="center" :size="8" wrap>
                <span class="lw-inline-field__hint">每</span>
                <n-input-number
                  v-model:value="form.luckyValuePerBet"
                  :min="1"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">有效投注 = 1 幸运值</span>
              </n-space>
            </n-form-item>
            <n-form-item label="幸运值有效天数" required>
              <n-space align="center" :size="8">
                <n-input-number
                  v-model:value="form.luckyValueValidDays"
                  :min="1"
                  :max="365"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">天</span>
              </n-space>
            </n-form-item>
          </section>

          <section class="lw-section lw-section--tight">
            <div class="lw-section__title lw-section__title--inline">领取入口</div>
            <n-form-item label="终端可领取">
              <n-space vertical :size="10">
                <n-checkbox v-model:checked="form.claimEntrance.pc">PC可领取</n-checkbox>
                <n-checkbox v-model:checked="form.claimEntrance.androidH5">
                  Android H5可领取
                </n-checkbox>
                <n-checkbox v-model:checked="form.claimEntrance.iosH5">
                  iOS H5可领取
                </n-checkbox>
                <div class="lw-claim-app-block">
                  <n-checkbox v-model:checked="form.claimEntrance.androidApp">
                    Android APP可领取
                  </n-checkbox>
                  <n-checkbox v-model:checked="form.claimEntrance.iosApp">
                    iOS APP可领取
                  </n-checkbox>
                  <div class="lw-claim-app-sub">
                    <n-checkbox v-model:checked="form.claimEntrance.appNative">
                      原生APP
                    </n-checkbox>
                    <n-checkbox v-model:checked="form.claimEntrance.appSpeed">
                      极速APP
                    </n-checkbox>
                    <n-checkbox v-model:checked="form.claimEntrance.appShell">
                      马甲包
                    </n-checkbox>
                    <n-checkbox v-model:checked="form.claimEntrance.appPwa">
                      PWA快捷APP
                    </n-checkbox>
                    <n-checkbox v-model:checked="form.claimEntrance.appIosSigned">
                      iOS描述签
                    </n-checkbox>
                  </div>
                </div>
              </n-space>
            </n-form-item>
            <n-form-item label="领取次数限制">
              <n-space vertical :size="12">
                <n-space align="center" :size="10" wrap>
                  <n-checkbox
                    v-model:checked="form.claimEntrance.sameDeviceLimitEnabled"
                  />
                  <span class="lw-inline-field__hint">同登录设备号只能领取</span>
                  <n-input-number
                    v-model:value="form.claimEntrance.sameDeviceLimitCount"
                    :min="1"
                    :max="10000"
                    :precision="0"
                    :show-button="false"
                    class="lw-input-xs"
                    :disabled="!form.claimEntrance.sameDeviceLimitEnabled"
                  />
                  <span class="lw-inline-field__hint">次</span>
                </n-space>
                <n-space align="center" :size="10" wrap>
                  <n-checkbox
                    v-model:checked="form.claimEntrance.sameFingerprintLimitEnabled"
                  />
                  <span class="lw-inline-field__hint">同浏览器指纹只能领取</span>
                  <n-input-number
                    v-model:value="form.claimEntrance.sameFingerprintLimitCount"
                    :min="1"
                    :max="10000"
                    :precision="0"
                    :show-button="false"
                    class="lw-input-xs"
                    :disabled="!form.claimEntrance.sameFingerprintLimitEnabled"
                  />
                  <span class="lw-inline-field__hint">次</span>
                </n-space>
              </n-space>
            </n-form-item>
          </section>

          <n-divider dashed class="lw-divider">
            <span class="lw-divider__text">更多领取限制</span>
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
            <n-form-item label="同IP领取限制" class="lw-mt">
              <n-space align="center" :size="10" wrap>
                <n-checkbox
                  v-model:checked="form.moreRestrictionLimits.sameIpLimitEnabled"
                />
                <span class="lw-inline-field__hint">同登录IP只能领取</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.sameIpLimitMax"
                  :min="1"
                  :max="10000"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                  :disabled="!form.moreRestrictionLimits.sameIpLimitEnabled"
                />
                <span class="lw-inline-field__hint">次</span>
              </n-space>
            </n-form-item>
            <n-form-item label="同姓名领取限制">
              <n-space align="center" :size="10" wrap>
                <n-checkbox
                  v-model:checked="form.moreRestrictionLimits.sameNameLimitEnabled"
                />
                <span class="lw-inline-field__hint">同姓名只能领取</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.sameNameLimitMax"
                  :min="1"
                  :max="10000"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                  :disabled="!form.moreRestrictionLimits.sameNameLimitEnabled"
                />
                <span class="lw-inline-field__hint">次</span>
              </n-space>
            </n-form-item>
            <n-form-item label="近期充值笔数">
              <n-space align="center" :size="8" wrap>
                <n-checkbox
                  v-model:checked="
                    form.moreRestrictionLimits.recentDaysMinRechargeCountEnabled
                  "
                />
                <span class="lw-inline-field__hint">最近</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysForRechargeRules"
                  :min="1"
                  :max="90"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">天内充值次数 ≥</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysMinRechargeCount"
                  :min="1"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-compact"
                  :disabled="!form.moreRestrictionLimits.recentDaysMinRechargeCountEnabled"
                />
                <span class="lw-inline-field__hint">次才能领取</span>
              </n-space>
            </n-form-item>
            <n-form-item label="近期充值金额">
              <n-space align="center" :size="8" wrap>
                <n-checkbox
                  v-model:checked="
                    form.moreRestrictionLimits.recentDaysMinRechargeAmountEnabled
                  "
                />
                <span class="lw-inline-field__hint">最近</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysForRechargeRules"
                  :min="1"
                  :max="90"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">天内充值金额 ≥</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysMinRechargeAmount"
                  :min="0"
                  :precision="2"
                  :show-button="false"
                  class="lw-input-compact"
                  :disabled="!form.moreRestrictionLimits.recentDaysMinRechargeAmountEnabled"
                />
                <span class="lw-inline-field__hint">才能领取</span>
              </n-space>
            </n-form-item>
            <n-form-item label="近期充值天数">
              <n-space align="center" :size="8" wrap>
                <n-checkbox
                  v-model:checked="
                    form.moreRestrictionLimits.recentDaysMinRechargeDaysEnabled
                  "
                />
                <span class="lw-inline-field__hint">最近</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysForRechargeRules"
                  :min="1"
                  :max="90"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">天内充值天数 ≥</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysMinRechargeDays"
                  :min="1"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-compact"
                  :disabled="!form.moreRestrictionLimits.recentDaysMinRechargeDaysEnabled"
                />
                <span class="lw-inline-field__hint">天才能领取</span>
              </n-space>
            </n-form-item>
            <n-form-item label="近期打码量">
              <n-space align="center" :size="8" wrap>
                <n-checkbox
                  v-model:checked="form.moreRestrictionLimits.recentDaysMinTurnoverEnabled"
                />
                <span class="lw-inline-field__hint">最近</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysForRechargeRules"
                  :min="1"
                  :max="90"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">天内打码量 ≥</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysMinTurnover"
                  :min="0"
                  :precision="2"
                  :show-button="false"
                  class="lw-input-compact"
                  :disabled="!form.moreRestrictionLimits.recentDaysMinTurnoverEnabled"
                />
                <span class="lw-inline-field__hint">才能领取</span>
              </n-space>
            </n-form-item>
            <n-form-item label="打码倍数要求">
              <n-space align="center" :size="8" wrap>
                <n-checkbox
                  v-model:checked="
                    form.moreRestrictionLimits.recentDaysTurnoverMultiplierEnabled
                  "
                />
                <span class="lw-inline-field__hint">最近</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysForRechargeRules"
                  :min="1"
                  :max="90"
                  :precision="0"
                  :show-button="false"
                  class="lw-input-xs"
                />
                <span class="lw-inline-field__hint">天内打码量为充值金额的</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.recentDaysTurnoverMultiplier"
                  :min="0"
                  :precision="2"
                  :show-button="false"
                  class="lw-input-compact"
                  :disabled="!form.moreRestrictionLimits.recentDaysTurnoverMultiplierEnabled"
                />
                <span class="lw-inline-field__hint">倍才能领取</span>
              </n-space>
            </n-form-item>
          </section>

          <n-divider dashed class="lw-divider">
            <span class="lw-divider__text">参与会员</span>
          </n-divider>
          <section class="lw-section lw-section--tight">
            <n-form-item label="参与会员" required>
              <n-space vertical :size="10" class="lw-claim-levels-wrap">
                <n-checkbox
                  :checked="allMemberTiersSelected"
                  @update:checked="onToggleAllMemberTiers"
                  :disabled="tiersLoading || memberTierOptions.length === 0"
                >
                  全选
                </n-checkbox>
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
            <span class="lw-divider__text">稽核设置</span>
          </n-divider>
          <section class="lw-section lw-section--tight">
            <n-form-item label="稽核倍数" required>
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
            <n-form-item label="奖金稽核指定平台">
              <n-space vertical :size="12" style="width: 100%">
                <n-radio-group
                  v-model:value="form.auditPlatformRestriction"
                  class="lw-radio-row"
                >
                  <n-radio value="all_platforms">不限制</n-radio>
                  <n-radio value="specific_platforms">仅限勾选平台</n-radio>
                  <n-radio value="exclude_platforms">排除勾选平台</n-radio>
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
            <span class="lw-divider__text">规则说明</span>
          </n-divider>
          <section class="lw-section lw-section--tight">
            <n-form-item label="规则说明" required>
              <n-space vertical :size="12" style="width: 100%">
                <n-radio-group
                  v-model:value="form.ruleDescriptionMode"
                  class="lw-radio-row"
                >
                  <n-radio value="custom">自定义</n-radio>
                  <n-radio value="system">系统自带</n-radio>
                </n-radio-group>
                <n-input
                  v-if="form.ruleDescriptionMode === 'custom'"
                  v-model:value="form.ruleDescriptionCustom"
                  type="textarea"
                  :rows="6"
                  maxlength="10000"
                  show-count
                  placeholder="请输入规则说明"
                  class="lw-rule-textarea"
                />
                <div v-else class="lw-system-rule-preview">
                  <div class="lw-system-rule-preview__label">系统规则预览</div>
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
        <n-button class="lw-btn-cancel" @click="visible = false">取消</n-button>
        <n-button class="lw-btn-save" type="primary" :loading="saving" @click="handleSave">
          保存
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
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

const SYSTEM_RULE_PREVIEW = `1. 用户通过有效投注获得幸运值，幸运值在有效期内可用于转盘抽奖。
2. 白银、黄金、钻石转盘消耗不同幸运值，奖品以实际配置为准。
3. 中奖奖金需完成对应稽核倍数后方可提现。
4. 领取入口、会员层级及更多限制以本页配置为准。
5. 平台保留活动解释、风控及人工审核权利。`;

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
      label: tier.tierName || tier.tierCode || `层级${tier.id}`,
    }));
    if (!form.memberTierIds.length && memberTierOptions.value.length) {
      form.memberTierIds = [...allMemberTierIds.value];
    } else if (form.memberTierIds.length) {
      const valid = new Set(allMemberTierIds.value);
      form.memberTierIds = form.memberTierIds.filter((id) => valid.has(id));
    }
  } catch (e) {
    console.error(e);
    message.error('加载会员层级失败');
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
    message.warning('请完善稽核平台选择');
    return;
  }
  if (!form.memberTierIds.length) {
    message.warning('请至少勾选一个参与会员层级');
    return;
  }
  saving.value = true;
  try {
    const snapshot = toSnapshot();
    await putLuckyWheelAdminPublicConfigApi(snapshot);
    emit('saved', snapshot);
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
