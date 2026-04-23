<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="modalTitle"
    class="provident-fund-modal"
    :style="{ width: '980px', maxWidth: '98vw' }"
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

            <n-form-item label="无赠送公积金的充值要求投注倍数" required>
              <n-input-number
                v-model:value="form.betMultipleWithoutGift"
                :min="0"
                :precision="2"
                :show-button="false"
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

          <n-divider dashed class="pf-divider">
            <span class="pf-divider__text">周期与派发</span>
          </n-divider>

          <section class="pf-section pf-section--tight">
            <n-form-item label="重置周期">
              <n-radio-group v-model:value="form.resetCycle" class="pf-radio-row">
                <n-radio value="monthly">每月</n-radio>
                <n-radio value="quarterly">每季度</n-radio>
                <n-radio value="semi_annual">每半年</n-radio>
                <n-radio value="annual">每年</n-radio>
                <n-radio value="none">不限制</n-radio>
              </n-radio-group>
            </n-form-item>
            <n-form-item>
              <template #label>
                <span class="pf-label-with-tip">
                  同周期能否多次参与
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <n-icon size="16" class="pf-tip-icon">
                        <HelpCircleOutline />
                      </n-icon>
                    </template>
                    与「重置周期」的 UTC
                    锚点一致：「只能参与一次」表示同一周期内仅一轮获赠；「完成后可再次参与」表示须完成当前打码后才可开启下一轮（同周期可多次）。
                  </n-tooltip>
                </span>
              </template>
              <n-radio-group
                v-model:value="form.sameCycleParticipation"
                class="pf-radio-row"
              >
                <n-radio value="once_per_cycle">只能参与一次</n-radio>
                <n-radio value="repeat_after_completion">
                  完成后可再次参与
                </n-radio>
              </n-radio-group>
            </n-form-item>
            <n-form-item label="派发方式">
              <n-radio-group
                v-model:value="form.distributionMethod"
                class="pf-radio-row"
              >
                <n-radio value="player_claim_expire">玩家自领-过期作废</n-radio>
                <n-radio value="player_claim_auto">玩家自领-过期自动派发</n-radio>
              </n-radio-group>
            </n-form-item>
          </section>

          <section class="pf-section pf-section--tight">
            <div class="pf-section__title pf-section__title--inline">领取入口</div>
            <n-form-item label="充值成功后直接弹窗">
              <n-switch v-model:value="form.claimPopupAfterRecharge" />
            </n-form-item>
            <n-form-item label="终端可领取">
              <n-space vertical :size="10">
                <n-checkbox v-model:checked="form.claimEntrance.pc">
                  PC可领取
                </n-checkbox>
                <n-checkbox v-model:checked="form.claimEntrance.androidH5">
                  Android H5可领取
                </n-checkbox>
                <n-checkbox v-model:checked="form.claimEntrance.iosH5">
                  iOS H5可领取
                </n-checkbox>
                <div class="pf-claim-app-block">
                  <n-checkbox v-model:checked="form.claimEntrance.androidApp">
                    Android APP可领取
                  </n-checkbox>
                  <n-checkbox v-model:checked="form.claimEntrance.iosApp">
                    iOS APP可领取
                  </n-checkbox>
                  <div class="pf-claim-app-sub">
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
                  <span class="pf-inline-field__hint">同登录设备号只能领取</span>
                  <n-input-number
                    v-model:value="form.claimEntrance.sameDeviceLimitCount"
                    :min="1"
                    :max="10000"
                    :precision="0"
                    :show-button="false"
                    class="pf-input-xs"
                    :disabled="!form.claimEntrance.sameDeviceLimitEnabled"
                  />
                  <span class="pf-inline-field__hint">次</span>
                </n-space>
                <n-space align="center" :size="10" wrap>
                  <n-checkbox
                    v-model:checked="
                      form.claimEntrance.sameFingerprintLimitEnabled
                    "
                  />
                  <span class="pf-inline-field__hint">同浏览器指纹只能领取</span>
                  <n-input-number
                    v-model:value="form.claimEntrance.sameFingerprintLimitCount"
                    :min="1"
                    :max="10000"
                    :precision="0"
                    :show-button="false"
                    class="pf-input-xs"
                    :disabled="!form.claimEntrance.sameFingerprintLimitEnabled"
                  />
                  <span class="pf-inline-field__hint">次</span>
                </n-space>
              </n-space>
            </n-form-item>
          </section>

          <n-divider dashed class="pf-divider">
            <span class="pf-divider__text">更多领取限制</span>
          </n-divider>
          <section class="pf-section pf-section--tight">
            <div class="pf-checkbox-grid">
              <n-checkbox
                v-for="opt in moreRestrictionToggleOptions"
                :key="opt.id"
                :checked="form.moreRestrictions.includes(opt.id)"
                @update:checked="(v) => toggleMoreRestriction(opt.id, v)"
              >
                {{ opt.label }}
              </n-checkbox>
            </div>
            <n-form-item label="同IP领取限制" class="pf-mt">
              <n-space align="center" :size="10" wrap>
                <n-checkbox
                  v-model:checked="form.moreRestrictionLimits.sameIpLimitEnabled"
                />
                <span class="pf-inline-field__hint">同登录IP只能领取</span>
                <n-input-number
                  v-model:value="form.moreRestrictionLimits.sameIpLimitMax"
                  :min="1"
                  :max="10000"
                  :precision="0"
                  :show-button="false"
                  class="pf-input-xs"
                  :disabled="!form.moreRestrictionLimits.sameIpLimitEnabled"
                />
                <span class="pf-inline-field__hint">次</span>
              </n-space>
            </n-form-item>
            <n-form-item label="近期充值笔数">
              <n-space align="center" :size="8" wrap>
                <n-checkbox
                  v-model:checked="
                    form.moreRestrictionLimits.recentDaysMinRechargeCountEnabled
                  "
                />
                <span class="pf-inline-field__hint">最近</span>
                <n-input-number
                  v-model:value="
                    form.moreRestrictionLimits.recentDaysForRechargeRules
                  "
                  :min="1"
                  :max="90"
                  :precision="0"
                  :show-button="false"
                  class="pf-input-xs"
                  :disabled="
                    !form.moreRestrictionLimits.recentDaysMinRechargeCountEnabled &&
                    !form.moreRestrictionLimits.recentDaysMinRechargeAmountEnabled
                  "
                />
                <span class="pf-inline-field__hint">天内充值次数 ≥</span>
                <n-input-number
                  v-model:value="
                    form.moreRestrictionLimits.recentDaysMinRechargeCount
                  "
                  :min="1"
                  :max="999999"
                  :precision="0"
                  :show-button="false"
                  class="pf-input-compact"
                  :disabled="
                    !form.moreRestrictionLimits.recentDaysMinRechargeCountEnabled
                  "
                />
                <span class="pf-inline-field__hint">次才能领取</span>
              </n-space>
            </n-form-item>
            <n-form-item label="近期充值金额 (BRL)">
              <n-space align="center" :size="8" wrap>
                <n-checkbox
                  v-model:checked="
                    form.moreRestrictionLimits.recentDaysMinRechargeAmountEnabled
                  "
                />
                <span class="pf-inline-field__hint">最近</span>
                <n-input-number
                  v-model:value="
                    form.moreRestrictionLimits.recentDaysForRechargeRules
                  "
                  :min="1"
                  :max="90"
                  :precision="0"
                  :show-button="false"
                  class="pf-input-xs"
                  :disabled="
                    !form.moreRestrictionLimits.recentDaysMinRechargeCountEnabled &&
                    !form.moreRestrictionLimits.recentDaysMinRechargeAmountEnabled
                  "
                />
                <span class="pf-inline-field__hint">天内充值金额 ≥</span>
                <n-input-number
                  v-model:value="
                    form.moreRestrictionLimits.recentDaysMinRechargeAmount
                  "
                  :min="0"
                  :precision="2"
                  :show-button="false"
                  class="pf-input-compact"
                  :disabled="
                    !form.moreRestrictionLimits.recentDaysMinRechargeAmountEnabled
                  "
                />
                <span class="pf-inline-field__hint">才能领取</span>
              </n-space>
            </n-form-item>
          </section>

          <n-divider dashed class="pf-divider">
            <span class="pf-divider__text">领取层级</span>
          </n-divider>
          <section class="pf-section pf-section--tight">
            <n-form-item label="可领取层级" required>
              <n-space vertical :size="10" class="pf-claim-levels-wrap">
                <n-checkbox
                  :checked="allClaimLevelsSelected"
                  @update:checked="onToggleAllClaimLevels"
                  :disabled="tiersLoading || claimLevelOptions.length === 0"
                >
                  全选
                </n-checkbox>
                <div class="pf-checkbox-grid">
                  <n-checkbox
                    v-for="opt in claimLevelOptions"
                    :key="opt.id"
                    :checked="form.claimLevels.includes(opt.id)"
                    @update:checked="(v) => toggleClaimLevel(opt.id, v)"
                    :disabled="tiersLoading"
                  >
                    {{ opt.label }}
                  </n-checkbox>
                </div>
                <span v-if="tiersLoading" class="pf-inline-field__hint">正在加载会员层级...</span>
                <span
                  v-else-if="claimLevelOptions.length === 0"
                  class="pf-inline-field__hint"
                >
                  暂无可用会员层级，请先在会员层级管理配置
                </span>
              </n-space>
            </n-form-item>
          </section>

          <n-divider dashed class="pf-divider">
            <span class="pf-divider__text">规则说明</span>
          </n-divider>
          <section class="pf-section pf-section--tight">
            <n-form-item label="前台展示">
              <n-space vertical :size="12" style="width: 100%">
                <n-radio-group
                  v-model:value="form.ruleDescriptionMode"
                  class="pf-radio-row"
                >
                  <n-radio value="system">系统自带</n-radio>
                  <n-radio value="custom">自定义</n-radio>
                </n-radio-group>
                <n-input
                  v-if="form.ruleDescriptionMode === 'custom'"
                  v-model:value="form.ruleDescriptionCustom"
                  type="textarea"
                  :rows="10"
                  placeholder="填写前台展示的公积金规则说明（支持换行）"
                  class="pf-rule-textarea"
                />
                <div v-else class="pf-system-rule-preview">
                  <div class="pf-system-rule-preview__label">系统默认说明预览</div>
                  <pre class="pf-system-rule-preview__body">{{ systemRulePreview }}</pre>
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
  NSwitch,
  useMessage,
} from 'naive-ui';
import { HelpCircleOutline } from '@vicons/ionicons5';
import PlatformGameSelector from '#/components/activity/PlatformGameSelector.vue';
import type { SelectedPlatform } from '#/api/activity/platformSelection';
import {
  type ProvidentFundFormSnapshot,
  cloneSnapshot,
  defaultClaimEntrance,
  defaultMoreRestrictionLimits,
  defaultProvidentFundSnapshot,
  normalizeClaimEntrance,
  normalizeMoreRestrictionLimits,
} from './providentFundTypes';
import { MORE_RESTRICTION_TOGGLE_OPTIONS } from './providentFundUiConstants';
import { putProvidentFundAdminSettingsApi } from '#/api/core/provident-fund-admin';
import { getActiveMemberTiersApi } from '#/api/core/memberTier';

const claimLevelOptions = ref<{ id: string; label: string }[]>([]);
const moreRestrictionToggleOptions = MORE_RESTRICTION_TOGGLE_OPTIONS;

const SYSTEM_RULE_PREVIEW = `1. 每笔充值按活动比例计入公积金（币种 BRL）。
2. 取出公积金需完成对应打码倍数；有赠送与无赠送时倍数可能不同。
3. 活动期内领取次数、累计赠送等以实际配置为准。
4. 支持 PC、H5、Android / iOS APP 等终端（以「领取入口」配置为准）。
5. 防刷、风控与人工审核以平台规则为准。`;

const props = withDefaults(
  defineProps<{
    /** 新增 / 编辑 */
    mode?: 'create' | 'edit';
    /** 编辑时传入的完整配置 */
    initialSnapshot?: ProvidentFundFormSnapshot | null;
    /** 覆盖弹窗标题（后台「公积金设置」） */
    titleText?: string | null;
    /** 为 true 时保存调用后台 API（默认 true） */
    persistToApi?: boolean;
  }>(),
  {
    mode: 'create',
    initialSnapshot: null,
    titleText: null,
    persistToApi: true,
  },
);

const emit = defineEmits<{
  saved: [snapshot: ProvidentFundFormSnapshot];
}>();

const visible = defineModel<boolean>('show', { default: false });

const message = useMessage();
const saving = ref(false);
const platformSelectionValid = ref(true);
const tiersLoading = ref(false);

const systemRulePreview = computed(() => SYSTEM_RULE_PREVIEW);

const modalTitle = computed(() => {
  if (props.titleText) return props.titleText;
  return props.mode === 'edit' ? '编辑公积金' : '新增公积金';
});

const allDynamicClaimLevelIds = computed(() =>
  claimLevelOptions.value.map((item) => item.id),
);

/** 公积金活动币种目前仅开放 BRL */
const currencyOptions = ['BRL'] as const;

const form = reactive({
  nameMode: 'system' as 'system' | 'custom',
  displayName: '公积金',
  currencies: ['BRL'] as string[],
  depositMinByCurrency: {} as Record<string, number | null>,
  giftRatioPercent: 100,
  cumulativeGiftCap: 0,
  giftFrequency: 0,
  betMultipleWithGift: 30,
  betMultipleWithoutGift: 3,
  platformRestriction: 'all_platforms' as
    | 'all_platforms'
    | 'specific_platforms'
    | 'exclude_platforms',
  selectedPlatforms: [] as SelectedPlatform[],
  resetCycle: 'none' as ProvidentFundFormSnapshot['resetCycle'],
  sameCycleParticipation:
    'repeat_after_completion' as ProvidentFundFormSnapshot['sameCycleParticipation'],
  distributionMethod: 'player_claim_expire' as ProvidentFundFormSnapshot['distributionMethod'],
  claimPopupAfterRecharge: true,
  claimEntrance: defaultClaimEntrance(),
  ruleDescriptionMode: 'system' as 'system' | 'custom',
  ruleDescriptionCustom: '',
  moreRestrictions: [] as string[],
  moreRestrictionLimits: defaultMoreRestrictionLimits(),
  claimLevels: [] as string[],
});

function applySnapshot(s: ProvidentFundFormSnapshot) {
  const snap = cloneSnapshot(s);
  form.nameMode = snap.nameMode;
  form.displayName = snap.displayName;
  form.currencies = ['BRL'];
  form.depositMinByCurrency = {
    BRL: snap.depositMinByCurrency?.BRL ?? 0,
  };
  form.giftRatioPercent = snap.giftRatioPercent;
  form.cumulativeGiftCap = snap.cumulativeGiftCap;
  form.giftFrequency = snap.giftFrequency;
  form.betMultipleWithGift = snap.betMultipleWithGift;
  form.betMultipleWithoutGift =
    snap.betMultipleWithoutGift ??
    snap.wagerNewDepositAfterCap ??
    form.betMultipleWithoutGift;
  form.platformRestriction = snap.platformRestriction;
  form.selectedPlatforms = snap.selectedPlatforms?.length
    ? (JSON.parse(
        JSON.stringify(snap.selectedPlatforms),
      ) as SelectedPlatform[])
    : [];
  form.resetCycle = snap.resetCycle ?? 'none';
  form.sameCycleParticipation =
    snap.sameCycleParticipation === 'once_per_cycle'
      ? 'once_per_cycle'
      : 'repeat_after_completion';
  form.distributionMethod =
    snap.distributionMethod ?? 'player_claim_expire';
  form.claimPopupAfterRecharge = snap.claimPopupAfterRecharge ?? true;
  Object.assign(
    form.claimEntrance,
    normalizeClaimEntrance(snap.claimEntrance),
  );
  form.ruleDescriptionMode = snap.ruleDescriptionMode ?? 'system';
  form.ruleDescriptionCustom = snap.ruleDescriptionCustom ?? '';
  form.moreRestrictions = snap.moreRestrictions?.length
    ? [...snap.moreRestrictions]
    : [];
  Object.assign(
    form.moreRestrictionLimits,
    normalizeMoreRestrictionLimits(snap.moreRestrictionLimits),
  );
  form.claimLevels =
    snap.claimLevels?.length > 0
      ? [...snap.claimLevels]
      : [...allDynamicClaimLevelIds.value];
  ensureDepositKeys();
}

function resetForm() {
  applySnapshot(defaultProvidentFundSnapshot());
}

function toSnapshot(): ProvidentFundFormSnapshot {
  return cloneSnapshot({
    nameMode: form.nameMode,
    displayName: form.displayName,
    currencies: ['BRL'],
    depositMinByCurrency: {
      BRL: form.depositMinByCurrency.BRL ?? 0,
    },
    giftRatioPercent: form.giftRatioPercent,
    cumulativeGiftCap: form.cumulativeGiftCap,
    giftFrequency: form.giftFrequency,
    betMultipleWithGift: form.betMultipleWithGift,
    betMultipleWithoutGift: form.betMultipleWithoutGift,
    wagerNewDepositAfterCap: form.betMultipleWithoutGift,
    platformRestriction: form.platformRestriction,
    selectedPlatforms: JSON.parse(
      JSON.stringify(form.selectedPlatforms),
    ) as SelectedPlatform[],
    resetCycle: form.resetCycle,
    sameCycleParticipation: form.sameCycleParticipation,
    distributionMethod: form.distributionMethod,
    claimPopupAfterRecharge: form.claimPopupAfterRecharge,
    claimEntrance: { ...form.claimEntrance },
    ruleDescriptionMode: form.ruleDescriptionMode,
    ruleDescriptionCustom: form.ruleDescriptionCustom,
    moreRestrictions: [...form.moreRestrictions],
    moreRestrictionLimits: { ...form.moreRestrictionLimits },
    claimLevels: [...form.claimLevels],
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

function toggleMoreRestriction(id: string, checked: boolean) {
  const set = new Set(form.moreRestrictions);
  if (checked) set.add(id);
  else set.delete(id);
  form.moreRestrictions = [...set];
}

function toggleClaimLevel(id: string, checked: boolean) {
  const set = new Set(form.claimLevels);
  if (checked) set.add(id);
  else set.delete(id);
  form.claimLevels = [...set];
}

const allClaimLevelsSelected = computed(
  () =>
    allDynamicClaimLevelIds.value.length > 0 &&
    allDynamicClaimLevelIds.value.every((id) => form.claimLevels.includes(id)),
);

function onToggleAllClaimLevels(checked: boolean) {
  form.claimLevels = checked ? [...allDynamicClaimLevelIds.value] : [];
}

async function loadClaimLevelOptions() {
  tiersLoading.value = true;
  try {
    const tiers = await getActiveMemberTiersApi();
    claimLevelOptions.value = tiers.map((tier) => ({
      id: String(tier.id),
      label: tier.tierName || tier.tierCode || `层级${tier.id}`,
    }));
    if (!form.claimLevels.length && claimLevelOptions.value.length > 0) {
      form.claimLevels = [...allDynamicClaimLevelIds.value];
    } else if (form.claimLevels.length > 0) {
      const valid = new Set(allDynamicClaimLevelIds.value);
      form.claimLevels = form.claimLevels.filter((id) => valid.has(id));
    }
  } catch (e) {
    console.error(e);
    message.error('加载会员层级失败');
    claimLevelOptions.value = [];
  } finally {
    tiersLoading.value = false;
  }
}

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
    loadClaimLevelOptions();
  },
);

watch(
  () => props.initialSnapshot,
  (snap) => {
    if (visible.value && props.mode === 'edit' && snap) {
      applySnapshot(snap);
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
  if (!form.claimLevels.length) {
    message.warning('请至少勾选一个领取层级');
    return;
  }
  if (!form.currencies.length) {
    message.warning('请至少选择一个币种');
    return;
  }
  saving.value = true;
  try {
    const snapshot = toSnapshot();
    if (props.persistToApi) {
      await putProvidentFundAdminSettingsApi(
        snapshot as unknown as Record<string, unknown>,
      );
    } else {
      await new Promise((r) => setTimeout(r, 200));
    }
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

.pf-section__title--inline {
  margin-top: 4px;
  margin-bottom: 10px;
}

.pf-checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px 14px;
}

.pf-claim-levels-wrap {
  width: 100%;
}

.pf-claim-levels-wrap :deep(.n-space-item) {
  width: 100%;
}

.pf-mt {
  margin-top: 12px;
}

.pf-input-xs {
  width: 92px;
}

.pf-claim-app-block {
  padding-left: 10px;
  border-left: 3px solid rgb(229 231 235);
}

.pf-claim-app-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 8px;
  padding-left: 12px;
}

.pf-rule-textarea {
  width: 100%;
  max-width: 100%;
}

.pf-system-rule-preview {
  border-radius: 10px;
  border: 1px solid rgb(229 231 235);
  background: rgb(249 250 251);
  padding: 12px 14px;
}

.pf-system-rule-preview__label {
  font-size: 12px;
  font-weight: 600;
  color: rgb(107 114 128);
  margin-bottom: 8px;
}

.pf-system-rule-preview__body {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: rgb(75 85 99);
  white-space: pre-wrap;
  font-family: ui-sans-serif, system-ui, sans-serif;
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
