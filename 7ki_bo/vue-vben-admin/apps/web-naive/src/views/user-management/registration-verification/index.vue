<template>
  <Page auto-content-height title="注册和验证">
    <div class="registration-verification-layout flex min-h-[calc(100vh-140px)] flex-col gap-4 bg-[#f5f7fa] p-2">
      <n-spin :show="loading">
        <section class="setting-card">
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

          <div class="setting-row">
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

          <!--<div class="setting-row">
            <div class="setting-label">登录密码强度要求</div>
            <div class="setting-content inline-options">
              <label class="radio-label">
                <input v-model="loginPasswordStrength" type="radio" value="recommended" />
                <span>强密码(推荐)</span>
              </label>
              <label class="radio-label">
                <input v-model="loginPasswordStrength" type="radio" value="no_limit" />
                <span>简易密码(允许数字)</span>
              </label>
            </div>
          </div>

          <div class="setting-row no-border">
            <div class="setting-label">强制修改登录或提现密码情形</div>
            <div class="setting-content">
              <label class="radio-label block-option">
                <input v-model="forceChangePasswordWhenNotSelfSet" :value="true" type="radio" />
                <span>重置、新增导入新密码后需要修改一次密码（推荐）</span>
              </label>
              <label class="radio-label block-option">
                <input v-model="forceChangePasswordWhenNotSelfSet" :value="false" type="radio" />
                <span>不强制修改(不安全)</span>
              </label>
            </div>
          </div>-->
        </section>
      </n-spin>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { useMessage } from 'naive-ui';
import { computed, onMounted, ref, watch } from 'vue';

import type { RegistrationVerificationConfigPayload } from '#/api/core/registration-verification';
import {
  fetchRegistrationVerificationConfig,
  saveRegistrationVerificationConfigApi,
} from '#/api/core/registration-verification';

const message = useMessage();
const loading = ref(false);
const savingRegister = ref(false);
const savingLogin = ref(false);

const meta = ref({
  scope: 'global',
  scopeValue: 'default',
  version: 0,
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
const loginPasswordStrength = ref<'recommended' | 'no_limit'>('recommended');
const forceChangePasswordWhenNotSelfSet = ref(true);

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

function hintComingSoon(name: string) {
  message.info(`「${name}」请从对应顶栏菜单进入（开发中可在此接入路由）`);
}

function ensureSelectValueValid() {
  const registerAllowed = registerDefaultOptions.value.map((o) => o.value);
  if (registerAllowed.length > 0 && !registerAllowed.includes(registerSupport.value.defaultRegisterMethod)) {
    registerSupport.value.defaultRegisterMethod = registerAllowed[0]!;
  }
  const loginAllowed = loginDefaultOptions.value.map((o) => o.value);
  if (loginAllowed.length > 0 && !loginAllowed.includes(defaultLoginMethod.value)) {
    defaultLoginMethod.value = loginAllowed[0]!;
  }
}

function applyFromConfig(data: RegistrationVerificationConfigPayload) {
  config.value = JSON.parse(JSON.stringify(data)) as RegistrationVerificationConfigPayload;
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
  loginPasswordStrength.value = data.publicPage.loginPasswordStrength;
  forceChangePasswordWhenNotSelfSet.value = data.publicPage.forceChangePasswordWhenNotSelfSet;
  ensureSelectValueValid();
}

async function load() {
  loading.value = true;
  try {
    const d = await fetchRegistrationVerificationConfig();
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

async function onSaveRegister() {
  if (!config.value) return;
  ensureSelectValueValid();
  savingRegister.value = true;
  try {
    const nextConfig = JSON.parse(JSON.stringify(config.value)) as RegistrationVerificationConfigPayload;
    nextConfig.publicPage.registerSupport = JSON.parse(JSON.stringify(registerSupport.value));
    nextConfig.publicPage.loginSupport.defaultLoginMethod = defaultLoginMethod.value;
    nextConfig.registrationSupportMethods.channels.phone = registerSupport.value.phone;
    nextConfig.registrationSupportMethods.channels.email = registerSupport.value.email;
    nextConfig.registrationSupportMethods.channels.memberAccount = registerSupport.value.memberAccount;
    nextConfig.registrationSupportMethods.defaultChannel = registerSupport.value.defaultRegisterMethod;
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
    const nextConfig = JSON.parse(JSON.stringify(config.value)) as RegistrationVerificationConfigPayload;
    nextConfig.publicPage.loginSupport = JSON.parse(JSON.stringify(loginSupport.value));
    nextConfig.publicPage.loginSupport.defaultLoginMethod = defaultLoginMethod.value;
    nextConfig.publicPage.loginPasswordStrength = loginPasswordStrength.value;
    nextConfig.publicPage.forceChangePasswordWhenNotSelfSet = forceChangePasswordWhenNotSelfSet.value;
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
});
</script>

<style scoped>
.setting-card {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fff;
}

.setting-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f0;
}

.setting-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.action-btn {
  min-width: 50px;
  height: 30px;
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
}

.setting-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #111827;
}

.option-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.check-label,
.radio-label {
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

.inline-options {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 14px;
}

.block-option {
  display: flex;
}
</style>
