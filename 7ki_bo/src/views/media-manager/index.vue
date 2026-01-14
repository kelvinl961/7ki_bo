<template>
  <div class="media-manager-page">
    <n-card>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">媒体文件管理</h2>
          <n-button type="primary" @click="loadMediaFiles">
            <template #icon>
              <n-icon><RefreshIcon /></n-icon>
            </template>
            刷新
          </n-button>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <n-spin size="large" />
        <span class="ml-4">加载中...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <n-alert type="error" :title="error" />
        <n-button class="mt-4" @click="loadMediaFiles">重试</n-button>
      </div>

      <!-- Media Files Grid -->
      <div v-else-if="mediaFiles.length > 0" class="media-grid">
        <n-card
          v-for="file in mediaFiles"
          :key="file.id"
          class="media-item"
          hoverable
        >
          <template #cover>
            <div class="file-preview">
              <img
                v-if="file.type === 'image'"
                :src="getFileUrl(file.url)"
                :alt="file.alt || file.filename"
                class="preview-image"
                @error="handleImageError"
              />
              <div v-else class="file-type-icon">
                {{ getFileIcon(file.type) }}
              </div>
            </div>
          </template>

          <div class="file-info">
            <h3 class="file-name" :title="file.filename">{{ file.filename }}</h3>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span class="file-type">{{ file.type }}</span>
            </div>
            <div v-if="file.description" class="file-description">
              {{ file.description }}
            </div>
            <div class="file-stats">
              <span>使用: {{ file.usageCount || 0 }} 次</span>
              <span>{{ formatDate(file.createdAt) }}</span>
            </div>
          </div>

          <template #action>
            <div class="file-actions">
              <n-button size="small" @click="copyFileUrl(file)">复制链接</n-button>
              <n-button size="small" type="error" @click="deleteFile(file.id)">
                删除
              </n-button>
            </div>
          </template>
        </n-card>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <n-empty description="暂无媒体文件">
          <template #extra>
            <n-button type="primary">上传文件</n-button>
          </template>
        </n-empty>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="mt-6 flex justify-center">
        <n-pagination
          v-model:page="pagination.page"
          :page-count="pagination.totalPages"
          :page-size="pagination.pageSize"
          show-size-picker
          :page-sizes="[12, 24, 48, 96]"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  NCard,
  NButton,
  NSpin,
  NAlert,
  NEmpty,
  NPagination,
  NIcon,
  useMessage,
} from 'naive-ui';
import { Refresh as RefreshIcon } from '@vicons/ionicons5';
import { getMediaFiles, deleteMediaFile, type MediaFile } from '#/api/mediaLibrary';

defineOptions({
  name: 'MediaManagerIndex',
});

const message = useMessage();
const loading = ref(false);
const error = ref<string | null>(null);
const mediaFiles = ref<MediaFile[]>([]);

const pagination = reactive({
  page: 1,
  pageSize: 24,
  total: 0,
  totalPages: 0,
});

const loadMediaFiles = async () => {
  try {
    loading.value = true;
    error.value = null;

    console.log('📂 Loading media files...', {
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    const response = await getMediaFiles({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    console.log('📦 Media files response:', response);
    console.log('📦 Response type:', typeof response);
    console.log('📦 Response keys:', response ? Object.keys(response) : 'null');
    console.log('📦 Response.success:', response?.success);
    console.log('📦 Response.data:', response?.data);
    console.log('📦 Response.pagination:', response?.pagination);

    // Handle different response formats
    if (response) {
      if (response.success === true && response.data) {
        mediaFiles.value = Array.isArray(response.data) ? response.data : [];
        if (response.pagination) {
          pagination.total = response.pagination.total || 0;
          pagination.totalPages = response.pagination.totalPages || 0;
          pagination.page = response.pagination.page || pagination.page;
          pagination.pageSize = response.pagination.pageSize || pagination.pageSize;
        }
        console.log('✅ Loaded media files:', mediaFiles.value.length);
      } else if (Array.isArray(response)) {
        mediaFiles.value = response;
        console.log('✅ Loaded media files (array):', mediaFiles.value.length);
      } else if (response.data && Array.isArray(response.data)) {
        mediaFiles.value = response.data;
        if (response.pagination) {
          pagination.total = response.pagination.total || 0;
          pagination.totalPages = response.pagination.totalPages || 0;
        }
        console.log('✅ Loaded media files (data):', mediaFiles.value.length);
      } else if (response.code === 0 && response.data) {
        if (Array.isArray(response.data)) {
          mediaFiles.value = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          mediaFiles.value = response.data.data;
          if (response.data.pagination) {
            Object.assign(pagination, response.data.pagination);
          }
        }
        console.log('✅ Loaded media files (code 0):', mediaFiles.value.length);
      } else {
        console.warn('⚠️ Unknown response format:', response);
        mediaFiles.value = [];
      }
    } else {
      console.error('❌ Response is null or undefined');
      mediaFiles.value = [];
    }
  } catch (err: any) {
    console.error('❌ Load media files error:', err);
    error.value = err.message || '加载媒体文件失败';
    message.error('加载媒体文件失败');
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  loadMediaFiles();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  loadMediaFiles();
};

const getFileUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `http://localhost:5000${url}`;
  }
  return `http://localhost:5000/uploads/${url}`;
};

const getFileIcon = (type: string): string => {
  const icons: Record<string, string> = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    document: '📄',
  };
  return icons[type] || '📁';
};

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const copyFileUrl = async (file: MediaFile) => {
  const url = getFileUrl(file.url);
  try {
    await navigator.clipboard.writeText(url);
    message.success('链接已复制到剪贴板');
  } catch (err) {
    message.error('复制失败');
  }
};

const deleteFile = async (fileId: number) => {
  const confirmed = window.confirm('确认删除这个文件吗？此操作不可恢复。');
  if (!confirmed) return;

  try {
    await deleteMediaFile(fileId);
    message.success('删除成功');
    loadMediaFiles();
  } catch (err) {
    console.error('Delete file error:', err);
    message.error('删除失败');
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E图片加载失败%3C/text%3E%3C/svg%3E';
};

onMounted(() => {
  console.log('📚 Media Manager component mounted');
  loadMediaFiles();
});
</script>

<style scoped>
.media-manager-page {
  padding: 24px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.media-item {
  transition: transform 0.2s;
}

.media-item:hover {
  transform: translateY(-4px);
}

.file-preview {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-type-icon {
  font-size: 64px;
  opacity: 0.6;
}

.file-info {
  padding: 12px 0;
}

.file-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.file-description {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-stats {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
}

.file-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
}
</style>

