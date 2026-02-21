<template>
  <div class="online-customer-service-tab p-4">
    <n-spin :show="loading">
      <n-space justify="end" class="mb-4">
        <n-button v-if="!isEditing" type="primary" @click="enableEdit">
          修改
        </n-button>
        <n-space v-else>
          <n-button @click="cancelEdit">
            取消
          </n-button>
          <n-button type="primary" :loading="saving" @click="saveConfig">
            保存
          </n-button>
        </n-space>
      </n-space>
      
      <n-card title="基础设置" class="mb-4">
        <n-space vertical :size="20">
          <!-- Skip Message Center -->
          <n-space align="center" justify="space-between">
            <div>
              <div class="font-semibold">跳过消息中心</div>
              <div class="text-gray-500 text-sm">
                开启后，用户的客服消息直接跳转至客服页面，不经过消息中心
              </div>
            </div>
            <n-switch v-model:value="formData.skipMessageCenter" :disabled="!isEditing" />
          </n-space>

          <!-- Online Service Toggle -->
          <n-space align="center" justify="space-between">
            <div>
              <div class="font-semibold">在线客服开关</div>
              <div class="text-gray-500 text-sm">控制在线客服功能的启用/关闭</div>
            </div>
            <n-switch v-model:value="formData.onlineServiceEnabled" :disabled="!isEditing" />
          </n-space>
        </n-space>
      </n-card>

      <!-- Service Link Settings -->
      <n-card title="客服链接设置" class="mb-4">
        <n-form :model="formData" label-placement="top">
          <n-form-item label="品牌选择（支持多选）">
            <n-input
              v-model:value="formData.brandId"
              placeholder="输入品牌ID，例如：419|419"
              :disabled="!isEditing"
            />
          </n-form-item>

          <n-form-item label="客服链接设置（H5/APP生效）">
            <n-space vertical class="w-full" :size="12">
              <n-alert type="info" :show-icon="false" style="margin-bottom: 8px">
                注意：APP支持两种方式，H5仅支持外部浏览器打开
              </n-alert>
              
              <div v-for="(link, index) in serviceLinkList" :key="index" class="w-full">
                <n-space align="center" :size="8" :wrap="false">
                  <n-select
                    v-model:value="link.language"
                    :options="languageOptions"
                    placeholder="语言"
                    style="width: 140px"
                    :disabled="!isEditing"
                  />
                  <n-input
                    v-model:value="link.serviceName"
                    placeholder="客服名称"
                    :disabled="!isEditing"
                    style="width: 150px"
                  />
                  <n-select
                    v-model:value="link.openMethod"
                    :options="openMethodOptions"
                    placeholder="打开方式"
                    style="width: 160px"
                    :disabled="!isEditing"
                  />
                  <n-input
                    v-model:value="link.url"
                    placeholder="请输入线路地址"
                    :disabled="!isEditing"
                    style="flex: 1; min-width: 250px"
                  />
                  <n-button 
                    v-if="isEditing"
                    @click="addServiceLink" 
                    type="primary"
                    circle
                  >
                    <template #icon>
                      <span>+</span>
                    </template>
                  </n-button>
                  <n-button 
                    v-if="isEditing && serviceLinkList.length > 1"
                    @click="removeServiceLink(index)" 
                    type="error"
                    circle
                  >
                    <template #icon>
                      <span>-</span>
                    </template>
                  </n-button>
                </n-space>
              </div>

              <div v-if="serviceLinkList.length === 0 && !isEditing" class="text-gray-400 text-sm text-center py-4">
                暂无客服链接
              </div>
            </n-space>
          </n-form-item>
        </n-form>
      </n-card>

      <!-- H5 Floating Customer Service -->
      <n-card title="H5悬浮客服设置" class="mb-4">
        <n-space vertical :size="16">
          <n-form :model="formData" label-placement="top">
            <n-form-item label="H5悬浮客服">
              <n-switch v-model:value="formData.h5FloatingEnabled" :disabled="!isEditing" />
            </n-form-item>

            <template v-if="formData.h5FloatingEnabled">
              <n-form-item label="展示方式">
                <n-radio-group v-model:value="formData.h5DisplayLocation" :disabled="!isEditing">
                  <n-space>
                    <n-radio value="HOME_ONLY">首页</n-radio>
                    <n-radio value="ALL_PAGES">全部页面</n-radio>
                  </n-space>
                </n-radio-group>
              </n-form-item>

              <n-form-item label="内嵌代码">
                <n-space vertical class="w-full" :size="8">
                  <n-alert type="info" :show-icon="false">
                    填写LiveChat的内嵌代码；如果代码无法显示图标，请联系技术客服。
                  </n-alert>
                  <n-input
                    v-model:value="formData.h5EmbedCode"
                    placeholder='在"内嵌代码"框中填写所需的H5悬浮客服代码'
                    type="textarea"
                    :autosize="{ minRows: 4, maxRows: 8 }"
                    :disabled="!isEditing"
                  />
                </n-space>
              </n-form-item>
            </template>
          </n-form>
        </n-space>
      </n-card>

      <!-- LiveChat App SDK Configuration -->
      <n-card title="LiveChat App SDK 配置" class="mb-4">
        <n-alert type="info" class="mb-4">
          重要提示：App端只支持 LiveChat 悬浮客服，其他客服系统不支持。
        </n-alert>

        <n-form :model="formData" label-placement="top">
          <n-form-item label="启用LiveChat SDK">
            <n-switch v-model:value="formData.livechatEnabled" :disabled="!isEditing" />
          </n-form-item>

          <template v-if="formData.livechatEnabled">
            <n-form-item label="品牌ID（支持多选）">
              <n-input
                v-model:value="brandIdsInput"
                placeholder="输入品牌ID，多个ID用逗号分隔"
                @blur="updateBrandIds"
                :disabled="!isEditing"
              />
            </n-form-item>

            <n-form-item label="展示位置">
              <n-radio-group v-model:value="formData.livechatDisplayLocation" :disabled="!isEditing">
                <n-space>
                  <n-radio value="HOME_ONLY">首页</n-radio>
                  <n-radio value="ALL_PAGES">全部页面</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item label="Group ID">
              <n-space vertical class="w-full" :size="8">
                <n-alert type="warning" :show-icon="false">
                  没有填写，悬浮客服不启用
                </n-alert>
                <n-input
                  v-model:value="formData.livechatGroupId"
                  placeholder="填写LiveChat后台团队的Group ID"
                  :disabled="!isEditing"
                />
              </n-space>
            </n-form-item>

            <n-form-item label="License ID">
              <n-space vertical class="w-full" :size="8">
                <n-alert type="info" :show-icon="false">
                  只有填写了 Group ID 后，这个才是必填项
                </n-alert>
                <n-input
                  v-model:value="formData.livechatLicenseId"
                  placeholder="填写LiveChat提供的License ID"
                  :disabled="!isEditing"
                />
              </n-space>
            </n-form-item>
          </template>
        </n-form>
      </n-card>

      <!-- Action Buttons (Hidden - moved to top) -->
      <div style="display: none;">
        <n-space justify="end" class="mt-4">
          <n-button @click="resetForm">重置</n-button>
          <n-button type="primary" @click="saveConfig" :loading="saving">
            保存
          </n-button>
        </n-space>
      </div>
    </n-spin>

    <!-- Language Configuration Modal -->
    <n-modal
      v-model:show="showLanguageModal"
      preset="card"
      title="语言设置"
      style="width: 600px"
    >
      <n-form :model="languageForm">
        <n-form-item label="语言选择">
          <n-select
            v-model:value="languageForm.language"
            :options="languageOptions"
            placeholder="选择语言"
          />
        </n-form-item>

        <n-form-item label="客服名称">
          <n-input
            v-model:value="languageForm.serviceName"
            placeholder="输入客服名称"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showLanguageModal = false">取消</n-button>
          <n-button type="primary" @click="addLanguageConfig">
            确认
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  NCard,
  NSpace,
  NSwitch,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NButton,
  NRadioGroup,
  NRadio,
  NSpin,
  NAlert,
  NModal,
  NSelect,
  NTag,
  useMessage,
} from 'naive-ui';
import {
  getOnlineCustomerServiceConfig,
  updateOnlineCustomerServiceConfig,
  type OnlineCustomerServiceConfig,
  type LanguageConfig,
} from '#/api/operations/customerService';

const message = useMessage();

// Loading states
const loading = ref(false);
const saving = ref(false);
const isEditing = ref(false);

// Store original data for cancel
const originalData = ref<OnlineCustomerServiceConfig | null>(null);

// Form data
const formData = ref<OnlineCustomerServiceConfig>({
  brandId: '',
  skipMessageCenter: false,
  onlineServiceEnabled: true,
  serviceLinkUrl: '',
  openMethod: 'APP_INTERNAL',
  languageConfigs: [],
  h5FloatingEnabled: false,
  h5DisplayLocation: 'ALL_PAGES',
  h5EmbedCode: '',
  livechatEnabled: false,
  livechatBrandIds: [],
  livechatDisplayLocation: 'ALL_PAGES',
  livechatGroupId: '',
  livechatLicenseId: '',
});

// Service link list (for multiple links with language info)
const serviceLinkList = ref<Array<{ 
  language: string; 
  serviceName: string;
  openMethod: string;
  url: string;
}>>([]);

// Open method options
const openMethodOptions = [
  { label: 'APP内部打开', value: 'APP_INTERNAL' },
  { label: '外部浏览器打开', value: 'EXTERNAL_BROWSER' },
];

// Brand IDs input (for easier management)
const brandIdsInput = ref('');

// Language configuration modal
const showLanguageModal = ref(false);
const languageForm = ref<LanguageConfig>({
  language: '',
  serviceName: '',
});

const languageOptions = [
  { label: '简体中文 (zh-CN)', value: 'zh-CN' },
  { label: '繁体中文 (zh-TW)', value: 'zh-TW' },
  { label: 'English (en)', value: 'en' },
  { label: 'Português (pt-BR)', value: 'pt-BR' },
  { label: 'Español (es)', value: 'es' },
  { label: 'ไทย (th)', value: 'th' },
  { label: 'Tiếng Việt (vi)', value: 'vi' },
];

// Load configuration
const loadConfig = async () => {
  loading.value = true;
  try {
    const response = await getOnlineCustomerServiceConfig();
    // Handle both response formats and null data
    if (response) {
      if (response.success && response.data) {
        formData.value = {
          ...formData.value,
          ...response.data,
        };
      } else if (response.data) {
        // Fallback for direct data
        formData.value = {
          ...formData.value,
          ...response.data,
        };
      } else if (response.code === 0 && response.data) {
        // Old format
        formData.value = {
          ...formData.value,
          ...response.data,
        };
      }

      // Parse service links from serviceLinkUrl and combine with languageConfigs
      if (formData.value.serviceLinkUrl && formData.value.languageConfigs) {
        const links = formData.value.serviceLinkUrl.split('\n').filter(url => url.trim());
        const configs = formData.value.languageConfigs || [];
        
        serviceLinkList.value = links.map((url, index) => {
          // Parse format: "openMethod|url" or just "url"
          const parts = url.trim().split('|');
          const openMethod = parts.length === 2 ? parts[0] : 'EXTERNAL_BROWSER';
          const urlValue = parts.length === 2 ? parts[1] : url.trim();
          
          // Match with language config by index
          const langConfig = configs[index] || { language: 'zh-CN', serviceName: '' };
          
          return {
            language: langConfig.language,
            serviceName: langConfig.serviceName,
            openMethod: openMethod,
            url: urlValue
          };
        });
      } else if (formData.value.languageConfigs && formData.value.languageConfigs.length > 0) {
        // Only language configs exist, no URLs yet
        serviceLinkList.value = formData.value.languageConfigs.map(config => ({
          language: config.language,
          serviceName: config.serviceName,
          openMethod: 'EXTERNAL_BROWSER',
          url: ''
        }));
      } else {
        serviceLinkList.value = [];
      }
      
      // If no links exist, add a default empty one
      if (serviceLinkList.value.length === 0) {
        serviceLinkList.value = [{ 
          language: 'zh-CN', 
          serviceName: '', 
          openMethod: 'EXTERNAL_BROWSER',
          url: '' 
        }];
      }

      // Update brand IDs input
      if (formData.value.livechatBrandIds && formData.value.livechatBrandIds.length > 0) {
        brandIdsInput.value = formData.value.livechatBrandIds.join(', ');
      }
    }
  } catch (error: any) {
    console.error('Load config error:', error);
    message.warning('暂无配置数据，可以创建新配置');
  } finally {
    loading.value = false;
  }
};

// Enable edit mode
const enableEdit = () => {
  originalData.value = JSON.parse(JSON.stringify(formData.value));
  isEditing.value = true;
};

// Cancel edit mode
const cancelEdit = () => {
  if (originalData.value) {
    formData.value = JSON.parse(JSON.stringify(originalData.value));
    
    // Restore service links with language configs
    if (formData.value.serviceLinkUrl && formData.value.languageConfigs) {
      const links = formData.value.serviceLinkUrl.split('\n').filter(url => url.trim());
      const configs = formData.value.languageConfigs || [];
      
      serviceLinkList.value = links.map((url, index) => {
        const parts = url.trim().split('|');
        const openMethod = parts.length === 2 ? parts[0] : 'EXTERNAL_BROWSER';
        const urlValue = parts.length === 2 ? parts[1] : url.trim();
        const langConfig = configs[index] || { language: 'zh-CN', serviceName: '' };
        
        return {
          language: langConfig.language,
          serviceName: langConfig.serviceName,
          openMethod: openMethod,
          url: urlValue
        };
      });
    } else {
      serviceLinkList.value = [{ 
        language: 'zh-CN', 
        serviceName: '',
        openMethod: 'EXTERNAL_BROWSER',
        url: '' 
      }];
    }
  }
  isEditing.value = false;
};

// Save configuration
const saveConfig = async () => {
  saving.value = true;
  try {
    // Extract language configs and service links
    formData.value.languageConfigs = serviceLinkList.value
      .filter(link => link.language && link.serviceName)
      .map(link => ({
        language: link.language,
        serviceName: link.serviceName
      }));
    
    // Combine service links into serviceLinkUrl with format: "openMethod|url"
    const linksText = serviceLinkList.value
      .filter(link => link.url.trim())
      .map(link => `${link.openMethod}|${link.url.trim()}`)
      .join('\n');
    
    formData.value.serviceLinkUrl = linksText;

    await updateOnlineCustomerServiceConfig(formData.value);
    message.success('配置保存成功');
    isEditing.value = false;
    await loadConfig();
  } catch (error: any) {
    message.error(error.message || '保存配置失败');
  } finally {
    saving.value = false;
  }
};

// Reset form
const resetForm = () => {
  loadConfig();
};

// Add service link
const addServiceLink = () => {
  serviceLinkList.value.push({ 
    language: 'zh-CN', 
    serviceName: '',
    openMethod: 'EXTERNAL_BROWSER',
    url: '' 
  });
};

// Remove service link
const removeServiceLink = (index: number) => {
  serviceLinkList.value.splice(index, 1);
};

// Add language configuration
const addLanguageConfig = () => {
  if (!languageForm.value.language || !languageForm.value.serviceName) {
    message.warning('请填写完整的语言配置');
    return;
  }

  if (!formData.value.languageConfigs) {
    formData.value.languageConfigs = [];
  }

  // Check if language already exists
  const exists = formData.value.languageConfigs.some(
    (config) => config.language === languageForm.value.language
  );

  if (exists) {
    message.warning('该语言已存在，请选择其他语言');
    return;
  }

  formData.value.languageConfigs.push({ ...languageForm.value });
  languageForm.value = { language: '', serviceName: '' };
  showLanguageModal.value = false;
  message.success('语言配置已添加');
};

// Remove language configuration
const removeLanguageConfig = (index: number) => {
  formData.value.languageConfigs?.splice(index, 1);
};

// Update brand IDs from input
const updateBrandIds = () => {
  if (brandIdsInput.value) {
    const ids = brandIdsInput.value.split(',').map((id) => id.trim()).filter((id) => id);
    formData.value.livechatBrandIds = ids;
  } else {
    formData.value.livechatBrandIds = [];
  }
};

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.online-customer-service-tab {
  max-width: 1200px;
}
</style>

