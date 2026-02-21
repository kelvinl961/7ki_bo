<template>
  <n-modal
    v-model:show="showModal"
    :style="{ width: '900px', maxHeight: '90vh' }"
    @after-leave="resetForm"
  >
    <n-card
      title="新增主域名"
      :bordered="false"
      size="small"
      role="dialog"
      aria-modal="true"
      style="border-radius: 8px"
    >
      <template #header-extra>
        <n-button text @click="showModal = false">
          <span style="font-size: 20px">✕</span>
        </n-button>
      </template>

      <n-scrollbar style="max-height: calc(90vh - 200px)">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="top"
          size="medium"
        >
          <!-- Activated CDN Nodes -->
          <n-form-item>
            <template #label>
              <div style="display: flex; align-items: center; gap: 8px">
                <span style="color: red">*</span>
                <span>已开通节点</span>
                <n-tooltip>
                  <template #trigger>
                    <span style="color: #999; cursor: help">(已开通?)</span>
                  </template>
                  <div style="max-width: 300px">节点说明</div>
                </n-tooltip>
              </div>
            </template>
            <div class="cdn-nodes-container">
              <div
                v-for="node in activatedNodes"
                :key="node.value"
                class="cdn-node-card"
                :class="{
                  active: formData.cdnProvider === node.value,
                  disabled: node.disabled,
                }"
                @click="!node.disabled && (formData.cdnProvider = node.value)"
              >
                <!-- Badges -->
                <div class="badges">
                  <n-tag
                    v-for="(badge, idx) in node.badges"
                    :key="idx"
                    :type="badge.type"
                    size="small"
                    :bordered="false"
                  >
                    {{ badge.text }}
                  </n-tag>
                </div>

                <!-- Provider Info -->
                <div class="provider-info">
                  <n-icon v-if="node.icon" :component="node.icon" size="20" />
                  <span class="provider-name">{{ node.label }}</span>
                  <n-icon v-if="node.verified" style="color: #18a058" size="16">
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      />
                    </svg>
                  </n-icon>
                </div>

                <!-- Count -->
                <div class="node-count">{{ node.count }}条</div>
              </div>
            </div>
          </n-form-item>

          <!-- Not Activated Nodes -->
          <n-form-item label="未开通节点">
            <div class="cdn-nodes-container">
              <div
                v-for="node in notActivatedNodes"
                :key="node.value"
                class="cdn-node-card inactive"
              >
                <!-- Badges -->
                <div class="badges">
                  <n-tag
                    v-for="(badge, idx) in node.badges"
                    :key="idx"
                    :type="badge.type"
                    size="small"
                    :bordered="false"
                  >
                    {{ badge.text }}
                  </n-tag>
                </div>

                <!-- Provider Info -->
                <div class="provider-info">
                  <span class="provider-name">{{ node.label }}</span>
                  <n-icon v-if="node.verified" style="color: #18a058" size="16">
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      />
                    </svg>
                  </n-icon>
                </div>

                <!-- Activate Button -->
                <n-button
                  size="small"
                  type="primary"
                  ghost
                  @click="handleActivateNode(node)"
                >
                  开通
                </n-button>
              </div>
            </div>
            <div style="text-align: center; margin-top: 12px">
              <n-button
                text
                type="primary"
                @click="showMoreNodes = !showMoreNodes"
              >
                {{ showMoreNodes ? '收起' : '更多' }}
                <n-icon
                  :component="showMoreNodes ? ChevronUp : ChevronDown"
                  style="margin-left: 4px"
                />
              </n-button>
            </div>
          </n-form-item>

          <!-- Main Domains Input -->
          <n-form-item path="domains">
            <template #label>
              <div style="display: flex; align-items: center; gap: 8px">
                <span style="color: red">*</span>
                <span>主域名</span>
              </div>
            </template>
            <n-input
              v-model:value="formData.domains"
              type="textarea"
              :rows="4"
              placeholder="支持批量添加，最多20个，多个域名请换行，例如：&#10;123.com&#10;123.com.hk&#10;123.in"
              :status="domainsError ? 'error' : undefined"
            />
            <div
              v-if="domainsError"
              style="color: #d03050; font-size: 12px; margin-top: 4px"
            >
              {{ domainsError }}
            </div>
          </n-form-item>

          <!-- Usage Scenario -->
          <n-form-item path="usageScenario">
            <template #label>
              使用场景
              <n-tooltip>
                <template #trigger>
                  <n-icon size="16" style="margin-left: 4px; cursor: help">
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                      />
                    </svg>
                  </n-icon>
                </template>
                使用场景说明
              </n-tooltip>
            </template>
            <n-radio-group v-model:value="formData.usageScenario">
              <n-space>
                <n-radio value="ALL">全部</n-radio>
                <n-radio value="CLUB_ONLY">仅俱乐部</n-radio>
                <n-radio value="PC_AGENT_BACKEND">仅PC代理后台</n-radio>
              </n-space>
            </n-radio-group>
          </n-form-item>

          <!-- Remarks -->
          <n-form-item label="备注">
            <n-input
              v-model:value="formData.remarks"
              type="textarea"
              placeholder="请输入备注"
              :rows="3"
              :maxlength="200"
              show-count
              clearable
            />
          </n-form-item>

          <!-- Pricing and Usage Tutorial -->
          <div class="tutorial-section">
            <div class="tutorial-title">收费和使用法教程：</div>

            <div class="tutorial-item">
              <div class="tutorial-label">1、限顶级域名：</div>
              <div class="tutorial-content">
                此处只能添加独立的顶级域名，请勿添加子域名，例如：只能添加123.com，不是www.123.com。详见:
                <n-button
                  text
                  type="primary"
                  size="small"
                  @click="openTutorial('domain')"
                  >域名管理教程</n-button
                >
              </div>
            </div>

            <div class="tutorial-item">
              <div class="tutorial-label">2、节点使用教程：</div>
              <div class="tutorial-content">
                <div class="tutorial-subsection">
                  <strong>(1) 中国市场 (含港澳台)：</strong> 推荐使用alb域名
                  (CloudFront-ALB)、三方公共域名 (CloudFront防封)、Wangsu
                  (CDN+IP)、Apeir8、Yundun (云盾)、Funnull
                  (方能)、superEdge、大陆阿里云。
                </div>
                <div class="tutorial-subsection">
                  <strong>(2) 全球市场 (即非中国)：</strong> 推荐使用alb域名
                  (CloudFront-ALB与阿里云ALB)、三方公共域名
                  (CloudFront防封与Azure防封)、CloudFront、Cloudflare、腾讯云、阿里云、Google、Azure、华为云、Wangsu
                  (CDN+IP)、Yundun (云盾)。
                </div>
                <div class="tutorial-subsection">
                  <strong>(3) Wangsu独立IP：</strong>
                  提供独立IP地址，适用于全球禁域名，但不会封禁IP的国家（例如：印尼、中国、巴西、越南等），国际和中国大陆市场均可使用（即全球通用130USDT/IP/月），若超过7天未启用系统自动回收。
                </div>
                <div class="tutorial-subsection">
                  <strong>(4) 开放回源：</strong>
                  我方提供独立源服务器IP信息，您可使用外部三方CDN绑定到我方源站，所以仅限web大厅使用（不支持原生APP)，需要有专业知识才能配置websocket、HTTP2、缓存等信息，详见域名管理教程。
                </div>
              </div>
            </div>
          </div>
        </n-form>
      </n-scrollbar>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">
            确认
          </n-button>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  useMessage,
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NRadio,
  NRadioGroup,
  NSpace,
  NTag,
  NIcon,
  NTooltip,
  NModal,
  NScrollbar,
} from 'naive-ui';
import { ChevronDown, ChevronUp } from '@vicons/ionicons5';
import { domainApi } from '../api/domainApi';

const props = defineProps<{
  show: boolean;
  defaultUseType?: string;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void;
}>();

const message = useMessage();
const showModal = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

const formRef = ref();
const submitting = ref(false);
const showMoreNodes = ref(false);
const domainsError = ref('');

const formData = ref({
  cdnProvider: '',
  domains: '',
  usageScenario: 'ALL',
  remarks: '',
});

// Activated CDN Nodes
const activatedNodes = [
  {
    label: 'Cloudflare',
    value: 'CLOUDFLARE',
    verified: true,
    count: 5,
    badges: [
      { text: '顶级版', type: 'success' },
      { text: '全球', type: 'info' },
    ],
  },
  {
    label: 'AWS',
    value: 'AWS',
    verified: true,
    count: 4,
    badges: [{ text: '全球', type: 'info' }],
  },
  {
    label: '华为云',
    value: 'HUAWEI_CLOUD',
    count: 2,
    disabled: true,
    badges: [
      { text: '国际', type: 'success' },
      { text: '维护中', type: 'default' },
    ],
  },
];

// Not Activated Nodes
const notActivatedNodes = [
  {
    label: 'Google',
    value: 'GOOGLE',
    badges: [
      { text: '国际', type: 'success' },
      { text: '防封', type: 'warning' },
    ],
  },
  {
    label: 'AWS防封',
    value: 'AWS_DEFENSE',
    badges: [
      { text: '全球', type: 'info' },
      { text: '防封', type: 'warning' },
    ],
  },
  {
    label: 'AWS-ALB',
    value: 'AWS_ALB',
    badges: [
      { text: '全球', type: 'info' },
      { text: '防封', type: 'warning' },
    ],
  },
];

const rules = {
  domains: {
    required: true,
    message: '请输入主域名',
    trigger: 'blur',
  },
  usageScenario: {
    required: true,
    message: '请选择使用场景',
    trigger: 'change',
  },
};

const validateDomains = () => {
  domainsError.value = '';

  if (!formData.value.domains.trim()) {
    domainsError.value = '请输入主域名';
    return false;
  }

  const domains = formData.value.domains
    .trim()
    .split('\n')
    .filter((d) => d.trim());

  if (domains.length === 0) {
    domainsError.value = '请输入主域名';
    return false;
  }

  if (domains.length > 20) {
    domainsError.value = '最多只能添加20个域名';
    return false;
  }

  // Validate domain format (basic check for top-level domains)
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;

  for (const domain of domains) {
    if (!domainRegex.test(domain.trim())) {
      domainsError.value = `域名格式错误: ${domain}`;
      return false;
    }

    // Check if it's a subdomain (contains more than 2 dots usually means subdomain)
    if (domain.trim().startsWith('www.')) {
      domainsError.value = `请勿添加www子域名: ${domain}。只添加顶级域名，如: ${domain.replace('www.', '')}`;
      return false;
    }
  }

  return true;
};

const handleActivateNode = (node: any) => {
  message.info(`开通 ${node.label} 功能即将上线`);
};

const openTutorial = (type: string) => {
  message.info('域名管理教程即将上线');
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    if (!formData.value.cdnProvider) {
      message.warning('请选择已开通的CDN节点');
      return;
    }

    if (!validateDomains()) {
      return;
    }

    submitting.value = true;

    // Split domains by newline
    const domains = formData.value.domains
      .trim()
      .split('\n')
      .filter((d) => d.trim());

    console.log(`🔍 Creating ${domains.length} parent domain(s)...`);

    // Create domains one by one and collect results
    const results = await Promise.allSettled(
      domains.map(async (domain) => {
        const response: any = await domainApi.createDomain({
          domainName: domain.trim(),
          cdnProvider: formData.value.cdnProvider,
          cdnPlatformName:
            activatedNodes.find((n) => n.value === formData.value.cdnProvider)
              ?.label || '',
          usageScenario: formData.value.usageScenario,
          备注: formData.value.remarks,
          useType: props.defaultUseType || 'WEB_HALL',
          isParentDomain: true,
          sslEnabled: true,
          createOnCDN: true, // Actually create on CDN
          createdBy: 'admin',
          operatedBy: 'admin',
        });

        console.log(`📊 Response for ${domain}:`, response);

        // Check response code
        const code = response.code ?? response.data?.code ?? 0;
        if (code === 0) {
          return { domain, success: true };
        } else {
          throw new Error(
            response.message || response.data?.message || 'Creation failed',
          );
        }
      }),
    );

    // Count successes and failures
    const successful = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');

    console.log(
      `✅ Success: ${successful.length}, ❌ Failed: ${failed.length}`,
    );

    if (successful.length > 0 && failed.length === 0) {
      // All succeeded
      message.success(`成功创建 ${successful.length} 个域名`);
      emit('success');
      showModal.value = false;
    } else if (successful.length > 0 && failed.length > 0) {
      // Partial success
      const failedDomains = failed.map(
        (r: any) => r.reason?.message || '未知错误',
      );
      message.warning(
        `成功创建 ${successful.length} 个域名，${failed.length} 个失败：${failedDomains.join('; ')}`,
      );
      emit('success');
      showModal.value = false;
    } else {
      // All failed
      const failedDomains = failed.map(
        (r: any) => r.reason?.message || '未知错误',
      );
      throw new Error(failedDomains.join('; '));
    }
  } catch (error: any) {
    console.error('Form submission failed:', error);
    message.error(error.response?.data?.message || error.message || '创建失败');
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    cdnProvider: '',
    domains: '',
    usageScenario: 'ALL',
    remarks: '',
  };
  domainsError.value = '';
  showMoreNodes.value = false;
};
</script>

<style scoped lang="scss">
.cdn-nodes-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
}

.cdn-node-card {
  position: relative;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 100px;

  &:hover:not(.disabled):not(.inactive) {
    border-color: #18a058;
    background-color: #f0fdf4;
  }

  &.active {
    border-color: #18a058;
    background-color: #f0fdf4;
    box-shadow: 0 0 0 1px #18a058;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f5f5f5;
  }

  &.inactive {
    cursor: default;

    &:hover {
      border-color: #d1d5db;
    }
  }

  .badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .provider-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;

    .provider-name {
      font-size: 15px;
      font-weight: 500;
      color: #333;
    }
  }

  .node-count {
    font-size: 13px;
    color: #666;
  }
}

.tutorial-section {
  background-color: #f7f8fa;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;

  .tutorial-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 16px;
    color: #333;
  }

  .tutorial-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .tutorial-label {
      font-weight: 600;
      font-size: 13px;
      color: #333;
      margin-bottom: 8px;
    }

    .tutorial-content {
      font-size: 13px;
      line-height: 1.8;
      color: #666;

      .tutorial-subsection {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        strong {
          color: #333;
          font-weight: 600;
        }
      }
    }
  }
}

:deep(.n-card-header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.n-card__content) {
  padding: 20px;
}

:deep(.n-card__footer) {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

:deep(.n-form-item-label) {
  font-weight: 500;
}
</style>
