<template>
  <Page auto-content-height title="注册和验证" description="">
    <div class="registration-verification-layout flex min-h-[calc(100vh-140px)] flex-col bg-[#f5f7fa]">
      <n-card :bordered="false" class="mb-3 rounded-lg shadow-sm" size="small">
        <n-tabs v-model:value="topTab" type="line" size="medium">
          <n-tab-pane name="login-register" tab="登录/注册配置">
            <n-layout
              has-sider
              class="mt-3 rounded-lg bg-transparent"
              style="min-height: 520px"
            >
              <n-layout-sider
                bordered
                :width="200"
                content-style="padding: 12px 0; background: #fff"
                class="rounded-l-lg shadow-sm"
              >
                <n-menu v-model:value="sideKey" :options="sideMenuOptions" />
              </n-layout-sider>
              <n-layout-content
                content-style="padding: 0; background: transparent"
                class="pl-3"
              >
                <n-spin :show="loading">
                  <template v-if="sideKey === 'register-support' && rs">
              <n-card :bordered="false" class="rounded-lg shadow-sm">
                <template #header>
                  <div class="text-base font-medium text-gray-800">
                    注册支持方式
                  </div>
                </template>
                <div class="mb-4 flex justify-end gap-2 border-b border-gray-100 pb-4">
                  <n-button @click="onCancel">取消</n-button>
                  <n-button type="primary" :loading="saving" @click="onSave">
                    保存
                  </n-button>
                </div>

                <!-- 支持方式 -->
                <div class="mb-6">
                  <div class="mb-3 text-sm font-medium text-gray-700">支持方式</div>
                  <n-space vertical :size="12">
                    <div class="flex flex-wrap items-center gap-2">
                      <n-checkbox v-model:checked="rs.channels.phone">
                        手机号码
                      </n-checkbox>
                      <n-button
                        text
                        type="primary"
                        size="tiny"
                        @click="hintComingSoon('短信配置')"
                      >
                        (短信配置)
                      </n-button>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <n-checkbox v-model:checked="rs.channels.email">
                        邮箱
                      </n-checkbox>
                      <n-button
                        text
                        type="primary"
                        size="tiny"
                        @click="hintComingSoon('邮箱验证')"
                      >
                        (邮箱配置)
                      </n-button>
                    </div>
                    <n-checkbox v-model:checked="rs.channels.memberAccount">
                      会员账号
                    </n-checkbox>
                  </n-space>
                  <div class="mt-4 max-w-md">
                    <div class="mb-2 text-sm text-gray-600">默认注册方式</div>
                    <n-select
                      v-model:value="rs.defaultChannel"
                      :options="defaultChannelSelectOptions"
                      placeholder="选择默认方式"
                    />
                  </div>
                </div>

                <!-- 手机号码注册 -->
                <template v-if="rs.channels.phone">
                  <n-divider title-placement="left">手机号码注册</n-divider>
                  <div class="mb-4">
                    <div class="mb-2 text-sm text-gray-600">
                      手机号码支持的注册方式
                    </div>
                    <n-space vertical :size="8">
                      <n-checkbox v-model:checked="rs.phone.allowPasswordRegister">
                        密码注册
                      </n-checkbox>
                      <n-checkbox v-model:checked="rs.phone.allowSmsCodeRegister">
                        短信验证码注册
                      </n-checkbox>
                    </n-space>
                  </div>
                  <div class="mb-4">
                    <div class="mb-2 text-sm text-gray-600">
                      手机注册是否强制验证
                    </div>
                    <n-radio-group v-model:value="rs.phone.smsVerification">
                      <n-space vertical :size="8">
                        <n-radio value="new_number_skip">
                          不强制（新号码免验证）
                        </n-radio>
                        <n-radio value="required">必须通过短信验证</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>
                  <div class="mb-4">
                    <div class="mb-2 text-sm text-gray-600">
                      手机号码注册默认输入框
                    </div>
                    <n-radio-group v-model:value="rs.phone.defaultRegisterInput">
                      <n-space vertical :size="8">
                        <n-radio value="password">密码输入框</n-radio>
                        <n-radio value="sms_code">短信验证码输入框</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>
                  <div class="mb-4">
                    <div class="mb-2 text-sm text-gray-600">
                      注册的手机号码输入框
                    </div>
                    <n-radio-group v-model:value="rs.phone.phoneFieldLayout">
                      <n-space vertical :size="8">
                        <n-radio value="merged">输入框合并任选其一</n-radio>
                        <n-radio value="split_required">
                          拆开独立展示且必填
                        </n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>
                  <div class="mb-2">
                    <div class="mb-2 text-sm text-gray-600">
                      手机注册第二步设置账号弹窗
                    </div>
                    <n-radio-group
                      v-model:value="rs.phone.secondStepSetAccountModal"
                    >
                      <n-space vertical :size="8">
                        <n-radio :value="true">
                          开启（设置会员账号弹窗）
                        </n-radio>
                        <n-radio :value="false">关闭</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>
                </template>

                <!-- 邮箱注册 -->
                <template v-if="rs.channels.email">
                  <n-divider title-placement="left">邮箱注册</n-divider>
                  <div class="mb-4">
                    <div class="mb-2 text-sm text-gray-600">
                      邮箱支持的注册方式
                    </div>
                    <n-space vertical :size="8">
                      <n-checkbox
                        v-model:checked="rs.email.allowPasswordRegister"
                      >
                        密码注册
                      </n-checkbox>
                      <n-checkbox
                        v-model:checked="rs.email.allowEmailCodeRegister"
                      >
                        邮箱验证码注册
                      </n-checkbox>
                    </n-space>
                  </div>
                  <div class="mb-4">
                    <div class="mb-2 text-sm text-gray-600">
                      邮箱注册是否强制验证
                    </div>
                    <n-radio-group v-model:value="rs.email.emailVerification">
                      <n-space vertical :size="8">
                        <n-radio value="new_email_skip">
                          不强制（新邮箱免验证）
                        </n-radio>
                        <n-radio value="required">必须通过邮箱验证</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>
                  <div class="mb-4">
                    <div class="mb-2 text-sm text-gray-600">
                      邮箱注册默认输入框
                    </div>
                    <n-radio-group v-model:value="rs.email.defaultRegisterInput">
                      <n-space vertical :size="8">
                        <n-radio value="password">密码输入框</n-radio>
                        <n-radio value="email_code">邮箱验证码输入框</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>
                  <div class="mb-4">
                    <div class="mb-2 text-sm text-gray-600">注册的邮箱输入框</div>
                    <n-radio-group v-model:value="rs.email.emailFieldLayout">
                      <n-space vertical :size="8">
                        <n-radio value="merged">输入框合并并任选其一</n-radio>
                        <n-radio value="split_required">
                          拆开独立展示且必填
                        </n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>
                  <div class="mb-2">
                    <div class="mb-2 text-sm text-gray-600">
                      邮箱注册第二步设置账号弹窗
                    </div>
                    <n-radio-group
                      v-model:value="rs.email.secondStepSetAccountModal"
                    >
                      <n-space vertical :size="8">
                        <n-radio :value="true">
                          开启（设置会员账号弹窗）
                        </n-radio>
                        <n-radio :value="false">关闭</n-radio>
                      </n-space>
                    </n-radio-group>
                  </div>
                </template>
              </n-card>
                  </template>

                  <n-card
                    v-else
                    :bordered="false"
                    class="flex min-h-[400px] items-center justify-center rounded-lg shadow-sm"
                  >
                    <n-empty description="该模块开发中，敬请期待" />
                  </n-card>
                </n-spin>
              </n-layout-content>
            </n-layout>
          </n-tab-pane>
          <n-tab-pane name="security" tab="安全中心配置">
            <div class="mt-4 flex min-h-[360px] items-center justify-center">
              <n-empty description="敬请期待" />
            </div>
          </n-tab-pane>
          <n-tab-pane name="third-bind" tab="绑定三方配置">
            <div class="mt-4 flex min-h-[360px] items-center justify-center">
              <n-empty description="敬请期待" />
            </div>
          </n-tab-pane>
          <n-tab-pane name="sms" tab="短信配置">
            <div class="mt-4 flex min-h-[360px] items-center justify-center">
              <n-empty description="敬请期待" />
            </div>
          </n-tab-pane>
          <n-tab-pane name="email" tab="邮箱验证">
            <div class="mt-4 flex min-h-[360px] items-center justify-center">
              <n-empty description="敬请期待" />
            </div>
          </n-tab-pane>
          <n-tab-pane name="kyc" tab="KYC验证配置">
            <div class="mt-4 flex min-h-[360px] items-center justify-center">
              <n-empty description="敬请期待" />
            </div>
          </n-tab-pane>
          <n-tab-pane name="member-basic" tab="会员基本信息设置">
            <div class="mt-4 flex min-h-[360px] items-center justify-center">
              <n-empty description="敬请期待" />
            </div>
          </n-tab-pane>
          <n-tab-pane name="risk" tab="防刷风控">
            <div class="mt-4 flex min-h-[360px] items-center justify-center">
              <n-empty description="敬请期待" />
            </div>
          </n-tab-pane>
          <n-tab-pane name="ext-api" tab="外部注册API配置">
            <div class="mt-4 flex min-h-[360px] items-center justify-center">
              <n-empty description="敬请期待" />
            </div>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { Page } from '@vben/common-ui';
import type { MenuOption } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { computed, onMounted, ref, watch } from 'vue';

import type { RegistrationSupportMethods } from '#/api/core/registration-verification';
import {
  fetchRegistrationVerificationConfig,
  saveRegistrationVerificationConfigApi,
} from '#/api/core/registration-verification';

const message = useMessage();
const loading = ref(false);
const saving = ref(false);
const topTab = ref('login-register');
const sideKey = ref('register-support');

const meta = ref({
  scope: 'global',
  scopeValue: 'default',
  version: 0,
});

const rs = ref<RegistrationSupportMethods | null>(null);

const sideMenuOptions: MenuOption[] = [
  { label: '免注册配置', key: 'guest' },
  { label: '公共配置', key: 'public' },
  { label: '注册支持方式', key: 'register-support' },
  { label: '登录支持方式', key: 'login-support' },
  { label: '注册页其他输入框配置', key: 'register-fields' },
  { label: '展示样式', key: 'display-style' },
  { label: '注册成功弹窗配置', key: 'register-success' },
  { label: '用户协议配置', key: 'user-agreement' },
];

const defaultChannelSelectOptions = computed(() => {
  const r = rs.value;
  if (!r) return [];
  const opts: { label: string; value: RegistrationSupportMethods['defaultChannel'] }[] = [];
  if (r.channels.phone) opts.push({ label: '手机号码', value: 'phone' });
  if (r.channels.email) opts.push({ label: '邮箱', value: 'email' });
  if (r.channels.memberAccount) {
    opts.push({ label: '会员账号', value: 'member_account' });
  }
  return opts;
});

function ensureDefaultChannelValid() {
  const r = rs.value;
  if (!r) return;
  const allowed = defaultChannelSelectOptions.value.map((o) => o.value);
  if (allowed.length === 0) return;
  if (!allowed.includes(r.defaultChannel)) {
    r.defaultChannel = allowed[0]!;
  }
}

watch(
  () => rs.value?.channels,
  () => ensureDefaultChannelValid(),
  { deep: true },
);

function hintComingSoon(name: string) {
  message.info(`「${name}」请从对应顶栏菜单进入（开发中可在此接入路由）`);
}

function applyRegistrationSupportFromConfig(
  data: import('#/api/core/registration-verification').RegistrationVerificationConfigPayload,
) {
  rs.value = JSON.parse(
    JSON.stringify(data.registrationSupportMethods),
  ) as RegistrationSupportMethods;
  ensureDefaultChannelValid();
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
    applyRegistrationSupportFromConfig(d.config);
  } catch (e) {
    message.error((e as Error).message);
  } finally {
    loading.value = false;
  }
}

async function onCancel() {
  await load();
  message.success('已恢复为服务器配置');
}

async function onSave() {
  if (!rs.value) return;
  ensureDefaultChannelValid();
  saving.value = true;
  try {
    const payload: RegistrationSupportMethods = JSON.parse(JSON.stringify(rs.value));
    const d = await saveRegistrationVerificationConfigApi({
      scope: meta.value.scope,
      scopeValue: meta.value.scopeValue,
      config: { registrationSupportMethods: payload },
    });
    meta.value.version = d.version;
    applyRegistrationSupportFromConfig(d.config);
    message.success('保存成功');
  } catch (e) {
    message.error((e as Error).message);
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  load();
});
</script>
