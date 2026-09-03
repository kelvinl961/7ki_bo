<template>
  <div class="media-edit-form">
    <div v-if="file" class="file-preview-section">
      <div class="preview-container">
        <img
          v-if="file.type === 'image'"
          :src="getImageUrlByEnvironment(file.url)"
          :alt="file.alt || file.filename"
          class="preview-image"
        />
        <div v-else class="file-icon-preview">
          <div class="file-icon">{{ getFileTypeIcon(file.mimeType) }}</div>
          <div class="file-name">{{ file.filename }}</div>
        </div>
      </div>
      <div class="file-info">
        <p>
          <strong>{{ $t('media.filename') }}:</strong> {{ file.filename }}
        </p>
        <p>
          <strong>{{ $t('media.size') }}:</strong> {{ formatFileSize(file.size) }}
        </p>
        <p>
          <strong>{{ $t('common.type') }}:</strong> {{ file.mimeType }}
        </p>
        <p v-if="file.width && file.height">
          <strong>{{ $t('media.dimensions') }}:</strong>
          {{ file.width }} × {{ file.height }}px
        </p>
        <p>
          <strong>{{ $t('media.uploadTime') }}:</strong>
          <TzDateTime :value="file.createdAt" />
        </p>
        <p>
          <strong>{{ $t('media.usageTimesLabel') }}:</strong>
          {{ file.usageCount }}
        </p>
      </div>
    </div>

    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="top"
    >
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
      <n-form-item
        v-if="file?.type === 'image'"
        :label="$t('media.altText')"
        path="alt"
      >
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

      <!-- File URL (read-only) -->
      <n-form-item :label="$t('media.fileUrl')">
        <n-input
          :value="file?.url"
          readonly
          :placeholder="$t('media.fileUrlPlaceholder')"
        >
          <template #suffix>
            <n-button size="tiny" text @click="copyUrl">{{
              $t('common.copy')
            }}</n-button>
          </template>
        </n-input>
      </n-form-item>
    </n-form>

    <!-- Actions -->
    <div class="mt-6 flex justify-end gap-3">
      <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
      <n-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ $t('common.save') }}
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
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import {
  updateMediaFile,
  formatFileSize,
  getFileTypeIcon,
  MEDIA_CATEGORIES,
  type MediaFile,
} from '#/api/mediaLibrary';
import TzDateTime from '#/components/common/TzDateTime.vue';
import { getImageUrlByEnvironment } from '../../../utils/imageUtils';

// Props
interface Props {
  file: MediaFile | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

// State
const formRef = ref<FormInst>();
const submitting = ref(false);

// Message
const message = useMessage();

// Form data
const formData = reactive({
  filename: '',
  category: '',
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

// Methods
const handleSubmit = async () => {
  if (!props.file) return;

  try {
    await formRef.value?.validate();

    submitting.value = true;

    const response = await updateMediaFile(props.file.id, {
      filename: formData.filename,
      category: formData.category,
      alt: formData.alt || undefined,
      description: formData.description || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      isPublic: formData.isPublic,
    });

    if (response.success) {
      message.success($t('media.updateSuccess'));
      emit('success');
    } else {
      throw new Error('Update failed');
    }
  } catch (error) {
    console.error('Update error:', error);
    message.error($t('media.updateFailed'));
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
};

const copyUrl = async () => {
  if (!props.file?.url) return;

  try {
    await navigator.clipboard.writeText(
      window.location.origin + props.file.url,
    );
    message.success($t('media.urlCopied'));
  } catch (error) {
    console.error('Copy URL error:', error);
    message.error($t('media.copyFailed'));
  }
};

// Watch for props changes
watch(
  () => props.file,
  (newFile) => {
    if (newFile) {
      Object.assign(formData, {
        filename: newFile.filename,
        category: newFile.category,
        alt: newFile.alt || '',
        description: newFile.description || '',
        tags: newFile.tags || [],
        isPublic: newFile.isPublic,
      });
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.media-edit-form {
  padding: 0;
}

.file-preview-section {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-container {
  flex-shrink: 0;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.file-icon-preview {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.file-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.file-icon-preview .file-name {
  font-size: 12px;
  text-align: center;
  word-break: break-all;
  padding: 0 8px;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.file-info strong {
  color: #333;
}

@media (max-width: 768px) {
  .file-preview-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .preview-container {
    align-self: center;
  }
}
</style>
