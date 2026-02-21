<template>
  <n-modal
    v-model:show="showModal"
    :title="editingItem ? '编辑通知' : '新增通知'"
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
        <n-tab-pane name="basic" tab="基本信息">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="语言" path="language">
              <n-select
                v-model:value="formData.language"
                placeholder="选择语言"
                :options="languageOptions"
              />
            </n-form-item>

            <n-form-item label="币种" path="currency">
              <n-select
                v-model:value="formData.currency"
                placeholder="选择币种"
                :options="currencyOptions"
              />
            </n-form-item>

            <n-form-item label="收件人类型" path="receiverType">
              <n-select
                v-model:value="formData.receiverType"
                placeholder="选择收件人类型"
                :options="receiverTypeOptions"
              />
            </n-form-item>

            <n-form-item label="触发条件" path="triggerCondition">
              <n-select
                v-model:value="formData.triggerCondition"
                placeholder="选择触发条件"
                :options="triggerConditionOptions"
              />
            </n-form-item>

            <n-form-item label="状态" path="status">
              <n-select
                v-model:value="formData.status"
                placeholder="选择状态"
                :options="statusOptions"
              />
            </n-form-item>
          </div>

          <n-form-item label="标题" path="title">
            <n-input
              v-model:value="formData.title"
              placeholder="请输入通知标题"
              clearable
            />
          </n-form-item>

          <n-form-item label="内容" path="content">
            <n-input
              v-model:value="formData.content"
              type="textarea"
              placeholder="请输入通知内容"
              :rows="4"
              clearable
            />
          </n-form-item>
        </n-tab-pane>

        <n-tab-pane name="schedule" tab="时间设置">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="开始时间" path="startTime">
              <n-date-picker
                v-model:value="formData.startTime"
                type="datetime"
                placeholder="选择开始时间"
                format="yyyy-MM-dd HH:mm:ss"
                clearable
              />
            </n-form-item>

            <n-form-item label="结束时间" path="endTime">
              <n-date-picker
                v-model:value="formData.endTime"
                type="datetime"
                placeholder="选择结束时间"
                format="yyyy-MM-dd HH:mm:ss"
                clearable
              />
            </n-form-item>
          </div>

          <n-form-item label="是否立即发送">
            <n-switch v-model:value="formData.sendImmediately" />
            <span class="ml-2 text-sm text-gray-500">
              开启后将立即发送通知，否则按时间段发送
            </span>
          </n-form-item>
        </n-tab-pane>

        <n-tab-pane name="display" tab="显示设置">
          <div class="grid grid-cols-2 gap-4">
            <n-form-item label="弹窗入口">
              <n-switch v-model:value="formData.popupEntrance" />
              <span class="ml-2 text-sm text-gray-500">
                开启后通知将以弹窗形式显示
              </span>
            </n-form-item>

            <n-form-item label="视频推送">
              <n-switch v-model:value="formData.videoPush" />
              <span class="ml-2 text-sm text-gray-500">
                开启后支持视频内容推送
              </span>
            </n-form-item>

            <n-form-item label="已读/发送">
              <n-switch v-model:value="formData.readOrSent" />
              <span class="ml-2 text-sm text-gray-500">
                标记为已读或已发送状态
              </span>
            </n-form-item>

            <n-form-item label="消息优先级">
              <n-select
                v-model:value="formData.priority"
                placeholder="选择优先级"
                :options="priorityOptions"
              />
            </n-form-item>
          </div>

          <n-form-item label="消息图标（可选）">
            <MediaLibrarySelector
              v-model="formData.icon"
              category="icons"
              :accept-types="['image']"
              placeholder="从媒体库选择消息图标"
              @file-selected="handleIconSelected"
            />
            <div class="field-hint">
              选择一个图标来增强消息的视觉效果（可选）
            </div>

            <!-- 预览区域 -->
            <div v-if="formData.icon" class="mt-2">
              <div class="icon-preview">
                <img
                  :src="getImageUrlByEnvironment(formData.icon)"
                  alt="消息图标预览"
                  class="icon-preview-image"
                />
              </div>
            </div>
          </n-form-item>
        </n-tab-pane>

        <n-tab-pane name="advanced" tab="高级设置">
          <n-form-item label="目标用户筛选">
            <n-checkbox-group v-model:value="formData.targetUsers">
              <n-space>
                <n-checkbox value="new_users">新用户</n-checkbox>
                <n-checkbox value="vip_users">VIP用户</n-checkbox>
                <n-checkbox value="active_users">活跃用户</n-checkbox>
                <n-checkbox value="inactive_users">非活跃用户</n-checkbox>
                <n-checkbox value="high_rollers">高额投注用户</n-checkbox>
              </n-space>
            </n-checkbox-group>
          </n-form-item>

          <n-form-item label="发送限制">
            <div class="grid grid-cols-2 gap-4">
              <n-input-number
                v-model:value="formData.maxSendCount"
                placeholder="最大发送次数"
                :min="1"
                :max="1000"
              />
              <n-input-number
                v-model:value="formData.sendInterval"
                placeholder="发送间隔(分钟)"
                :min="1"
                :max="1440"
              />
            </div>
          </n-form-item>

          <n-form-item label="跳转链接">
            <n-input
              v-model:value="formData.actionUrl"
              placeholder="点击通知后跳转的链接"
              clearable
            />
          </n-form-item>

          <n-form-item label="后台备注">
            <n-input
              v-model:value="formData.remark"
              type="textarea"
              placeholder="请输入后台备注信息"
              :rows="3"
              clearable
            />
          </n-form-item>
        </n-tab-pane>
      </n-tabs>
    </n-form>

    <template #action>
      <div class="flex justify-end gap-2">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ editingItem ? '更新' : '创建' }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
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
  { label: '中文', value: 'zh-CN' },
  { label: '英文', value: 'en' },
  { label: '葡语', value: 'pt' },
  { label: '西班牙语', value: 'es' },
  { label: '日语', value: 'ja' },
];

const currencyOptions: SelectOption[] = [
  { label: 'BRL', value: 'BRL' },
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'JPY', value: 'JPY' },
];

const receiverTypeOptions: SelectOption[] = [
  { label: '全部用户', value: 'all' },
  { label: 'VIP用户', value: 'vip' },
  { label: '新用户', value: 'new' },
  { label: '活跃用户', value: 'active' },
  { label: '自定义', value: 'custom' },
];

const statusOptions: SelectOption[] = [
  { label: '已启用', value: 'enabled' },
  { label: '已停用', value: 'disabled' },
  { label: '草稿', value: 'draft' },
];

const triggerConditionOptions: SelectOption[] = [
  { label: '登录成功', value: 'login_success' },
  { label: '充值成功', value: 'deposit_success' },
  { label: '首次充值', value: 'first_deposit' },
  { label: '投注成功', value: 'bet_success' },
  { label: '定时发送', value: 'scheduled' },
  { label: '手动触发', value: 'manual' },
];

const priorityOptions: SelectOption[] = [
  { label: '低', value: 'low' },
  { label: '普通', value: 'normal' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
];

// Form validation rules
const formRules: FormRules = {
  language: [{ required: true, message: '请选择语言', trigger: 'change' }],
  currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
  receiverType: [
    { required: true, message: '请选择收件人类型', trigger: 'change' },
  ],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    {
      min: 2,
      max: 100,
      message: '标题长度应在2-100个字符之间',
      trigger: 'blur',
    },
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    {
      min: 10,
      max: 1000,
      message: '内容长度应在10-1000个字符之间',
      trigger: 'blur',
    },
  ],
  triggerCondition: [
    { required: true, message: '请选择触发条件', trigger: 'change' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
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
      content: props.editingItem ? '更新成功' : '创建成功',
      duration: 3000,
    });

    emit('success');
  } catch (error) {
    console.error('Error submitting operation message:', error);
    notification.error({
      content: '提交失败',
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
