<template>
  <div class="unified-image-upload">
    <n-upload
      ref="uploadRef"
      :file-list="fileList"
      :max="1"
      :accept="accept"
      :before-upload="handleBeforeUpload"
      @change="handleFileChange"
      :show-file-list="false"
    >
      <div class="upload-area" :class="{ 'has-image': modelValue }">
        <div v-if="modelValue" class="image-preview">
          <n-image
            :src="getImageUrlByEnvironment(modelValue)"
            :width="previewWidth"
            :height="previewHeight"
            object-fit="cover"
            class="preview-image"
          />
          <div class="image-actions">
            <n-button
              size="small"
              type="error"
              ghost
              @click.stop="handleRemove"
            >
              删除
            </n-button>
            <n-button
              size="small"
              type="info"
              ghost
              @click.stop="handlePreview"
            >
              预览
            </n-button>
          </div>
        </div>
        <div v-else class="upload-placeholder">
          <div class="upload-icon">
            <n-icon size="32" :depth="3">
              <CloudUploadOutline />
            </n-icon>
          </div>
          <div class="upload-text">
            {{ placeholder || '点击或拖拽上传图片' }}
          </div>
          <div v-if="description" class="upload-hint">{{ description }}</div>
        </div>
      </div>
    </n-upload>

    <!-- Preview Modal -->
    <n-modal
      v-model:show="showPreview"
      preset="card"
      title="图片预览"
      style="width: 80vw; max-width: 800px"
    >
      <div class="flex justify-center">
        <n-image
          :src="getImageUrlByEnvironment(modelValue)"
          style="max-width: 100%; max-height: 60vh"
          object-fit="contain"
        />
      </div>
    </n-modal>

    <!-- Loading overlay -->
    <div v-if="uploading" class="upload-loading">
      <n-spin size="large" />
      <p class="mt-2">上传中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMessage } from 'naive-ui';
import type { UploadFileInfo } from 'naive-ui';
import { CloudUploadOutline } from '@vicons/ionicons5';
import { uploadMediaFile } from '#/api/mediaLibrary';
import { getImageUrlByEnvironment } from '../../utils/imageUtils';

interface Props {
  modelValue?: string;
  category?: string;
  maxSize?: number; // MB
  accept?: string;
  placeholder?: string;
  description?: string;
  previewWidth?: number;
  previewHeight?: number;
  alt?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'upload-success', data: { url: string; file: any }): void;
  (e: 'remove', oldUrl: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  category: 'other',
  maxSize: 5,
  accept: 'image/*',
  previewWidth: 200,
  previewHeight: 150,
});

const emit = defineEmits<Emits>();

const message = useMessage();
const uploadRef = ref();
const fileList = ref<UploadFileInfo[]>([]);
const showPreview = ref(false);
const uploading = ref(false);

// Watch for external value changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && fileList.value.length === 0) {
      fileList.value = [
        {
          id: 'current',
          name: 'current-image',
          status: 'finished',
          url: newVal,
        },
      ];
    } else if (!newVal) {
      fileList.value = [];
    }
  },
  { immediate: true },
);

const handleBeforeUpload = (data: {
  file: UploadFileInfo;
  fileList: UploadFileInfo[];
}) => {
  const { file } = data;

  // Check file size
  if (file.file && file.file.size > props.maxSize * 1024 * 1024) {
    message.error(`文件大小不能超过 ${props.maxSize}MB`);
    return false;
  }

  // Check file type
  if (file.file && !file.file.type.startsWith('image/')) {
    message.error('只能上传图片文件');
    return false;
  }

  return true;
};

const handleFileChange = async (options: { fileList: UploadFileInfo[] }) => {
  const { fileList: newFileList } = options;

  if (newFileList.length > 0 && newFileList[0].file) {
    const file = newFileList[0].file;

    try {
      uploading.value = true;

      // Upload to media library
      const response = await uploadMediaFile(file, {
        category: props.category,
        alt: props.alt || file.name,
        description: `Uploaded from ${props.category}`,
        isPublic: true,
      });

      if (response.success) {
        const imageUrl = response.data.url;
        emit('update:modelValue', imageUrl);
        emit('upload-success', { url: imageUrl, file: response.data });
        message.success('上传成功');
      } else {
        message.error('上传失败');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('上传失败，请重试');
      // Remove failed file from list
      fileList.value = [];
    } finally {
      uploading.value = false;
    }
  } else {
    // File removed
    fileList.value = [];
  }
};

const handleRemove = () => {
  const oldUrl = props.modelValue;
  fileList.value = [];
  emit('update:modelValue', '');
  emit('remove', oldUrl || '');
  message.success('已删除图片');
};

const handlePreview = () => {
  if (props.modelValue) {
    showPreview.value = true;
  }
};
</script>

<style scoped>
.unified-image-upload {
  position: relative;
  width: 100%;
  /* DEBUG: Add red border to see component boundaries */
  border: 2px solid red;
  min-height: 120px;
}

.upload-area {
  position: relative;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s;
  cursor: pointer;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* DEBUG: Add green background to see upload area */
  background: #e6ffe6 !important;
}

.upload-area:hover {
  border-color: #40a9ff;
  background: #f0f8ff;
}

.upload-area.has-image {
  border: none;
  background: transparent;
  min-height: auto;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.upload-icon {
  margin-bottom: 8px;
  color: #999;
}

.upload-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #999;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.image-preview:hover .image-actions {
  opacity: 1;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-image {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upload-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 10;
}
</style>
