<template>
  <div class="contact-tab">
    <!-- Security Password Input -->
    <div v-if="!isDecrypted" class="security-section">
      <n-result status="info" title="需安全码解密" description="请输入安全码以查看联系方式信息">
        <template #footer>
          <n-space>
            <n-input 
              v-model:value="securityCode" 
              type="password" 
              placeholder="请输入安全码"
              :loading="verifying"
              @keyup.enter="handleVerifyCode"
            />
            <n-button 
              type="primary" 
              :loading="verifying"
              @click="handleVerifyCode"
            >
              解密查看
            </n-button>
          </n-space>
        </template>
      </n-result>
    </div>

    <!-- Contact Information (Decrypted) -->
    <div v-else class="contact-content">
      <!-- Section 1: Contact Information -->
      <n-card title="联系方式（原户信息）" class="mb-4">
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
                    修改
                  </n-button>
                </div>
              </div>
            </n-gi>
          </n-grid>
        </div>
        
        <template #action>
          <n-space>
            <n-button size="small" @click="handleRefreshContacts">
              刷新
            </n-button>
            <n-button size="small" type="primary" @click="handleSaveAllContacts">
              保存所有修改
            </n-button>
          </n-space>
        </template>
      </n-card>

      <!-- Section 2: Third-Party Bindings -->
      <n-card title="绑定第三方快捷登录记录" class="mb-4">
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
              刷新
            </n-button>
            <n-button size="small" type="primary" @click="showAddBindingModal = true">
              添加绑定
            </n-button>
          </n-space>
        </template>
      </n-card>
    </div>

    <!-- Add Binding Modal -->
    <n-modal v-model:show="showAddBindingModal" preset="dialog" title="添加第三方绑定">
      <n-form ref="bindingFormRef" :model="bindingForm" :rules="bindingRules">
        <n-form-item label="平台名称" path="platformName">
          <n-select
            v-model:value="bindingForm.platformName"
            placeholder="选择平台"
            :options="platformOptions"
          />
        </n-form-item>
        <n-form-item label="第三方账号" path="thirdPartyId">
          <n-input
            v-model:value="bindingForm.thirdPartyId"
            placeholder="请输入第三方账号"
          />
        </n-form-item>
      </n-form>
      
      <template #action>
        <div class="flex gap-2">
          <n-button @click="showAddBindingModal = false">取消</n-button>
          <n-button 
            type="primary" 
            :loading="addingBinding"
            @click="handleAddBinding"
          >
            添加
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
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
  type FormRules
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
  type CreateThirdPartyBindingParams
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
  threads: ''
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
  prefix: (info: any) => `共 ${info.itemCount} 条`,
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
const contactFields = [
  { key: 'whatsapp', label: '微信' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'line', label: 'Line' },
  { key: 'threads', label: 'Threads' },
  { key: 'email', label: '邮箱' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'zalo', label: 'Zalo' },
  { key: 'phone', label: '手机号' },
];

// Platform options
const platformOptions = [
  { label: '微信', value: 'WeChat' },
  { label: 'Facebook', value: 'Facebook' },
  { label: 'Google', value: 'Google' },
  { label: 'Twitter', value: 'Twitter' },
  { label: 'Line', value: 'Line' },
  { label: 'Telegram', value: 'Telegram' },
  { label: 'Apple', value: 'Apple' },
  { label: 'QQ', value: 'QQ' },
];

// Form rules
const bindingRules: FormRules = {
  platformName: [
    { required: true, message: '请选择平台', trigger: 'change' }
  ],
  thirdPartyId: [
    { required: true, message: '请输入第三方账号', trigger: 'blur' }
  ]
};

// Table columns
const bindingColumns: DataTableColumns<ThirdPartyBinding> = [
  {
    title: '绑定时间',
    key: 'boundAt',
    width: 180,
    render: (row) => new Date(row.boundAt).toLocaleString('zh-CN')
  },
  {
    title: '三方平台名称',
    key: 'platformName',
    width: 150
  },
  {
    title: '三方帐号',
    key: 'thirdPartyId',
    width: 200,
    ellipsis: { tooltip: true }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) => h(
      NPopconfirm,
      {
        onPositiveClick: () => handleRemoveBinding(row.id)
      },
      {
        default: () => '确定解绑此账号？',
        trigger: () => h(
          NButton,
          {
            size: 'small',
            type: 'error',
            text: true
          },
          { default: () => '解绑' }
        )
      }
    )
  }
];

// Methods
const handleVerifyCode = async () => {
  if (!securityCode.value.trim()) {
    message.error('请输入安全码');
    return;
  }

  verifying.value = true;
  try {
    // For demo purposes, accept any non-empty code
    // In production, this should verify against the actual security code
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (securityCode.value === '123456') {
      isDecrypted.value = true;
      await loadContacts();
      await loadBindings();
    } else {
      message.error('安全码错误');
    }
  } catch (error) {
    message.error('验证失败');
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
    message.error('获取联系方式失败');
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
      pageSize: bindingsPagination.pageSize
    };
    
    const response = await getUserThirdPartyBindingsApi(params);
    bindings.value = response.list;
    bindingsPagination.total = response.pagination.total;
  } catch (error) {
    message.error('获取绑定记录失败');
    console.error('Error loading bindings:', error);
  } finally {
    bindingsLoading.value = false;
  }
};

const handleEditField = (fieldKey: string) => {
  editingField.value = fieldKey;
  editingValue.value = contacts.value[fieldKey as keyof UserContactInfo] as string || '';
};

const handleSaveField = async () => {
  if (!editingField.value) return;
  
  try {
    const updateParams: UpdateContactParams = {
      [editingField.value]: editingValue.value
    };
    
    await updateUserContactsApi(props.userId, updateParams);
    (contacts.value as any)[editingField.value] = editingValue.value;
    
    editingField.value = null;
    editingValue.value = '';
    message.success('更新成功');
  } catch (error) {
    message.error('更新失败');
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
    message.success('保存成功');
  } catch (error) {
    message.error('保存失败');
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
      thirdPartyId: ''
    });
    
    message.success('添加绑定成功');
    await loadBindings();
  } catch (error) {
    message.error('添加绑定失败');
    console.error('Error adding binding:', error);
  } finally {
    addingBinding.value = false;
  }
};

const handleRemoveBinding = async (bindingId: string) => {
  try {
    await removeThirdPartyBindingApi(props.userId, bindingId);
    message.success('解绑成功');
    await loadBindings();
  } catch (error) {
    message.error('解绑失败');
    console.error('Error removing binding:', error);
  }
};

// Lifecycle
onMounted(() => {
  // For demo purposes, auto-decrypt with demo code
  // In production, this should require actual security verification
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