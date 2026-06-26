<script setup lang="ts">
import { $t } from '@vben/locales';

import { computed, h, onMounted, reactive, ref } from 'vue';
import {
  NButton,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NPopconfirm,
  NSelect,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  createMerchantApi,
  deleteMerchantApi,
  getMerchantsApi,
  type MerchantItem,
  updateMerchantApi,
} from '#/api/core/merchants';

const message = useMessage();
const loading = ref(false);
const showModal = ref(false);
const editingId = ref<null | string>(null);
const isMerchantRole = computed(() => {
  const roles = JSON.parse(localStorage.getItem('userInfo') || '{}')?.roles || [];
  return String(roles?.[0] || '').toUpperCase() === 'MERCHANT';
});

const query = reactive({ page: 1, limit: 20, search: '' });
const tableData = ref<MerchantItem[]>([]);
const total = ref(0);
const form = reactive({
  merchantId: '',
  name: '',
  secretKey: '',
  webhookUrl: '',
  status: 'active',
  configText: '',
});

function resetForm() {
  form.merchantId = '';
  form.name = '';
  form.secretKey = '';
  form.webhookUrl = '';
  form.status = 'active';
  form.configText = '';
}

async function loadData() {
  loading.value = true;
  try {
    const resp: any = await getMerchantsApi(query);
    tableData.value = resp?.data?.records || [];
    total.value = resp?.data?.total || 0;
  } catch (error: any) {
    message.error(error?.message || $t('merchants.loadFailed'));
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  resetForm();
  showModal.value = true;
}

function openEdit(row: MerchantItem) {
  editingId.value = row.id;
  form.merchantId = row.merchantId;
  form.name = row.name;
  form.status = row.status;
  form.secretKey = '';
  form.webhookUrl = row.webhookUrl || '';
  form.configText = row.config ? JSON.stringify(row.config, null, 2) : '';
  showModal.value = true;
}

async function saveMerchant() {
  try {
    if (!form.merchantId.trim() || !form.name.trim()) {
      message.error($t('merchants.idAndNameRequired'));
      return;
    }
    if (!editingId.value && !form.secretKey.trim()) {
      message.error($t('merchants.secretKeyRequired'));
      return;
    }
    let parsedConfig: any = null;
    if (form.configText.trim()) {
      try {
        parsedConfig = JSON.parse(form.configText);
      } catch {
        message.error($t('merchants.invalidJson'));
        return;
      }
    }
    const payload: any = {
      merchantId: form.merchantId,
      name: form.name,
      status: form.status,
      webhookUrl: form.webhookUrl || undefined,
      config: parsedConfig,
    };
    if (form.secretKey.trim()) payload.secretKey = form.secretKey.trim();
    if (editingId.value) {
      await updateMerchantApi(editingId.value, payload);
      message.success($t('common.saveSuccess'));
    } else {
      await createMerchantApi(payload);
      message.success($t('common.operationSuccess'));
    }
    showModal.value = false;
    await loadData();
  } catch (error: any) {
    message.error(error?.message || $t('merchants.saveFailed'));
  }
}

async function removeMerchant(id: string) {
  try {
    await deleteMerchantApi(id);
    message.success($t('common.deleteSuccess'));
    await loadData();
  } catch (error: any) {
    message.error(error?.message || $t('merchants.deleteFailed'));
  }
}

const columns = computed<DataTableColumns<MerchantItem>>(() => [
  { title: $t('merchants.merchantId'), key: 'merchantId', width: 180 },
  { title: $t('common.name'), key: 'name', width: 220 },
  {
    title: $t('common.status'),
    key: 'status',
    width: 120,
    render: (row) =>
      h(
        NTag,
        { type: row.status === 'ACTIVE' ? 'success' : 'warning' },
        { default: () => row.status },
      ),
  },
  { title: 'Webhook', key: 'webhookUrl', ellipsis: { tooltip: true } },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 220,
    render: (row) =>
      h('div', { class: 'flex gap-2' }, [
        h(
          NButton,
          { size: 'small', onClick: () => openEdit(row) },
          { default: () => $t('common.edit') },
        ),
        !isMerchantRole.value
          ? h(
              NPopconfirm,
              { onPositiveClick: () => removeMerchant(row.id) },
              {
                trigger: () =>
                  h(NButton, { size: 'small', type: 'error' }, { default: () => $t('common.delete') }),
                default: () => $t('merchants.confirmDelete'),
              },
            )
          : null,
      ]),
  },
]);

onMounted(loadData);
</script>

<template>
  <div class="p-4">
    <div class="mb-3 flex items-center gap-2">
      <n-input v-model:value="query.search" :placeholder="$t('merchants.searchPlaceholder')" class="w-64" />
      <n-button type="primary" @click="loadData">{{ $t('common.search') }}</n-button>
      <n-button v-if="!isMerchantRole" type="success" @click="openCreate">{{ $t('merchants.createMerchant') }}</n-button>
    </div>

    <n-data-table
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="{ page: query.page, pageSize: query.limit, itemCount: total }"
    />

    <n-modal v-model:show="showModal" preset="card" :title="$t('merchants.title')" class="max-w-[520px]">
      <n-form label-placement="left" label-width="90">
        <n-form-item :label="$t('merchants.merchantId')">
          <n-input v-model:value="form.merchantId" :disabled="isMerchantRole" />
        </n-form-item>
        <n-form-item :label="$t('common.name')">
          <n-input v-model:value="form.name" />
        </n-form-item>
        <n-form-item label="Secret Key">
          <n-input v-model:value="form.secretKey" type="password" show-password-on="click" />
        </n-form-item>
        <n-form-item label="Webhook URL">
          <n-input v-model:value="form.webhookUrl" />
        </n-form-item>
        <n-form-item v-if="!isMerchantRole" :label="$t('common.status')">
          <n-select
            v-model:value="form.status"
            :options="[{ label: 'active', value: 'active' }, { label: 'suspended', value: 'suspended' }, { label: 'pending', value: 'pending' }]"
          />
        </n-form-item>
        <n-form-item label="Config JSON">
          <n-input v-model:value="form.configText" type="textarea" :autosize="{ minRows: 4, maxRows: 10 }" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="saveMerchant">{{ $t('common.save') }}</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
