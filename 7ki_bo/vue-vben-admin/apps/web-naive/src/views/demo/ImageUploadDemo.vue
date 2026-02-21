<template>
  <div class="image-upload-demo">
    <div class="demo-header">
      <h1>Enhanced Image Upload Demo</h1>
      <p>
        Test the new image upload system with database storage and proper URL
        generation
      </p>
    </div>

    <div class="demo-content">
      <div class="demo-section">
        <h2>Single Image Upload</h2>
        <ImageUpload
          :multiple="false"
          :max-files="1"
          category="demo"
          :is-public="true"
          @uploaded="handleSingleUpload"
          @error="handleError"
        />
      </div>

      <div class="demo-section">
        <h2>Multiple Images Upload</h2>
        <ImageUpload
          :multiple="true"
          :max-files="5"
          category="demo"
          :is-public="true"
          @uploaded="handleMultipleUpload"
          @error="handleError"
        />
      </div>

      <div v-if="uploadedFiles.length" class="demo-section">
        <h2>Uploaded Files</h2>
        <div class="uploaded-files-grid">
          <div
            v-for="file in uploadedFiles"
            :key="file.id"
            class="uploaded-file-card"
          >
            <img
              :src="getImageUrl(file.url)"
              :alt="file.alt || file.originalName"
              class="file-image"
            />
            <div class="file-details">
              <h3>{{ file.originalName }}</h3>
              <p class="file-url">{{ file.url }}</p>
              <p class="file-info">
                Size: {{ formatFileSize(file.size) }} • Dimensions:
                {{ file.width }}x{{ file.height }} • Format: {{ file.format }}
              </p>
              <div
                v-if="file.thumbnailUrl || file.mediumUrl"
                class="file-variants"
              >
                <p v-if="file.thumbnailUrl">
                  <strong>Thumbnail:</strong> {{ file.thumbnailUrl }}
                </p>
                <p v-if="file.mediumUrl">
                  <strong>Medium:</strong> {{ file.mediumUrl }}
                </p>
              </div>
              <div class="file-metadata">
                <p><strong>Category:</strong> {{ file.category }}</p>
                <p v-if="file.alt"><strong>Alt Text:</strong> {{ file.alt }}</p>
                <p v-if="file.description">
                  <strong>Description:</strong> {{ file.description }}
                </p>
                <p v-if="file.tags && file.tags.length">
                  <strong>Tags:</strong> {{ file.tags.join(', ') }}
                </p>
                <p>
                  <strong>Public:</strong> {{ file.isPublic ? 'Yes' : 'No' }}
                </p>
                <p>
                  <strong>Uploaded:</strong> {{ formatDate(file.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="demo-section error-section">
        <h2>Error</h2>
        <div class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const ImageUpload = defineAsyncComponent(
  () => import('../../components/ImageUpload.vue'),
);
import {
  getImageUrlByEnvironment,
  formatFileSize,
} from '../../utils/imageUtils';
import type { UploadedFile } from '../../api/upload';

const uploadedFiles = ref<UploadedFile[]>([]);
const errorMessage = ref('');

function handleSingleUpload(files: UploadedFile[]) {
  uploadedFiles.value.push(...files);
  errorMessage.value = '';
  console.log('Single upload completed:', files);
}

function handleMultipleUpload(files: UploadedFile[]) {
  uploadedFiles.value.push(...files);
  errorMessage.value = '';
  console.log('Multiple upload completed:', files);
}

function handleError(message: string) {
  errorMessage.value = message;
  console.error('Upload error:', message);
}

function getImageUrl(url: string): string {
  return getImageUrlByEnvironment(url);
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleString();
}
</script>

<style scoped>
.image-upload-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.demo-header {
  text-align: center;
  margin-bottom: 32px;
}

.demo-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.demo-header p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.demo-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.uploaded-files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.uploaded-file-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.file-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.file-details {
  padding: 16px;
}

.file-details h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-url {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 8px 0;
  word-break: break-all;
  font-family: monospace;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
}

.file-info {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.file-variants {
  margin-bottom: 12px;
}

.file-variants p {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 4px 0;
  word-break: break-all;
  font-family: monospace;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
}

.file-metadata {
  font-size: 12px;
  color: #6b7280;
}

.file-metadata p {
  margin: 0 0 4px 0;
}

.file-metadata strong {
  color: #374151;
}

.error-section {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
}
</style>
