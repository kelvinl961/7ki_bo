<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="$t('activity.noviceWelfareSettings.k4fee')"
    style="width: 600px"
    class="settings-modal"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <span>{{ $t('activity.noviceWelfareSettings.k4fee') }}</span>
      </div>
    </template>

    <div class="modal-content">
      <n-form
        ref="formRef"
        :model="formData"
        label-placement="left"
        label-width="140px"
        size="medium"
        class="settings-form"
      >
        <!-- 任务条件 -->
        <n-form-item :label="$t('activity.noviceWelfare.k4efb')">
          <span class="text-gray-600">{{ $t('activity.noviceWelfareSettings.k6ce8') }}</span>
        </n-form-item>

        <!-- 是否开启 -->
        <n-form-item :label="$t('activity.noviceWelfare.k662f')">
          <n-switch v-model:value="formData.isEnabled" size="medium">
            <template #checked>{{ $t('activity.noviceWelfare.k5f00') }}</template>
            <template #unchecked>{{ $t('activity.formModal.k5173') }}</template>
          </n-switch>
        </n-form-item>

        <!-- 提示气泡 -->
        <n-form-item :label="$t('activity.noviceWelfare.k63d0')">
          <n-switch v-model:value="formData.showTooltip" size="medium">
            <template #checked>{{ $t('activity.noviceWelfare.k5f00') }}</template>
            <template #unchecked>{{ $t('activity.formModal.k5173') }}</template>
          </n-switch>
        </n-form-item>

        <!-- 奖励类型 -->
        <n-form-item :label="$t('activity.rewardReport.k5956')">
          <n-radio-group v-model:value="formData.rewardType">
            <n-space>
              <n-radio value="CASH">
                <span>{{ $t('activity.formModal.k56fa') }}</span>
              </n-radio>
              <n-radio value="BONUS">
                <span>{{ $t('activity.noviceWelfareSettings.k968f') }}</span>
              </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <!-- 巴西(BRL)奖励金额 -->
        <n-form-item :label="$t('activity.noviceWelfareSettings.k5df4BRLk5956')" required>
          <n-input-number
            v-model:value="formData.rewardAmount"
            :min="0"
            :step="0.01"
            :precision="2"
            :placeholder="$t('activity.formModal.k8bf73')"
            style="width: 100%"
          />
        </n-form-item>

        <!-- 活跃度 -->
        <n-form-item :label="$t('activity.rewardReport.k6d3b5')">
          <n-input-number
            v-model:value="formData.activityLevel"
            :min="0"
            :step="1"
            placeholder="0"
            style="width: 100%"
          />
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
  NInput,
  NInputNumber,
  NButton,
  NSpace,
  NRadio,
  NRadioGroup,
  NSwitch,
  useMessage,
  type FormInst,
} from 'naive-ui';
import {
  updateTaskCenter,
  getTaskCenterList,
  type TaskCenter,
} from '#/api/taskCenter';

interface Props {
  show: boolean;
  taskData: TaskCenter | null;
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

// Form data for individual task settings only
const formData = reactive({
  // Individual task settings (shown for current task)
  isEnabled: true,
  showTooltip: false,
  rewardType: 'CASH' as 'CASH' | 'BONUS',
  rewardAmount: 10.0,
  activityLevel: 0,
});

const handleCancel = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  if (!props.taskData) {
    message.error($t('activity.noviceWelfareSettings.k4efb'));
    return;
  }

  submitting.value = true;
  try {
    console.log('🎯 Submitting individual task settings:', formData);

    // Call API to update task settings
    const updateData = {
      isActive: formData.isEnabled,
      rewardType: formData.rewardType,
      rewardAmount: formData.rewardAmount,
      activityLevel: formData.activityLevel,
      // Include other necessary fields from the original task
      title: props.taskData.title,
      category: props.taskData.category,
      taskType: props.taskData.taskType,
      rewardCurrency: props.taskData.rewardCurrency || 'BRL',
    };

    await updateTaskCenter(props.taskData.id, updateData);

    message.success($t('activity.noviceWelfareSettings.k4efb2'));
    showModal.value = false;
    emit('submit');
  } catch (error: any) {
    console.error('Task settings submission failed:', error);
    message.error(error.message || $t('activity.common.saveSettingsFailed'));
  } finally {
    submitting.value = false;
  }
};

// Load current task settings when modal opens
watch(showModal, async (newValue) => {
  if (newValue && props.taskData) {
    console.log(
      '📝 Loading individual task settings for:',
      props.taskData.title,
      'ID:',
      props.taskData.id,
    );

    try {
      // Fetch fresh data from API to ensure we have the latest values
      const { data: tasks } = await getTaskCenterList({
        category: 'NOVICE_WELFARE',
      });

      // Find the current task in the fresh data
      const freshTask = tasks.find((t: any) => t.id === props.taskData!.id);

      if (freshTask) {
        console.log('✅ Loaded fresh task data from API:', freshTask);
        // Load fresh task data into form
        Object.assign(formData, {
          isEnabled: freshTask.isActive ?? true,
          showTooltip: false, // This field might not exist in task data yet
          rewardType: freshTask.rewardType || 'CASH',
          rewardAmount: freshTask.rewardAmount || 10.0,
          activityLevel: freshTask.activityLevel || 0,
        });
      } else {
        // Fallback to props data if API fetch fails to find the task
        console.warn('⚠️ Task not found in API response, using props data');
        Object.assign(formData, {
          isEnabled: props.taskData.isActive ?? true,
          showTooltip: false,
          rewardType: props.taskData.rewardType || 'CASH',
          rewardAmount: props.taskData.rewardAmount || 10.0,
          activityLevel: props.taskData.activityLevel || 0,
        });
      }
    } catch (error) {
      console.error('❌ Failed to load fresh task data:', error);
      // Fallback to props data on error
      Object.assign(formData, {
        isEnabled: props.taskData.isActive ?? true,
        showTooltip: false,
        rewardType: props.taskData.rewardType || 'CASH',
        rewardAmount: props.taskData.rewardAmount || 10.0,
        activityLevel: props.taskData.activityLevel || 0,
      });
    }
  }
});
</script>

<style scoped>
.settings-modal :deep(.n-dialog) {
  max-height: 90vh !important;
}

.modal-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

.settings-form :deep(.n-form-item) {
  margin-bottom: 16px;
}

.settings-form :deep(.n-form-item-label) {
  font-size: 14px;
  color: #374151;
}
</style>
