<template>
  <Page auto-content-height :title="$t('user.registrationVerification.pageTitle')">
    <div class="registration-verification-layout flex min-h-[calc(100vh-140px)] flex-col gap-4 bg-[#f5f7fa] p-2">
      <n-spin :show="loading">
        <section class="setting-card">
          <div class="setting-card-header">
            <div>
              <div class="setting-card-title">
                {{ $t('user.registrationVerification.platformRestrictions') }}
              </div>
            </div>
            <button
              class="action-btn"
              :disabled="savingPlatform"
              @click="onSavePlatformRestrictions"
            >
              {{
                savingPlatform
                  ? $t('user.registrationVerification.saving')
                  : $t('common.modify')
              }}
            </button>
          </div>

          <div class="setting-row">
            <div class="setting-label">
              {{ $t('user.registrationVerification.enableRestrictions') }}
            </div>
            <div class="setting-content">
              <div class="enable-row">
                <n-switch v-model:value="platformRestrictions.enabled" size="medium" />
                <span class="enable-hint">
                  {{
                    platformRestrictions.enabled
                      ? $t('user.registrationVerification.enabledHint')
                      : $t('user.registrationVerification.disabledHint')
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
                {{ $t('user.registrationVerification.suggestion') }}
              </n-alert>
            </div>
          </div>

          <div class="setting-row no-border">
            <div class="setting-label">
              {{ $t('user.registrationVerification.allowRegistration') }}
            </div>
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
                    'platform-tile--blocked':
                      platformRestrictions.enabled && !isPlatformAllowed(item.key),
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
              <p
                v-if="platformRestrictions.enabled && allPlatformsBlocked"
                class="platform-error"
              >
                {{ $t('user.registrationVerification.keepOnePlatform') }}
              </p>
            </div>
          </div>
        </section>

        <section class="setting-card mt-4">
          <div class="setting-card-header">
            <div class="setting-card-title">
              {{ $t('user.registrationVerification.registerSupport') }}
            </div>
            <button class="action-btn" :disabled="savingRegister" @click="onSaveRegister">
              {{
                savingRegister
                  ? $t('user.registrationVerification.saving')
                  : $t('common.modify')
              }}
            </button>
          </div>

          <div class="setting-row">
            <div class="setting-label">
              {{ $t('user.registrationVerification.supportMethods') }}
            </div>
            <div class="setting-content">
              <div class="option-line">
                <label class="check-label">
                  <input v-model="registerSupport.phone" type="checkbox" />
                  <span>{{ $t('user.registrationVerification.phoneNumber') }}</span>
                </label>
                <button
                  class="text-link"
                  @click="hintComingSoon($t('user.registrationVerification.smsConfig'))"
                >
                  ({{ $t('user.registrationVerification.smsConfig') }})
                </button>
              </div>
              <div class="option-line">
                <label class="check-label">
                  <input v-model="registerSupport.email" type="checkbox" />
                  <span>{{ $t('user.registrationVerification.email') }}</span>
                </label>
                <button
                  class="text-link"
                  @click="hintComingSoon($t('user.registrationVerification.emailConfig'))"
                >
                  ({{ $t('user.registrationVerification.emailConfig') }})
                </button>
              </div>
              <label class="check-label">
                <input v-model="registerSupport.memberAccount" type="checkbox" />
                <span>{{ $t('common.memberAccount') }}</span>
              </label>
            </div>
          </div>

          <div class="setting-row no-border">
            <div class="setting-label">
              {{ $t('user.registrationVerification.defaultRegisterMethod') }}
            </div>
            <div class="setting-content">
              <select v-model="registerSupport.defaultRegisterMethod" class="select-box">
                <option
                  v-for="item in registerDefaultOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>
        </section>

        <section class="setting-card mt-4">
          <div class="setting-card-header">
            <div class="setting-card-title">
              {{ $t('user.registrationVerification.loginSupport') }}
            </div>
            <button class="action-btn" :disabled="savingLogin" @click="onSaveLogin">
              {{
                savingLogin
                  ? $t('user.registrationVerification.saving')
                  : $t('common.modify')
              }}
            </button>
          </div>

          <div class="setting-row">
            <div class="setting-label">
              {{ $t('user.registrationVerification.supportMethods') }}
            </div>
            <div class="setting-content">
              <div class="option-line">
                <label class="check-label">
                  <input v-model="loginSupport.phone" type="checkbox" />
                  <span>{{ $t('user.registrationVerification.phoneNumber') }}</span>
                </label>
                <button
                  class="text-link"
                  @click="hintComingSoon($t('user.registrationVerification.smsConfig'))"
                >
                  ({{ $t('user.registrationVerification.smsConfig') }})
                </button>
              </div>
              <div class="option-line">
                <label class="check-label">
                  <input v-model="loginSupport.email" type="checkbox" />
                  <span>{{ $t('user.registrationVerification.email') }}</span>
                </label>
                <button
                  class="text-link"
                  @click="hintComingSoon($t('user.registrationVerification.emailConfig'))"
                >
                  ({{ $t('user.registrationVerification.bindConfig') }})
                </button>
              </div>
              <label class="check-label">
                <input v-model="loginSupport.memberAccount" type="checkbox" />
                <span>{{ $t('common.memberAccount') }}</span>
              </label>
            </div>
          </div>

          <div class="setting-row no-border">
            <div class="setting-label">
              {{ $t('user.registrationVerification.defaultLoginMethod') }}
            </div>
            <div class="setting-content">
              <select v-model="defaultLoginMethod" class="select-box">
                <option value="" disabled>{{ $t('common.pleaseSelect') }}</option>
                <option
                  v-for="item in loginDefaultOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>
        </section>

        <section class="setting-card mt-4">
          <div class="setting-card-header">
            <div>
              <div class="setting-card-title">
                {{ $t('user.registrationVerification.authHeaderPromo') }}
              </div>
              <p class="setting-card-hint">
                {{ $t('user.registrationVerification.authHeaderPromoHint') }}
              </p>
            </div>
            <button
              class="action-btn"
              :disabled="savingPageStyle"
              @click="onSavePageStyle"
            >
              {{
                savingPageStyle
                  ? $t('user.registrationVerification.saving')
                  : $t('common.modify')
              }}
            </button>
          </div>

          <div class="setting-row">
            <div class="setting-label">
              {{ $t('user.registrationVerification.sloganPrefix') }}
            </div>
            <div class="setting-content">
              <div class="text-color-row">
                <input
                  v-model="pageStyle.sloganPrefix"
                  type="text"
                  class="text-input"
                  maxlength="120"
                  :placeholder="
                    $t('user.registrationVerification.sloganPrefixPlaceholder')
                  "
                />
                <label class="color-picker-label" :title="$t('user.registrationVerification.textColor')">
                  <span class="color-swatch" :style="{ background: pageStyle.sloganPrefixColor }" />
                  <input
                    v-model="pageStyle.sloganPrefixColor"
                    type="color"
                    class="color-input-native"
                  />
                </label>
              </div>
            </div>
          </div>

          <div class="setting-row no-border">
            <div class="setting-label">
              {{ $t('user.registrationVerification.sloganHighlight') }}
            </div>
            <div class="setting-content">
              <div class="text-color-row">
                <input
                  v-model="pageStyle.sloganHighlight"
                  type="text"
                  class="text-input"
                  maxlength="60"
                  :placeholder="
                    $t('user.registrationVerification.sloganHighlightPlaceholder')
                  "
                />
                <label class="color-picker-label" :title="$t('user.registrationVerification.textColor')">
                  <span class="color-swatch" :style="{ background: pageStyle.sloganHighlightColor }" />
                  <input
                    v-model="pageStyle.sloganHighlightColor"
                    type="color"
                    class="color-input-native"
                  />
                </label>
              </div>
              <p v-if="pageStylePreview" class="slogan-preview">
                <span class="slogan-preview-prefix" :style="{ color: pageStyle.sloganPrefixColor }">{{ pageStyle.sloganPrefix }}</span>
                <span class="slogan-preview-highlight" :style="{ color: pageStyle.sloganHighlightColor }">{{
                  pageStyle.sloganHighlight
                }}</span>
              </p>
            </div>
          </div>
        </section>
      </n-spin>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { Page } from '@vben/common-ui';
import {
  LogoAndroid,
  LogoApple,
  LogoWindows,
  PhonePortraitOutline,
} from '@vicons/ionicons5';
import { NAlert, NIcon, NSwitch, useMessage } from 'naive-ui';
import { computed, onMounted, ref, watch } from 'vue';

import type {
  RegistrationPlatformRestrictions,
  RegistrationVerificationConfigPayload,
} from '#/api/core/registration-verification';
import {
  fetchRegistrationVerificationConfig,
  saveRegistrationVerificationConfigApi,
} from '#/api/core/registration-verification';

type PlatformKey = 'pc' | 'apple' | 'android' | 'other';

const message = useMessage();
const loading = ref(false);
const savingRegister = ref(false);
const savingLogin = ref(false);
const savingPlatform = ref(false);
const savingPageStyle = ref(false);

const meta = ref({
  scope: 'global',
  scopeValue: 'default',
  version: 0,
});

const config = ref<RegistrationVerificationConfigPayload | null>(null);
const registerSupport = ref<
  RegistrationVerificationConfigPayload['publicPage']['registerSupport']
>({
  phone: true,
  email: false,
  memberAccount: true,
  defaultRegisterMethod: 'member_account',
});
const loginSupport = ref<
  RegistrationVerificationConfigPayload['publicPage']['loginSupport']
>({
  phone: true,
  email: false,
  memberAccount: true,
});
const defaultLoginMethod = ref<'phone' | 'email' | 'member_account'>(
  'member_account',
);

const pageStyle = ref({
  sloganPrefix: '',
  sloganPrefixColor: '#ff1900',
  sloganHighlight: '',
  sloganHighlightColor: '#24ee89',
});

const pageStylePreview = computed(
  () =>
    Boolean(
      pageStyle.value.sloganPrefix.trim() ||
        pageStyle.value.sloganHighlight.trim(),
    ),
);

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

const platformOptions = computed(() => [
  {
    key: 'pc' as PlatformKey,
    label: $t('user.registrationVerification.platformPc'),
    description: $t('user.registrationVerification.platformPcDesc'),
    icon: LogoWindows,
    color: '#0078d4',
    allowField: 'allowPc' as keyof RegistrationPlatformRestrictions,
  },
  {
    key: 'apple' as PlatformKey,
    label: $t('user.registrationVerification.platformApple'),
    description: $t('user.registrationVerification.platformAppleDesc'),
    icon: LogoApple,
    color: '#333333',
    allowField: 'allowApple' as keyof RegistrationPlatformRestrictions,
  },
  {
    key: 'android' as PlatformKey,
    label: $t('user.registrationVerification.platformAndroid'),
    description: $t('user.registrationVerification.platformAndroidDesc'),
    icon: LogoAndroid,
    color: '#3ddc84',
    allowField: 'allowAndroid' as keyof RegistrationPlatformRestrictions,
  },
  {
    key: 'other' as PlatformKey,
    label: $t('user.registrationVerification.platformOther'),
    description: $t('user.registrationVerification.platformOtherDesc'),
    icon: PhonePortraitOutline,
    color: '#8c8c8c',
    allowField: 'allowOther' as keyof RegistrationPlatformRestrictions,
  },
]);

function isPlatformAllowed(key: PlatformKey): boolean {
  const field = platformOptions.value.find((p) => p.key === key)?.allowField;
  if (!field || field === 'enabled') return true;
  return platformRestrictions.value[field] !== false;
}

function setPlatformAllowed(key: PlatformKey, allowed: boolean) {
  const field = platformOptions.value.find((p) => p.key === key)?.allowField;
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
  const blocked = platformOptions.value
    .filter((p) => !isPlatformAllowed(p.key))
    .map((p) => p.label);
  if (blocked.length === 0) {
    return $t('user.registrationVerification.allPlatformsOpen');
  }
  return $t('user.registrationVerification.platformsBlocked', [
    blocked.join('、'),
  ]);
});

const registerDefaultOptions = computed(() => {
  const opts: Array<{
    label: string;
    value: 'phone' | 'email' | 'member_account';
  }> = [];
  if (registerSupport.value.phone) {
    opts.push({
      label: $t('user.registrationVerification.phoneNumber'),
      value: 'phone',
    });
  }
  if (registerSupport.value.email) {
    opts.push({
      label: $t('user.registrationVerification.email'),
      value: 'email',
    });
  }
  if (registerSupport.value.memberAccount) {
    opts.push({ label: $t('common.memberAccount'), value: 'member_account' });
  }
  return opts;
});

const loginDefaultOptions = computed(() => {
  const opts: Array<{
    label: string;
    value: 'phone' | 'email' | 'member_account';
  }> = [];
  if (loginSupport.value.phone) {
    opts.push({
      label: $t('user.registrationVerification.phoneNumber'),
      value: 'phone',
    });
  }
  if (loginSupport.value.email) {
    opts.push({
      label: $t('user.registrationVerification.email'),
      value: 'email',
    });
  }
  if (loginSupport.value.memberAccount) {
    opts.push({ label: $t('common.memberAccount'), value: 'member_account' });
  }
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
  message.info($t('user.registrationVerification.comingSoonHint', [name]));
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
  config.value = JSON.parse(
    JSON.stringify(data),
  ) as RegistrationVerificationConfigPayload;
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
  pageStyle.value = {
    sloganPrefix: data.pageStyle?.sloganPrefix ?? '',
    sloganPrefixColor: data.pageStyle?.sloganPrefixColor || '#ff1900',
    sloganHighlight: data.pageStyle?.sloganHighlight ?? '',
    sloganHighlightColor: data.pageStyle?.sloganHighlightColor || '#24ee89',
  };
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

async function onSavePlatformRestrictions() {
  if (!config.value) return;
  if (allPlatformsBlocked.value) {
    message.warning($t('user.registrationVerification.keepOnePlatform'));
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
    message.success($t('user.registrationVerification.platformSaved'));
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
    nextConfig.publicPage.registerSupport = JSON.parse(
      JSON.stringify(registerSupport.value),
    );
    nextConfig.publicPage.loginSupport.defaultLoginMethod =
      defaultLoginMethod.value;
    nextConfig.registrationSupportMethods.channels.phone =
      registerSupport.value.phone;
    nextConfig.registrationSupportMethods.channels.email =
      registerSupport.value.email;
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
    message.success($t('user.registrationVerification.registerSaved'));
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
    nextConfig.publicPage.loginSupport = JSON.parse(
      JSON.stringify(loginSupport.value),
    );
    nextConfig.publicPage.loginSupport.defaultLoginMethod =
      defaultLoginMethod.value;
    const d = await saveRegistrationVerificationConfigApi({
      scope: meta.value.scope,
      scopeValue: meta.value.scopeValue,
      config: nextConfig as unknown as Record<string, unknown>,
    });
    meta.value.version = d.version;
    applyFromConfig(d.config);
    message.success($t('user.registrationVerification.loginSaved'));
  } catch (e) {
    message.error((e as Error).message);
  } finally {
    savingLogin.value = false;
  }
}

async function onSavePageStyle() {
  if (!config.value) return;
  savingPageStyle.value = true;
  try {
    const nextConfig = JSON.parse(
      JSON.stringify(config.value),
    ) as RegistrationVerificationConfigPayload;
    const sloganPrefix = pageStyle.value.sloganPrefix.trim();
    const sloganHighlight = pageStyle.value.sloganHighlight.trim();
    nextConfig.pageStyle = {
      displayMode: nextConfig.pageStyle?.displayMode || 'modal',
      displayStyle: nextConfig.pageStyle?.displayStyle || 'default',
      slogan: [sloganPrefix, sloganHighlight].filter(Boolean).join(' '),
      sloganPrefix,
      sloganPrefixColor: pageStyle.value.sloganPrefixColor,
      sloganHighlight,
      sloganHighlightColor: pageStyle.value.sloganHighlightColor,
    };
    const d = await saveRegistrationVerificationConfigApi({
      scope: meta.value.scope,
      scopeValue: meta.value.scopeValue,
      config: nextConfig as unknown as Record<string, unknown>,
    });
    meta.value.version = d.version;
    applyFromConfig(d.config);
    message.success($t('user.registrationVerification.authHeaderPromoSaved'));
  } catch (e) {
    message.error((e as Error).message);
  } finally {
    savingPageStyle.value = false;
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

.setting-card-hint {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.4;
  color: #6b7280;
  font-weight: 400;
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

.text-input {
  width: 100%;
  max-width: 480px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  color: #111827;
}

.text-input::placeholder {
  color: #bfbfbf;
}

.slogan-preview {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.slogan-preview-prefix {
  margin-right: 6px;
}

.slogan-preview-highlight {
  /* color set via inline style */
}

.text-color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-color-row .text-input {
  flex: 1;
}

.color-picker-label {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.color-swatch {
  display: block;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}

.color-input-native {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  border: none;
  padding: 0;
}
</style>
