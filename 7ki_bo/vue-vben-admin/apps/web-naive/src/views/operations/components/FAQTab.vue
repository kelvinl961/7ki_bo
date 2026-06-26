<template>
  <div class="faq-tab p-4">
    <n-space vertical :size="16">
      <!-- Filter Bar -->
      <n-card>
        <n-space :size="16">
          <n-select
            v-model:value="filters.language"
            :options="languageOptions"
            :placeholder="$t('operations.faq.selectLanguage')"
            style="width: 150px"
            clearable
            @update:value="loadFAQs"
          />

          <n-select
            v-model:value="filters.faqType"
            :options="faqTypeOptions"
            :placeholder="$t('operations.faq.selectType')"
            style="width: 150px"
            clearable
            @update:value="loadFAQs"
          />

          <n-select
            v-model:value="filters.status"
            :options="statusOptions"
            :placeholder="$t('operations.faq.selectStatus')"
            style="width: 150px"
            clearable
            @update:value="loadFAQs"
          />

          <n-input
            v-model:value="filters.search"
            :placeholder="$t('operations.faq.searchPlaceholder')"
            style="width: 250px"
            clearable
            @update:value="loadFAQs"
          >
            <template #prefix>
              <span>🔍</span>
            </template>
          </n-input>

          <n-button type="primary" @click="openCategoryModal">
            {{ $t('operations.faq.setCategories') }}
          </n-button>

          <n-button type="primary" @click="showEditModal(null)">
            <template #icon>
              <span>+</span>
            </template>
            {{ $t('operations.faq.addQuestion') }}
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
      :title="editingId ? $t('operations.faq.editQuestion') : $t('operations.faq.addQuestion')"
      style="width: 800px"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="top"
      >
        <n-form-item :label="$t('operations.faq.questionType')" path="faqType">
          <n-select
            v-model:value="formData.faqType"
            :options="faqTypeOptions"
            :placeholder="$t('operations.faq.selectQuestionType')"
          />
        </n-form-item>

        <n-form-item :label="$t('operations.language')" path="language">
          <n-select
            v-model:value="formData.language"
            :options="languageOptions"
            :placeholder="$t('operations.faq.selectLanguage')"
          />
        </n-form-item>

        <n-form-item :label="$t('operations.faq.questionCategory')" path="categoryId">
          <n-select
            v-model:value="formData.categoryId"
            :options="categoryOptions"
            :placeholder="$t('operations.faq.selectCategory')"
          />
        </n-form-item>

        <n-form-item :label="$t('operations.faq.question')" path="question">
          <n-input
            v-model:value="formData.question"
            :placeholder="$t('operations.faq.questionPlaceholder')"
            maxlength="100"
            show-count
          />
        </n-form-item>

        <n-form-item :label="$t('operations.faq.answer')" path="answer">
          <n-input
            v-model:value="formData.answer"
            type="textarea"
            :placeholder="$t('operations.faq.answerPlaceholder')"
            :autosize="{ minRows: 4, maxRows: 8 }"
            maxlength="1000"
            show-count
          />
        </n-form-item>

        <n-form-item :label="$t('operations.faq.videoOptional')">
          <n-input
            v-model:value="formData.videoUrl"
            :placeholder="$t('operations.faq.videoPlaceholder')"
          />
          <n-upload
            class="mt-2"
            accept="video/*"
            :max="1"
            list-type="text"
            @before-upload="handleVideoUpload"
          >
            <n-button>{{ $t('operations.faq.uploadVideo') }}</n-button>
          </n-upload>
        </n-form-item>

        <n-form-item :label="$t('operations.sort')">
          <n-input-number
            v-model:value="formData.displayOrder"
            :min="0"
            :placeholder="$t('operations.faq.sortPlaceholder')"
            style="width: 200px"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="submitForm" :loading="saving">
            {{ $t('common.confirm') }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Category Management Modal -->
    <n-modal
      v-model:show="showCategoryModal"
      preset="card"
      :title="$t('operations.faq.categoryModalTitle')"
      style="width: 800px"
    >
      <n-space vertical :size="16">
        <!-- Add/Edit Category Form -->
        <n-card :title="editingCategoryId ? $t('operations.faq.editCategory') : $t('operations.faq.addCategory')">
          <n-form :model="categoryForm" label-placement="top">
            <n-form-item :label="$t('operations.language')">
              <n-select
                v-model:value="categoryForm.language"
                :options="languageOptions"
                :placeholder="$t('operations.faq.selectLanguage')"
              />
            </n-form-item>

            <n-form-item :label="$t('operations.faq.categoryName')">
              <n-input
                v-model:value="categoryForm.categoryName"
                :placeholder="$t('operations.faq.categoryNamePlaceholder')"
              />
            </n-form-item>

            <n-form-item :label="$t('operations.icon')">
              <MediaLibrarySelector
                v-model="categoryForm.icon"
                :accept-types="['image']"
                category="customer-service/faq-categories"
                :placeholder="$t('operations.faq.iconPlaceholder')"
              />
            </n-form-item>

            <n-form-item :label="$t('operations.sort')">
              <n-input-number
                v-model:value="categoryForm.displayOrder"
                :min="0"
                style="width: 200px"
              />
            </n-form-item>

            <n-space justify="end">
              <n-button v-if="editingCategoryId" @click="cancelEditCategory">
                {{ $t('operations.faq.cancelEdit') }}
              </n-button>
              <n-button type="primary" @click="submitCategory">
                {{ editingCategoryId ? $t('operations.faq.updateCategory') : $t('operations.faq.addCategory') }}
              </n-button>
            </n-space>
          </n-form>
        </n-card>

        <!-- Category List -->
        <n-card :title="$t('operations.faq.existingCategories')">
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
import { $t } from '@vben/locales';

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
const formRules = computed(() => ({
  faqType: { required: true, message: $t('operations.faq.rules.selectType') },
  language: { required: true, message: $t('operations.faq.rules.selectLanguage') },
  categoryId: { required: true, message: $t('operations.faq.rules.selectCategory'), type: 'number' },
  question: { required: true, message: $t('operations.faq.rules.enterQuestion') },
  answer: { required: true, message: $t('operations.faq.rules.enterAnswer') },
}));

const languageOptions = computed(() => [
  { label: $t('operations.faq.languages.zh-CN'), value: 'zh-CN' },
  { label: $t('operations.faq.languages.zh-TW'), value: 'zh-TW' },
  { label: $t('operations.faq.languages.en'), value: 'en' },
  { label: $t('operations.faq.languages.pt-BR'), value: 'pt-BR' },
]);

const faqTypeOptions = computed(() => [
  { label: $t('operations.faq.types.REGISTRATION'), value: 'REGISTRATION' },
  { label: $t('operations.faq.types.RECHARGE'), value: 'RECHARGE' },
  { label: $t('operations.faq.types.WITHDRAWAL'), value: 'WITHDRAWAL' },
  { label: $t('operations.faq.types.GAME'), value: 'GAME' },
  { label: $t('operations.faq.types.BETTING'), value: 'BETTING' },
  { label: $t('operations.faq.types.COMMON'), value: 'COMMON' },
  { label: $t('operations.faq.types.OTHER'), value: 'OTHER' },
]);

const statusOptions = computed(() => [
  { label: $t('operations.draft'), value: 'DRAFT' },
  { label: $t('operations.published'), value: 'PUBLISHED' },
]);

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
    title: $t('operations.sort'),
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
    title: $t('common.type'),
    key: 'faqType',
    width: 120,
    render: (row) => {
      const typeLabel =
        faqTypeOptions.value.find((opt) => opt.value === row.faqType)?.label ||
        row.faqType;
      return h(NTag, { size: 'small' }, () => typeLabel);
    },
  },
  {
    title: $t('operations.language'),
    key: 'language',
    width: 100,
  },
  {
    title: $t('operations.faq.question'),
    key: 'question',
    ellipsis: { tooltip: true },
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: row.status === 'PUBLISHED' ? 'success' : 'warning' },
        () => (row.status === 'PUBLISHED' ? $t('operations.published') : $t('operations.draft')),
      );
    },
  },
  {
    title: $t('common.operator'),
    key: 'createdBy',
    width: 120,
  },
  {
    title: $t('common.operationTime'),
    key: 'createdAt',
    width: 180,
    render: (row) => {
      return row.createdAt
        ? new Date(row.createdAt).toLocaleString('zh-CN')
        : '-';
    },
  },
  {
    title: $t('common.actions'),
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
          () => $t('common.modify'),
        ),
        row.status === 'DRAFT'
          ? h(
              NButton,
              {
                size: 'small',
                type: 'success',
                onClick: () => handlePublish(row.id!),
              },
              () => $t('operations.faq.publish'),
            )
          : h(
              NButton,
              {
                size: 'small',
                type: 'warning',
                onClick: () => handleUnpublish(row.id!),
              },
              () => $t('operations.faq.unpublish'),
            ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.id!),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', type: 'error' }, () => $t('common.delete')),
            default: () => $t('operations.faq.confirmDeleteFaq'),
          },
        ),
      ]);
    },
  },
]);

// Category table columns
const categoryColumns = computed<DataTableColumns<FAQCategory>>(() => [
  {
    title: $t('operations.sort'),
    key: 'displayOrder',
    width: 80,
  },
  {
    title: $t('operations.icon'),
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
    title: $t('operations.language'),
    key: 'language',
    width: 100,
  },
  {
    title: $t('operations.faq.categoryName'),
    key: 'categoryName',
  },
  {
    title: $t('operations.faq.faqCount'),
    key: '_count',
    width: 100,
    render: (row) => {
      return row._count?.faqs || 0;
    },
  },
  {
    title: $t('common.actions'),
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
          () => $t('common.modify'),
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDeleteCategory(row.id!),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', type: 'error' }, () => $t('common.delete')),
            default: () => $t('operations.faq.confirmDeleteCategory'),
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
    message.error(error.message || $t('operations.faq.loadFailed'));
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
    message.error(error.message || $t('operations.faq.loadCategoriesFailed'));
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
      message.success(editingId.value ? $t('operations.faq.updateSuccess') : $t('operations.faq.createSuccess'));
      showModal.value = false;
      await loadFAQs();
    } else {
      message.error(response.message || $t('common.operationFailed'));
    }
  } catch (error: any) {
    message.error(error.message || $t('common.operationFailed'));
  } finally {
    saving.value = false;
  }
};

// Submit category
const submitCategory = async () => {
  if (!categoryForm.value.categoryName) {
    message.warning($t('operations.faq.enterCategoryName'));
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
        message.success($t('operations.faq.categoryUpdateSuccess'));
      }
    } else {
      // Create new category
      response = await createFAQCategory(categoryForm.value);
      if (response.success) {
        message.success($t('operations.faq.categoryAddSuccess'));
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
      message.error(response.message || $t('common.operationFailed'));
    }
  } catch (error: any) {
    message.error(error.message || $t('common.operationFailed'));
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
      message.success($t('common.deleteSuccess'));
      await loadFAQs();
    } else {
      message.error(response.message || $t('common.operationFailed'));
    }
  } catch (error: any) {
    message.error(error.message || $t('common.operationFailed'));
  }
};

// Handle delete category
const handleDeleteCategory = async (id: number) => {
  try {
    const response = await deleteFAQCategory(id);
    if (response.success) {
      message.success($t('common.deleteSuccess'));
      await loadCategories();
    } else {
      message.error(response.message || $t('common.operationFailed'));
    }
  } catch (error: any) {
    message.error(error.message || $t('common.operationFailed'));
  }
};

// Handle publish
const handlePublish = async (id: number) => {
  try {
    const response = await publishFAQ(id);
    if (response.success) {
      message.success($t('operations.faq.publishSuccess'));
      await loadFAQs();
    } else {
      message.error(response.message || $t('operations.faq.publishFailed'));
    }
  } catch (error: any) {
    message.error(error.message || $t('operations.faq.publishFailed'));
  }
};

// Handle unpublish
const handleUnpublish = async (id: number) => {
  try {
    const response = await unpublishFAQ(id);
    if (response.success) {
      message.success($t('operations.faq.unpublishSuccess'));
      await loadFAQs();
    } else {
      message.error(response.message || $t('operations.faq.unpublishFailed'));
    }
  } catch (error: any) {
    message.error(error.message || $t('operations.faq.unpublishFailed'));
  }
};

// Handle video upload
const handleVideoUpload = (options: any) => {
  message.info($t('operations.faq.videoUploadPending'));
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
