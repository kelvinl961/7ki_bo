<template>
  <Page auto-content-height title="注册和验证">
    <div class="registration-verification-layout flex min-h-[calc(100vh-140px)] flex-col gap-4 bg-[#f5f7fa] p-2">
      <n-alert
        v-if="activeSiteLabel"
        type="info"
        :bordered="false"
        class="site-scope-banner"
      >
        当前配置范围：{{ activeSiteLabel }}（切换顶部站点筛选后将自动重新加载）
      </n-alert>
      <n-spin :show="loading">
        <section class="setting-card">
          <div class="setting-card-header">
            <div>
              <div class="setting-card-title">注册端限制</div>
          
            </div>
            <button
              class="action-btn"
              :disabled="savingPlatform"
              @click="onSavePlatformRestrictions"
            >
              {{ savingPlatform ? '保存中...' : '修改' }}
            </button>
          </div>

          <div class="setting-row">
            <div class="setting-label">启用限制</div>
            <div class="setting-content">
              <div class="enable-row">
                <n-switch v-model:value="platformRestrictions.enabled" size="medium" />
                <span class="enable-hint">
                  {{
                    platformRestrictions.enabled
                      ? '已启用：未勾选的端将无法注册'
                      : '未启用：所有端均可注册'
                  }}
                </span>
              </div>
              <n-alert
                v-if="platformRestrictions.enabled && platformBlockSummary"
                type="warning"
                :bordered="false"
                class="platform-alert"
              >
                {{ platformBlockSummary }}
              </n-alert>
              <n-alert
                v-else-if="!platformRestrictions.enabled"
                type="info"
                :bordered="false"
                class="platform-alert"
              >
                建议：若发现电脑端（Windows）短时间大量注册，可启用限制并关闭「PC / 电脑端」。
              </n-alert>
            </div>
          </div>

          <div class="setting-row no-border">
            <div class="setting-label">允许注册</div>
            <div class="setting-content platform-grid-wrap">
              <div
                class="platform-grid"
                :class="{ 'platform-grid--dimmed': !platformRestrictions.enabled }"
              >
                <div
                  v-for="item in platformOptions"
                  :key="item.key"
                  class="platform-tile"
                  :class="{
                    'platform-tile--allowed': isPlatformAllowed(item.key),
                    'platform-tile--blocked': platformRestrictions.enabled && !isPlatformAllowed(item.key),
                  }"
                >
                  <div class="platform-tile-icon" :style="{ color: item.color }">
                    <n-icon :component="item.icon" :size="28" />
                  </div>
                  <div class="platform-tile-body">
                    <div class="platform-tile-title">{{ item.label }}</div>
                    <div class="platform-tile-desc">{{ item.description }}</div>
                  </div>
                  <n-switch
                    :value="isPlatformAllowed(item.key)"
                    :disabled="!platformRestrictions.enabled"
                    size="small"
                    @update:value="(v: boolean) => setPlatformAllowed(item.key, v)"
                  />
                </div>
              </div>
              <p v-if="platformRestrictions.enabled && allPlatformsBlocked" class="platform-error">
                至少保留一个允许注册的端，否则所有用户都无法注册。
              </p>
            </div>
          </div>
        </section>

        <section class="setting-card mt-4">
          <div class="setting-card-header">
            <div class="setting-card-title">注册支持方式</div>
            <button class="action-btn" :disabled="savingRegister" @click="onSaveRegister">
              {{ savingRegister ? '保存中...' : '修改' }}
            </button>
          </div>

          <div class="setting-row">
            <div class="setting-label">支持方式</div>
            <div class="setting-content">
              <div class="option-line">
                <label class="check-label">
                  <input v-model="registerSupport.phone" type="checkbox" />
                  <span>手机号码</span>
                </label>
                <button class="text-link" @click="hintComingSoon('短信配置')">(短信配置)</button>
              </div>
              <div class="option-line">
                <label class="check-label">
                  <input v-model="registerSupport.email" type="checkbox" />
                  <span>邮箱</span>
                </label>
                <button class="text-link" @click="hintComingSoon('邮箱验证')">(邮箱配置)</button>
              </div>
              <label class="check-label">
                <input v-model="registerSupport.memberAccount" type="checkbox" />
                <span>会员账号</span>
              </label>
            </div>
          </div>

          <div class="setting-row no-border">
            <div class="setting-label">默认注册方式</div>
            <div class="setting-content">
              <select v-model="registerSupport.defaultRegisterMethod" class="select-box">
                <option v-for="item in registerDefaultOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>
        </section>

        <section class="setting-card mt-4">
          <div class="setting-card-header">
            <div class="setting-card-title">登录支持方式</div>
            <button class="action-btn" :disabled="savingLogin" @click="onSaveLogin">
              {{ savingLogin ? '保存中...' : '修改' }}
            </button>
          </div>

          <div class="setting-row">
            <div class="setting-label">支持方式</div>
            <div class="setting-content">
              <div class="option-line">
                <label class="check-label">
                  <input v-model="loginSupport.phone" type="checkbox" />
                  <span>手机号码</span>
                </label>
                <button class="text-link" @click="hintComingSoon('短信配置')">(短信配置)</button>
              </div>
              <div class="option-line">
                <label class="check-label">
                  <input v-model="loginSupport.email" type="checkbox" />
                  <span>邮箱</span>
                </label>
                <button class="text-link" @click="hintComingSoon('邮箱验证')">(绑定配置)</button>
              </div>
              <label class="check-label">
                <input v-model="loginSupport.memberAccount" type="checkbox" />
                <span>会员账号</span>
              </label>
            </div>
          </div>

          <div class="setting-row no-border">
            <div class="setting-label">默认登录方式</div>
            <div class="setting-content">
              <select v-model="defaultLoginMethod" class="select-box">
                <option value="" disabled>请选择</option>
                <option v-for="item in loginDefaultOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>
        </section>
      </n-spin>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { Page } from '@vben/common-ui';
import {
  LogoAndroid,
  LogoApple,
  LogoWindows,
  PhonePortraitOutline,
} from '@vicons/ionicons5';
import { NAlert, NIcon, NSwitch, useMessage } from 'naive-ui';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import type {
  RegistrationPlatformRestrictions,
  RegistrationVerificationConfigPayload,
} from '#/api/core/registration-verification';
import {
  fetchRegistrationVerificationConfig,
  saveRegistrationVerificationConfigApi,
} from '#/api/core/registration-verification';
import {
  getSiteScope,
  resolveConfigScopeParams,
  SITE_SCOPE_CHANGED_EVENT,
} from '#/utils/siteScope';

type PlatformKey = 'pc' | 'apple' | 'android' | 'other';

const message = useMessage();
const loading = ref(false);
const savingRegister = ref(false);
const savingLogin = ref(false);
const savingPlatform = ref(false);

const initialScope = resolveConfigScopeParams();
const meta = ref({
  scope: initialScope.scope,
  scopeValue: initialScope.scopeValue,
  version: 0,
});

const activeSiteLabel = computed(() => {
  const siteCode = getSiteScope();
  if (!siteCode || siteCode === 'all') return '全部站点（全局默认）';
  return `站点 ${siteCode}`;
});

const config = ref<RegistrationVerificationConfigPayload | null>(null);
const registerSupport = ref<RegistrationVerificationConfigPayload['publicPage']['registerSupport']>({
  phone: true,
  email: false,
  memberAccount: true,
  defaultRegisterMethod: 'member_account',
});
const loginSupport = ref<RegistrationVerificationConfigPayload['publicPage']['loginSupport']>({
  phone: true,
  email: false,
  memberAccount: true,
});
const defaultLoginMethod = ref<'phone' | 'email' | 'member_account'>('member_account');

const defaultPlatformRestrictions = (): RegistrationPlatformRestrictions => ({
  enabled: false,
  allowPc: true,
  allowApple: true,
  allowAndroid: true,
  allowOther: true,
});

const platformRestrictions = ref<RegistrationPlatformRestrictions>(
  defaultPlatformRestrictions(),
);

const platformOptions: Array<{
  key: PlatformKey;
  label: string;
  description: string;
  icon: typeof LogoWindows;
  color: string;
  allowField: keyof RegistrationPlatformRestrictions;
}> = [
  {
    key: 'pc',
    label: 'PC / 电脑端',
    description: 'Windows、Mac 浏览器等桌面访问（刷号高发）',
    icon: LogoWindows,
    color: '#0078d4',
    allowField: 'allowPc',
  },
  {
    key: 'apple',
    label: 'Apple / iOS',
    description: 'iPhone、iPad、iOS App 与 Safari H5',
    icon: LogoApple,
    color: '#333333',
    allowField: 'allowApple',
  },
  {
    key: 'android',
    label: 'Android',
    description: 'Android App 与手机浏览器 H5',
    icon: LogoAndroid,
    color: '#3ddc84',
    allowField: 'allowAndroid',
  },
  {
    key: 'other',
    label: '其他端',
    description: '无法识别的客户端、部分 WebView / 第三方容器',
    icon: PhonePortraitOutline,
    color: '#8c8c8c',
    allowField: 'allowOther',
  },
];

function isPlatformAllowed(key: PlatformKey): boolean {
  const field = platformOptions.find((p) => p.key === key)?.allowField;
  if (!field || field === 'enabled') return true;
  return platformRestrictions.value[field] !== false;
}

function setPlatformAllowed(key: PlatformKey, allowed: boolean) {
  const field = platformOptions.find((p) => p.key === key)?.allowField;
  if (!field || field === 'enabled') return;
  platformRestrictions.value[field] = allowed;
}

const allPlatformsBlocked = computed(() => {
  if (!platformRestrictions.value.enabled) return false;
  return (
    !platformRestrictions.value.allowPc &&
    !platformRestrictions.value.allowApple &&
    !platformRestrictions.value.allowAndroid &&
    !platformRestrictions.value.allowOther
  );
});

const platformBlockSummary = computed(() => {
  if (!platformRestrictions.value.enabled) return '';
  const blocked = platformOptions
    .filter((p) => !isPlatformAllowed(p.key))
    .map((p) => p.label);
  if (blocked.length === 0) return '当前未关闭任何端，所有客户端均可注册。';
  return `已关闭注册：${blocked.join('、')}。其余端可正常注册。`;
});

const registerDefaultOptions = computed(() => {
  const opts: Array<{ label: string; value: 'phone' | 'email' | 'member_account' }> = [];
  if (registerSupport.value.phone) opts.push({ label: '手机号码', value: 'phone' });
  if (registerSupport.value.email) opts.push({ label: '邮箱', value: 'email' });
  if (registerSupport.value.memberAccount) opts.push({ label: '会员账号', value: 'member_account' });
  return opts;
});

const loginDefaultOptions = computed(() => {
  const opts: Array<{ label: string; value: 'phone' | 'email' | 'member_account' }> = [];
  if (loginSupport.value.phone) opts.push({ label: '手机号码', value: 'phone' });
  if (loginSupport.value.email) opts.push({ label: '邮箱', value: 'email' });
  if (loginSupport.value.memberAccount) opts.push({ label: '会员账号', value: 'member_account' });
  return opts;
});

function resolveLoginDefault(
  preferred?: 'phone' | 'email' | 'member_account',
): 'phone' | 'email' | 'member_account' {
  const allowed = loginDefaultOptions.value.map((o) => o.value);
  if (preferred && allowed.includes(preferred)) return preferred;
  if (allowed.includes(defaultLoginMethod.value)) return defaultLoginMethod.value;
  if (allowed.includes('member_account')) return 'member_account';
  if (allowed.includes('phone')) return 'phone';
  if (allowed.includes('email')) return 'email';
  return 'member_account';
}

function normalizePlatformRestrictions(
  raw?: RegistrationPlatformRestrictions | null,
): RegistrationPlatformRestrictions {
  if (!raw) return defaultPlatformRestrictions();
  return {
    enabled: raw.enabled === true,
    allowPc: raw.allowPc !== false,
    allowApple: raw.allowApple !== false,
    allowAndroid: raw.allowAndroid !== false,
    allowOther: raw.allowOther !== false,
  };
}

function hintComingSoon(name: string) {
  message.info(`「${name}」请从对应顶栏菜单进入（开发中可在此接入路由）`);
}

function ensureSelectValueValid() {
  const registerAllowed = registerDefaultOptions.value.map((o) => o.value);
  if (
    registerAllowed.length > 0 &&
    !registerAllowed.includes(registerSupport.value.defaultRegisterMethod)
  ) {
    registerSupport.value.defaultRegisterMethod = registerAllowed[0]!;
  }
  const loginAllowed = loginDefaultOptions.value.map((o) => o.value);
  if (loginAllowed.length > 0 && !loginAllowed.includes(defaultLoginMethod.value)) {
    defaultLoginMethod.value = loginAllowed[0]!;
  }
}

function applyFromConfig(data: RegistrationVerificationConfigPayload) {
  config.value = JSON.parse(JSON.stringify(data)) as RegistrationVerificationConfigPayload;
  platformRestrictions.value = normalizePlatformRestrictions(
    data.registrationPlatformRestrictions,
  );
  registerSupport.value = {
    phone: data.registrationSupportMethods.channels.phone,
    email: data.registrationSupportMethods.channels.email,
    memberAccount: data.registrationSupportMethods.channels.memberAccount,
    defaultRegisterMethod: data.registrationSupportMethods.defaultChannel,
  };
  loginSupport.value = JSON.parse(JSON.stringify(data.publicPage.loginSupport));
  defaultLoginMethod.value = resolveLoginDefault(
    data.publicPage.loginSupport.defaultLoginMethod,
  );
  ensureSelectValueValid();
}

async function load() {
  loading.value = true;
  try {
    const scopeParams = resolveConfigScopeParams();
    const d = await fetchRegistrationVerificationConfig(scopeParams);
    meta.value = {
      scope: d.scope,
      scopeValue: d.scopeValue,
      version: d.version,
    };
    applyFromConfig(d.config);
  } catch (e) {
    message.error((e as Error).message);
  } finally {
    loading.value = false;
  }
}

function onSiteScopeChanged() {
  const scopeParams = resolveConfigScopeParams();
  meta.value.scope = scopeParams.scope;
  meta.value.scopeValue = scopeParams.scopeValue;
  void load();
}

watch(
  () => registerSupport.value,
  () => ensureSelectValueValid(),
  { deep: true },
);
watch(
  () => loginSupport.value,
  () => ensureSelectValueValid(),
  { deep: true },
);

async function onSavePlatformRestrictions() {
  if (!config.value) return;
  if (allPlatformsBlocked.value) {
    message.warning('至少保留一个允许注册的端');
    return;
  }
  savingPlatform.value = true;
  try {
    const nextConfig = JSON.parse(
      JSON.stringify(config.value),
    ) as RegistrationVerificationConfigPayload;
    nextConfig.registrationPlatformRestrictions = JSON.parse(
      JSON.stringify(platformRestrictions.value),
    );
    const d = await saveRegistrationVerificationConfigApi({
      scope: meta.value.scope,
      scopeValue: meta.value.scopeValue,
      config: nextConfig as unknown as Record<string, unknown>,
    });
    meta.value.version = d.version;
    applyFromConfig(d.config);
    message.success('注册端限制已保存');
  } catch (e) {
    message.error((e as Error).message);
  } finally {
    savingPlatform.value = false;
  }
}

async function onSaveRegister() {
  if (!config.value) return;
  ensureSelectValueValid();
  savingRegister.value = true;
  try {
    const nextConfig = JSON.parse(
      JSON.stringify(config.value),
    ) as RegistrationVerificationConfigPayload;
    nextConfig.publicPage.registerSupport = JSON.parse(JSON.stringify(registerSupport.value));
    nextConfig.publicPage.loginSupport.defaultLoginMethod = defaultLoginMethod.value;
    nextConfig.registrationSupportMethods.channels.phone = registerSupport.value.phone;
    nextConfig.registrationSupportMethods.channels.email = registerSupport.value.email;
    nextConfig.registrationSupportMethods.channels.memberAccount =
      registerSupport.value.memberAccount;
    nextConfig.registrationSupportMethods.defaultChannel =
      registerSupport.value.defaultRegisterMethod;
    nextConfig.registrationPlatformRestrictions = JSON.parse(
      JSON.stringify(platformRestrictions.value),
    );
    const d = await saveRegistrationVerificationConfigApi({
      scope: meta.value.scope,
      scopeValue: meta.value.scopeValue,
      config: nextConfig as unknown as Record<string, unknown>,
    });
    meta.value.version = d.version;
    applyFromConfig(d.config);
    message.success('注册支持方式已保存');
  } catch (e) {
    message.error((e as Error).message);
  } finally {
    savingRegister.value = false;
  }
}

async function onSaveLogin() {
  if (!config.value) return;
  ensureSelectValueValid();
  savingLogin.value = true;
  try {
    const nextConfig = JSON.parse(
      JSON.stringify(config.value),
    ) as RegistrationVerificationConfigPayload;
    nextConfig.publicPage.loginSupport = JSON.parse(JSON.stringify(loginSupport.value));
    nextConfig.publicPage.loginSupport.defaultLoginMethod = defaultLoginMethod.value;
    const d = await saveRegistrationVerificationConfigApi({
      scope: meta.value.scope,
      scopeValue: meta.value.scopeValue,
      config: nextConfig as unknown as Record<string, unknown>,
    });
    meta.value.version = d.version;
    applyFromConfig(d.config);
    message.success('登录支持方式已保存');
  } catch (e) {
    message.error((e as Error).message);
  } finally {
    savingLogin.value = false;
  }
}

onMounted(() => {
  load();
  window.addEventListener(SITE_SCOPE_CHANGED_EVENT, onSiteScopeChanged);
});

onUnmounted(() => {
  window.removeEventListener(SITE_SCOPE_CHANGED_EVENT, onSiteScopeChanged);
});
</script>

<style scoped>
.site-scope-banner {
  margin: 0;
}

.setting-card {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fff;
}

.setting-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f0;
}

.setting-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.setting-card-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.4;
}

.action-btn {
  min-width: 50px;
  height: 30px;
  flex-shrink: 0;
  border: 0;
  border-radius: 4px;
  background: #1890ff;
  color: #fff;
  cursor: pointer;
}

.action-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.setting-row {
  display: flex;
  gap: 18px;
  padding: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.setting-row.no-border {
  border-bottom: none;
}

.setting-label {
  width: 100px;
  flex-shrink: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 600;
  padding-top: 4px;
}

.setting-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #111827;
  flex: 1;
  min-width: 0;
}

.enable-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.enable-hint {
  font-size: 14px;
  color: #4b5563;
}

.platform-alert {
  margin-top: 4px;
}

.platform-grid-wrap {
  width: 100%;
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
}

@media (min-width: 900px) {
  .platform-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.platform-grid--dimmed .platform-tile {
  opacity: 0.72;
}

.platform-tile {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.platform-tile--allowed {
  border-color: #b7eb8f;
  background: #f6ffed;
}

.platform-tile--blocked {
  border-color: #ffccc7;
  background: #fff2f0;
}

.platform-tile-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #f0f0f0;
}

.platform-tile-body {
  flex: 1;
  min-height: 52px;
}

.platform-tile-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.platform-tile-desc {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.35;
  color: #6b7280;
}

.platform-tile :deep(.n-switch) {
  align-self: flex-end;
}

.platform-error {
  margin: 4px 0 0;
  font-size: 13px;
  color: #cf1322;
}

.option-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.check-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.text-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: #1890ff;
  cursor: pointer;
}

.select-box {
  min-width: 220px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
}
</style>
