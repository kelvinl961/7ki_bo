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
        <p><strong>文件名:</strong> {{ file.filename }}</p>
        <p><strong>大小:</strong> {{ formatFileSize(file.size) }}</p>
        <p><strong>类型:</strong> {{ file.mimeType }}</p>
        <p v-if="file.width && file.height">
          <strong>尺寸:</strong> {{ file.width }} × {{ file.height }}px
        </p>
        <p><strong>上传时间:</strong> {{ formatDate(file.createdAt) }}</p>
        <p><strong>使用次数:</strong> {{ file.usageCount }}</p>
      </div>
    </div>

    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="top"
    >
      <!-- Filename -->
      <n-form-item label="显示名称" path="filename">
        <n-input
          v-model:value="formData.filename"
          placeholder="输入显示名称"
          maxlength="100"
          show-count
        />
      </n-form-item>

      <!-- Category -->
      <n-form-item label="分类" path="category">
        <n-select
          v-model:value="formData.category"
          placeholder="选择文件分类"
          :options="categoryOptions"
        />
      </n-form-item>

      <!-- Alt Text (for images) -->
      <n-form-item v-if="file?.type === 'image'" label="替代文本" path="alt">
        <n-input
          v-model:value="formData.alt"
          placeholder="用于无障碍访问的替代文本"
          maxlength="100"
          show-count
        />
      </n-form-item>

      <!-- Description -->
      <n-form-item label="描述" path="description">
        <n-input
          v-model:value="formData.description"
          type="textarea"
          placeholder="文件描述（可选）"
          :autosize="{ minRows: 3, maxRows: 5 }"
          maxlength="200"
          show-count
        />
      </n-form-item>

      <!-- Tags -->
      <n-form-item label="标签" path="tags">
        <n-dynamic-tags v-model:value="formData.tags" />
      </n-form-item>

      <!-- Public -->
      <n-form-item label="访问权限" path="isPublic">
        <n-switch v-model:value="formData.isPublic">
          <template #checked>公开</template>
          <template #unchecked>私有</template>
        </n-switch>
        <div class="mt-1 text-xs text-gray-500">
          公开文件可以被其他用户在选择器中看到
        </div>
      </n-form-item>

      <!-- File URL (read-only) -->
      <n-form-item label="文件URL">
        <n-input :value="file?.url" readonly placeholder="文件访问地址">
          <template #suffix>
            <n-button size="tiny" text @click="copyUrl">复制</n-button>
          </template>
        </n-input>
      </n-form-item>
    </n-form>

    <!-- Actions -->
    <div class="mt-6 flex justify-end gap-3">
      <n-button @click="handleCancel">取消</n-button>
      <n-button type="primary" @click="handleSubmit" :loading="submitting">
        保存
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
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

// Validation rules
const rules: FormRules = {
  filename: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择文件分类', trigger: 'change' }],
};

// Options
const categoryOptions = MEDIA_CATEGORIES.map((cat) => ({
  label: getCategoryDisplayName(cat),
  value: cat,
}));

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
      message.success('文件信息更新成功');
      emit('success');
    } else {
      throw new Error('Update failed');
    }
  } catch (error) {
    console.error('Update error:', error);
    message.error('更新失败，请重试');
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
    message.success('URL已复制到剪贴板');
  } catch (error) {
    console.error('Copy URL error:', error);
    message.error('复制失败');
  }
};

const getCategoryDisplayName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    backgrounds: '背景图',
    banners: '横幅',
    icons: '图标',
    logos: '标志',
    templates: '模板',
    avatars: '头像',
    documents: '文档',
    videos: '视频',
    audio: '音频',
    other: '其他',
  };
  return categoryMap[category] || category;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
