<template>
  <div class="image-upload">
    <n-upload
      ref="uploadRef"
      :file-list="fileList"
      :max="1"
      :accept="accept"
      :custom-request="handleCustomRequest"
      :before-upload="handleBeforeUpload"
      :on-update:file-list="handleUpdateFileList"
      :on-remove="handleRemove"
      list-type="image-card"
      :show-file-list="false"
    >
      <div class="upload-area">
        <div v-if="imageUrl" class="image-preview">
          <n-image
            :src="imageUrl"
            :width="previewWidth"
            :height="previewHeight"
            object-fit="cover"
            class="rounded-lg"
          />
          <div class="image-actions">
            <n-button
              size="small"
              type="error"
              quaternary
              @click.stop="handleRemove"
            >
              删除
            </n-button>
            <n-button
              size="small"
              type="info"
              quaternary
              @click.stop="handlePreview"
            >
              预览
            </n-button>
          </div>
        </div>
        <div v-else class="upload-placeholder">
          <p class="mt-2 text-gray-500">点击或拖拽上传图片</p>
          <p v-if="description" class="mt-1 text-xs text-gray-400">
            {{ description }}
          </p>
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
          :src="imageUrl"
          style="max-width: 100%; max-height: 60vh"
          object-fit="contain"
        />
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMessage } from 'naive-ui';
import type { UploadFileInfo, UploadCustomRequestOptions } from 'naive-ui';
import { uploadImageApi } from '#/api/brand/brandSetting';

interface Props {
  value?: string;
  maxSize?: number; // MB
  accept?: string;
  description?: string;
  previewWidth?: number;
  previewHeight?: number;
}

interface Emits {
  (e: 'update:value', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 2,
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

const imageUrl = computed({
  get: () => props.value,
  set: (value: string) => emit('update:value', value),
});

// Watch for external value changes
watch(
  () => props.value,
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

const handleCustomRequest = async (options: UploadCustomRequestOptions) => {
  const { file, onProgress, onFinish, onError } = options;

  try {
    uploading.value = true;

    // Simulate progress
    onProgress?.({ percent: 30 });

    const response = await uploadImageApi(file.file as File);

    onProgress?.({ percent: 100 });

    // Update image URL
    imageUrl.value = response.url;

    onFinish();
    message.success('上传成功');
  } catch (error) {
    console.error('Upload error:', error);
    onError();
    message.error('上传失败');
  } finally {
    uploading.value = false;
  }
};

const handleUpdateFileList = (files: UploadFileInfo[]) => {
  fileList.value = files;
};

const handleRemove = () => {
  fileList.value = [];
  imageUrl.value = '';
  message.success('已删除图片');
};

const handlePreview = () => {
  if (imageUrl.value) {
    showPreview.value = true;
  }
};
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  position: relative;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: border-color 0.3s;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #40a9ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 150px;
}

.image-preview {
  position: relative;
  display: inline-block;
  margin: 8px;
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

:deep(.n-upload-dragger) {
  padding: 0;
}

:deep(.n-upload-file-list) {
  margin: 0;
}

:deep(.n-upload-file-list .n-upload-file) {
  margin: 0;
}
</style>
