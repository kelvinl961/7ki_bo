<template>
  <n-modal
    v-model:show="showModal"
    :title="editingItem ? $t('operations.form.editNotification') : $t('operations.messageSettings.addNotification')"
    preset="dialog"
    style="width: 1000px"
    @after-leave="resetForm"
  >
    <n-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-placement="left"
      label-width="120"
      class="mt-4"
    >
      <n-tabs v-model:value="activeTab" type="line" class="mb-4">
        <n-tab-pane name="basic" :tab="$t('operations.form.tabBasic')">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item :label="$t('operations.messageSettings.language')" path="language">
              <n-select
                v-model:value="formData.language"
                :placeholder="$t('operations.messageSettings.selectLanguage')"
                :options="languageOptions"
              />
            </n-form-item>

            <n-form-item :label="$t('common.currency')" path="currency">
              <n-select
                v-model:value="formData.currency"
                :placeholder="$t('operations.messageSettings.selectCurrency')"
                :options="currencyOptions"
              />
            </n-form-item>

            <n-form-item :label="$t('operations.messageSettings.receiverType')" path="receiverType">
              <n-select
                v-model:value="formData.receiverType"
                :placeholder="$t('operations.messageSettings.selectReceiverType')"
                :options="receiverTypeOptions"
              />
            </n-form-item>

            <n-form-item :label="$t('operations.messageSettings.triggerCondition')" path="triggerCondition">
              <n-select
                v-model:value="formData.triggerCondition"
                :placeholder="$t('operations.messageSettings.selectTrigger')"
                :options="triggerConditionOptions"
              />
            </n-form-item>

            <n-form-item :label="$t('common.status')" path="status">
              <n-select
                v-model:value="formData.status"
                :placeholder="$t('operations.messageSettings.selectStatus')"
                :options="statusOptions"
              />
            </n-form-item>
          </div>

          <n-form-item :label="$t('operations.messageSettings.titleLabel')" path="title">
            <n-input
              v-model:value="formData.title"
              :placeholder="$t('operations.form.notificationTitlePlaceholder')"
              clearable
            />
          </n-form-item>

          <n-form-item :label="$t('operations.messageSettings.content')" path="content">
            <n-input
              v-model:value="formData.content"
              type="textarea"
              :placeholder="$t('operations.form.notificationContentPlaceholder')"
              :rows="4"
              clearable
            />
          </n-form-item>
        </n-tab-pane>

        <n-tab-pane name="schedule" :tab="$t('operations.form.tabTime')">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item :label="$t('operations.messageSettings.startTime')" path="startTime">
              <n-date-picker
                v-model:value="formData.startTime"
                type="datetime"
                :placeholder="$t('operations.messageSettings.startTime')"
                format="yyyy-MM-dd HH:mm:ss"
                clearable
              />
            </n-form-item>

            <n-form-item :label="$t('operations.messageSettings.endTime')" path="endTime">
              <n-date-picker
                v-model:value="formData.endTime"
                type="datetime"
                :placeholder="$t('operations.messageSettings.endTime')"
                format="yyyy-MM-dd HH:mm:ss"
                clearable
              />
            </n-form-item>
          </div>

          <n-form-item :label="$t('operations.form.immediateSend')">
            <n-switch v-model:value="formData.sendImmediately" />
            <span class="ml-2 text-sm text-gray-500">{{ $t('operations.form.immediateSendHint') }}</span>
          </n-form-item>
        </n-tab-pane>

        <n-tab-pane name="display" :tab="$t('operations.form.tabDisplaySettings')">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item :label="$t('operations.messageSettings.popupEntrance')">
              <n-switch v-model:value="formData.popupEntrance" />
              <span class="ml-2 text-sm text-gray-500">{{ $t('operations.form.popupDisplayHint') }}</span>
            </n-form-item>

            <n-form-item :label="$t('operations.messageSettings.videoPush')">
              <n-switch v-model:value="formData.videoPush" />
              <span class="ml-2 text-sm text-gray-500">{{ $t('operations.form.videoPushHint') }}</span>
            </n-form-item>

            <n-form-item :label="$t('operations.messageSettings.readOrSent')">
              <n-switch v-model:value="formData.readOrSent" />
              <span class="ml-2 text-sm text-gray-500">{{ $t('operations.form.readSentHint') }}</span>
            </n-form-item>

            <n-form-item :label="$t('operations.form.messagePriority')">
              <n-select
                v-model:value="formData.priority"
                :placeholder="$t('operations.form.displayPriority')"
                :options="priorityOptions"
              />
            </n-form-item>
          </div>

          <n-form-item :label="$t('operations.form.messageIcon')">
            <MediaLibrarySelector
              v-model="formData.icon"
              category="icons"
              :accept-types="['image']"
              :placeholder="$t('operations.form.messageIconPlaceholder')"
              @file-selected="handleIconSelected"
            />
            <div class="field-hint">{{ $t('operations.form.iconEnhanceHint') }}</div>

            <!-- 预览区域 -->
            <div v-if="formData.icon" class="mt-2">
              <div class="icon-preview">
                <img
                  :src="getImageUrlByEnvironment(formData.icon)"
                  :alt="$t('operations.form.messageIcon')"
                  class="icon-preview-image"
                />
              </div>
            </div>
          </n-form-item>
        </n-tab-pane>

        <n-tab-pane name="advanced" :tab="$t('operations.form.tabAdvanced')">
          <n-form-item :label="$t('operations.form.targetUserFilter')">
            <n-checkbox-group v-model:value="formData.targetUsers">
              <n-space>
                <n-checkbox value="new_users">{{ $t('operations.form.filterNewUsers') }}</n-checkbox>
                <n-checkbox value="vip_users">{{ $t('operations.form.filterVipUsers') }}</n-checkbox>
                <n-checkbox value="active_users">{{ $t('operations.form.filterActiveUsers') }}</n-checkbox>
                <n-checkbox value="inactive_users">{{ $t('operations.form.filterInactiveUsers') }}</n-checkbox>
                <n-checkbox value="high_rollers">{{ $t('operations.form.filterHighRollers') }}</n-checkbox>
              </n-space>
            </n-checkbox-group>
          </n-form-item>

          <n-form-item :label="$t('operations.form.sendLimit')">
            <div class="grid grid-cols-2 gap-4">
              <n-input-number
                v-model:value="formData.maxSendCount"
                :placeholder="$t('operations.form.maxSendPlaceholder')"
                :min="1"
                :max="1000"
              />
              <n-input-number
                v-model:value="formData.sendInterval"
                :placeholder="$t('operations.form.sendIntervalPlaceholder')"
                :min="1"
                :max="1440"
              />
            </div>
          </n-form-item>

          <n-form-item :label="$t('operations.form.redirectUrl')">
            <n-input
              v-model:value="formData.actionUrl"
              :placeholder="$t('operations.form.jumpLinkPlaceholder')"
              clearable
            />
          </n-form-item>

          <n-form-item :label="$t('operations.messageSettings.backendRemark')">
            <n-input
              v-model:value="formData.remark"
              type="textarea"
              :placeholder="$t('operations.messageSettings.backendRemark')"
              :rows="3"
              clearable
            />
          </n-form-item>
        </n-tab-pane>
      </n-tabs>
    </n-form>

    <template #action>
      <div class="flex justify-end gap-2">
        <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ editingItem ? $t('operations.form.update') : $t('operations.form.create') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, watch } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import {
  NButton,
  NCheckbox,
  NCheckboxGroup,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NSwitch,
  NTabs,
  NTabPane,
  type SelectOption,
} from 'naive-ui';
import { notification } from '#/adapter/naive';
import {
  createOperationMessage,
  updateOperationMessage,
  type OperationMessageCreateRequest,
} from '#/api/operationMessage';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking modal load
import { defineAsyncComponent } from 'vue';
const MediaLibrarySelector = defineAsyncComponent(
  () => import('#/components/MediaLibrarySelector.vue'),
);
import type { MediaFile } from '#/api/mediaLibrary';
import { getImageUrlByEnvironment } from '../../../utils/imageUtils';

interface OperationMessage {
  id?: number;
  language: string;
  currency: string;
  receiverType: string;
  title: string;
  content?: string;
  popupEntrance: boolean;
  startTime: number | null;
  endTime: number | null;
  readOrSent: boolean;
  videoPush: boolean;
  triggerCondition: string;
  status: string;
  priority?: string;
  icon?: string;
  targetUsers?: string[];
  maxSendCount?: number;
  sendInterval?: number;
  actionUrl?: string;
  sendImmediately?: boolean;
  remark: string;
}

interface Props {
  show: boolean;
  editingItem?: OperationMessage | null;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  editingItem: null,
});

const emit = defineEmits<Emits>();

// Form data
const formRef = ref<FormInst>();
const submitting = ref(false);
const activeTab = ref('basic');

const formData = reactive<OperationMessage>({
  language: 'zh-CN',
  currency: 'BRL',
  receiverType: 'all',
  title: '',
  content: '',
  popupEntrance: false,
  startTime: null,
  endTime: null,
  readOrSent: false,
  videoPush: false,
  triggerCondition: 'manual',
  status: 'draft',
  priority: 'normal',
  icon: '',
  targetUsers: [],
  maxSendCount: 1,
  sendInterval: 60,
  actionUrl: '',
  sendImmediately: false,
  remark: '',
});

// Options
const languageOptions: SelectOption[] = [
  { label: $t('operations.messageSettings.option.langZh'), value: 'zh-CN' },
  { label: $t('operations.messageSettings.option.langEn'), value: 'en' },
  { label: $t('operations.messageSettings.option.langPt'), value: 'pt' },
  { label: $t('operations.messageSettings.option.langEs'), value: 'es' },
  { label: $t('operations.messageSettings.option.langJa'), value: 'ja' },
];

const currencyOptions: SelectOption[] = [
  { label: 'BRL', value: 'BRL' },
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'JPY', value: 'JPY' },
];

const receiverTypeOptions: SelectOption[] = [
  { label: $t('operations.messageSettings.option.receiverAll'), value: 'all' },
  { label: $t('operations.messageSettings.option.receiverVip'), value: 'vip' },
  { label: $t('operations.messageSettings.option.receiverNew'), value: 'new' },
  { label: $t('operations.messageSettings.option.receiverActive'), value: 'active' },
  { label: $t('operations.messageSettings.option.receiverCustom'), value: 'custom' },
];

const statusOptions: SelectOption[] = [
  { label: $t('operations.messageSettings.option.statusEnabled'), value: 'enabled' },
  { label: $t('operations.messageSettings.option.statusDisabled'), value: 'disabled' },
  { label: $t('operations.messageSettings.option.statusDraft'), value: 'draft' },
];

const triggerConditionOptions: SelectOption[] = [
  { label: $t('operations.messageSettings.option.triggerLogin'), value: 'login_success' },
  { label: $t('operations.messageSettings.option.triggerDeposit'), value: 'deposit_success' },
  { label: $t('operations.messageSettings.option.triggerFirstDeposit'), value: 'first_deposit' },
  { label: $t('operations.messageSettings.option.triggerBet'), value: 'bet_success' },
  { label: $t('operations.messageSettings.option.triggerScheduled'), value: 'scheduled' },
  { label: $t('operations.messageSettings.option.triggerManual'), value: 'manual' },
];

const priorityOptions: SelectOption[] = [
  { label: $t('operations.form.priorityLow'), value: 'low' },
  { label: $t('operations.form.priorityNormal'), value: 'normal' },
  { label: $t('operations.form.priorityHigh'), value: 'high' },
  { label: $t('operations.form.priorityUrgent'), value: 'urgent' },
];

// Form validation rules
const formRules: FormRules = {
  language: [{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.language'), trigger: 'change' }],
  currency: [{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('common.currency'), trigger: 'change' }],
  receiverType: [
    { required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.messageSettings.receiverType'), trigger: 'change' },
  ],
  title: [
    { required: true, message: $t('common.pleaseEnterField', [$t('operations.messageSettings.titleLabel')]), trigger: 'blur' },
    {
      min: 2,
      max: 100,
      message: $t('operations.form.notificationTitleLength'),
      trigger: 'blur',
    },
  ],
  content: [
    { required: true, message: $t('common.pleaseEnterField', [$t('operations.messageSettings.content')]), trigger: 'blur' },
    {
      min: 10,
      max: 1000,
      message: $t('operations.form.notificationContentLength'),
      trigger: 'blur',
    },
  ],
  triggerCondition: [
    { required: true, message: $t('common.pleaseSelect') + ' ' + $t('operations.messageSettings.triggerCondition'), trigger: 'change' },
  ],
  status: [{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('common.status'), trigger: 'change' }],
  startTime: [{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('common.startTime'), trigger: 'change' }],
  endTime: [{ required: true, message: $t('common.pleaseSelect') + ' ' + $t('common.endTime'), trigger: 'change' }],
};

// Computed
const showModal = computed({
  get: () => props.show,
  set: (value: boolean) => {
    emit('update:show', value);
  },
});

// Methods
const handleIconSelected = (file: MediaFile) => {
  formData.icon = file.url;
  console.log('Selected icon:', file.filename, file.url);
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    const submitData: OperationMessageCreateRequest = {
      language: formData.language,
      currency: formData.currency,
      receiverType: formData.receiverType,
      title: formData.title,
      content: formData.content,
      popupEntrance: formData.popupEntrance,
      startTime: formData.startTime
        ? new Date(formData.startTime).toISOString()
        : undefined,
      endTime: formData.endTime
        ? new Date(formData.endTime).toISOString()
        : undefined,
      readOrSent: formData.readOrSent,
      videoPush: formData.videoPush,
      triggerCondition: formData.triggerCondition,
      status: formData.status,
      priority: formData.priority,
      icon: formData.icon,
      targetUsers: formData.targetUsers,
      maxSendCount: formData.maxSendCount,
      sendInterval: formData.sendInterval,
      actionUrl: formData.actionUrl,
      sendImmediately: formData.sendImmediately,
      remark: formData.remark,
    };

    if (props.editingItem) {
      await updateOperationMessage(props.editingItem.id!, submitData);
    } else {
      await createOperationMessage(submitData);
    }

    notification.success({
      content: props.editingItem ? $t('operations.form.updateSuccess') : $t('operations.form.createSuccess'),
      duration: 3000,
    });

    emit('success');
  } catch (error) {
    console.error('Error submitting operation message:', error);
    notification.error({
      content: $t('operations.form.submitFailed'),
      duration: 3000,
    });
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  showModal.value = false;
};

const resetForm = () => {
  Object.assign(formData, {
    language: 'zh-CN',
    currency: 'BRL',
    receiverType: 'all',
    title: '',
    content: '',
    popupEntrance: false,
    startTime: null,
    endTime: null,
    readOrSent: false,
    videoPush: false,
    triggerCondition: 'manual',
    status: 'draft',
    priority: 'normal',
    icon: '',
    targetUsers: [],
    maxSendCount: 1,
    sendInterval: 60,
    actionUrl: '',
    sendImmediately: false,
    remark: '',
  });

  activeTab.value = 'basic';
};

// Watch for editing item changes
watch(
  () => props.editingItem,
  (newItem) => {
    if (newItem) {
      Object.assign(formData, {
        ...newItem,
        startTime: newItem.startTime
          ? new Date(newItem.startTime).getTime()
          : null,
        endTime: newItem.endTime ? new Date(newItem.endTime).getTime() : null,
      });
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-500 {
  color: #6b7280;
}

.field-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

/* Icon预览样式 */
.icon-preview {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  background-color: #fafafa;
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

.icon-preview-image {
  max-width: 64px;
  max-height: 64px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}
</style>
