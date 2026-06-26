<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="$t('activity.noviceWelfareGlobal.k65b0')"
    style="width: 800px; max-height: 90vh"
    class="global-settings-modal"
  >
    <div class="modal-content">
      <n-form
        ref="formRef"
        :model="formData"
        label-placement="left"
        label-width="120px"
        size="medium"
        class="global-form"
      >
        <!-- 选择币种 -->
        <n-form-item :label="$t('activity.providentFundSetting.k9009')">
          <div class="checkbox-group">
            <n-checkbox
              v-model:checked="formData.currencySelectAll"
              @update:checked="handleCurrencySelectAll"
            >{{ $t('activity.formModal.k51683') }}</n-checkbox>
            <n-checkbox v-model:checked="formData.currencyBRL">{{ $t('activity.noviceWelfareGlobal.k5df4BRL') }}</n-checkbox>
          </div>
        </n-form-item>

        <!-- 参与会员 -->
        <n-form-item :label="$t('activity.detailModal.k53c2')">
          <div class="member-groups">
            <n-checkbox
              v-model:checked="formData.memberGroupsSelectAll"
              @update:checked="handleMemberGroupsSelectAll"
            >{{ $t('activity.formModal.k51683') }}</n-checkbox>
            <div class="member-grid">
              <n-checkbox v-model:checked="formData.memberGroups.defaultLevel"
                >{{ $t('activity.noviceWelfareGlobal.k9ed8') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.yellowLevel"
                >{{ $t('activity.noviceWelfareGlobal.k9ec4') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.fiveYuan"
                >{{ $t('activity.noviceWelfareGlobal.k4e94') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.tenYuan"
                >{{ $t('activity.noviceWelfareGlobal.k5341') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.thirtyYuan"
                >{{ $t('activity.noviceWelfareGlobal.k4e09') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.fiftyYuan"
                >{{ $t('activity.noviceWelfareGlobal.k4e942') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.oneHundredYuan"
                >{{ $t('activity.noviceWelfareGlobal.k4e00') }}</n-checkbox
              >
              <n-checkbox
                v-model:checked="formData.memberGroups.threeHundredYuan"
                >{{ $t('activity.noviceWelfareGlobal.k4e092') }}</n-checkbox
              >
              <n-checkbox
                v-model:checked="formData.memberGroups.oneThousandYuan"
                >{{ $t('activity.noviceWelfareGlobal.k4e002') }}</n-checkbox
              >
              <n-checkbox
                v-model:checked="formData.memberGroups.threeThousandYuan"
                >{{ $t('activity.noviceWelfareGlobal.k4e093') }}</n-checkbox
              >
              <n-checkbox
                v-model:checked="formData.memberGroups.fiveThousandYuan"
                >{{ $t('activity.noviceWelfareGlobal.k4e943') }}</n-checkbox
              >
              <n-checkbox
                v-model:checked="formData.memberGroups.tenThousandYuan"
                >{{ $t('activity.noviceWelfareGlobal.k4e003') }}</n-checkbox
              >
              <n-checkbox
                v-model:checked="formData.memberGroups.thirtyThousandYuan"
                >{{ $t('activity.noviceWelfareGlobal.k4e094') }}</n-checkbox
              >
              <n-checkbox
                v-model:checked="formData.memberGroups.fiftyThousandYuan"
                >{{ $t('activity.noviceWelfareGlobal.k4e944') }}</n-checkbox
              >
              <n-checkbox
                v-model:checked="formData.memberGroups.oneHundredThousandYuan"
                >{{ $t('activity.noviceWelfareGlobal.k53412') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.millionYuan"
                >{{ $t('activity.noviceWelfareGlobal.k767e') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.childrenPlay"
                >{{ $t('activity.noviceWelfareGlobal.k5237') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.chainPlay"
                >{{ $t('activity.noviceWelfareGlobal.k53ef') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.badgePlay"
                >{{ $t('activity.noviceWelfareGlobal.k6076') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.profitPlay"
                >{{ $t('activity.noviceWelfareGlobal.k5957') }}</n-checkbox
              >
              <n-checkbox
                v-model:checked="formData.memberGroups.otherHighProfile"
                >{{ $t('activity.noviceWelfareGlobal.k5176') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.deadUser"
                >{{ $t('activity.noviceWelfareGlobal.k6b7b') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.fixedAgent"
                >{{ $t('activity.noviceWelfareGlobal.k56fa') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.manualExport"
                >{{ $t('activity.noviceWelfareGlobal.k624b') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.memberGroups.testLevel"
                >{{ $t('activity.noviceWelfareGlobal.k6d4b') }}</n-checkbox
              >
            </div>
          </div>
        </n-form-item>

        <!-- 任务时长 -->
        <n-form-item :label="$t('activity.noviceWelfareGlobal.k4efb')">
          <n-radio-group v-model:value="formData.taskDuration">
            <n-space>
              <n-radio value="LONG_TERM">{{ $t('activity.noviceWelfareGlobal.k957f') }}</n-radio>
              <n-radio value="LIMITED_TIME">{{ $t('activity.noviceWelfareGlobal.k9650') }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 领取方式 -->
        <n-form-item :label="$t('activity.rewardReport.k9886')">
          <n-radio-group v-model:value="formData.claimMethod">
            <n-space>
              <n-radio value="MANUAL">{{ $t('activity.rewardReport.k624b') }}</n-radio>
              <n-radio value="AUTO_DISPATCH">{{ $t('activity.formModal.k7cfb2') }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 领取时间 -->
        <n-form-item :label="$t('activity.rewardReport.k98862')">
          <n-radio-group v-model:value="formData.claimTime">
            <n-space>
              <n-radio value="NEXT_DAY">{{ $t('activity.noviceWelfareGlobal.k6b21') }}</n-radio>
              <n-radio value="REAL_TIME">{{ $t('activity.noviceWelfareGlobal.k5f53k5f71') }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 领取入口 -->
        <n-form-item :label="$t('activity.luckyWheelPublicConfig.k98862')">
          <div class="claim-entries">
            <div class="entry-group">
              <n-checkbox v-model:checked="formData.claimAndroidApp"
                >{{ $t('activity.formModal.androidAPP') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.claimIOSApp"
                >{{ $t('activity.formModal.iOSAPP') }}</n-checkbox
              >
            </div>
            <div class="entry-group">
              <n-checkbox v-model:checked="formData.claimOriginalApp"
                >{{ $t('activity.formModal.k539f') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.claimPolarApp"
                >{{ $t('activity.formModal.k6781') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.claimMarketBag"
                >{{ $t('activity.formModal.k9a6c') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.claimPWAFastApp"
                >{{ $t('activity.formModal.pWAAPP') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.claimIOSRedirect"
                >{{ $t('activity.noviceWelfareGlobal.iOS') }}</n-checkbox
              >
            </div>
            <div class="entry-group">
              <n-checkbox v-model:checked="formData.claimSameDeviceOnce"
                >{{ $t('activity.noviceWelfareGlobal.k540c') }}</n-checkbox
              >
            </div>
            <div class="entry-group">
              <n-checkbox v-model:checked="formData.claimPCWeb"
                >{{ $t('activity.formModal.pC') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.claimAndroidH5"
                >{{ $t('activity.formModal.androidH5') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.claimIOSH5"
                >{{ $t('activity.formModal.iOSH5') }}</n-checkbox
              >
              <n-checkbox v-model:checked="formData.claimTGApp"
                >{{ $t('activity.noviceWelfareGlobal.tGAPP') }}</n-checkbox
              >
            </div>
            <div class="entry-group">
              <n-checkbox v-model:checked="formData.claimSameDeviceBindingOnce"
                >{{ $t('activity.noviceWelfareGlobal.k540c2') }}</n-checkbox
              >
            </div>
          </div>
        </n-form-item>

        <!-- 更多领取限制 -->
        <n-form-item :label="$t('activity.luckyWheelPublicConfig.k66f4')">
          <div class="restrictions-grid">
            <n-checkbox v-model:checked="formData.requirePhoneVerification"
              >{{ $t('activity.noviceWelfareGlobal.k5b8c') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.requireEmailVerification"
              >{{ $t('activity.formModal.k5b8c2') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.requireBirthdaySet"
              >{{ $t('activity.formModal.k5b8c5') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.requireBankBinding"
              >{{ $t('activity.formModal.k5b8c3') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.requireCityBinding"
              >{{ $t('activity.noviceWelfareGlobal.k7ed1') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.requireThirdPartyWallet"
              >{{ $t('activity.formModal.k7ed12') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.requirePaymentMethod"
              >{{ $t('activity.formModal.k7ed13') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.requireRealNameAuth"
              >{{ $t('activity.formModal.k586b') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.requireBiometricAuth"
              >{{ $t('activity.noviceWelfareGlobal.k7ed12') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.requireKycVerification"
              >{{ $t('activity.noviceWelfareGlobal.k5b8c2') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.sameNameOnlyOnce"
              >{{ $t('activity.noviceWelfareGlobal.k540c3') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.requireFirstRecharge"
              >{{ $t('activity.noviceWelfareGlobal.k5b8c3') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.sameIpOnce"
              >{{ $t('activity.noviceWelfareGlobal.k540c4') }}</n-checkbox
            >
            <n-checkbox v-model:checked="formData.onlyRegisteredDevices"
              >{{ $t('activity.noviceWelfareGlobal.k4ec5') }}</n-checkbox
            >
          </div>
        </n-form-item>

        <!-- 登录前弹窗方式 -->
        <n-form-item :label="$t('activity.formModal.k767b')">
          <n-select
            v-model:value="formData.loginBeforePopupMethod"
            :options="popupMethodOptions"
            :placeholder="$t('activity.noviceWelfareGlobal.k8bf7')"
          />
        </n-form-item>

        <!-- 登录后弹窗方式 -->
        <n-form-item :label="$t('activity.formModal.k767b2')">
          <n-select
            v-model:value="formData.loginAfterPopupMethod"
            :options="popupMethodOptions"
            :placeholder="$t('activity.noviceWelfareGlobal.k8bf72')"
          />
        </n-form-item>

        <!-- 稽核倍数 -->
        <n-form-item :label="$t('activity.formModal.k7a3d2')">
          <n-input-number
            v-model:value="formData.auditMultiplier"
            :min="0"
            :step="0.01"
            :precision="2"
            placeholder="10.00"
            style="width: 200px"
          />
        </n-form-item>

        <!-- 奖金稽核指定平台 -->
        <n-form-item :label="$t('activity.distributeReward.k5956')">
          <n-radio-group v-model:value="formData.bonusAuditPlatformRestriction">
            <n-space>
              <n-radio value="UNLIMITED">{{ $t('activity.formModal.k4e0d4') }}</n-radio>
              <n-radio value="SPECIFIED_ONLY">{{ $t('activity.noviceWelfareGlobal.k4ec52') }}</n-radio>
              <n-radio value="EXCLUDE_SPECIFIED">{{ $t('activity.noviceWelfareGlobal.k6392') }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 奖金提现方式限制 -->
        <n-form-item :label="$t('activity.formModal.k595611')">
          <n-radio-group
            v-model:value="formData.bonusWithdrawalMethodRestriction"
          >
            <n-space>
              <n-radio value="UNLIMITED">{{ $t('activity.formModal.k4e0d4') }}</n-radio>
              <n-radio value="SPECIFIED_ONLY">{{ $t('activity.noviceWelfareGlobal.k4ec53') }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 规则说明 -->
        <n-form-item :label="$t('activity.formModal.k89c4')">
          <div class="rule-description">
            <n-radio-group v-model:value="formData.ruleDescriptionType">
              <n-space vertical>
                <n-radio value="CUSTOM">{{ $t('activity.detailModal.k81ea') }}</n-radio>
                <n-radio value="SYSTEM_TRANSLATE">{{ $t('activity.noviceWelfareGlobal.k7cfb') }}</n-radio>
              </n-space>
            </n-radio-group>
            <n-input
              v-if="formData.ruleDescriptionType === 'CUSTOM'"
              v-model:value="formData.ruleDescriptionCustomText"
              type="textarea"
              :placeholder="$t('activity.noviceWelfareGlobal.k8bf73')"
              :rows="6"
              class="mt-4"
            />
          </div>
        </n-form-item>
      </n-form>
    </div>

    <template #action>
      <n-space>
        <n-button @click="handleCancel">{{ $t('activity.activityList.k53d6') }}</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">{{ $t('activity.noviceWelfareGlobal.k786e') }}</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, computed, watch, reactive } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NButton,
  NSpace,
  NCheckbox,
  NRadio,
  NRadioGroup,
  NSelect,
  NInput,
  NInputNumber,
  useMessage,
  type FormInst,
} from 'naive-ui';
import {
  updateGlobalTaskSettings,
  getGlobalTaskSettings,
} from '#/api/taskCenter';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'submit'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

// Popup method options
const popupMethodOptions = [
  { label: $t('activity.formModal.k9ad8'), value: 'HIGH_FREQUENCY' },
  { label: $t('activity.formModal.k4e0d'), value: 'NO_POPUP' },
  { label: $t('activity.detailModal.k81ea'), value: 'CUSTOM' },
];

// Form data matching the screenshot
const formData = reactive({
  // Currency Selection
  currencySelectAll: true,
  currencyBRL: true,

  // Member Groups
  memberGroupsSelectAll: true,
  memberGroups: {
    defaultLevel: true,
    yellowLevel: true,
    fiveYuan: true,
    tenYuan: true,
    thirtyYuan: true,
    fiftyYuan: true,
    oneHundredYuan: true,
    threeHundredYuan: true,
    oneThousandYuan: true,
    threeThousandYuan: true,
    fiveThousandYuan: true,
    tenThousandYuan: true,
    thirtyThousandYuan: true,
    fiftyThousandYuan: true,
    oneHundredThousandYuan: true,
    millionYuan: true,
    childrenPlay: true,
    chainPlay: true,
    badgePlay: true,
    profitPlay: true,
    otherHighProfile: true,
    deadUser: true,
    fixedAgent: true,
    manualExport: true,
    testLevel: true,
  },

  // Task Settings
  taskDuration: 'LONG_TERM',
  claimMethod: 'MANUAL',
  claimTime: 'NEXT_DAY',

  // Claim Entries
  claimAndroidApp: false,
  claimIOSApp: false,
  claimOriginalApp: false,
  claimPolarApp: false,
  claimMarketBag: false,
  claimPWAFastApp: false,
  claimIOSRedirect: false,
  claimSameDeviceOnce: false,
  claimPCWeb: false,
  claimAndroidH5: false,
  claimIOSH5: false,
  claimTGApp: false,
  claimSameDeviceBindingOnce: false,

  // Restrictions
  requirePhoneVerification: false,
  requireEmailVerification: false,
  requireBirthdaySet: false,
  requireBankBinding: false,
  requireCityBinding: false,
  requireThirdPartyWallet: false,
  requirePaymentMethod: false,
  requireRealNameAuth: false,
  requireBiometricAuth: false,
  requireKycVerification: false,
  sameNameOnlyOnce: false,
  requireFirstRecharge: false,
  sameIpOnce: false,
  onlyRegisteredDevices: false,

  // Login Popup Methods
  loginBeforePopupMethod: 'HIGH_FREQUENCY',
  loginAfterPopupMethod: 'HIGH_FREQUENCY',

  // Audit Settings
  auditMultiplier: 10.0,

  // Platform and Method Restrictions
  bonusAuditPlatformRestriction: 'UNLIMITED',
  bonusWithdrawalMethodRestriction: 'UNLIMITED',

  // Rule Description
  ruleDescriptionType: 'CUSTOM',
  ruleDescriptionCustomText:
    $t('activity.rulePreviews.noviceWelfare'),
});

// Handle currency select all
const handleCurrencySelectAll = (checked: boolean) => {
  formData.currencyBRL = checked;
};

// Handle member groups select all
const handleMemberGroupsSelectAll = (checked: boolean) => {
  Object.keys(formData.memberGroups).forEach((key) => {
    (formData.memberGroups as any)[key] = checked;
  });
};

const handleCancel = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  submitting.value = true;
  try {
    console.log('🎯 Submitting global novice welfare settings:', formData);

    // Convert member groups object to array format for backend
    const memberGroupsArray = Object.entries(formData.memberGroups)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);

    const submitData = {
      ...formData,
      memberGroups: memberGroupsArray,
      noviceWelfareEnabled: true, // Always enable when submitting settings
    };

    await updateGlobalTaskSettings(submitData);

    message.success($t('activity.noviceWelfareGlobal.k65b02'));
    showModal.value = false;
    emit('submit');
  } catch (error: any) {
    console.error('Global settings submission failed:', error);
    message.error(error.message || $t('activity.common.saveSettingsFailed'));
  } finally {
    submitting.value = false;
  }
};

// Load settings when modal opens
watch(showModal, async (newValue) => {
  if (newValue) {
    console.log('📝 Opening global novice welfare settings modal...');

    // Load current settings from API
    try {
      const { data } = await getGlobalTaskSettings();
      if (data) {
        // Update formData with values from API
        Object.keys(formData).forEach((key) => {
          if (key === 'memberGroups') {
            // Handle memberGroups array -> object conversion
            if (Array.isArray(data.memberGroups)) {
              // Reset all member groups first
              Object.keys(formData.memberGroups).forEach((groupKey) => {
                (formData.memberGroups as any)[groupKey] = false;
              });
              // Then set selected ones to true
              data.memberGroups.forEach((group: string) => {
                if (formData.memberGroups.hasOwnProperty(group)) {
                  (formData.memberGroups as any)[group] = true;
                }
              });
            }
          } else if (key === 'auditMultiplier') {
            // Convert auditMultiplier to number (handles Decimal/string from backend)
            const value = (data as any)[key];
            if (value !== undefined && value !== null) {
              const numValue =
                typeof value === 'string' ? parseFloat(value) : Number(value);
              (formData as any)[key] = numValue;
              console.log(`✅ Loaded auditMultiplier: ${value} -> ${numValue}`);
            }
          } else if ((data as any)[key] !== undefined && (data as any)[key] !== null) {
            (formData as any)[key] = (data as any)[key];
          }
        });
        console.log(
          '✅ Loaded settings from API, requireFirstRecharge:',
          (data as any).requireFirstRecharge,
        );
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      message.warning($t('activity.noviceWelfareGlobal.k52a0k4f7f'));
    }
  }
});
</script>

<style scoped>
.global-settings-modal :deep(.n-dialog) {
  max-height: 90vh !important;
}

.modal-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

.global-form :deep(.n-form-item) {
  margin-bottom: 20px;
}

.checkbox-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.member-groups {
  width: 100%;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.claim-entries .entry-group {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.restrictions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.rule-description {
  width: 100%;
}

.mt-4 {
  margin-top: 16px;
}
</style>
