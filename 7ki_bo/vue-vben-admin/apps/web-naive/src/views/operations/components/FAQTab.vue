<template>
  <div class="faq-tab p-4">
    <n-space vertical :size="16">
      <!-- Filter Bar -->
      <n-card>
        <n-space :size="16">
          <n-select
            v-model:value="filters.language"
            :options="languageOptions"
            placeholder="选择语言"
            style="width: 150px"
            clearable
            @update:value="loadFAQs"
          />

          <n-select
            v-model:value="filters.faqType"
            :options="faqTypeOptions"
            placeholder="选择类型"
            style="width: 150px"
            clearable
            @update:value="loadFAQs"
          />

          <n-select
            v-model:value="filters.status"
            :options="statusOptions"
            placeholder="选择状态"
            style="width: 150px"
            clearable
            @update:value="loadFAQs"
          />

          <n-input
            v-model:value="filters.search"
            placeholder="搜索问题或答案"
            style="width: 250px"
            clearable
            @update:value="loadFAQs"
          >
            <template #prefix>
              <span>🔍</span>
            </template>
          </n-input>

          <n-button type="primary" @click="openCategoryModal">
            设置问题类别
          </n-button>

          <n-button type="primary" @click="showEditModal(null)">
            <template #icon>
              <span>+</span>
            </template>
            新增问题
          </n-button>
        </n-space>
      </n-card>

      <!-- FAQ List -->
      <n-spin :show="loading">
        <n-data-table
          :columns="columns"
          :data="faqList"
          :pagination="pagination"
          :bordered="false"
        />
      </n-spin>
    </n-space>

    <!-- Edit/Create FAQ Modal -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editingId ? '编辑问题' : '新增问题'"
      style="width: 800px"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="top"
      >
        <n-form-item label="问题类型" path="faqType">
          <n-select
            v-model:value="formData.faqType"
            :options="faqTypeOptions"
            placeholder="选择问题类型"
          />
        </n-form-item>

        <n-form-item label="语言" path="language">
          <n-select
            v-model:value="formData.language"
            :options="languageOptions"
            placeholder="选择语言"
          />
        </n-form-item>

        <n-form-item label="问题分类" path="categoryId">
          <n-select
            v-model:value="formData.categoryId"
            :options="categoryOptions"
            placeholder="选择问题分类"
          />
        </n-form-item>

        <n-form-item label="问题" path="question">
          <n-input
            v-model:value="formData.question"
            placeholder="输入问题（最多100字）"
            maxlength="100"
            show-count
          />
        </n-form-item>

        <n-form-item label="答案" path="answer">
          <n-input
            v-model:value="formData.answer"
            type="textarea"
            placeholder="输入答案"
            :autosize="{ minRows: 4, maxRows: 8 }"
            maxlength="1000"
            show-count
          />
        </n-form-item>

        <n-form-item label="视频（可选）">
          <n-input
            v-model:value="formData.videoUrl"
            placeholder="输入视频链接或点击上传"
          />
          <n-upload
            class="mt-2"
            accept="video/*"
            :max="1"
            list-type="text"
            @before-upload="handleVideoUpload"
          >
            <n-button>上传视频</n-button>
          </n-upload>
        </n-form-item>

        <n-form-item label="排序">
          <n-input-number
            v-model:value="formData.displayOrder"
            :min="0"
            placeholder="数字越小越靠前"
            style="width: 200px"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="submitForm" :loading="saving">
            确认
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Category Management Modal -->
    <n-modal
      v-model:show="showCategoryModal"
      preset="card"
      title="设置问题类别"
      style="width: 800px"
    >
      <n-space vertical :size="16">
        <!-- Add/Edit Category Form -->
        <n-card :title="editingCategoryId ? '编辑类别' : '新增类别'">
          <n-form :model="categoryForm" label-placement="top">
            <n-form-item label="语言">
              <n-select
                v-model:value="categoryForm.language"
                :options="languageOptions"
                placeholder="选择语言"
              />
            </n-form-item>

            <n-form-item label="类别名称">
              <n-input
                v-model:value="categoryForm.categoryName"
                placeholder="输入类别名称"
              />
            </n-form-item>

            <n-form-item label="图标">
              <MediaLibrarySelector
                v-model="categoryForm.icon"
                :accept-types="['image']"
                category="customer-service/faq-categories"
                placeholder="从媒体库选择或上传图标（建议500x500，≤500KB）"
              />
            </n-form-item>

            <n-form-item label="排序">
              <n-input-number
                v-model:value="categoryForm.displayOrder"
                :min="0"
                style="width: 200px"
              />
            </n-form-item>

            <n-space justify="end">
              <n-button v-if="editingCategoryId" @click="cancelEditCategory">
                取消编辑
              </n-button>
              <n-button type="primary" @click="submitCategory">
                {{ editingCategoryId ? '更新类别' : '添加类别' }}
              </n-button>
            </n-space>
          </n-form>
        </n-card>

        <!-- Category List -->
        <n-card title="已有类别">
          <n-spin :show="loadingCategories">
            <n-data-table
              :columns="categoryColumns"
              :data="categories"
              :pagination="false"
              :bordered="false"
            />
          </n-spin>
        </n-card>
      </n-space>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted, reactive } from 'vue';
import {
  NSpace,
  NButton,
  NCard,
  NDataTable,
  NSpin,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NInputNumber,
  NUpload,
  NTag,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
} from 'naive-ui';
import {
  getFAQs,
  getFAQCategories,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  publishFAQ,
  unpublishFAQ,
  createFAQCategory,
  updateFAQCategory,
  deleteFAQCategory,
  type FAQ,
  type FAQCategory,
} from '#/api/operations/customerService';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const MediaLibrarySelector = defineAsyncComponent(
  () => import('#/components/MediaLibrarySelector.vue'),
);

const message = useMessage();

// Loading states
const loading = ref(false);
const saving = ref(false);
const loadingCategories = ref(false);

// Modal states
const showModal = ref(false);
const showCategoryModal = ref(false);
const editingId = ref<number | null>(null);
const editingCategoryId = ref<number | null>(null);

// Form reference
const formRef = ref();

// FAQ list
const faqList = ref<FAQ[]>([]);

// Categories
const categories = ref<FAQCategory[]>([]);

// Filters
const filters = reactive({
  language: undefined as string | undefined,
  faqType: undefined as string | undefined,
  status: undefined as string | undefined,
  search: undefined as string | undefined,
});

// Pagination
const pagination: PaginationProps = {
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page;
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
  },
};

// Form data
const formData = ref<FAQ>({
  categoryId: 0,
  faqType: 'COMMON',
  language: 'zh-CN',
  question: '',
  answer: '',
  videoUrl: '',
  status: 'DRAFT',
  displayOrder: 0,
});

// Category form
const categoryForm = ref<FAQCategory>({
  language: 'zh-CN',
  categoryName: '',
  icon: '',
  displayOrder: 0,
});

// Form validation rules
const formRules = {
  faqType: { required: true, message: '请选择问题类型' },
  language: { required: true, message: '请选择语言' },
  categoryId: { required: true, message: '请选择问题分类', type: 'number' },
  question: { required: true, message: '请输入问题' },
  answer: { required: true, message: '请输入答案' },
};

// Language options
const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: '繁体中文', value: 'zh-TW' },
  { label: 'English', value: 'en' },
  { label: 'Português', value: 'pt-BR' },
];

// FAQ type options
const faqTypeOptions = [
  { label: '注册问题', value: 'REGISTRATION' },
  { label: '充值问题', value: 'RECHARGE' },
  { label: '提现问题', value: 'WITHDRAWAL' },
  { label: '游戏问题', value: 'GAME' },
  { label: '投注问题', value: 'BETTING' },
  { label: '常见问题', value: 'COMMON' },
  { label: '其他', value: 'OTHER' },
];

// Status options
const statusOptions = [
  { label: '待发布', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
];

// Category options
const categoryOptions = computed(() => {
  return categories.value.map((cat) => ({
    label: `${cat.categoryName} (${cat.language})`,
    value: cat.id!,
  }));
});

// Table columns
const columns = computed<DataTableColumns<FAQ>>(() => [
  {
    title: '排序',
    key: 'displayOrder',
    width: 80,
    render: (row) => {
      return h('div', { class: 'cursor-move' }, [
        h('span', '☰'),
        h('span', { class: 'ml-2' }, row.displayOrder),
      ]);
    },
  },
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '类型',
    key: 'faqType',
    width: 120,
    render: (row) => {
      const typeLabel =
        faqTypeOptions.find((opt) => opt.value === row.faqType)?.label ||
        row.faqType;
      return h(NTag, { size: 'small' }, () => typeLabel);
    },
  },
  {
    title: '语言',
    key: 'language',
    width: 100,
  },
  {
    title: '问题',
    key: 'question',
    ellipsis: { tooltip: true },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: row.status === 'PUBLISHED' ? 'success' : 'warning' },
        () => (row.status === 'PUBLISHED' ? '已发布' : '待发布'),
      );
    },
  },
  {
    title: '操作人',
    key: 'createdBy',
    width: 120,
  },
  {
    title: '操作时间',
    key: 'createdAt',
    width: 180,
    render: (row) => {
      return row.createdAt
        ? new Date(row.createdAt).toLocaleString('zh-CN')
        : '-';
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 250,
    fixed: 'right',
    render: (row) => {
      return h(NSpace, {}, () => [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => showEditModal(row.id!),
          },
          () => '修改',
        ),
        row.status === 'DRAFT'
          ? h(
              NButton,
              {
                size: 'small',
                type: 'success',
                onClick: () => handlePublish(row.id!),
              },
              () => '发布',
            )
          : h(
              NButton,
              {
                size: 'small',
                type: 'warning',
                onClick: () => handleUnpublish(row.id!),
              },
              () => '撤回',
            ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.id!),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', type: 'error' }, () => '删除'),
            default: () => '确定删除此FAQ吗？',
          },
        ),
      ]);
    },
  },
]);

// Category table columns
const categoryColumns = computed<DataTableColumns<FAQCategory>>(() => [
  {
    title: '排序',
    key: 'displayOrder',
    width: 80,
  },
  {
    title: '图标',
    key: 'icon',
    width: 100,
    render: (row) => {
      if (row.icon) {
        return h('img', {
          src: row.icon,
          alt: row.categoryName,
          style: {
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '4px',
          },
        });
      }
      return h('span', { style: { color: '#999' } }, '-');
    },
  },
  {
    title: '语言',
    key: 'language',
    width: 100,
  },
  {
    title: '类别名称',
    key: 'categoryName',
  },
  {
    title: 'FAQ数量',
    key: '_count',
    width: 100,
    render: (row) => {
      return row._count?.faqs || 0;
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) => {
      return h(NSpace, {}, () => [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleEditCategory(row),
          },
          () => '修改',
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDeleteCategory(row.id!),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', type: 'error' }, () => '删除'),
            default: () => '确定删除此类别吗？',
          },
        ),
      ]);
    },
  },
]);

// Load FAQs
const loadFAQs = async () => {
  loading.value = true;
  try {
    const response = await getFAQs(filters);
    if (response.success && response.data) {
      faqList.value = response.data;
    }
  } catch (error: any) {
    message.error(error.message || '加载FAQ列表失败');
  } finally {
    loading.value = false;
  }
};

// Load categories
const loadCategories = async () => {
  loadingCategories.value = true;
  try {
    const response = await getFAQCategories();
    if (response.success && response.data) {
      categories.value = response.data;
    }
  } catch (error: any) {
    message.error(error.message || '加载分类失败');
  } finally {
    loadingCategories.value = false;
  }
};

// Show edit modal
const showEditModal = async (id: number | null) => {
  editingId.value = id;

  if (id) {
    const faq = faqList.value.find((f) => f.id === id);
    if (faq) {
      formData.value = { ...faq };
    }
  } else {
    formData.value = {
      categoryId: 0,
      faqType: 'COMMON',
      language: 'zh-CN',
      question: '',
      answer: '',
      videoUrl: '',
      status: 'DRAFT',
      displayOrder: 0,
    };
  }

  showModal.value = true;
};

// Submit form
const submitForm = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  saving.value = true;
  try {
    let response;
    if (editingId.value) {
      response = await updateFAQ(editingId.value, formData.value);
    } else {
      response = await createFAQ(formData.value);
    }

    if (response.success) {
      message.success(editingId.value ? '更新成功' : '创建成功');
      showModal.value = false;
      await loadFAQs();
    } else {
      message.error(response.message || '操作失败');
    }
  } catch (error: any) {
    message.error(error.message || '操作失败');
  } finally {
    saving.value = false;
  }
};

// Submit category
const submitCategory = async () => {
  if (!categoryForm.value.categoryName) {
    message.warning('请输入类别名称');
    return;
  }

  try {
    let response;
    if (editingCategoryId.value) {
      // Update existing category
      response = await updateFAQCategory(
        editingCategoryId.value,
        categoryForm.value,
      );
      if (response.success) {
        message.success('类别更新成功');
      }
    } else {
      // Create new category
      response = await createFAQCategory(categoryForm.value);
      if (response.success) {
        message.success('类别添加成功');
      }
    }

    if (response.success) {
      // Reset form
      categoryForm.value = {
        language: 'zh-CN',
        categoryName: '',
        icon: '',
        displayOrder: 0,
      };
      editingCategoryId.value = null;
      await loadCategories();
    } else {
      message.error(response.message || '操作失败');
    }
  } catch (error: any) {
    message.error(error.message || '操作失败');
  }
};

// Open category modal
const openCategoryModal = () => {
  // Reset form when opening modal
  editingCategoryId.value = null;
  categoryForm.value = {
    language: 'zh-CN',
    categoryName: '',
    icon: '',
    displayOrder: 0,
  };
  showCategoryModal.value = true;
};

// Handle edit category
const handleEditCategory = (category: FAQCategory) => {
  editingCategoryId.value = category.id!;
  categoryForm.value = {
    language: category.language,
    categoryName: category.categoryName,
    icon: category.icon || '',
    displayOrder: category.displayOrder,
  };

  // Scroll to form
  const formElement = document.querySelector('.faq-tab .n-card');
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Cancel edit category
const cancelEditCategory = () => {
  editingCategoryId.value = null;
  categoryForm.value = {
    language: 'zh-CN',
    categoryName: '',
    icon: '',
    displayOrder: 0,
  };
};

// Handle delete
const handleDelete = async (id: number) => {
  try {
    const response = await deleteFAQ(id);
    if (response.success) {
      message.success('删除成功');
      await loadFAQs();
    } else {
      message.error(response.message || '删除失败');
    }
  } catch (error: any) {
    message.error(error.message || '删除失败');
  }
};

// Handle delete category
const handleDeleteCategory = async (id: number) => {
  try {
    const response = await deleteFAQCategory(id);
    if (response.success) {
      message.success('删除成功');
      await loadCategories();
    } else {
      message.error(response.message || '删除失败');
    }
  } catch (error: any) {
    message.error(error.message || '删除失败');
  }
};

// Handle publish
const handlePublish = async (id: number) => {
  try {
    const response = await publishFAQ(id);
    if (response.success) {
      message.success('发布成功');
      await loadFAQs();
    } else {
      message.error(response.message || '发布失败');
    }
  } catch (error: any) {
    message.error(error.message || '发布失败');
  }
};

// Handle unpublish
const handleUnpublish = async (id: number) => {
  try {
    const response = await unpublishFAQ(id);
    if (response.success) {
      message.success('撤回成功');
      await loadFAQs();
    } else {
      message.error(response.message || '撤回失败');
    }
  } catch (error: any) {
    message.error(error.message || '撤回失败');
  }
};

// Handle video upload
const handleVideoUpload = (options: any) => {
  message.info('视频上传功能待实现');
  return false;
};

onMounted(() => {
  loadFAQs();
  loadCategories();
});
</script>

<style scoped>
.faq-tab {
  max-width: 1600px;
}
.cursor-move {
  cursor: move;
}
</style>
