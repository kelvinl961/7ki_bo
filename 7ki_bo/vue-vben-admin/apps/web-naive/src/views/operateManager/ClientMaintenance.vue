<template>
  <div class="h-full bg-gray-50 p-6">
    <div class="mb-4">
      <h1 class="mb-2 text-2xl font-semibold text-gray-900">
        {{ $t('operations.clientMaintenance.title') }}
      </h1>
      <p class="text-sm text-gray-600">
        {{ $t('operations.clientMaintenance.description') }}
      </p>
    </div>

    <n-spin :show="loading">
      <div class="max-w-2xl rounded-lg border bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-center justify-between gap-4">
          <div>
            <div class="text-sm font-medium text-gray-900">
              {{ $t('operations.clientMaintenance.switch') }}
            </div>
            <div class="mt-1 text-xs text-gray-500">
              {{
                enabled
                  ? $t('operations.clientMaintenance.switchOn')
                  : $t('operations.clientMaintenance.switchOff')
              }}
            </div>
          </div>
          <n-switch v-model:value="enabled" />
        </div>

        <div class="mb-6">
          <div class="mb-2 text-sm font-medium text-gray-900">
            {{ $t('operations.clientMaintenance.message') }}
          </div>
          <n-input
            v-model:value="maintenanceMessage"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            :placeholder="$t('operations.clientMaintenance.messagePlaceholder')"
          />
        </div>

        <n-button type="primary" :loading="saving" @click="save">
          {{ $t('operations.clientMaintenance.save') }}
        </n-button>
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useI18n } from '@vben/locales';
import { NButton, NInput, NSpin, NSwitch, useMessage } from 'naive-ui';

import { systemConfigApi } from '#/api/system/systemConfig';

const CATEGORY = 'app_settings';
const SCOPE = 'global';
const SCOPE_VALUE = 'default';

const { t } = useI18n();
const message = useMessage();
const loading = ref(false);
const saving = ref(false);
const enabled = ref(false);
const maintenanceMessage = ref('');

function readEnabled(value: unknown): boolean {
  return value === true || value === 'true';
}

onMounted(async () => {
  loading.value = true;
  try {
    const resp = await systemConfigApi.getConfigsByCategory(
      CATEGORY,
      SCOPE,
      SCOPE_VALUE,
    );
    const data = resp.data ?? {};
    enabled.value = readEnabled(data.maintenance_mode?.value);
    const storedMessage = data.maintenance_message?.value;
    maintenanceMessage.value =
      typeof storedMessage === 'string' ? storedMessage : '';
  } catch (error) {
    console.error('Failed to load client maintenance settings', error);
    message.error(t('operations.clientMaintenance.loadFailed'));
  } finally {
    loading.value = false;
  }
});

async function save() {
  saving.value = true;
  try {
    const resp = await systemConfigApi.batchSaveConfigs([
      {
        category: CATEGORY,
        key: 'maintenance_mode',
        value: enabled.value,
        dataType: 'boolean',
        scope: SCOPE,
        scopeValue: SCOPE_VALUE,
        description: 'Show the client maintenance page',
      },
      {
        category: CATEGORY,
        key: 'maintenance_message',
        value: maintenanceMessage.value.trim(),
        dataType: 'string',
        scope: SCOPE,
        scopeValue: SCOPE_VALUE,
        description: 'Optional client maintenance description',
      },
    ]);
    if (!resp.success) {
      message.error(resp.message || t('operations.clientMaintenance.saveFailed'));
      return;
    }
    message.success(t('operations.clientMaintenance.saved'));
  } catch (error) {
    console.error('Failed to save client maintenance settings', error);
    message.error(t('operations.clientMaintenance.saveFailed'));
  } finally {
    saving.value = false;
  }
}
</script>
