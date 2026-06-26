<template>
  <div class="media-upload-form">
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="top"
    >
      <!-- File Upload -->
      <n-form-item :label="$t('media.selectFile')" path="file">
        <n-upload
          ref="uploadRef"
          :file-list="fileList"
          @update:file-list="handleFileListChange"
          :accept="acceptTypes"
          :max="1"
          :show-file-list="true"
          :show-preview-button="false"
          :show-remove-button="true"
          :show-upload-button="false"
        >
          <n-upload-dragger>
            <div class="upload-dragger-content">
              <div class="upload-icon">📁</div>
              <div class="upload-text">{{ $t('media.uploadHint') }}</div>
              <div class="upload-hint">
                {{ $t('media.supportedFormats') }}
                {{
                  Array.isArray(acceptTypes)
                    ? acceptTypes.join(', ')
                    : acceptTypes
                }}
              </div>
            </div>
          </n-upload-dragger>
        </n-upload>
      </n-form-item>

      <!-- Filename -->
      <n-form-item :label="$t('media.displayName')" path="filename">
        <n-input
          v-model:value="formData.filename"
          :placeholder="$t('media.displayNamePlaceholder')"
          maxlength="100"
          show-count
        />
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
      <n-form-item v-if="isImageFile" :label="$t('media.altText')" path="alt">
        <n-input
          v-model:value="formData.alt"
          :placeholder="$t('media.altTextPlaceholder')"
          maxlength="100"
          show-count
        />
      </n-form-item>

      <!-- Description -->
      <n-form-item :label="$t('common.description')" path="description">
        <n-input
          v-model:value="formData.description"
          type="textarea"
          :placeholder="$t('media.descriptionOptional')"
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
    </n-form>

    <!-- Actions -->
    <div class="mt-6 flex justify-end gap-3">
      <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
      <n-button
        type="primary"
        @click="handleSubmit"
        :loading="submitting"
        :disabled="!selectedFile"
      >
        {{ $t('common.upload') }}
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
  useMessage,
  type FormInst,
  type FormRules,
  type UploadFileInfo,
  type UploadInst,
} from 'naive-ui';
import {
  uploadMediaFile,
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
  success: [file: MediaFile];
  cancel: [];
}>();

// State
const message = useMessage();
const formRef = ref<FormInst>();
const uploadRef = ref<UploadInst>();
const submitting = ref(false);
const fileList = ref<UploadFileInfo[]>([]);
const selectedFile = ref<File | null>(null);

// Form data
const formData = reactive({
  filename: '',
  category: props.category,
  alt: '',
  description: '',
  tags: [] as string[],
  isPublic: true,
});

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

// Validation rules
const rules = computed<FormRules>(() => ({
  filename: [
    { required: true, message: $t('media.displayNameRequired'), trigger: 'blur' },
  ],
  category: [
    { required: true, message: $t('media.categoryRequired'), trigger: 'change' },
  ],
}));

// Options
const categoryOptions = computed(() =>
  MEDIA_CATEGORIES.map((cat) => ({
    label: getCategoryDisplayName(cat),
    value: cat,
  })),
);

// Computed
const isImageFile = computed(() => {
  if (!selectedFile.value) return false;
  return selectedFile.value.type.startsWith('image/');
});

// Methods
const handleFileListChange = (newFileList: UploadFileInfo[]) => {
  fileList.value = newFileList;

  if (newFileList.length > 0 && newFileList[0].file) {
    selectedFile.value = newFileList[0].file;

    // Auto-fill filename if empty
    if (!formData.filename) {
      formData.filename = selectedFile.value.name;
    }

    // Auto-detect category if empty
    if (!formData.category) {
      formData.category = detectCategory(selectedFile.value);
    }
  } else {
    selectedFile.value = null;
  }
};

const detectCategory = (file: File): string => {
  const type = file.type;

  if (type.startsWith('image/')) {
    if (type.includes('icon') || file.name.toLowerCase().includes('icon')) {
      return 'icons';
    }
    if (type.includes('logo') || file.name.toLowerCase().includes('logo')) {
      return 'logos';
    }
    if (type.includes('banner') || file.name.toLowerCase().includes('banner')) {
      return 'banners';
    }
    if (type.includes('background') || file.name.toLowerCase().includes('bg')) {
      return 'backgrounds';
    }
    if (
      type.includes('template') ||
      file.name.toLowerCase().includes('template')
    ) {
      return 'templates';
    }
    if (type.includes('avatar') || file.name.toLowerCase().includes('avatar')) {
      return 'avatars';
    }
    return 'other';
  }

  if (type.startsWith('video/')) {
    return 'videos';
  }

  if (type.startsWith('audio/')) {
    return 'audio';
  }

  return 'documents';
};

const handleSubmit = async () => {
  if (!selectedFile.value) {
    message.error($t('media.selectUploadFile'));
    return;
  }

  try {
    await formRef.value?.validate();

    submitting.value = true;

    if (!formData.category) {
      message.error($t('media.categoryRequired'));
      return;
    }

    const response = await uploadMediaFile(selectedFile.value, {
      filename: formData.filename,
      category: formData.category,
      alt: formData.alt || undefined,
      description: formData.description || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      isPublic: formData.isPublic,
    });

    console.log('📁 Upload response:', response);

    // Handle different response formats
    if (response && response.success && response.data) {
      // Format: {success: true, data: {...}, message: "..."}
      message.success(response.message || $t('media.uploadSuccess'));
      emit('success', response.data);
    } else if (response && response.data) {
      // Format: {data: {...}, message: "..."}
      message.success(response.message || $t('media.uploadSuccess'));
      emit('success', response.data);
    } else if (response && typeof response === 'object' && 'id' in response) {
      // Format: direct file object
      message.success($t('media.uploadSuccess'));
      emit('success', response as any);
    } else {
      console.warn('⚠️ Unexpected response format:', response);
      throw new Error('Upload failed - unexpected response format');
    }
  } catch (error) {
    console.error('Upload error:', error);
    message.error($t('media.uploadFailed'));
  } finally {
    submitting.value = false;
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
.media-upload-form {
  padding: 0;
}

.upload-dragger-content {
  text-align: center;
  padding: 20px;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.upload-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #666;
}
</style>
