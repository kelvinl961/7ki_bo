<template>
  <div class="media-batch-upload-form">
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="top"
    >
      <!-- File Upload -->
      <n-form-item :label="$t('media.selectFile')" path="files">
        <n-upload
          ref="uploadRef"
          :file-list="fileList"
          @update:file-list="handleFileListChange"
          :accept="acceptTypes"
          :max="20"
          :show-file-list="true"
          :show-preview-button="false"
          :show-remove-button="true"
          :show-upload-button="false"
          multiple
        >
          <n-upload-dragger>
            <div class="upload-dragger-content">
              <div class="upload-icon">📁</div>
              <div class="upload-text">{{ $t('media.batchUploadHint') }}</div>
              <div class="upload-hint">
                {{ $t('media.supportedFormats') }}
                {{
                  Array.isArray(acceptTypes)
                    ? acceptTypes.join(', ')
                    : acceptTypes
                }}
              </div>
              <div class="upload-hint">{{ $t('media.maxFiles') }}</div>
            </div>
          </n-upload-dragger>
        </n-upload>
      </n-form-item>

      <!-- Category -->
      <n-form-item :label="$t('media.category')" path="category">
        <n-select
          v-model:value="formData.category"
          :placeholder="$t('media.selectFileCategory')"
          :options="categoryOptions"
        />
      </n-form-item>

      <!-- Alt Text (for images) -->
      <n-form-item v-if="hasImageFiles" :label="$t('media.altText')" path="alt">
        <n-input
          v-model:value="formData.alt"
          :placeholder="$t('media.altTextBatch')"
          maxlength="100"
          show-count
        />
      </n-form-item>

      <!-- Description -->
      <n-form-item :label="$t('common.description')" path="description">
        <n-input
          v-model:value="formData.description"
          type="textarea"
          :placeholder="$t('media.descriptionBatch')"
          :autosize="{ minRows: 3, maxRows: 5 }"
          maxlength="200"
          show-count
        />
      </n-form-item>

      <!-- Tags -->
      <n-form-item :label="$t('media.tags')" path="tags">
        <n-dynamic-tags v-model:value="formData.tags" />
      </n-form-item>

      <!-- Public -->
      <n-form-item :label="$t('media.accessPermission')" path="isPublic">
        <n-switch v-model:value="formData.isPublic">
          <template #checked>{{ $t('media.public') }}</template>
          <template #unchecked>{{ $t('media.private') }}</template>
        </n-switch>
        <div class="mt-1 text-xs text-gray-500">
          {{ $t('media.publicHint') }}
        </div>
      </n-form-item>

      <!-- Upload Progress -->
      <div v-if="uploading" class="upload-progress">
        <n-progress
          type="line"
          :percentage="uploadProgress"
          :show-indicator="true"
          :status="uploadProgress === 100 ? 'success' : 'normal'"
        />
        <div class="progress-text">
          {{ $t('media.uploadingProgress', [uploadedCount, totalFiles]) }}
        </div>
      </div>

      <!-- Upload Results -->
      <div v-if="uploadResults.length > 0" class="upload-results">
        <h4 class="mb-3 text-lg font-medium">{{ $t('media.uploadResult') }}</h4>
        <div class="results-grid">
          <div
            v-for="result in uploadResults"
            :key="result.id"
            class="result-item"
            :class="{ success: result.success, error: !result.success }"
          >
            <div class="result-icon">
              {{ result.success ? '✅' : '❌' }}
            </div>
            <div class="result-info">
              <div class="result-filename">{{ result.filename }}</div>
              <div class="result-message">{{ result.message }}</div>
            </div>
          </div>
        </div>
      </div>
    </n-form>

    <!-- Actions -->
    <div class="mt-6 flex justify-end gap-3">
      <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
      <n-button
        type="primary"
        @click="handleSubmit"
        :loading="uploading"
        :disabled="!selectedFiles.length"
      >
        {{ uploadButtonLabel }}
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, watch } from 'vue';
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSwitch,
  NDynamicTags,
  NButton,
  NUpload,
  NUploadDragger,
  NProgress,
  useMessage,
  type FormInst,
  type FormRules,
  type UploadFileInfo,
  type UploadInst,
} from 'naive-ui';
import {
  uploadMediaFiles,
  MEDIA_CATEGORIES,
  type MediaFile,
} from '#/api/mediaLibrary';

// Props
interface Props {
  category?: string;
  acceptTypes?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  category: '',
  acceptTypes: () => ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx'],
});

// Emits
const emit = defineEmits<{
  success: [files: MediaFile[]];
  cancel: [];
}>();

// State
const message = useMessage();
const formRef = ref<FormInst>();
const uploadRef = ref<UploadInst>();
const submitting = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadedCount = ref(0);
const totalFiles = ref(0);
const uploadResults = ref<
  Array<{ success: boolean; filename: string; message: string; id?: number }>
>([]);

// Form data
const formData = reactive({
  category: props.category,
  alt: '',
  description: '',
  tags: [] as string[],
  isPublic: true,
});

// File list
const fileList = ref<UploadFileInfo[]>([]);
const selectedFiles = ref<File[]>([]);

const categoryMap = computed<Record<string, string>>(() => ({
  backgrounds: $t('media.catBackgrounds'),
  banners: $t('media.catBanners'),
  icons: $t('media.catIcons'),
  logos: $t('media.catLogos'),
  templates: $t('media.catTemplates'),
  avatars: $t('media.catAvatars'),
  documents: $t('media.catDocuments'),
  videos: $t('media.catVideos'),
  audio: $t('media.catAudio'),
  other: $t('media.catOther'),
}));

const getCategoryDisplayName = (category: string): string => {
  return categoryMap.value[category] || category;
};

// Computed
const hasImageFiles = computed(() => {
  return selectedFiles.value.some((file) => file.type.startsWith('image/'));
});

const categoryOptions = computed(() =>
  MEDIA_CATEGORIES.map((cat) => ({
    label: getCategoryDisplayName(cat),
    value: cat,
  })),
);

const uploadButtonLabel = computed(() => {
  if (uploading.value) {
    return $t('media.uploading');
  }
  return $t('media.uploadCount', [selectedFiles.value.length]);
});

// Validation rules
const rules = computed<FormRules>(() => ({
  category: [
    { required: true, message: $t('media.categoryRequired'), trigger: 'change' },
  ],
}));

// Methods
const handleFileListChange = (newFileList: UploadFileInfo[]) => {
  fileList.value = newFileList;
  selectedFiles.value = newFileList
    .filter((file) => file.file)
    .map((file) => file.file!);
};

const handleSubmit = async () => {
  if (selectedFiles.value.length === 0) {
    message.error($t('media.selectUploadFile'));
    return;
  }

  try {
    await formRef.value?.validate();

    if (!formData.category) {
      message.error($t('media.categoryRequired'));
      return;
    }

    uploading.value = true;
    uploadProgress.value = 0;
    uploadedCount.value = 0;
    totalFiles.value = selectedFiles.value.length;
    uploadResults.value = [];

    // Create FormData for batch upload
    const formDataToSend = new FormData();

    // Add all files
    selectedFiles.value.forEach((file) => {
      formDataToSend.append('files', file);
    });

    // Add metadata
    formDataToSend.append('category', formData.category);
    if (formData.alt) {
      formDataToSend.append('alt', formData.alt);
    }
    if (formData.description) {
      formDataToSend.append('description', formData.description);
    }
    if (formData.tags.length > 0) {
      formDataToSend.append('tags', JSON.stringify(formData.tags));
    }
    formDataToSend.append('isPublic', formData.isPublic.toString());

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 10;
      }
    }, 200);

    // Upload files
    const response = await uploadMediaFiles(formDataToSend);

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    console.log('📁 Batch upload response:', response);

    if (response && response.success && response.data) {
      // Process results
      const successResults = response.data.map((file: MediaFile) => ({
        success: true,
        filename: file.filename,
        message: $t('media.uploadItemSuccess'),
        id: file.id,
      }));

      const errorResults =
        response.errors?.map((error: any) => ({
          success: false,
          filename: error.filename,
          message: error.error,
        })) || [];

      uploadResults.value = [...successResults, ...errorResults];
      uploadedCount.value = successResults.length;

      message.success(response.message || $t('media.batchUploadComplete'));
      emit('success', response.data);
    } else {
      throw new Error('Upload failed - unexpected response format');
    }
  } catch (error) {
    console.error('Batch upload error:', error);
    message.error($t('media.batchUploadFailed'));
  } finally {
    uploading.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
};

// Watch for props changes
watch(
  () => props.category,
  (newCategory) => {
    formData.category = newCategory;
  },
);
</script>

<style scoped>
.media-batch-upload-form {
  padding: 0;
}

.upload-dragger-content {
  text-align: center;
  padding: 20px;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.upload-progress {
  margin: 20px 0;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
}

.progress-text {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.upload-results {
  margin: 20px 0;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
}

.results-grid {
  display: grid;
  gap: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.result-item.success {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.result-item.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.result-icon {
  font-size: 20px;
  margin-right: 12px;
}

.result-info {
  flex: 1;
}

.result-filename {
  font-weight: 500;
  margin-bottom: 4px;
}

.result-message {
  font-size: 14px;
  color: #666;
}
</style>
