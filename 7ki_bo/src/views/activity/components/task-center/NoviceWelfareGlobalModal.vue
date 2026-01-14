<template>
  <n-modal 
    v-model:show="showModal" 
    preset="dialog" 
    title="新人福利设置" 
    style="width: 800px; max-height: 90vh;"
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
        <n-form-item label="选择币种">
          <div class="checkbox-group">
            <n-checkbox v-model:checked="formData.currencySelectAll" @update:checked="handleCurrencySelectAll">
              全选
            </n-checkbox>
            <n-checkbox v-model:checked="formData.currencyBRL">
              巴西(BRL)
            </n-checkbox>
          </div>
        </n-form-item>

        <!-- 参与会员 -->
        <n-form-item label="参与会员">
          <div class="member-groups">
            <n-checkbox v-model:checked="formData.memberGroupsSelectAll" @update:checked="handleMemberGroupsSelectAll">
              全选
            </n-checkbox>
            <div class="member-grid">
              <n-checkbox v-model:checked="formData.memberGroups.defaultLevel">默认层级</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.yellowLevel">黄用层级</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.fiveYuan">五元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.tenYuan">十元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.thirtyYuan">三十元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.fiftyYuan">五十元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.oneHundredYuan">一百元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.threeHundredYuan">三百元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.oneThousandYuan">一千元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.threeThousandYuan">三千元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.fiveThousandYuan">五千元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.tenThousandYuan">一万元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.thirtyThousandYuan">三万元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.fiftyThousandYuan">五万元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.oneHundredThousandYuan">十万元玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.millionYuan">百万土豪</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.childrenPlay">刷子玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.chainPlay">可链玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.badgePlay">恶意玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.profitPlay">套利玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.otherHighProfile">其他高性玩家</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.deadUser">死亡用户</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.fixedAgent">固定代理</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.manualExport">手动出款专用</n-checkbox>
              <n-checkbox v-model:checked="formData.memberGroups.testLevel">测试专用层级</n-checkbox>
            </div>
          </div>
        </n-form-item>

        <!-- 任务时长 -->
        <n-form-item label="任务时长">
          <n-radio-group v-model:value="formData.taskDuration">
            <n-space>
              <n-radio value="LONG_TERM">长期</n-radio>
              <n-radio value="LIMITED_TIME">限时</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 领取方式 -->
        <n-form-item label="领取方式">
          <n-radio-group v-model:value="formData.claimMethod">
            <n-space>
              <n-radio value="MANUAL">手动领取</n-radio>
              <n-radio value="AUTO_DISPATCH">系统立即自动派发</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 领取时间 -->
        <n-form-item label="领取时间">
          <n-radio-group v-model:value="formData.claimTime">
            <n-space>
              <n-radio value="NEXT_DAY">次日</n-radio>
              <n-radio value="REAL_TIME">当天实时(影响留存)</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 领取入口 -->
        <n-form-item label="领取入口">
          <div class="claim-entries">
            <div class="entry-group">
              <n-checkbox v-model:checked="formData.claimAndroidApp">Android_APP可领取</n-checkbox>
              <n-checkbox v-model:checked="formData.claimIOSApp">iOS_APP可领取</n-checkbox>
            </div>
            <div class="entry-group">
              <n-checkbox v-model:checked="formData.claimOriginalApp">原生APP</n-checkbox>
              <n-checkbox v-model:checked="formData.claimPolarApp">极速APP</n-checkbox>
              <n-checkbox v-model:checked="formData.claimMarketBag">马甲包</n-checkbox>
              <n-checkbox v-model:checked="formData.claimPWAFastApp">PWA快捷APP</n-checkbox>
              <n-checkbox v-model:checked="formData.claimIOSRedirect">iOS描述版</n-checkbox>
            </div>
            <div class="entry-group">
              <n-checkbox v-model:checked="formData.claimSameDeviceOnce">同登录设备号只能领取1次</n-checkbox>
            </div>
            <div class="entry-group">
              <n-checkbox v-model:checked="formData.claimPCWeb">PC可领取</n-checkbox>
              <n-checkbox v-model:checked="formData.claimAndroidH5">Android_H5可领取</n-checkbox>
              <n-checkbox v-model:checked="formData.claimIOSH5">iOS_H5可领取</n-checkbox>
            </div>
            <div class="entry-group">
              <n-checkbox v-model:checked="formData.claimSameDeviceBindingOnce">同网络器绑定号只能领取1次</n-checkbox>
            </div>
          </div>
        </n-form-item>

        <!-- 更多领取限制 -->
        <n-form-item label="更多领取限制">
          <div class="restrictions-grid">
            <n-checkbox v-model:checked="formData.requirePhoneVerification">完成短信验证才能领取</n-checkbox>
            <n-checkbox v-model:checked="formData.requireEmailVerification">完成邮箱验证才能领取</n-checkbox>
            <n-checkbox v-model:checked="formData.requireBirthdaySet">完成生日设置才能领取</n-checkbox>
            <n-checkbox v-model:checked="formData.requireBankBinding">完成银行卡绑定才能领取</n-checkbox>
            <n-checkbox v-model:checked="formData.requireCityBinding">绑定城市扣税才能领取</n-checkbox>
            <n-checkbox v-model:checked="formData.requireThirdPartyWallet">绑定三方钱包才能领取</n-checkbox>
            <n-checkbox v-model:checked="formData.requirePaymentMethod">绑定收款方式才能领取</n-checkbox>
            <n-checkbox v-model:checked="formData.requireRealNameAuth">填写真实姓名才能领取</n-checkbox>
            <n-checkbox v-model:checked="formData.requireBiometricAuth">绑定生物识别才可领取</n-checkbox>
            <n-checkbox v-model:checked="formData.requireKycVerification">完成KYC认证才可领取</n-checkbox>
            <n-checkbox v-model:checked="formData.sameNameOnlyOnce">同姓名只能领取1次</n-checkbox>
            <n-checkbox v-model:checked="formData.requireFirstRecharge">完成首充才能领取</n-checkbox>
            <n-checkbox v-model:checked="formData.sameIpOnce">同登录IP号只能领取1次</n-checkbox>
            <n-checkbox v-model:checked="formData.onlyRegisteredDevices">仅注册设备号可领取</n-checkbox>
          </div>
        </n-form-item>

        <!-- 登录前弹窗方式 -->
        <n-form-item label="登录前弹窗方式">
          <n-select v-model:value="formData.loginBeforePopupMethod" :options="popupMethodOptions" placeholder="请选择登录前弹窗方式" />
        </n-form-item>

        <!-- 登录后弹窗方式 -->
        <n-form-item label="登录后弹窗方式">
          <n-select v-model:value="formData.loginAfterPopupMethod" :options="popupMethodOptions" placeholder="请选择登录后弹窗方式" />
        </n-form-item>

        <!-- 稽核倍数 -->
        <n-form-item label="稽核倍数">
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
        <n-form-item label="奖金稽核指定平台">
          <n-radio-group v-model:value="formData.bonusAuditPlatformRestriction">
            <n-space>
              <n-radio value="UNLIMITED">不限制</n-radio>
              <n-radio value="SPECIFIED_ONLY">仅限指定平台</n-radio>
              <n-radio value="EXCLUDE_SPECIFIED">排除指定平台</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 奖金提现方式限制 -->
        <n-form-item label="奖金提现方式限制">
          <n-radio-group v-model:value="formData.bonusWithdrawalMethodRestriction">
            <n-space>
              <n-radio value="UNLIMITED">不限制</n-radio>
              <n-radio value="SPECIFIED_ONLY">仅限指定方式</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 规则说明 -->
        <n-form-item label="规则说明">
          <div class="rule-description">
            <n-radio-group v-model:value="formData.ruleDescriptionType">
              <n-space vertical>
                <n-radio value="CUSTOM">自定义</n-radio>
                <n-radio value="SYSTEM_TRANSLATE">系统翻译</n-radio>
              </n-space>
            </n-radio-group>
            <n-input
              v-if="formData.ruleDescriptionType === 'CUSTOM'"
              v-model:value="formData.ruleDescriptionCustomText"
              type="textarea"
              placeholder="请输入自定义规则说明..."
              :rows="6"
              class="mt-4"
            />
          </div>
        </n-form-item>
      </n-form>
    </div>

    <template #action>
      <n-space>
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">
          确认
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
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
import { updateGlobalTaskSettings, getGlobalTaskSettings } from '#/api/taskCenter';

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
  { label: '高频弹窗', value: 'HIGH_FREQUENCY' },
  { label: '自定义', value: 'CUSTOM' },
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
  auditMultiplier: 10.00,
  
  // Platform and Method Restrictions
  bonusAuditPlatformRestriction: 'UNLIMITED',
  bonusWithdrawalMethodRestriction: 'UNLIMITED',
  
  // Rule Description
  ruleDescriptionType: 'CUSTOM',
  ruleDescriptionCustomText: '1.每个新注册的账号都可以完成以上任务，完成任务后可获得一定金额奖金，难度越高，奖励越多；\n2.满足条件即可直接领取，可在iOS_APP、Android_APP、iOS_H5、Android_H5、PC任意一端直接领取，过期作废（即未主动领取视为自愿放弃）；\n3.因本任务赠送的奖金较高，所以赠送的奖金需10.00倍流水（即稽核，打码或有效投注）才能提现；\n4.本任务仅限账号本人进行正常的人为操作，禁止租借、使用外挂、机器人、不同账号对打、互刷、套利、接口、协议、利用漏洞、群控或其他技术手段参与，否则取消或扣除相关，冻结、甚至拉入黑名单；\n5.为避免文字理解差异，平台将保留本活动最终解释权。',
});

// Handle currency select all
const handleCurrencySelectAll = (checked: boolean) => {
  formData.currencyBRL = checked;
};

// Handle member groups select all
const handleMemberGroupsSelectAll = (checked: boolean) => {
  Object.keys(formData.memberGroups).forEach(key => {
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
    
    message.success('新人福利全局设置保存成功');
    showModal.value = false;
    emit('submit');
  } catch (error: any) {
    console.error('Global settings submission failed:', error);
    message.error(error.message || '保存设置失败，请重试');
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
        Object.keys(formData).forEach(key => {
          if (key === 'memberGroups') {
            // Handle memberGroups array -> object conversion
            if (Array.isArray(data.memberGroups)) {
              // Reset all member groups first
              Object.keys(formData.memberGroups).forEach(groupKey => {
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
            const value = data[key];
            if (value !== undefined && value !== null) {
              const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
              (formData as any)[key] = numValue;
              console.log(`✅ Loaded auditMultiplier: ${value} -> ${numValue}`);
            }
          } else if (data[key] !== undefined && data[key] !== null) {
            (formData as any)[key] = data[key];
          }
        });
        console.log('✅ Loaded settings from API, requireFirstRecharge:', data.requireFirstRecharge);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      message.warning('加载设置失败，使用默认值');
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
