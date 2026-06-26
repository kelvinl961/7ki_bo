<template>
  <div class="contact-tab">
    <!-- Security Password Input -->
    <div v-if="!isDecrypted" class="security-section">
      <n-result
        status="info"
        :title="$t('user.contact.securityCodeRequired')"
        :description="$t('user.contact.enterSecurityCodeDesc')"
      >
        <template #footer>
          <n-space>
            <n-input
              v-model:value="securityCode"
              type="password"
              :placeholder="$t('user.contact.enterSecurityCode')"
              :loading="verifying"
              @keyup.enter="handleVerifyCode"
            />
            <n-button
              type="primary"
              :loading="verifying"
              @click="handleVerifyCode"
            >
              {{ $t('user.contact.decryptView') }}
            </n-button>
          </n-space>
        </template>
      </n-result>
    </div>

    <!-- Contact Information (Decrypted) -->
    <div v-else class="contact-content">
      <!-- Section 1: Contact Information -->
      <n-card :title="$t('user.contact.contactInfoOriginal')" class="mb-4">
        <div class="contact-fields">
          <n-grid :cols="3" :x-gap="16" :y-gap="16">
            <n-gi v-for="field in contactFields" :key="field.key">
              <div class="contact-field">
                <div class="field-label">{{ field.label }}</div>
                <div class="field-value">
                  <span v-if="!editingField || editingField !== field.key">
                    {{ contacts[field.key] || '--' }}
                  </span>
                  <n-input
                    v-else
                    v-model:value="editingValue"
                    size="small"
                    @blur="handleSaveField"
                    @keyup.enter="handleSaveField"
                    @keyup.escape="handleCancelEdit"
                  />
                  <n-button
                    text
                    size="small"
                    type="primary"
                    class="ml-2"
                    @click="handleEditField(field.key)"
                  >
                    {{ $t('common.modify') }}
                  </n-button>
                </div>
              </div>
            </n-gi>
          </n-grid>
        </div>

        <template #action>
          <n-space>
            <n-button size="small" @click="handleRefreshContacts">
              {{ $t('common.refresh') }}
            </n-button>
            <n-button
              size="small"
              type="primary"
              @click="handleSaveAllContacts"
            >
              {{ $t('user.contact.saveAllChanges') }}
            </n-button>
          </n-space>
        </template>
      </n-card>

      <!-- Section 2: Third-Party Bindings -->
      <n-card :title="$t('user.contact.thirdPartyBindings')" class="mb-4">
        <n-data-table
          :columns="bindingColumns"
          :data="bindings"
          :loading="bindingsLoading"
          :pagination="bindingsPagination"
          size="small"
          :row-key="(row: ThirdPartyBinding) => row.id"
        />

        <template #action>
          <n-space>
            <n-button size="small" @click="handleRefreshBindings">
              {{ $t('common.refresh') }}
            </n-button>
            <n-button
              size="small"
              type="primary"
              @click="showAddBindingModal = true"
            >
              {{ $t('user.contact.addBinding') }}
            </n-button>
          </n-space>
        </template>
      </n-card>
    </div>

    <!-- Add Binding Modal -->
    <n-modal
      v-model:show="showAddBindingModal"
      preset="dialog"
      :title="$t('user.contact.addThirdPartyBinding')"
    >
      <n-form ref="bindingFormRef" :model="bindingForm" :rules="bindingRules">
        <n-form-item :label="$t('user.contact.platformName')" path="platformName">
          <n-select
            v-model:value="bindingForm.platformName"
            :placeholder="$t('user.contact.selectPlatform')"
            :options="platformOptions"
          />
        </n-form-item>
        <n-form-item :label="$t('user.contact.thirdPartyAccount')" path="thirdPartyId">
          <n-input
            v-model:value="bindingForm.thirdPartyId"
            :placeholder="$t('user.contact.enterThirdPartyAccount')"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <div class="flex gap-2">
          <n-button @click="showAddBindingModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="addingBinding"
            @click="handleAddBinding"
          >
            {{ $t('common.add') }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, onMounted, h } from 'vue';
import {
  NCard,
  NGrid,
  NGi,
  NButton,
  NInput,
  NSpace,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NSelect,
  NResult,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import {
  getUserContactsApi,
  updateUserContactsApi,
  getUserThirdPartyBindingsApi,
  createThirdPartyBindingApi,
  removeThirdPartyBindingApi,
  type UserContactInfo,
  type UpdateContactParams,
  type ThirdPartyBinding,
  type ThirdPartyBindingListParams,
  type CreateThirdPartyBindingParams,
} from '#/api/core/user-detail';

interface Props {
  userId: number;
}

const props = defineProps<Props>();
const message = useMessage();

// State
const isDecrypted = ref(false);
const securityCode = ref('');
const verifying = ref(false);
const loading = ref(false);
const bindingsLoading = ref(false);
const addingBinding = ref(false);
const showAddBindingModal = ref(false);

// Contact information
const contacts = ref<UserContactInfo>({
  userId: props.userId,
  email: '',
  phone: '',
  whatsapp: '',
  facebook: '',
  telegram: '',
  line: '',
  twitter: '',
  instagram: '',
  zalo: '',
  threads: '',
});

// Editing states
const editingField = ref<string | null>(null);
const editingValue = ref('');

// Third-party bindings
const bindings = ref<ThirdPartyBinding[]>([]);
const bindingsPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: any) => $t('user.withdrawAccount.totalRecords', [info.itemCount]),
  onUpdatePage: (page: number) => {
    bindingsPagination.current = page;
    loadBindings();
  },
  onUpdatePageSize: (pageSize: number) => {
    bindingsPagination.pageSize = pageSize;
    bindingsPagination.current = 1;
    loadBindings();
  },
});

// Add binding form
const bindingFormRef = ref<FormInst>();
const bindingForm = reactive<CreateThirdPartyBindingParams>({
  platformName: '',
  thirdPartyId: '',
});

// Contact fields configuration
const contactFields = computed(() => [
  { key: 'whatsapp', label: $t('user.contact.wechat') },
  { key: 'facebook', label: 'Facebook' },
  { key: 'line', label: 'Line' },
  { key: 'threads', label: 'Threads' },
  { key: 'email', label: $t('user.contact.email') },
  { key: 'telegram', label: 'Telegram' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'zalo', label: 'Zalo' },
  { key: 'phone', label: $t('user.contact.phone') },
]);

// Platform options
const platformOptions = computed(() => [
  { label: $t('user.contact.wechat'), value: 'WeChat' },
  { label: 'Facebook', value: 'Facebook' },
  { label: 'Google', value: 'Google' },
  { label: 'Twitter', value: 'Twitter' },
  { label: 'Line', value: 'Line' },
  { label: 'Telegram', value: 'Telegram' },
  { label: 'Apple', value: 'Apple' },
  { label: 'QQ', value: 'QQ' },
]);

// Form rules
const bindingRules = computed<FormRules>(() => ({
  platformName: [
    {
      required: true,
      message: $t('user.contact.selectPlatformRequired'),
      trigger: 'change',
    },
  ],
  thirdPartyId: [
    {
      required: true,
      message: $t('user.contact.enterThirdPartyAccount'),
      trigger: 'blur',
    },
  ],
}));

// Table columns
const bindingColumns = computed<DataTableColumns<ThirdPartyBinding>>(() => [
  {
    title: $t('user.contact.boundAt'),
    key: 'boundAt',
    width: 180,
    render: (row) => new Date(row.boundAt).toLocaleString(),
  },
  {
    title: $t('user.contact.thirdPartyPlatform'),
    key: 'platformName',
    width: 150,
  },
  {
    title: $t('user.contact.thirdPartyAccountCol'),
    key: 'thirdPartyId',
    width: 200,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 100,
    render: (row) =>
      h(
        NPopconfirm,
        {
          onPositiveClick: () => handleRemoveBinding(row.id),
        },
        {
          default: () => $t('user.contact.confirmUnbind'),
          trigger: () =>
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                text: true,
              },
              { default: () => $t('user.contact.unbind') },
            ),
        },
      ),
  },
]);

// Methods
const handleVerifyCode = async () => {
  if (!securityCode.value.trim()) {
    message.error($t('user.contact.enterCodeRequired'));
    return;
  }

  verifying.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (securityCode.value === '123456') {
      isDecrypted.value = true;
      await loadContacts();
      await loadBindings();
    } else {
      message.error($t('user.contact.wrongCode'));
    }
  } catch {
    message.error($t('user.contact.verifyFailed'));
  } finally {
    verifying.value = false;
  }
};

const loadContacts = async () => {
  loading.value = true;
  try {
    const response = await getUserContactsApi(props.userId);
    contacts.value = response;
  } catch (error) {
    message.error($t('user.contact.loadFailed'));
    console.error('Error loading contacts:', error);
  } finally {
    loading.value = false;
  }
};

const loadBindings = async () => {
  bindingsLoading.value = true;
  try {
    const params: ThirdPartyBindingListParams = {
      userId: props.userId,
      page: bindingsPagination.current,
      pageSize: bindingsPagination.pageSize,
    };

    const response = await getUserThirdPartyBindingsApi(params);
    bindings.value = response.list;
    bindingsPagination.total = response.pagination.total;
  } catch (error) {
    message.error($t('user.contact.loadBindingsFailed'));
    console.error('Error loading bindings:', error);
  } finally {
    bindingsLoading.value = false;
  }
};

const handleEditField = (fieldKey: string) => {
  editingField.value = fieldKey;
  editingValue.value =
    (contacts.value[fieldKey as keyof UserContactInfo] as string) || '';
};

const handleSaveField = async () => {
  if (!editingField.value) return;

  try {
    const updateParams: UpdateContactParams = {
      [editingField.value]: editingValue.value,
    };

    await updateUserContactsApi(props.userId, updateParams);
    (contacts.value as any)[editingField.value] = editingValue.value;

    editingField.value = null;
    editingValue.value = '';
    message.success($t('user.contact.updateSuccess'));
  } catch (error) {
    message.error($t('user.contact.updateFailed'));
    console.error('Error updating contact:', error);
  }
};

const handleCancelEdit = () => {
  editingField.value = null;
  editingValue.value = '';
};

const handleSaveAllContacts = async () => {
  try {
    const { userId, ...updateParams } = contacts.value;
    await updateUserContactsApi(props.userId, updateParams);
    message.success($t('user.contact.saveSuccess'));
  } catch (error) {
    message.error($t('user.contact.saveFailed'));
    console.error('Error saving contacts:', error);
  }
};

const handleRefreshContacts = () => {
  loadContacts();
};

const handleRefreshBindings = () => {
  loadBindings();
};

const handleAddBinding = async () => {
  try {
    await bindingFormRef.value?.validate();

    addingBinding.value = true;
    await createThirdPartyBindingApi(props.userId, bindingForm);

    showAddBindingModal.value = false;
    Object.assign(bindingForm, {
      platformName: '',
      thirdPartyId: '',
    });

    message.success($t('user.contact.addBindingSuccess'));
    await loadBindings();
  } catch (error) {
    message.error($t('user.contact.addBindingFailed'));
    console.error('Error adding binding:', error);
  } finally {
    addingBinding.value = false;
  }
};

const handleRemoveBinding = async (bindingId: string) => {
  try {
    await removeThirdPartyBindingApi(props.userId, bindingId);
    message.success($t('user.contact.unbindSuccess'));
    await loadBindings();
  } catch (error) {
    message.error($t('user.contact.unbindFailed'));
    console.error('Error removing binding:', error);
  }
};

onMounted(() => {
  if (process.env.NODE_ENV === 'development') {
    isDecrypted.value = true;
    loadContacts();
    loadBindings();
  }
});
</script>

<style scoped>
.contact-tab {
  padding: 16px;
}

.security-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.contact-content {
  min-height: 400px;
}

.contact-fields {
  margin-bottom: 16px;
}

.contact-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.field-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  min-height: 32px;
}

.field-value span {
  flex: 1;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  min-height: 20px;
  display: flex;
  align-items: center;
}

.ml-2 {
  margin-left: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 8px;
}
</style>
