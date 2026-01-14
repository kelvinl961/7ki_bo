<template>
  <div class="media-library-selector">
    <!-- Selected File Display -->
    <div v-if="modelValue" class="selected-file">
      <div class="file-preview">
        <img 
          v-if="showImagePreview" 
          :src="getImageUrlByEnvironment(modelValue)" 
          :alt="selectedFileName"
          class="preview-image"
          @error="previewError = true"
        />
        <div v-else class="file-icon">📄</div>
      </div>
      <div class="file-info">
        <div class="file-name">{{ selectedFileName }}</div>
        <div class="file-actions">
          <n-button size="tiny" @click="openSelector">更换</n-button>
          <n-button size="tiny" type="error" @click="clearSelection">清除</n-button>
        </div>
      </div>
    </div>

    <!-- Upload/Select Button -->
    <div v-else class="upload-area" @click="openSelector">
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <div class="upload-text">{{ placeholder || '从媒体库选择或上传文件' }}</div>
      </div>
    </div>

    <!-- Media Library Modal -->
    <n-modal 
      v-model:show="showModal" 
      preset="card" 
      title="选择媒体文件" 
      style="width: 800px; max-height: 80vh;"
    >
      <div class="media-selector-content">
        <!-- Search and Filters -->
        <div class="filters-section mb-4">
          <div class="flex gap-4 items-end">
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">搜索</label>
              <n-input
                v-model:value="filters.search"
                placeholder="搜索文件名..."
                clearable
                style="width: 200px"
                @keyup.enter="loadMediaFiles"
              />
            </div>
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
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">类型</label>
              <n-select
                v-model:value="filters.type"
                placeholder="选择类型"
                :options="typeOptions"
                clearable
                style="width: 120px"
              />
            </div>
            <n-button type="primary" @click="loadMediaFiles">搜索</n-button>
            <n-button @click="resetFilters">重置</n-button>
          </div>
          <!-- Help text for category filtering -->
          <div v-if="props.category && !filters.search" class="text-xs text-gray-500 mt-2">
            💡 显示所有{{ getCategoryDisplayName(props.category) }}文件，其他分类的文件也会显示（标记为"推荐"的为最佳匹配）
          </div>
        </div>

        <!-- Media Grid -->
        <div v-if="!loading && mediaFiles.length > 0" class="media-grid">
          <div 
            v-for="file in mediaFiles" 
            :key="file.id"
            class="media-item"
            :class="{ 'selected': selectedFileId === file.id }"
            @click="selectFile(file)"
          >
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
            <div class="file-info">
              <h3 class="file-name" :title="file.filename">{{ file.filename }}</h3>
              <div class="file-meta">
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <span class="file-category" :class="{ 'category-match': file.category === props.category }">
                  {{ getCategoryDisplayName(file.category) }}
                  <span v-if="file.category === props.category" class="category-badge">推荐</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && mediaFiles.length === 0" class="empty-state">
          <div class="empty-icon">📁</div>
          <h3>暂无文件</h3>
          <p>没有找到符合条件的文件</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <n-spin size="large" />
          <p>加载中...</p>
        </div>

        <!-- Pagination -->
        <div class="flex justify-center mt-4" v-if="pagination.totalPages > 1">
          <n-pagination 
            v-model:page="pagination.page"
            :page-count="pagination.totalPages"
            :page-size="pagination.pageSize"
            :show-size-picker="true"
            :page-sizes="[12, 24, 48]"
            show-quick-jumper
            @update:page="loadMediaFiles"
            @update:page-size="handlePageSizeChange"
          />
        </div>
      </div>

      <!-- Modal Actions -->
      <template #action>
        <div class="flex justify-between items-center">
          <div class="flex gap-2">
            <n-button @click="showUploadModal = true">
              上传新文件
            </n-button>
            <n-button @click="openMediaLibrary">
              前往媒体库
            </n-button>
          </div>
          <div class="flex gap-2">
            <n-button @click="showModal = false">取消</n-button>
            <n-button 
              type="primary" 
              @click="confirmSelection"
              :disabled="!selectedFileId"
            >
              确认选择
            </n-button>
          </div>
        </div>
      </template>
    </n-modal>

    <!-- Upload Modal -->
    <n-modal v-model:show="showUploadModal" preset="card" title="上传文件" style="width: 600px">
      <MediaUploadForm @success="handleUploadSuccess" @cancel="showUploadModal = false" />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import {
  NModal,
  NButton,
  NInput,
  NSelect,
  NPagination,
  NSpin,
  useMessage,
} from 'naive-ui';
import {
  getMediaFiles,
  formatFileSize,
  getFileTypeIcon,
  MEDIA_CATEGORIES,
  type MediaFile,
} from '#/api/mediaLibrary';
import { getImageUrlByEnvironment } from '../utils/imageUtils';
import MediaUploadForm from '#/views/media-library/components/MediaUploadForm.vue';

// Props
interface Props {
  modelValue?: string;
  category?: string;
  acceptTypes?: string[];
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  category: '',
  acceptTypes: () => ['image', 'video', 'audio', 'document'],
  placeholder: '从媒体库选择或上传文件',
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string];
  'file-selected': [file: MediaFile];
}>();

// State
const message = useMessage();
const showModal = ref(false);
const showUploadModal = ref(false);
const loading = ref(false);
const mediaFiles = ref<MediaFile[]>([]);
const selectedFileId = ref<number | null>(null);
const selectedFile = ref<MediaFile | null>(null);

// Filters
const filters = reactive({
  search: '',
  category: props.category,
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

// Options
const categoryOptions = computed(() => [
  ...MEDIA_CATEGORIES.map(cat => ({
    label: getCategoryDisplayName(cat),
    value: cat,
  }))
]);

const typeOptions = [
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '音频', value: 'audio' },
  { label: '文档', value: 'document' },
];

// Computed
const selectedFileName = computed(() => {
  if (!props.modelValue) return '';
  // Extract filename from URL
  const url = props.modelValue;
  const filename = url.split('/').pop() || '';
  return decodeURIComponent(filename);
});

// Show image preview even if URL has no extension; fallback to icon on error
const previewError = ref(false);
const showImagePreview = computed(() => {
  if (!props.modelValue) return false;
  if (previewError.value) return false;
  return isImageFile(props.modelValue);
});

// Methods
const loadMediaFiles = async () => {
  try {
    loading.value = true;
    
    // If no search is active and a category is specified, show all files of the accepted type
    // This helps users see their newly uploaded files even if they're not in the exact category
    const shouldShowAllFiles = !filters.search && props.category && filters.category === props.category;
    
    const response = await getMediaFiles({
      page: pagination.page,
      pageSize: pagination.pageSize,
      category: shouldShowAllFiles ? undefined : (filters.category || undefined),
      type: filters.type || undefined,
      search: filters.search || undefined,
      sortBy: filters.sortBy as any,
      sortOrder: filters.sortOrder,
    });

    console.log('📁 MediaLibrarySelector response:', response);
    
    // Handle different response formats
    let responseData: MediaFile[] = [];
    let responsePagination: any = {};
    
    if (response.success && response.data && Array.isArray(response.data)) {
      // Format: {success: true, data: [...], pagination: {...}}
      responseData = response.data;
      responsePagination = response.pagination || {};
    } else if (response.data && Array.isArray(response.data)) {
      // Format: {data: [...], pagination: {...}}
      responseData = response.data;
      responsePagination = response.pagination || {};
    } else if (Array.isArray(response)) {
      // Format: direct array
      responseData = response;
      responsePagination = {};
    } else {
      console.warn('⚠️ Unexpected response format:', response);
      return;
    }
    
    // Filter by accept types if specified
    let filteredData = responseData;
    if (props.acceptTypes && props.acceptTypes.length > 0) {
      filteredData = responseData.filter(file => 
        props.acceptTypes!.includes(file.type)
      );
    }
    
    // If we're showing all files but want to prioritize the specified category
    if (shouldShowAllFiles) {
      // Sort so that files in the specified category appear first
      filteredData.sort((a, b) => {
        const aInCategory = a.category === props.category;
        const bInCategory = b.category === props.category;
        if (aInCategory && !bInCategory) return -1;
        if (!aInCategory && bInCategory) return 1;
        return 0;
      });
    }
    
    mediaFiles.value = filteredData;
    if (responsePagination) {
      Object.assign(pagination, responsePagination);
    }
    
    console.log(`✅ Loaded ${filteredData.length} media files`);
  } catch (error) {
    console.error('Load media files error:', error);
    message.error('加载文件失败');
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  Object.assign(filters, {
    search: '',
    category: props.category,
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

const selectFile = (file: MediaFile) => {
  selectedFileId.value = file.id;
  selectedFile.value = file;
};

const confirmSelection = () => {
  if (selectedFile.value) {
    emit('update:modelValue', selectedFile.value.url);
    emit('file-selected', selectedFile.value);
    showModal.value = false;
    message.success(`已选择: ${selectedFile.value.filename}`);
  }
};

const openSelector = () => {
  showModal.value = true;
  loadMediaFiles();
};

const clearSelection = () => {
  emit('update:modelValue', '');
  selectedFileId.value = null;
  selectedFile.value = null;
  message.success('已清除选择');
};

const openMediaLibrary = () => {
  window.open('/media-library/management', '_blank');
};

const handleUploadSuccess = (file: MediaFile) => {
  showUploadModal.value = false;
  // Auto-select the newly uploaded file
  selectedFileId.value = file.id;
  selectedFile.value = file;
  confirmSelection();
  // Add a small delay to ensure backend processing is complete
  setTimeout(() => {
    loadMediaFiles(); // Refresh the list
  }, 500);
};

const isImageFile = (url: string): boolean => {
  const lower = url.toLowerCase();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
  const nonImageExtensions = ['.pdf', '.zip', '.rar', '.doc', '.docx', '.xls', '.xlsx', '.mp4', '.mov', '.avi'];
  if (imageExtensions.some(ext => lower.includes(ext))) return true;
  if (nonImageExtensions.some(ext => lower.endsWith(ext))) return false;
  // Heuristic: treat unknown extension or no extension as image for preview purposes
  return true;
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

// Find file by URL when editing
const findFileByUrl = async (url: string) => {
  try {
    // Load media files to search for the matching URL
    const response = await getMediaFiles({
      page: 1,
      pageSize: 100, // Load more to find the file
      search: url.split('/').pop() || '', // Search by filename
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    if (response.success) {
      const matchingFile = response.data.find(file => file.url === url);
      if (matchingFile) {
        selectedFileId.value = matchingFile.id;
        selectedFile.value = matchingFile;
        console.log('Found matching file for URL:', url, matchingFile);
      }
    }
  } catch (error) {
    console.warn('Could not find file by URL:', url, error);
  }
};

// Watch for props changes
watch(() => props.category, (newCategory) => {
  filters.category = newCategory;
});

// Watch for modelValue changes to handle editing case
watch(() => props.modelValue, async (newValue) => {
  if (newValue && !selectedFile.value) {
    // When editing, we have a URL but need to find the corresponding file
    await findFileByUrl(newValue);
  }
}, { immediate: true });

// Lifecycle
onMounted(() => {
  // Load initial data if modal is opened
  if (showModal.value) {
    loadMediaFiles();
  }
});
</script>

<style scoped>
.media-library-selector {
  width: 100%;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
}

.file-preview {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  font-size: 24px;
  opacity: 0.6;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s;
  cursor: pointer;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #40a9ff;
  background: #f0f8ff;
}

.upload-content {
  text-align: center;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.upload-text {
  color: #666;
  font-size: 14px;
}

.media-selector-content {
  max-height: 60vh;
  overflow-y: auto;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.media-item {
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.media-item:hover {
  border-color: #40a9ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.media-item.selected {
  border-color: #1890ff;
  background: #f0f8ff;
}

.media-item .file-preview {
  height: 120px;
  width: 100%;
}

.media-item .file-info {
  padding: 8px;
}

.media-item .file-name {
  font-size: 12px;
  margin-bottom: 4px;
}

.media-item .file-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
}

.empty-state, .loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.loading-state p {
  margin-top: 16px;
}

.filters-section {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.category-match {
  color: #1890ff;
  font-weight: 500;
}

.category-badge {
  background: #1890ff;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
}
</style> 