<template>
  <div class="image-upload">
    <div
      class="upload-area"
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        @change="handleFileSelect"
        style="display: none"
      />

      <div class="upload-content" :class="{ 'drag-over': isDragOver }">
        <div v-if="!uploadedFiles.length" class="upload-placeholder">
          <Icon name="mdi:cloud-upload" size="48" class="upload-icon" />
          <p class="upload-text">
            Click to upload or drag and drop images here
          </p>
          <p class="upload-hint">
            Supports: JPG, PNG, GIF, WebP, SVG (Max 20MB)
          </p>
        </div>

        <div v-else class="uploaded-files">
          <div
            v-for="(file, index) in uploadedFiles"
            :key="index"
            class="file-item"
          >
            <img
              :src="getImageUrl(file.url)"
              :alt="file.alt || file.originalName"
              class="file-preview"
            />
            <div class="file-info">
              <p class="file-name">{{ file.originalName }}</p>
              <p class="file-size">{{ formatFileSize(file.size) }}</p>
              <p class="file-dimensions">{{ file.width }}x{{ file.height }}</p>
            </div>
            <button @click="removeFile(index)" class="remove-btn" type="button">
              <Icon name="mdi:close" size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="uploadedFiles.length" class="upload-actions">
      <button
        @click="uploadFiles"
        :disabled="isUploading"
        class="upload-btn"
        type="button"
      >
        <Icon
          v-if="isUploading"
          name="mdi:loading"
          size="16"
          class="spinning"
        />
        {{
          isUploading
            ? 'Uploading...'
            : `Upload ${uploadedFiles.length} file(s)`
        }}
      </button>
      <button @click="clearFiles" class="clear-btn" type="button">
        Clear All
      </button>
    </div>

    <div v-if="uploadedFiles.length" class="upload-options">
      <div class="option-group">
        <label for="category">Category:</label>
        <input
          v-model="uploadOptions.category"
          id="category"
          type="text"
          placeholder="e.g., avatars, banners"
        />
      </div>

      <div class="option-group">
        <label for="alt">Alt Text:</label>
        <input
          v-model="uploadOptions.alt"
          id="alt"
          type="text"
          placeholder="Image description for accessibility"
        />
      </div>

      <div class="option-group">
        <label for="description">Description:</label>
        <textarea
          v-model="uploadOptions.description"
          id="description"
          placeholder="Optional description"
        ></textarea>
      </div>

      <div class="option-group">
        <label for="tags">Tags:</label>
        <input
          v-model="tagsInput"
          id="tags"
          type="text"
          placeholder="tag1, tag2, tag3"
          @blur="updateTags"
        />
      </div>

      <div class="option-group">
        <label>
          <input v-model="uploadOptions.isPublic" type="checkbox" />
          Public (visible to all users)
        </label>
      </div>
    </div>

    <div v-if="uploadResults.length" class="upload-results">
      <h3>Upload Results</h3>
      <div v-for="result in uploadResults" :key="result.id" class="result-item">
        <img
          :src="getImageUrl(result.url)"
          :alt="result.alt || result.originalName"
          class="result-preview"
        />
        <div class="result-info">
          <p class="result-name">{{ result.originalName }}</p>
          <p class="result-url">{{ result.url }}</p>
          <p class="result-size">
            {{ formatFileSize(result.size) }} • {{ result.width }}x{{
              result.height
            }}
          </p>
          <div v-if="result.thumbnailUrl" class="result-thumbnails">
            <span>Thumbnail: {{ result.thumbnailUrl }}</span>
            <span v-if="result.mediumUrl">Medium: {{ result.mediumUrl }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  uploadSingleImage,
  uploadMultipleImages,
  type UploadedFile,
  type UploadOptions,
} from '../api/upload';
import {
  getImageUrlByEnvironment,
  formatFileSize,
  validateImageFile,
} from '../utils/imageUtils';

interface Props {
  multiple?: boolean;
  maxFiles?: number;
  category?: string;
  isPublic?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  maxFiles: 10,
  category: 'general',
  isPublic: true,
});

const emit = defineEmits<{
  uploaded: [files: UploadedFile[]];
  error: [message: string];
}>();

const fileInput = ref<HTMLInputElement>();
const isDragOver = ref(false);
const isUploading = ref(false);
const uploadedFiles = ref<File[]>([]);
const uploadResults = ref<UploadedFile[]>([]);

const uploadOptions = reactive<UploadOptions>({
  category: props.category,
  isPublic: props.isPublic,
  alt: '',
  description: '',
  tags: [],
});

const tagsInput = ref('');

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    addFiles(Array.from(target.files));
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;

  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files));
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = true;
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;
}

function addFiles(files: File[]) {
  const validFiles: File[] = [];

  for (const file of files) {
    const validation = validateImageFile(file);
    if (validation.valid) {
      validFiles.push(file);
    } else {
      emit('error', validation.error || 'Invalid file');
    }
  }

  if (uploadedFiles.value.length + validFiles.length > props.maxFiles) {
    emit('error', `Maximum ${props.maxFiles} files allowed`);
    return;
  }

  uploadedFiles.value.push(...validFiles);
}

function removeFile(index: number) {
  uploadedFiles.value.splice(index, 1);
}

function clearFiles() {
  uploadedFiles.value = [];
  uploadResults.value = [];
}

function updateTags() {
  if (tagsInput.value.trim()) {
    uploadOptions.tags = tagsInput.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);
  } else {
    uploadOptions.tags = [];
  }
}

function getImageUrl(url: string): string {
  return getImageUrlByEnvironment(url);
}

async function uploadFiles() {
  if (uploadedFiles.value.length === 0) {
    emit('error', 'No files to upload');
    return;
  }

  isUploading.value = true;

  try {
    let results: UploadedFile[];

    if (props.multiple && uploadedFiles.value.length > 1) {
      results = await uploadMultipleImages(uploadedFiles.value, uploadOptions);
    } else {
      const result = await uploadSingleImage(
        uploadedFiles.value[0],
        uploadOptions,
      );
      results = [result];
    }

    uploadResults.value = results;
    emit('uploaded', results);

    // Clear files after successful upload
    clearFiles();
  } catch (error) {
    console.error('Upload error:', error);
    emit('error', error instanceof Error ? error.message : 'Upload failed');
  } finally {
    isUploading.value = false;
  }
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-content {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  color: #6b7280;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.upload-hint {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.uploaded-files {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
}

.file-item {
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.file-preview {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.file-info {
  padding: 12px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size,
.file-dimensions {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.upload-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.upload-btn,
.clear-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn {
  background: #3b82f6;
  color: white;
  border: none;
}

.upload-btn:hover:not(:disabled) {
  background: #2563eb;
}

.upload-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.clear-btn {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.clear-btn:hover {
  background: #f9fafb;
  color: #374151;
}

.upload-options {
  margin-top: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.option-group {
  margin-bottom: 12px;
}

.option-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.option-group input,
.option-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.option-group input:focus,
.option-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.option-group textarea {
  resize: vertical;
  min-height: 80px;
}

.upload-results {
  margin-top: 24px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.upload-results h3 {
  margin: 0 0 16px 0;
  color: #0369a1;
  font-size: 16px;
  font-weight: 600;
}

.result-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 12px;
}

.result-preview {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.result-info {
  flex: 1;
}

.result-name {
  font-weight: 500;
  margin: 0 0 4px 0;
}

.result-url {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 4px 0;
  word-break: break-all;
}

.result-size {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.result-thumbnails {
  font-size: 12px;
  color: #6b7280;
}

.result-thumbnails span {
  display: block;
  margin-bottom: 2px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
