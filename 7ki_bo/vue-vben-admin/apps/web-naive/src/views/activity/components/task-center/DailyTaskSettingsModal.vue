<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    title="每日任务设置"
    style="width: 90vw; max-width: 880px; max-height: 90vh"
    class="daily-task-settings-modal"
    to="body"
    :z-index="5000"
  >
    <div class="max-h-[70vh] overflow-y-auto pr-1">
      <n-form label-placement="left" label-width="120" size="medium">
        <n-form-item label="参与会员" required>
          <div class="w-full space-y-2">
            <n-checkbox
              v-model:checked="form.memberGroupsSelectAll"
              @update:checked="onSelectAllMembers"
              >全选</n-checkbox
            >
            <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
              <n-checkbox
                v-for="m in memberOptions"
                :key="m.value"
                :checked="form.memberGroups.includes(m.value)"
                @update:checked="(v: boolean) => toggleMember(m.value, v)"
                >{{ m.label }}</n-checkbox
              >
            </div>
          </div>
        </n-form-item>

        <n-form-item label="领取入口" required>
          <div class="w-full space-y-2">
            <div class="flex flex-wrap gap-3">
              <n-checkbox v-model:checked="form.claimAndroidApp"
                >Android_APP可领取</n-checkbox
              >
              <n-checkbox v-model:checked="form.claimIOSApp"
                >iOS_APP可领取</n-checkbox
              >
            </div>
            <div
              v-if="form.claimAndroidApp || form.claimIOSApp"
              class="ml-4 flex flex-wrap gap-3"
            >
              <n-checkbox v-model:checked="form.claimOriginalApp"
                >原生APP</n-checkbox
              >
              <n-checkbox v-model:checked="form.claimPolarApp"
                >极速APP</n-checkbox
              >
              <n-checkbox v-model:checked="form.claimMarketBag"
                >马甲包</n-checkbox
              >
              <n-checkbox v-model:checked="form.claimPWAFastApp"
                >PWA快捷APP</n-checkbox
              >
              <n-checkbox v-model:checked="form.claimIOSRedirect"
                >iOS描述签</n-checkbox
              >
            </div>
            <div class="flex flex-wrap gap-3">
              <n-checkbox v-model:checked="form.claimPCWeb">PC可领取</n-checkbox>
              <n-checkbox v-model:checked="form.claimAndroidH5"
                >Android_H5可领取</n-checkbox
              >
              <n-checkbox v-model:checked="form.claimIOSH5"
                >iOS_H5可领取</n-checkbox
              >
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <n-checkbox v-model:checked="form.claimSameDeviceOnce"
                >同登录设备号只能领取</n-checkbox
              >
              <n-input-number
                v-model:value="form.claimSameDeviceLimit"
                :min="1"
                size="small"
                style="width: 80px"
              />
              <span>次</span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <n-checkbox v-model:checked="form.claimSameFingerprintOnce"
                >同浏览器指纹只能领取</n-checkbox
              >
              <n-input-number
                v-model:value="form.claimSameFingerprintLimit"
                :min="1"
                size="small"
                style="width: 80px"
              />
              <span>次</span>
            </div>
            <div class="flex items-center gap-2">
              <span>仅限WS浏览器领取</span>
              <n-switch v-model:value="form.onlyWsBrowser" />
            </div>
          </div>
        </n-form-item>

        <n-form-item label="更多领取限制">
          <div class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            <n-checkbox v-model:checked="form.requirePhoneVerification"
              >完成手机短信验证才能领取</n-checkbox
            >
            <n-checkbox v-model:checked="form.requireEmailVerification"
              >完成邮箱验证才能领取</n-checkbox
            >
            <n-checkbox v-model:checked="form.requireBirthdaySet"
              >完成生日设置才能领取</n-checkbox
            >
            <n-checkbox v-model:checked="form.requireBankBinding"
              >完成银行卡绑定才能领取</n-checkbox
            >
            <n-checkbox v-model:checked="form.requireCryptoWallet"
              >完成虚拟币钱包绑定才能领取</n-checkbox
            >
            <n-checkbox v-model:checked="form.requireThirdPartyWallet"
              >完成第三方钱包绑定才能领取</n-checkbox
            >
            <n-checkbox v-model:checked="form.requireKycVerification"
              >完成KYC认证才能领取</n-checkbox
            >
            <n-checkbox v-model:checked="form.requireRealNameAuth"
              >完成实名认证才能领取</n-checkbox
            >
            <n-checkbox v-model:checked="form.requireBiometricAuth"
              >完成生物识别才能领取</n-checkbox
            >
            <n-checkbox v-model:checked="form.requireFirstRecharge"
              >完成首充才能领取</n-checkbox
            >
            <n-checkbox v-model:checked="form.onlyRegisteredDevices"
              >仅注册设备号领取</n-checkbox
            >
            <div class="flex flex-wrap items-center gap-2">
              <n-checkbox v-model:checked="form.sameIpOnce"
                >同登录IP只能领取</n-checkbox
              >
              <n-input-number
                v-model:value="form.sameIpLimit"
                :min="1"
                size="small"
                style="width: 80px"
              />
              <span>次</span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <n-checkbox v-model:checked="form.sameNameOnlyOnce"
                >同姓名只能领取</n-checkbox
              >
              <n-input-number
                v-model:value="form.sameNameLimit"
                :min="1"
                :max="999999"
                size="small"
                style="width: 100px"
              />
              <span>次</span>
            </div>
          </div>
        </n-form-item>

        <n-form-item label="派发方式" required>
          <n-radio-group v-model:value="form.dispatchMode">
            <n-space vertical>
              <n-radio value="manual_expire_void"
                >玩家自领-过期作废</n-radio
              >
              <n-radio value="manual_expire_auto"
                >玩家自领-过期自动派发</n-radio
              >
              <n-radio value="system_immediate"
                >系统立即自动派发</n-radio
              >
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="领取时间" required>
          <n-radio-group v-model:value="form.claimTime">
            <n-space>
              <n-radio value="NEXT_DAY">次日领取</n-radio>
              <n-radio value="REAL_TIME">当天实时(影响留存)</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="奖励领取过期天数">
          <n-input-number
            v-model:value="form.rewardExpireDays"
            :min="0"
            style="width: 160px"
          />
        </n-form-item>

        <n-form-item label="登录前弹窗方式">
          <n-select
            v-model:value="form.loginBeforePopupMethod"
            :options="popupOptions"
            style="width: 200px"
          />
        </n-form-item>

        <n-form-item label="登录后弹窗方式">
          <n-select
            v-model:value="form.loginAfterPopupMethod"
            :options="popupOptions"
            style="width: 200px"
          />
        </n-form-item>

        <n-form-item label="稽核倍数">
          <n-input-number
            v-model:value="form.auditMultiplier"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 160px"
          />
        </n-form-item>

        <n-form-item label="奖金稽核指定平台">
          <n-radio-group v-model:value="form.bonusAuditPlatformRestriction">
            <n-space>
              <n-radio value="UNLIMITED">不限制</n-radio>
              <n-radio value="SPECIFIED_ONLY">仅指定平台</n-radio>
              <n-radio value="EXCLUDE_SPECIFIED">排除指定平台</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="奖金提现方式限制">
          <n-radio-group v-model:value="form.bonusWithdrawalMethodRestriction">
            <n-space>
              <n-radio value="UNLIMITED">不限制</n-radio>
              <n-radio value="SPECIFIED_ONLY">仅指定方式</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="规则说明">
          <div class="w-full space-y-2">
            <n-radio-group v-model:value="form.ruleDescriptionType">
              <n-space>
                <n-radio value="CUSTOM">自定义</n-radio>
                <n-radio value="SYSTEM">系统自带</n-radio>
              </n-space>
            </n-radio-group>
            <n-input
              v-if="form.ruleDescriptionType === 'CUSTOM'"
              v-model:value="form.ruleDescriptionCustomText"
              type="textarea"
              :rows="5"
              placeholder="请输入规则说明"
            />
            <div
              v-else
              class="rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-600"
            >
              <p>1. 活动仅限符合参与会员条件的玩家参加。</p>
              <p>2. 每日任务于站点时区 00:00 重置进度与可领状态。</p>
              <p>3. 玩家需手动领取奖励；过期后按派发方式处理。</p>
              <p>4. 每个阶梯奖励仅可领取一次，满足条件即可领取。</p>
              <p>5. 奖励发放受领取入口与限制条件约束。</p>
              <p>6. 最终解释权归平台所有。</p>
            </div>
          </div>
        </n-form-item>
      </n-form>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" :loading="saving" @click="submit"
          >确认</n-button
        >
      </div>
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
  NSwitch,
  useMessage,
} from 'naive-ui';
import { taskCenterPeriodicApi } from '#/api/taskCenterPeriodic';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  (e: 'update:show', v: boolean): void;
  (e: 'saved'): void;
}>();

const message = useMessage();
const saving = ref(false);

const showModal = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v),
});

const memberOptions = [
  { label: '默认层级', value: 'defaultLevel' },
  { label: '首充玩家', value: 'firstDeposit' },
  { label: '百元玩家', value: 'hundredYuan' },
  { label: '千元玩家', value: 'thousandYuan' },
  { label: '万元玩家', value: 'tenThousandYuan' },
  { label: '10万玩家', value: 'hundredThousandYuan' },
  { label: '100万大客户', value: 'millionYuan' },
  { label: '千万富豪', value: 'tenMillionYuan' },
];

const popupOptions = [
  { label: '不弹窗', value: 'NO_POPUP' },
  { label: '高频弹窗', value: 'HIGH_FREQUENCY' },
  { label: '自定义', value: 'CUSTOM' },
];

const form = reactive({
  memberGroupsSelectAll: true,
  memberGroups: memberOptions.map((m) => m.value) as string[],
  claimAndroidApp: true,
  claimIOSApp: true,
  claimOriginalApp: true,
  claimPolarApp: true,
  claimMarketBag: true,
  claimPWAFastApp: true,
  claimIOSRedirect: true,
  claimPCWeb: true,
  claimAndroidH5: true,
  claimIOSH5: true,
  claimSameDeviceOnce: false,
  claimSameFingerprintOnce: false,
  claimSameDeviceLimit: 1,
  claimSameFingerprintLimit: 1,
  onlyWsBrowser: false,
  requirePhoneVerification: false,
  requireEmailVerification: false,
  requireBirthdaySet: false,
  requireBankBinding: false,
  requireCryptoWallet: false,
  requireThirdPartyWallet: false,
  requireKycVerification: false,
  requireRealNameAuth: false,
  requireBiometricAuth: false,
  requireFirstRecharge: false,
  onlyRegisteredDevices: false,
  sameIpOnce: false,
  sameIpLimit: 1,
  sameNameOnlyOnce: false,
  sameNameLimit: 1,
  dispatchMode: 'manual_expire_auto',
  claimTime: 'REAL_TIME',
  rewardExpireDays: 0,
  loginBeforePopupMethod: 'NO_POPUP',
  loginAfterPopupMethod: 'NO_POPUP',
  auditMultiplier: 2,
  bonusAuditPlatformRestriction: 'UNLIMITED',
  bonusWithdrawalMethodRestriction: 'UNLIMITED',
  ruleDescriptionType: 'SYSTEM',
  ruleDescriptionCustomText: '' as string | null,
});

function onSelectAllMembers(checked: boolean) {
  form.memberGroups = checked ? memberOptions.map((m) => m.value) : [];
}

function toggleMember(value: string, checked: boolean) {
  if (checked) {
    if (!form.memberGroups.includes(value)) form.memberGroups.push(value);
  } else {
    form.memberGroups = form.memberGroups.filter((x) => x !== value);
  }
  form.memberGroupsSelectAll =
    form.memberGroups.length === memberOptions.length;
}

function applyData(data: Record<string, unknown>) {
  if (Array.isArray(data.memberGroups)) {
    form.memberGroups = data.memberGroups as string[];
    form.memberGroupsSelectAll =
      form.memberGroups.length === memberOptions.length;
  }
  const boolKeys = [
    'memberGroupsSelectAll',
    'claimAndroidApp',
    'claimIOSApp',
    'claimOriginalApp',
    'claimPolarApp',
    'claimMarketBag',
    'claimPWAFastApp',
    'claimIOSRedirect',
    'claimPCWeb',
    'claimAndroidH5',
    'claimIOSH5',
    'claimSameDeviceOnce',
    'claimSameFingerprintOnce',
    'onlyWsBrowser',
    'requirePhoneVerification',
    'requireEmailVerification',
    'requireBirthdaySet',
    'requireBankBinding',
    'requireCryptoWallet',
    'requireThirdPartyWallet',
    'requireKycVerification',
    'requireRealNameAuth',
    'requireBiometricAuth',
    'requireFirstRecharge',
    'onlyRegisteredDevices',
    'sameIpOnce',
    'sameNameOnlyOnce',
  ] as const;
  for (const k of boolKeys) {
    if (typeof data[k] === 'boolean') form[k] = data[k] as boolean;
  }
  const numKeys = [
    'claimSameDeviceLimit',
    'claimSameFingerprintLimit',
    'sameIpLimit',
    'sameNameLimit',
    'rewardExpireDays',
    'auditMultiplier',
  ] as const;
  for (const k of numKeys) {
    if (data[k] != null) form[k] = Number(data[k]);
  }
  const strKeys = [
    'dispatchMode',
    'claimTime',
    'loginBeforePopupMethod',
    'loginAfterPopupMethod',
    'bonusAuditPlatformRestriction',
    'bonusWithdrawalMethodRestriction',
    'ruleDescriptionType',
  ] as const;
  for (const k of strKeys) {
    if (typeof data[k] === 'string') form[k] = data[k] as string;
  }
  if (typeof data.ruleDescriptionCustomText === 'string') {
    form.ruleDescriptionCustomText = data.ruleDescriptionCustomText;
  }
}

watch(
  () => props.show,
  async (open) => {
    if (!open) return;
    try {
      const res = await taskCenterPeriodicApi.getCategorySettings('DAILY_TASK');
      const data =
        (res as { data?: Record<string, unknown> })?.data ??
        (res as Record<string, unknown>);
      if (data && typeof data === 'object') applyData(data);
    } catch {
      message.warning('加载设置失败，使用默认值');
    }
  },
);

async function submit() {
  saving.value = true;
  try {
    await taskCenterPeriodicApi.updateCategorySettings('DAILY_TASK', {
      ...form,
    });
    message.success('设置已保存');
    showModal.value = false;
    emit('saved');
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '保存失败');
  } finally {
    saving.value = false;
  }
}
</script>
