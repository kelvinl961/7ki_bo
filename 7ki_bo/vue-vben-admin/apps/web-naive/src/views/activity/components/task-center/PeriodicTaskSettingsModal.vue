<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="title"
    class="periodic-settings-modal"
    :style="{ width: '960px', maxWidth: '96vw' }"
    :mask-closable="false"
    :content-style="{ maxHeight: '72vh', overflow: 'auto' }"
  >
    <n-form label-placement="left" label-width="150" size="small" class="periodic-settings-form">
      <n-form-item v-if="isThreeDay" label="最终神秘大奖" required>
        <div class="entry-row">
          <n-switch v-model:value="form.finalPrizeEnabled" />
          <n-input-number
            v-model:value="form.finalPrizeMin"
            :min="0"
            :precision="2"
            :disabled="!form.finalPrizeEnabled"
            class="prize-input"
          />
          <span>—</span>
          <n-input-number
            v-model:value="form.finalPrizeMax"
            :min="0"
            :precision="2"
            :disabled="!form.finalPrizeEnabled"
            class="prize-input"
          />
        </div>
      </n-form-item>

      <n-form-item label="参与会员" required>
        <div class="field-block">
          <n-checkbox
            :checked="form.memberGroupsSelectAll"
            @update:checked="toggleSelectAll"
          >
            全选
          </n-checkbox>
          <div class="member-grid">
            <n-checkbox
              v-for="group in memberOptions"
              :key="group.key"
              :checked="selectedGroups.includes(group.key)"
              @update:checked="(checked) => toggleGroup(group.key, checked)"
            >
              {{ group.label }}
            </n-checkbox>
          </div>
        </div>
      </n-form-item>

      <n-form-item label="领取入口" required>
        <div class="field-block">
          <div class="entry-row">
            <n-checkbox v-model:checked="form.claimAndroidApp">Android_APP可领取</n-checkbox>
            <n-checkbox v-model:checked="form.claimIOSApp">iOS_APP可领取</n-checkbox>
          </div>
          <div class="entry-row entry-box">
            <n-checkbox v-model:checked="form.claimOriginalApp">原生APP</n-checkbox>
            <n-checkbox v-model:checked="form.claimPolarApp">极速APP</n-checkbox>
            <n-checkbox v-model:checked="form.claimMarketBag">马甲包</n-checkbox>
            <n-checkbox v-model:checked="form.claimPWAFastApp">PWA快捷APP</n-checkbox>
            <n-checkbox v-model:checked="form.claimIOSRedirect">iOS描述签</n-checkbox>
          </div>
          <div class="entry-row">
            <n-checkbox v-model:checked="form.claimSameDeviceOnce">同登录设备号只能领取</n-checkbox>
            <n-input-number v-model:value="form.sameDeviceLimitCount" :min="1" size="small" class="count-input" />
            <span>次</span>
          </div>
          <div class="entry-row">
            <n-checkbox v-model:checked="form.claimPCWeb">PC可领取</n-checkbox>
            <n-checkbox v-model:checked="form.claimAndroidH5">Android_H5可领取</n-checkbox>
            <n-checkbox v-model:checked="form.claimIOSH5">iOS_H5可领取</n-checkbox>
            <n-checkbox v-model:checked="form.claimDesktopShortcut">桌面快捷方式</n-checkbox>
          </div>
          <div class="entry-row">
            <n-checkbox v-model:checked="form.fingerprintOnce">同浏览器指纹只能领取</n-checkbox>
            <n-input-number v-model:value="form.fingerprintLimitCount" :min="1" size="small" class="count-input" />
            <span>次</span>
          </div>
          <div class="entry-row">
            <span>仅限WS浏览器领取</span>
            <n-switch v-model:value="form.wsBrowserOnly" />
          </div>
        </div>
      </n-form-item>

      <n-form-item label="更多领取限制">
        <div class="restrict-grid">
          <n-checkbox v-model:checked="form.requirePhoneVerification">完成手机短信验证才能领取</n-checkbox>
          <n-checkbox v-model:checked="form.requireEmailVerification">完成邮箱验证才能领取</n-checkbox>
          <n-checkbox v-model:checked="form.requireBirthdaySet">完成生日设置才能领取</n-checkbox>
          <n-checkbox v-model:checked="form.requireBankBinding">完成银行卡绑定才能领取</n-checkbox>
          <n-checkbox v-model:checked="form.requirePaymentMethod">绑定虚拟货币才能领取</n-checkbox>
          <n-checkbox v-model:checked="form.requireThirdPartyWallet">绑定三方钱包才能领取</n-checkbox>
          <n-checkbox v-model:checked="form.requireCityBinding">绑定收款方式才能领取</n-checkbox>
          <n-checkbox v-model:checked="form.requireRealNameAuth">填写真实姓名才能领取</n-checkbox>
          <n-checkbox v-model:checked="form.requireBiometricAuth">绑定生物识别才可领取</n-checkbox>
          <n-checkbox v-model:checked="form.requireKycVerification">完成KYC认证才可领取</n-checkbox>
          <n-checkbox v-model:checked="form.requireFirstRecharge">完成首充才能领取</n-checkbox>
          <n-checkbox v-model:checked="form.onlyRegisteredDevices">仅注册设备号领取</n-checkbox>
          <n-checkbox v-model:checked="form.requireThirdPartyQuickLogin">绑定三方快捷登录才能领取</n-checkbox>
          <div class="entry-row">
            <n-checkbox v-model:checked="form.sameIpOnce">同登录IP号只能领取</n-checkbox>
            <n-input-number v-model:value="form.sameIpLimitCount" :min="1" size="small" class="count-input" />
            <span>次</span>
          </div>
          <div class="entry-row">
            <n-checkbox v-model:checked="form.sameNameOnlyOnce">同姓名只能领取</n-checkbox>
            <n-input-number v-model:value="form.sameNameLimitCount" :min="1" :max="999999" size="small" class="count-input" />
            <span>次</span>
          </div>
        </div>
      </n-form-item>

      <n-form-item label=" ">
        <div class="field-block">
          <div class="entry-row">
            <n-checkbox v-model:checked="form.recentDepositCountEnabled">最近</n-checkbox>
            <n-input-number v-model:value="form.recentDepositCountDays" :min="1" :max="90" size="small" class="count-input" />
            <span>天内，累计充值次数≥</span>
            <n-input-number v-model:value="form.recentDepositCount" :min="1" size="small" class="count-input" />
            <span>次，才能领取</span>
          </div>
          <div class="entry-row">
            <n-checkbox v-model:checked="form.recentDepositAmountEnabled">最近</n-checkbox>
            <n-input-number v-model:value="form.recentDepositAmountDays" :min="1" :max="90" size="small" class="count-input" />
            <span>天内，累计充值金额≥</span>
            <n-input-number v-model:value="form.recentDepositAmount" :min="0" size="small" class="count-input" />
            <span>才能领取</span>
          </div>
          <div class="entry-row">
            <n-checkbox v-model:checked="form.recentDepositDaysEnabled">最近</n-checkbox>
            <n-input-number v-model:value="form.recentDepositDaysWindow" :min="1" :max="90" size="small" class="count-input" />
            <span>天内，累计充值天数≥</span>
            <n-input-number v-model:value="form.recentDepositDays" :min="1" size="small" class="count-input" />
            <span>天，才能领取</span>
          </div>
          <div class="entry-row">
            <n-checkbox v-model:checked="form.recentWagerAmountEnabled">最近</n-checkbox>
            <n-input-number v-model:value="form.recentWagerAmountDays" :min="1" :max="90" size="small" class="count-input" />
            <span>天内，累计打码金额≥</span>
            <n-input-number v-model:value="form.recentWagerAmount" :min="0" size="small" class="count-input" />
            <span>才能领取</span>
          </div>
          <div class="entry-row">
            <n-checkbox v-model:checked="form.wagerMultipleOfDepositEnabled">最近</n-checkbox>
            <n-input-number v-model:value="form.wagerMultipleDays" :min="1" :max="90" size="small" class="count-input" />
            <span>天内打码是期间充值的</span>
            <n-input-number v-model:value="form.wagerMultiple" :min="0" size="small" class="count-input" />
            <span>倍，才能领取</span>
          </div>
        </div>
      </n-form-item>

      <n-form-item label="派发方式" required>
        <n-radio-group v-model:value="form.distributionMethod">
          <n-space vertical>
            <n-radio value="player_claim_void">玩家自领-过期作废</n-radio>
            <n-radio value="player_claim_auto">玩家自领-过期自动派发</n-radio>
            <n-radio value="system_auto">系统立即自动派发</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="领取时间" required>
        <n-radio-group v-model:value="form.claimTime">
          <n-space>
            <n-radio value="next_day">次日</n-radio>
            <n-radio value="same_day">当天实时(影响留存)</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="奖励领取过期天数" required>
        <n-input-number v-model:value="form.claimExpireDays" :min="0" style="width: 220px" />
      </n-form-item>
      <n-form-item label="登录前弹窗方式" required>
        <n-select
          v-model:value="form.loginBeforePopupMethod"
          :options="popupOptions"
          style="width: 220px"
        />
      </n-form-item>
      <n-form-item label="登录后弹窗方式" required>
        <n-select
          v-model:value="form.loginAfterPopupMethod"
          :options="popupOptions"
          style="width: 220px"
        />
      </n-form-item>
      <n-form-item label="稽核倍数" required>
        <n-input-number v-model:value="form.auditMultiplier" :min="0" :precision="2" style="width: 220px" />
      </n-form-item>
      <n-form-item label="奖金稽核指定平台">
        <div class="field-block">
          <n-radio-group v-model:value="form.bonusAuditPlatformRestriction">
            <n-space>
              <n-radio value="UNLIMITED">不限制</n-radio>
              <n-radio value="SPECIFIED_ONLY">仅限勾选平台</n-radio>
              <n-radio value="EXCLUDE_SPECIFIED">排除勾选平台</n-radio>
            </n-space>
          </n-radio-group>
          <div
            v-if="form.bonusAuditPlatformRestriction !== 'UNLIMITED'"
            class="platform-grid"
            style="margin-top: 8px"
          >
            <n-spin :show="platformsLoading" size="small">
              <div class="platform-grid-inner">
                <div class="platform-grid-cards">
                  <div
                    v-for="p in platformList"
                    :key="p.id"
                    class="platform-card"
                    :class="{ 'platform-card--on': isPlatformSelected(p.id) }"
                    @click="togglePlatform(p.id)"
                  >
                    <div class="platform-card-icon">
                      <img
                        v-if="p.imageUrl"
                        :src="p.imageUrl"
                        :alt="p.platformName"
                        class="platform-card-img"
                      />
                      <span v-else>{{ (p.platformId || '?').substring(0, 2) }}</span>
                    </div>
                    <div class="platform-card-body">
                      <div class="platform-card-name">{{ p.platformName }}</div>
                      <div class="platform-card-meta">
                        {{ (p.gameType || '').toUpperCase() }}
                        <template v-if="p.gameCount != null">
                          • {{ p.gameCount }} 个游戏
                        </template>
                      </div>
                    </div>
                    <n-checkbox
                      :checked="isPlatformSelected(p.id)"
                      @click.stop
                      @update:checked="(c: boolean) => setPlatformSelected(p.id, c)"
                    />
                  </div>
                </div>
                <div v-if="!platformsLoading && platformList.length === 0" class="platform-empty">
                  暂无可用平台
                </div>
              </div>
            </n-spin>
          </div>
        </div>
      </n-form-item>
      <n-form-item label="奖金提现方式限制">
        <div class="field-block">
          <n-radio-group v-model:value="form.bonusWithdrawalMethodRestriction">
            <n-space>
              <n-radio value="UNLIMITED">不限制</n-radio>
              <n-radio value="SPECIFIED_ONLY">仅限勾选方式</n-radio>
            </n-space>
          </n-radio-group>
          <n-checkbox-group
            v-if="form.bonusWithdrawalMethodRestriction === 'SPECIFIED_ONLY'"
            v-model:value="form.bonusWithdrawalMethods"
            style="margin-top: 8px"
          >
            <n-space>
              <n-checkbox
                v-for="method in withdrawMethodOptions"
                :key="method.value"
                :value="method.value"
                :label="method.label"
              />
            </n-space>
          </n-checkbox-group>
        </div>
      </n-form-item>
      <n-form-item label="规则说明" required>
        <div class="field-block">
          <n-radio-group v-model:value="form.ruleDescriptionType">
            <n-space>
              <n-radio value="custom">自定义</n-radio>
              <n-radio value="system">系统自带</n-radio>
            </n-space>
          </n-radio-group>
          <n-input
            v-if="form.ruleDescriptionType === 'custom'"
            v-model:value="form.ruleDescriptionCustomText"
            type="textarea"
            :rows="6"
            style="margin-top: 8px"
          />
          <pre v-else class="rule-preview">{{ systemText }}</pre>
        </div>
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="visible = false">取消</n-button>
        <n-button type="primary" :loading="saving" @click="submit">确认</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  NButton,
  NCheckbox,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NSpin,
  NSwitch,
  useMessage,
} from 'naive-ui';
import { getActiveMemberTiersApi } from '#/api/core/memberTier';
import { getGamePlatformListApi } from '#/api/game/platform';
import { taskCenterPeriodicApi } from '#/api/taskCenterPeriodic';
import {
  MEMBER_GROUP_OPTIONS,
  systemRuleText,
  threeDaySystemRuleText,
  type PeriodicSettingsCategory,
} from './periodicTaskRules';

const props = defineProps<{
  show: boolean;
  category: PeriodicSettingsCategory;
}>();
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'saved'): void;
}>();

const message = useMessage();
const saving = ref(false);
const visible = ref(false);
watch(
  () => props.show,
  (open) => {
    visible.value = open;
  },
  { immediate: true },
);
watch(visible, (open) => {
  if (open !== props.show) emit('update:show', open);
});
const enabled = ref(true);
const liveTiers = ref<Array<{ key: string; label: string }>>([]);
const isThreeDay = computed(() => props.category === 'THREE_DAY_MYSTERY');
const memberOptions = computed(() =>
  isThreeDay.value && liveTiers.value.length ? liveTiers.value : MEMBER_GROUP_OPTIONS,
);
const selectedGroups = ref<string[]>(MEMBER_GROUP_OPTIONS.map((item) => item.key));

const popupOptions = [
  { label: '不弹窗', value: 'NO_POPUP' },
  { label: '高频弹窗', value: 'HIGH_FREQUENCY' },
  { label: '自定义', value: 'CUSTOM' },
];

function emptyForm() {
  return {
    memberGroupsSelectAll: true,
    claimAndroidApp: true,
    claimIOSApp: true,
    claimOriginalApp: true,
    claimPolarApp: true,
    claimMarketBag: true,
    claimPWAFastApp: true,
    claimIOSRedirect: true,
    claimSameDeviceOnce: false,
    sameDeviceLimitCount: 1,
    claimPCWeb: true,
    claimAndroidH5: true,
    claimIOSH5: true,
    fingerprintOnce: false,
    fingerprintLimitCount: 1,
    wsBrowserOnly: false,
    requirePhoneVerification: false,
    requireEmailVerification: false,
    requireBirthdaySet: false,
    requireBankBinding: false,
    requirePaymentMethod: false,
    requireThirdPartyWallet: false,
    requireCityBinding: false,
    requireRealNameAuth: false,
    requireBiometricAuth: false,
    requireKycVerification: false,
    requireFirstRecharge: false,
    onlyRegisteredDevices: false,
    requireThirdPartyQuickLogin: false,
    claimDesktopShortcut: false,
    finalPrizeEnabled: true,
    finalPrizeMin: 1,
    finalPrizeMax: 2,
    sameIpOnce: false,
    sameIpLimitCount: 1,
    sameNameOnlyOnce: false,
    sameNameLimitCount: 1,
    recentDepositCountEnabled: false,
    recentDepositCountDays: 1,
    recentDepositCount: 1,
    recentDepositAmountEnabled: false,
    recentDepositAmountDays: 1,
    recentDepositAmount: 0,
    recentDepositDaysEnabled: false,
    recentDepositDaysWindow: 1,
    recentDepositDays: 1,
    recentWagerAmountEnabled: false,
    recentWagerAmountDays: 1,
    recentWagerAmount: 0,
    wagerMultipleOfDepositEnabled: false,
    wagerMultipleDays: 1,
    wagerMultiple: 1,
    distributionMethod: 'player_claim_auto',
    claimTime: 'same_day',
    claimExpireDays: 0,
    loginBeforePopupMethod: 'NO_POPUP',
    loginAfterPopupMethod: 'NO_POPUP',
    auditMultiplier: 2,
    bonusAuditPlatformRestriction: 'UNLIMITED',
    bonusAuditPlatforms: [] as Array<number | string>,
    bonusWithdrawalMethodRestriction: 'UNLIMITED',
    bonusWithdrawalMethods: [] as string[],
    ruleDescriptionType: 'system',
    ruleDescriptionCustomText: '',
  };
}

const form = reactive(emptyForm());
const platformsLoading = ref(false);
const platformList = ref<
  Array<{
    id: number;
    platformId: string;
    platformName: string;
    gameType: string;
    gameCount?: number;
    imageUrl?: string;
  }>
>([]);
const withdrawMethodOptions = [
  { label: 'PIX', value: 'PIX' },
  { label: '银行卡', value: 'BANK' },
  { label: 'USDT', value: 'USDT' },
  { label: '支付宝', value: 'ALIPAY' },
  { label: '微信', value: 'WECHAT' },
];

async function loadPlatformOptions() {
  if (platformList.value.length > 0) return;
  platformsLoading.value = true;
  try {
    const res = await getGamePlatformListApi({ pageSize: 1000, isEnabled: true });
    const list = (res as any)?.list ?? (res as any)?.data?.list ?? [];
    platformList.value = (list as any[])
      .filter((p) => p?.id != null)
      .map((p) => ({
        id: Number(p.id),
        platformId: String(p.platformId || p.id),
        platformName: String(p.platformName || p.name || p.platformId || p.id),
        gameType: String(p.gameType || 'ALL'),
        gameCount: p.subGameCount ?? p.gameCount ?? 0,
        imageUrl: String(p.logoUrl || p.imageUrl || p.imageHorizontalUrl || '').trim() || undefined,
      }));
  } catch {
    platformList.value = [];
  } finally {
    platformsLoading.value = false;
  }
}

function isPlatformSelected(id: number): boolean {
  return form.bonusAuditPlatforms.some((x) => Number(x) === id);
}

function setPlatformSelected(id: number, checked: boolean) {
  if (checked) {
    if (!isPlatformSelected(id)) form.bonusAuditPlatforms.push(id);
  } else {
    form.bonusAuditPlatforms = form.bonusAuditPlatforms.filter(
      (x) => Number(x) !== id,
    );
  }
}

function togglePlatform(id: number) {
  setPlatformSelected(id, !isPlatformSelected(id));
}
const title = computed(() => {
  if (props.category === 'WEEKLY_TASK') return '每周任务设置';
  if (props.category === 'THREE_DAY_MYSTERY') return '三日任务设置';
  return '每日任务设置';
});

function claimPlatformLabel(): string {
  const labels: Array<[boolean, string]> = [
    [form.claimAndroidApp, 'Android_APP'],
    [form.claimIOSApp, 'iOS_APP'],
    [form.claimPCWeb, 'PC'],
    [form.claimAndroidH5, 'Android_H5'],
    [form.claimIOSH5, 'iOS_H5'],
    [form.claimDesktopShortcut, '桌面快捷方式'],
  ];
  return labels.filter(([on]) => on).map(([, label]) => label).join('、');
}

function claimConditionText(): string {
  if (form.recentDepositDaysEnabled) {
    return `需要完成如下任务才可领取：最近${form.recentDepositDaysWindow}天内，累计充值天数≥${form.recentDepositDays}`;
  }
  if (form.recentDepositCountEnabled) {
    return `需要完成如下任务才可领取：最近${form.recentDepositCountDays}天内，累计充值次数≥${form.recentDepositCount}`;
  }
  if (form.recentDepositAmountEnabled) {
    return `需要完成如下任务才可领取：最近${form.recentDepositAmountDays}天内，累计充值金额≥${form.recentDepositAmount}`;
  }
  return '完成当日抽取的全部任务才可领取';
}

const systemText = computed(() =>
  isThreeDay.value
    ? threeDaySystemRuleText({
        auditMultiplier: form.auditMultiplier,
        claimPlatforms: claimPlatformLabel(),
        claimCondition: claimConditionText(),
      })
    : systemRuleText(props.category as 'DAILY_TASK' | 'WEEKLY_TASK', form.auditMultiplier),
);

function allMemberKeys() {
  return memberOptions.value.map((item) => item.key);
}

function toggleSelectAll(checked: boolean) {
  form.memberGroupsSelectAll = checked;
  selectedGroups.value = checked ? allMemberKeys() : [];
}

function toggleGroup(key: string, checked: boolean) {
  if (checked) {
    if (!selectedGroups.value.includes(key)) selectedGroups.value.push(key);
  } else {
    selectedGroups.value = selectedGroups.value.filter((item) => item !== key);
  }
  form.memberGroupsSelectAll = selectedGroups.value.length === allMemberKeys().length;
}

async function loadLiveTiers() {
  if (!isThreeDay.value) return;
  const rows = await getActiveMemberTiersApi();
  liveTiers.value = rows
    .filter((tier) => tier?.id != null)
    .map((tier) => ({ key: String(tier.id), label: tier.tierName || String(tier.id) }));
}

watch(
  () => props.show,
  async (open) => {
    if (!open) return;
    try {
      await Promise.all([loadLiveTiers(), loadPlatformOptions()]);
      const res: any = await taskCenterPeriodicApi.getSettings(props.category);
      const data = res?.data ?? res;
      enabled.value = data?.enabled !== false;
      const saved = data?.settings && typeof data.settings === 'object' ? data.settings : {};
      const base = emptyForm();
      if (isThreeDay.value) {
        base.auditMultiplier = 0;
        base.loginAfterPopupMethod = 'HIGH_FREQUENCY';
      }
      Object.assign(form, base, saved);
      const storedIds = Array.isArray(saved.memberTierIds)
        ? saved.memberTierIds.map((id: number | string) => String(id))
        : [];
      const groups = Array.isArray(saved.memberGroups)
        ? saved.memberGroups.map((id: number | string) => String(id))
        : [];
      if (saved.memberGroupsSelectAll === true) {
        selectedGroups.value = allMemberKeys();
      } else if (storedIds.length) {
        selectedGroups.value = storedIds;
      } else if (groups.length) {
        selectedGroups.value = groups;
      } else {
        selectedGroups.value = allMemberKeys();
      }
      form.memberGroupsSelectAll =
        saved.memberGroupsSelectAll === true ||
        selectedGroups.value.length === allMemberKeys().length;
    } catch (error: any) {
      message.error(error?.message || '读取设置失败');
    }
  },
  { immediate: true },
);

async function submit() {
  saving.value = true;
  try {
    if (
      isThreeDay.value &&
      form.finalPrizeEnabled &&
      Number(form.finalPrizeMax) < Number(form.finalPrizeMin)
    ) {
      message.error('最终神秘大奖的最大值不能小于最小值');
      return;
    }
    const tierIds = selectedGroups.value
      .map((key) => Number(key))
      .filter((id) => Number.isFinite(id));
    await taskCenterPeriodicApi.saveSettings({
      category: props.category,
      enabled: enabled.value,
      settings: {
        ...form,
        memberGroups: isThreeDay.value
          ? tierIds
          : form.memberGroupsSelectAll
            ? MEMBER_GROUP_OPTIONS.map((item) => item.key)
            : [...selectedGroups.value],
        ...(isThreeDay.value
          ? {
              memberTierIds: tierIds,
              memberGroupsSelectAll: form.memberGroupsSelectAll,
            }
          : {}),
      },
    });
    message.success('已保存');
    visible.value = false;
    emit('saved');
  } catch (error: any) {
    message.error(error?.message || '保存失败');
  } finally {
    saving.value = false;
  }
}
</script>

<style>
.periodic-settings-form .field-block {
  width: 100%;
}
.periodic-settings-form .member-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px 12px;
  margin-top: 8px;
}
.periodic-settings-form .entry-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.periodic-settings-form .entry-box {
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}
.periodic-settings-form .restrict-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 12px;
  width: 100%;
}
.periodic-settings-form .count-input,
.periodic-settings-form .prize-input {
  width: 120px;
}
.periodic-settings-form .rule-preview {
  margin-top: 8px;
  padding: 12px;
  white-space: pre-wrap;
  line-height: 1.7;
  font-size: 13px;
  color: #4b5563;
  background: #f8fafc;
  border-radius: 4px;
}
.periodic-settings-form .platform-grid {
  width: 100%;
}
.periodic-settings-form .platform-grid-inner {
  max-height: 320px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 12px;
}
.periodic-settings-form .platform-grid-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.periodic-settings-form .platform-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
}
.periodic-settings-form .platform-card--on {
  border-color: #3b82f6;
  background: #eff6ff;
}
.periodic-settings-form .platform-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #e5e7eb;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}
.periodic-settings-form .platform-card-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.periodic-settings-form .platform-card-body {
  flex: 1;
  min-width: 0;
}
.periodic-settings-form .platform-card-name {
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.periodic-settings-form .platform-card-meta {
  font-size: 12px;
  color: #6b7280;
}
.periodic-settings-form .platform-empty {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}
</style>
