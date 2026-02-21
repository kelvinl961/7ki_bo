<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="modalTitle"
    style="width: 900px"
    :mask-closable="false"
  >
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="left"
      label-width="120"
      require-mark-placement="left"
    >
      <!-- Select CDN Node -->
      <n-form-item label="选择节点" path="cdnProvider" required>
        <n-space :size="12">
          <n-button
            v-for="cdn in cdnOptions"
            :key="cdn.value"
            :type="formData.cdnProvider === cdn.value ? 'primary' : 'default'"
            size="large"
            style="min-width: 180px; position: relative"
            @click="handleSelectCDN(cdn.value)"
          >
            <template #icon>
              <n-icon
                v-if="formData.cdnProvider === cdn.value"
                :component="CheckmarkCircleOutline"
              />
            </template>
            <span style="font-size: 16px; font-weight: 500">{{
              cdn.label
            }}</span>
            <n-tag
              v-if="cdn.tag"
              :type="cdn.tagType"
              size="small"
              style="position: absolute; top: 4px; right: 4px"
            >
              {{ cdn.tag }}
            </n-tag>
          </n-button>
        </n-space>
      </n-form-item>

      <!-- Select Domain (Only shows after CDN is selected) -->
      <n-form-item
        v-if="formData.cdnProvider"
        label="选择域名"
        path="domainName"
        required
      >
        <div style="width: 100%">
          <n-spin :show="loadingDomains">
            <n-space :size="12" v-if="availableDomains.length > 0">
              <n-button
                v-for="domain in availableDomains"
                :key="domain"
                :type="formData.domainName === domain ? 'primary' : 'default'"
                size="medium"
                @click="formData.domainName = domain"
              >
                {{ domain }}
              </n-button>
            </n-space>
            <n-empty
              v-else-if="!loadingDomains"
              description="该CDN节点下暂无可用域名，请先在域名管理中创建域名"
              style="padding: 20px 0"
            />
          </n-spin>
        </div>
      </n-form-item>

      <!-- Domain Purpose (Read-only, auto-filled) -->
      <n-form-item label="域名用途">
        <n-input :value="useTypeLabel" readonly style="background: #f5f5f5" />
        <template #feedback>
          <n-alert
            type="warning"
            :show-icon="false"
            style="margin-top: 8px; padding: 8px 12px"
          >
            <span style="color: #ff4d4f; font-size: 13px">
              该类型域名对业务至关重要，停用或删除时请慎重操作。随意或错删可能会影响老用户访问和业务稳定性。
            </span>
          </n-alert>
        </template>
      </n-form-item>

      <!-- Active Domain (Dynamic List) - Only shows after domain is selected -->
      <n-form-item v-if="formData.domainName" label="生效域名">
        <div style="width: 100%">
          <div
            v-for="(item, index) in activeDomainList"
            :key="index"
            style="display: flex; align-items: center; margin-bottom: 12px"
          >
            <n-input-group style="flex: 1">
              <n-input
                v-model:value="item.prefix"
                placeholder='例如，"@"代表主域名，或"api"、"cdn"等'
                style="width: 200px"
              />
              <n-input-group-label>·</n-input-group-label>
              <n-input
                :value="formData.domainName"
                readonly
                style="flex: 1; background: #f5f5f5"
              />
            </n-input-group>

            <n-button
              circle
              type="primary"
              style="margin-left: 8px"
              @click="addActiveDomain"
            >
              <template #icon>
                <span style="font-size: 18px">+</span>
              </template>
            </n-button>

            <n-button
              v-if="activeDomainList.length > 1"
              circle
              style="margin-left: 8px"
              @click="removeActiveDomain(index)"
            >
              <template #icon>
                <span style="font-size: 18px">-</span>
              </template>
            </n-button>
          </div>
        </div>
      </n-form-item>

      <!-- Notes -->
      <n-form-item label="备注">
        <n-input
          v-model:value="formData.notes"
          type="textarea"
          placeholder="请输入备注"
          :rows="3"
          :maxlength="200"
          show-count
          clearable
        />
      </n-form-item>

      <!-- Configuration Recommendations -->
      <n-form-item label="域名配置参考建议：">
        <div style="width: 100%">
          <div style="margin-bottom: 8px">
            <a href="#" style="color: #2080f0; text-decoration: none"
              >详见: 域名管理教程</a
            >
          </div>

          <n-card size="small" style="background: #fafafa">
            <n-scrollbar style="max-height: 300px">
              <div style="font-size: 13px; line-height: 1.8; color: #666">
                <p style="margin-bottom: 12px">
                  <strong>（1）多节点组合：</strong
                  >一定要配置3个或以上节点！因为每个节点都是不同厂商CDN，多个节点组合不仅能自动轮巡和防止封锁，还能独立扛攻击。所以每个功能用途都要配置3个或以上不同CDN厂商，特别是WEB大厅、APP大厅、OSS加速和后端加速域名。
                </p>

                <p style="margin-bottom: 12px">
                  <strong>（2）不是越多越好：</strong
                  >因为域名需要定期检测网络质量、是否被拦截或封锁，所以同个CDN且同个用途只要添加3-10个子域名就够了，并不是越多越好，避免网络检测浪费太多时间。
                </p>

                <p style="margin-bottom: 12px">
                  <strong>（3）如何备用：</strong
                  >只要域名没有启用就不会进行解析，也就不会被外部扫描发现，所以备用的域名可以先添加但不启用，等未来再快速启用。
                </p>

                <p style="margin-bottom: 12px">
                  <strong>（4）主域名说明：</strong
                  >主域名需要先添加到对应的CDN厂家后，且DNS生效后才能创建解析，解析即新增子域名，子域名才是主域名的具体用途，所以添加主域名后一定要到各个功能页面新增子域名才算真正启用。
                </p>

                <p style="margin-bottom: 12px">
                  <strong>（5）子域名说明：</strong
                  >因为主域名被封锁后子域名也会受影响，所以同个主域名且同个功能用途只添加1-2个子域名即可，避免浪费无用功。
                </p>

                <p style="margin-bottom: 0">
                  <strong>（6）大陆市场特别规则：</strong
                  >因大陆的长城防火墙规则特殊，所以建议尽量填写较长且复杂的子域名，而默认的www和@短域名可以作为URL跳转。
                </p>
              </div>
            </n-scrollbar>
          </n-card>
        </div>
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleCancel">取消</n-button>
        <n-button
          type="primary"
          :loading="submitting"
          :disabled="!formData.cdnProvider || !formData.domainName"
          @click="handleConfirm"
        >
          确认
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NButton,
  NSpace,
  NTag,
  NAlert,
  NCard,
  NScrollbar,
  NIcon,
  NSpin,
  NEmpty,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui';
import { CheckmarkCircleOutline } from '@vicons/ionicons5';
import { domainApi } from '../api/domainApi';

const props = defineProps<{
  show: boolean;
  useType?: string; // e.g., 'BACKEND_API', 'APP_UPDATE', 'OSS_ACCELERATION'
  useTypeLabel?: string; // e.g., '后端加速域名', 'APP更新', 'OSS加速域名'
  modalTitle?: string; // e.g., '新增域名'
}>();

const emit = defineEmits<{
  (e: 'update:show', show: boolean): void;
  (e: 'success'): void;
}>();

const message = useMessage();

const showModal = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

// Use prop values or defaults
const useType = computed(() => props.useType || 'BACKEND_API');
const useTypeLabel = computed(() => props.useTypeLabel || '后端加速域名');
const modalTitle = computed(() => props.modalTitle || '新增域名');

// CDN Options
const cdnOptions = [
  {
    value: 'CLOUDFLARE',
    label: 'Cloudflare',
    tag: '机联盟',
    tagType: 'success' as const,
  },
  {
    value: 'AWS',
    label: 'AWS',
    tag: '全球',
    tagType: 'info' as const,
  },
  {
    value: 'HUAWEI_CLOUD',
    label: '华为云',
    tag: '国际',
    tagType: 'warning' as const,
  },
];

// Available domains - fetch from API
const availableDomains = ref<string[]>([]);
const loadingDomains = ref(false);

// Fetch available domains based on selected CDN
const fetchAvailableDomains = async (cdnProvider: string) => {
  loadingDomains.value = true;
  try {
    console.log(`[BackendApiModal] Fetching domains for CDN: ${cdnProvider}`);

    // Fetch all parent domains that match the CDN provider
    const response: any = await domainApi.getDomains({
      cdnProvider: cdnProvider,
      isParentDomain: true, // ⭐ Only show parent domains for selection
      page: 1,
      pageSize: 100,
    });

    console.log('[BackendApiModal] 🔍 Full API Response:', response);
    console.log('[BackendApiModal] 🔍 response.data:', response.data);
    console.log(
      '[BackendApiModal] 🔍 response.data.data:',
      response.data?.data,
    );

    // Handle full axios response: { data: { code: 0, data: { list: [...], pagination: {...} } } }
    let domainsList: any[] = [];

    // Extract the actual data from nested structure
    const actualData = response.data?.data || response.data || response;
    console.log('[BackendApiModal] 🔍 actualData:', actualData);

    if (actualData && actualData.list && Array.isArray(actualData.list)) {
      domainsList = actualData.list;
      console.log(
        '[BackendApiModal] ✅ Found actualData.list:',
        domainsList.length,
        'domains',
      );
    } else if (Array.isArray(actualData)) {
      domainsList = actualData;
      console.log(
        '[BackendApiModal] ✅ Found direct array:',
        domainsList.length,
        'domains',
      );
    } else {
      console.error('[BackendApiModal] ❌ Unexpected response format!');
      console.error('[BackendApiModal] actualData type:', typeof actualData);
      console.error(
        '[BackendApiModal] actualData keys:',
        Object.keys(actualData || {}),
      );
    }

    console.log('[BackendApiModal]  Domains list:', domainsList);

    // Extract domain names (simple and direct!)
    const domainNames = domainsList
      .filter((d: any) => d && d.domainName) // Filter out null/undefined
      .map((d: any) => d.domainName);

    console.log('[BackendApiModal] 📝 Extracted domain names:', domainNames);

    // Remove duplicates and set
    const uniqueDomains = [...new Set(domainNames)];
    availableDomains.value = uniqueDomains;

    console.log(
      `[BackendApiModal] ✅ Final: ${uniqueDomains.length} unique domains`,
      uniqueDomains,
    );

    if (uniqueDomains.length === 0) {
      console.warn('[BackendApiModal] ⚠️ No domains found after extraction!');
      message.info(`未找到 ${cdnProvider} 节点下的域名`);
    } else {
      message.success(`找到 ${uniqueDomains.length} 个域名`);
    }
  } catch (error: any) {
    console.error('[BackendApiModal] ❌ Failed to fetch domains:', error);
    console.error('[BackendApiModal] Error response:', error.response?.data);
    message.warning('获取域名列表失败，请稍后重试');
    availableDomains.value = [];
  } finally {
    loadingDomains.value = false;
  }
};

// Form data
const formRef = ref<FormInst | null>(null);
const formData = reactive({
  cdnProvider: '',
  domainName: '',
  notes: '',
});

// Active Domain List (dynamic subdomain prefixes)
const activeDomainList = ref<Array<{ prefix: string }>>([
  { prefix: '' }, // Default entry - root domain
]);

// Add active domain entry
const addActiveDomain = () => {
  activeDomainList.value.push({ prefix: '' });
};

// Remove active domain entry
const removeActiveDomain = (index: number) => {
  if (activeDomainList.value.length > 1) {
    activeDomainList.value.splice(index, 1);
  }
};

const submitting = ref(false);

// Form rules
const rules: FormRules = {
  cdnProvider: [{ required: true, message: '请选择节点', trigger: 'change' }],
  domainName: [{ required: true, message: '请选择域名', trigger: 'change' }],
};

// Handle CDN selection
const handleSelectCDN = async (cdn: string) => {
  formData.cdnProvider = cdn;
  // Clear domain selection when CDN changes
  formData.domainName = '';

  // Fetch available domains for this CDN
  await fetchAvailableDomains(cdn);
};

// Handle confirm
const handleConfirm = async () => {
  try {
    await formRef.value?.validate();

    submitting.value = true;

    // Construct active domains from the list
    const activeDomains = activeDomainList.value
      .map((item) => {
        const prefix = item.prefix.trim();
        // Empty, "@", or "根域名" all represent root domain
        if (!prefix || prefix === '@' || prefix === '根域名') {
          return formData.domainName;
        }
        // Handle other prefixes (like www, api, cdn, etc.)
        return `${prefix}.${formData.domainName}`;
      })
      .filter(Boolean)
      .join(',');

    // Prepare domain creation data
    const domainData: any = {
      domainName: formData.domainName,
      cdnProvider: formData.cdnProvider,
      useType: useType.value, // Use dynamic useType from props
      activeDomain: activeDomains, // Constructed from the list
      notes: formData.notes || '',
      sslEnabled: true,
      verificationMethod: 'DNS_VALIDATION',
      status: 'NORMAL',
    };

    // Call API to create domain in Cloudflare and database
    const response: any = await domainApi.createDomain(domainData);

    console.log('🔍 Full response:', response);

    // Check if operation was successful AND subdomains were actually created
    // Handle both wrapped and unwrapped response structures
    const code = response.code ?? response.data?.code ?? 0;
    const result = response.data || response;
    const subdomains = result.data?.subdomains || result.subdomains || [];
    const errors = result.data?.errors || result.errors || [];

    console.log('📊 Parsed data:', { code, subdomains, errors });

    // Check if user only entered "@" (root domain)
    const onlyRootDomain = activeDomainList.value.every((item) => {
      const prefix = item.prefix.trim();
      return !prefix || prefix === '@' || prefix === '根域名';
    });

    if (code === 0 && subdomains.length > 0) {
      // Success: subdomains were created
      if (errors.length > 0) {
        // Partial success
        message.warning(
          `成功创建 ${subdomains.length} 个子域名，${errors.length} 个失败：${errors.join('; ')}`,
        );
      } else {
        // Full success
        message.success(`成功创建 ${subdomains.length} 个子域名！`);
      }
      emit('success');
      handleCancel();
    } else if (code === 0 && subdomains.length === 0 && onlyRootDomain) {
      // User only entered "@" and it already exists (parent domain)
      message.warning(
        `主域名 ${formData.domainName} 已存在。DNS配置未更新，请在Cloudflare中手动检查。`,
      );
      handleCancel();
    } else if (code === 0 && subdomains.length === 1 && onlyRootDomain) {
      // DNS was successfully updated for root domain
      message.success(`✅ 主域名 ${formData.domainName} 的DNS记录已更新！`);
      emit('success');
      handleCancel();
    } else if (errors.length > 0) {
      // All failed with specific errors
      message.error(`创建失败：${errors.join('; ')}`);
    } else {
      // Generic failure
      message.error(response.message || response.data?.message || '创建失败');
    }
  } catch (error: any) {
    console.error('Create backend API domain error:', error);

    if (error?.errorFields) {
      message.error('请填写必填项');
    } else {
      message.error(error.message || '创建失败，请重试');
    }
  } finally {
    submitting.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  formData.cdnProvider = '';
  formData.domainName = '';
  formData.notes = '';
  availableDomains.value = [];
  activeDomainList.value = [{ prefix: '' }]; // Reset to blank (root domain)
  showModal.value = false;
};

// Reset form when modal closes
watch(showModal, (val) => {
  if (!val) {
    formData.cdnProvider = '';
    formData.domainName = '';
    formData.notes = '';
    availableDomains.value = [];
    activeDomainList.value = [{ prefix: '' }]; // Reset to blank (root domain)
  }
});
</script>

<style scoped lang="scss">
:deep(.n-card__content) {
  padding: 20px !important;
}

:deep(.n-form-item-label) {
  font-weight: 500;
}

:deep(.n-button) {
  transition: all 0.3s;
}
</style>
