<template>
  <div class="media-upload-form">
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="top"
    >
      <!-- File Upload -->
      <n-form-item label="选择文件" path="file">
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
              <div class="upload-text">点击或拖拽文件到该区域上传</div>
              <div class="upload-hint">
                支持格式:
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
      <n-form-item v-if="isImageFile" label="替代文本" path="alt">
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
    </n-form>

    <!-- Actions -->
    <div class="mt-6 flex justify-end gap-3">
      <n-button @click="handleCancel">取消</n-button>
      <n-button
        type="primary"
        @click="handleSubmit"
        :loading="submitting"
        :disabled="!selectedFile"
      >
        上传
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
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

// Helper function
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
    message.error('请选择要上传的文件');
    return;
  }

  try {
    await formRef.value?.validate();

    submitting.value = true;

    if (!formData.category) {
      message.error('请选择文件分类');
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
      message.success(response.message || '文件上传成功');
      emit('success', response.data);
    } else if (response && response.data) {
      // Format: {data: {...}, message: "..."}
      message.success(response.message || '文件上传成功');
      emit('success', response.data);
    } else if (response && typeof response === 'object' && 'id' in response) {
      // Format: direct file object
      message.success('文件上传成功');
      emit('success', response as any);
    } else {
      console.warn('⚠️ Unexpected response format:', response);
      throw new Error('Upload failed - unexpected response format');
    }
  } catch (error) {
    console.error('Upload error:', error);
    message.error('上传失败，请重试');
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
