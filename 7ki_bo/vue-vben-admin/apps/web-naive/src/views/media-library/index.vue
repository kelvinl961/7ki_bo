<template>
  <div class="media-library-page">
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="mb-2 text-2xl font-semibold text-gray-900">媒体库管理</h1>
        <p class="text-gray-600">统一管理所有上传的图片、视频和文档</p>
      </div>
      <div class="flex gap-3">
        <n-button type="primary" @click="showUploadModal = true">
          上传文件
        </n-button>
        <n-button type="success" @click="showBatchUploadModal = true">
          批量上传
        </n-button>
        <n-button
          type="error"
          :disabled="selectedFiles.length === 0"
          @click="handleBulkDelete"
        >
          批量删除 ({{ selectedFiles.length }})
        </n-button>
      </div>
    </div>

    <!-- Filters and Search -->
    <n-card class="mb-4">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Search -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">搜索</label>
          <n-input
            v-model:value="filters.search"
            placeholder="搜索文件名、描述..."
            clearable
            style="width: 240px"
            @keyup.enter="loadMediaFiles"
          />
        </div>

        <!-- Category Filter -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">分类</label>
          <n-select
            v-model:value="filters.category"
            placeholder="选择分类"
            :options="categoryOptions"
            clearable
            style="width: 150px"
          />
        </div>

        <!-- Type Filter -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">文件类型</label>
          <n-select
            v-model:value="filters.type"
            placeholder="选择类型"
            :options="typeOptions"
            clearable
            style="width: 120px"
          />
        </div>

        <!-- Sort -->
        <div class="flex flex-col">
          <label class="mb-2 text-sm font-medium">排序</label>
          <n-select
            v-model:value="filters.sortBy"
            :options="sortOptions"
            style="width: 120px"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <n-button type="primary" @click="loadMediaFiles"> 搜索 </n-button>
          <n-button @click="resetFilters"> 重置 </n-button>
        </div>
      </div>
    </n-card>

    <!-- Category Statistics -->
    <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
      <div
        v-for="category in categories"
        :key="category.name"
        class="stat-card"
        :class="{ active: filters.category === category.name }"
        @click="
          filters.category = category.name;
          loadMediaFiles();
        "
      >
        <div class="stat-number">{{ category.count }}</div>
        <div class="stat-label">
          {{ getCategoryDisplayName(category.name) }}
        </div>
      </div>
    </div>

    <!-- Debug Info (temporary - remove in production) -->
    <n-card
      v-if="true"
      style="
        margin-bottom: 16px;
        background: #fff3cd;
        border: 1px solid #ffc107;
      "
    >
      <div style="font-size: 12px; font-family: monospace">
        <div><strong>Debug Info:</strong></div>
        <div>Loading: {{ loading }}</div>
        <div>Files Count: {{ mediaFiles ? mediaFiles.length : 'null' }}</div>
        <div>Has Files Array: {{ Array.isArray(mediaFiles) }}</div>
        <div>Pagination Total: {{ pagination.total }}</div>
        <div>Pagination Pages: {{ pagination.totalPages }}</div>
        <div>
          First File:
          {{
            mediaFiles && mediaFiles.length > 0
              ? mediaFiles[0].filename
              : 'none'
          }}
        </div>
      </div>
    </n-card>

    <!-- Media Grid -->
    <div
      class="media-grid"
      v-if="!loading && mediaFiles && mediaFiles.length > 0"
    >
      <div
        v-for="file in mediaFiles"
        :key="file.id"
        class="media-item"
        :class="{ selected: selectedFiles.includes(file.id) }"
        @click="toggleSelection(file.id)"
      >
        <!-- Selection Checkbox -->
        <div class="selection-checkbox">
          <n-checkbox :checked="selectedFiles.includes(file.id)" />
        </div>

        <!-- File Preview -->
        <div class="file-preview">
          <img
            v-if="file.type === 'image'"
            :src="getImageUrlByEnvironment(file.url)"
            :alt="file.alt || file.filename"
            class="preview-image"
            loading="lazy"
          />
          <div v-else class="file-type-icon">
            {{ getFileTypeIcon(file.mimeType) }}
          </div>
        </div>

        <!-- File Info -->
        <div class="file-info">
          <h3 class="file-name" :title="file.filename">{{ file.filename }}</h3>
          <div class="file-meta">
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <span class="file-category">{{
              getCategoryDisplayName(file.category)
            }}</span>
          </div>
          <div v-if="file.description" class="file-description">
            {{ file.description }}
          </div>
          <div class="file-stats">
            <span>使用次数: {{ file.usageCount }}</span>
            <span>{{ formatDate(file.createdAt) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="file-actions">
          <n-button size="tiny" @click.stop="editFile(file)">编辑</n-button>
          <n-button size="tiny" type="error" @click.stop="deleteFile(file.id)"
            >删除</n-button
          >
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading && (!mediaFiles || mediaFiles.length === 0)"
      class="empty-state"
    >
      <div class="empty-icon">📁</div>
      <h3>暂无文件</h3>
      <p>点击上传文件开始使用媒体库</p>
      <n-button type="primary" @click="showUploadModal = true">
        上传第一个文件
      </n-button>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-state">
      <n-spin size="large" />
      <p>加载中...</p>
    </div>

    <!-- Error State (if needed) -->
    <div v-else class="empty-state">
      <div class="empty-icon">⚠️</div>
      <h3>无法加载文件</h3>
      <p>请检查网络连接或刷新页面重试</p>
      <n-button type="primary" @click="loadMediaFiles"> 重新加载 </n-button>
    </div>

    <!-- Pagination -->
    <div class="mt-8 flex justify-center" v-if="pagination.totalPages > 1">
      <n-pagination
        v-model:page="pagination.page"
        :page-count="pagination.totalPages"
        :page-size="pagination.pageSize"
        :show-size-picker="true"
        :page-sizes="[12, 24, 48, 96]"
        show-quick-jumper
        @update:page="loadMediaFiles"
        @update:page-size="handlePageSizeChange"
      />
    </div>

    <!-- Upload Modal -->
    <n-modal
      v-model:show="showUploadModal"
      preset="card"
      title="上传文件"
      style="width: 600px"
    >
      <MediaUploadForm
        @success="handleUploadSuccess"
        @cancel="showUploadModal = false"
      />
    </n-modal>

    <!-- Batch Upload Modal -->
    <n-modal
      v-model:show="showBatchUploadModal"
      preset="card"
      title="批量上传文件"
      style="width: 800px"
    >
      <MediaBatchUploadForm
        @success="handleBatchUploadSuccess"
        @cancel="showBatchUploadModal = false"
      />
    </n-modal>

    <!-- Edit Modal -->
    <n-modal
      v-model:show="showEditModal"
      preset="card"
      title="编辑文件"
      style="width: 500px"
    >
      <MediaEditForm
        :file="editingFile"
        @success="handleEditSuccess"
        @cancel="showEditModal = false"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'MediaLibraryIndex',
});

import { ref, reactive, onMounted, computed, defineAsyncComponent } from 'vue';
import {
  NCard,
  NButton,
  NInput,
  NSelect,
  NCheckbox,
  NModal,
  NPagination,
  NSpin,
  useMessage,
} from 'naive-ui';
import {
  getMediaFiles,
  getMediaCategories,
  deleteMediaFile,
  bulkDeleteMediaFiles,
  formatFileSize,
  getFileTypeIcon,
  MEDIA_CATEGORIES,
  type MediaFile,
  type MediaCategory,
} from '#/api/mediaLibrary';
import { getImageUrlByEnvironment } from '../../utils/imageUtils';
// Lazy load child components to avoid blocking main component
const MediaUploadForm = defineAsyncComponent(
  () => import('./components/MediaUploadForm.vue'),
);
const MediaBatchUploadForm = defineAsyncComponent(
  () => import('./components/MediaBatchUploadForm.vue'),
);
const MediaEditForm = defineAsyncComponent(
  () => import('./components/MediaEditForm.vue'),
);

// State
const loading = ref(false);
const mediaFiles = ref<MediaFile[]>([]);
const categories = ref<MediaCategory[]>([]);
const selectedFiles = ref<number[]>([]);
const showUploadModal = ref(false);
const showBatchUploadModal = ref(false);
const showEditModal = ref(false);
const editingFile = ref<MediaFile | null>(null);

// Filters
const filters = reactive({
  search: '',
  category: '',
  type: '',
  sortBy: 'createdAt',
  sortOrder: 'desc' as 'asc' | 'desc',
});

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 24,
  total: 0,
  totalPages: 0,
});

// Message
const message = useMessage();

// Options
const categoryOptions = computed(() => [
  ...MEDIA_CATEGORIES.map((cat) => ({
    label: getCategoryDisplayName(cat),
    value: cat,
  })),
]);

const typeOptions = [
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '音频', value: 'audio' },
  { label: '文档', value: 'document' },
];

const sortOptions = [
  { label: '创建时间', value: 'createdAt' },
  { label: '文件名', value: 'filename' },
  { label: '文件大小', value: 'size' },
  { label: '使用次数', value: 'usageCount' },
];

// Methods
const loadMediaFiles = async () => {
  try {
    loading.value = true;
    console.log('📂 Loading media files...', {
      page: pagination.page,
      pageSize: pagination.pageSize,
      category: filters.category,
      type: filters.type,
      search: filters.search,
    });

    const response = await getMediaFiles({
      page: pagination.page,
      pageSize: pagination.pageSize,
      category: filters.category || undefined,
      type: filters.type || undefined,
      search: filters.search || undefined,
      sortBy: filters.sortBy as any,
      sortOrder: filters.sortOrder,
    });

    console.log('📦 Media files response:', response);
    console.log('📦 Response type:', typeof response);
    console.log('📦 Response keys:', response ? Object.keys(response) : 'null');

    // Handle different response formats
    if (response) {
      // Format 1: {success: true, data: [...], pagination: {...}}
      if (response.success === true && response.data) {
        mediaFiles.value = Array.isArray(response.data) ? response.data : [];
        if (response.pagination) {
          Object.assign(pagination, {
            page: response.pagination.page || pagination.page,
            pageSize: response.pagination.pageSize || pagination.pageSize,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0,
          });
        }
        console.log(
          '✅ Loaded media files (format 1):',
          mediaFiles.value.length,
        );
      }
      // Format 2: Direct array response
      else if (Array.isArray(response)) {
        mediaFiles.value = response;
        console.log(
          '✅ Loaded media files (format 2 - array):',
          mediaFiles.value.length,
        );
      }
      // Format 3: {data: [...], pagination: {...}} without success flag
      else if (response.data && Array.isArray(response.data)) {
        mediaFiles.value = response.data;
        if (response.pagination) {
          Object.assign(pagination, {
            page: response.pagination.page || pagination.page,
            pageSize: response.pagination.pageSize || pagination.pageSize,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0,
          });
        }
        console.log(
          '✅ Loaded media files (format 3):',
          mediaFiles.value.length,
        );
      }
      // Format 4: {code: 0, data: {...}} - nested data
      else if (response.code === 0 && response.data) {
        if (Array.isArray(response.data)) {
          mediaFiles.value = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          mediaFiles.value = response.data.data;
          if (response.data.pagination) {
            Object.assign(pagination, response.data.pagination);
          }
        }
        console.log(
          '✅ Loaded media files (format 4):',
          mediaFiles.value.length,
        );
      } else {
        console.warn('⚠️ Unknown response format:', response);
        mediaFiles.value = [];
      }
    } else {
      console.error('❌ Response is null or undefined');
      mediaFiles.value = [];
    }

    console.log(
      '📊 Final state - Files:',
      mediaFiles.value.length,
      'Pagination:',
      pagination,
    );
  } catch (error) {
    console.error('❌ Load media files error:', error);
    message.error('加载文件失败');
  } finally {
    loading.value = false;
  }
};

const loadCategories = async () => {
  try {
    const response = await getMediaCategories();
    if (response.success) {
      categories.value = response.data;
    }
  } catch (error) {
    console.error('Load categories error:', error);
  }
};

const toggleSelection = (fileId: number) => {
  const index = selectedFiles.value.indexOf(fileId);
  if (index > -1) {
    selectedFiles.value.splice(index, 1);
  } else {
    selectedFiles.value.push(fileId);
  }
};

const editFile = (file: MediaFile) => {
  editingFile.value = file;
  showEditModal.value = true;
};

const deleteFile = async (fileId: number) => {
  const confirmed = window.confirm('确认删除这个文件吗？此操作不可恢复。');
  if (!confirmed) return;

  try {
    await deleteMediaFile(fileId);
    message.success('删除成功');
    loadMediaFiles();
    // Remove from selection if selected
    const index = selectedFiles.value.indexOf(fileId);
    if (index > -1) {
      selectedFiles.value.splice(index, 1);
    }
  } catch (error) {
    console.error('Delete file error:', error);
    message.error('删除失败');
  }
};

const handleBulkDelete = async () => {
  const confirmed = window.confirm(
    `确认删除选中的 ${selectedFiles.value.length} 个文件吗？此操作不可恢复。`,
  );
  if (!confirmed) return;

  try {
    await bulkDeleteMediaFiles(selectedFiles.value);
    message.success('批量删除成功');
    selectedFiles.value = [];
    loadMediaFiles();
  } catch (error) {
    console.error('Bulk delete error:', error);
    message.error('批量删除失败');
  }
};

const resetFilters = () => {
  Object.assign(filters, {
    search: '',
    category: '',
    type: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  pagination.page = 1;
  loadMediaFiles();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  loadMediaFiles();
};

const handleUploadSuccess = () => {
  showUploadModal.value = false;
  loadMediaFiles();
  loadCategories();
};

const handleBatchUploadSuccess = () => {
  showBatchUploadModal.value = false;
  loadMediaFiles();
  loadCategories();
};

const handleEditSuccess = () => {
  showEditModal.value = false;
  loadMediaFiles();
  loadCategories();
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
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Lifecycle
onMounted(() => {
  console.log('📚 Media Library component mounted');
  loadMediaFiles();
  loadCategories();
});
</script>

<style scoped>
.media-library-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* Statistics Cards */
.stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-card.active {
  border-color: #1890ff;
  background: #f0f8ff;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.media-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.media-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.media-item.selected {
  border: 3px solid #1890ff;
  box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.2);
}

.selection-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 4px;
}

.file-preview {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  position: relative;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-type-icon {
  font-size: 48px;
  opacity: 0.6;
}

.file-info {
  padding: 16px;
}

.file-name {
  font-weight: 600;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
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
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-item:hover .file-actions {
  opacity: 1;
}

/* Empty and Loading States */
.empty-state,
.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #333;
}

.loading-state p {
  margin-top: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .media-library-page {
    padding: 16px;
  }

  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-number {
    font-size: 20px;
  }
}
</style>
