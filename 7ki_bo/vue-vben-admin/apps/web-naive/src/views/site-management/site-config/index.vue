<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { Page } from '@vben/common-ui';
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  createSiteApi,
  getSiteEndpointDomainsApi,
  listSitesApi,
  publishSiteApi,
  putSiteEndpointsApi,
  type SiteRecord,
  updateSiteApi,
} from '#/api/core/sites';

const message = useMessage();
const loading = ref(false);
const showSiteModal = ref(false);
const showEndpointsModal = ref(false);
const editingSite = ref<SiteRecord | null>(null);
const endpointDomains = ref<string[]>([]);

const siteForm = reactive({
  siteCode: '',
  displayName: '',
  brandCode: '',
  status: 'active',
});

const endpointRows = ref<Array<{ domain: string; url: string }>>([]);

/** API 存英文枚举；界面展示中文 */
const SITE_STATUS_LABELS: Record<string, string> = {
  active: '运行中',
  suspended: '已暂停',
  provisioning: '配置中',
};

const statusOptions = [
  { label: SITE_STATUS_LABELS.active, value: 'active' },
  { label: SITE_STATUS_LABELS.suspended, value: 'suspended' },
  { label: SITE_STATUS_LABELS.provisioning, value: 'provisioning' },
];

function siteStatusTagType(status: string): 'success' | 'warning' | 'default' {
  if (status === 'active') return 'success';
  if (status === 'suspended') return 'warning';
  return 'default';
}

function siteStatusLabel(status: string): string {
  return SITE_STATUS_LABELS[status] ?? status;
}

const columns = computed<DataTableColumns<SiteRecord>>(() => [
  { title: '站点代码', key: 'siteCode', width: 140 },
  { title: '显示名称', key: 'displayName', minWidth: 160 },
  { title: '品牌代码', key: 'brandCode', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 110,
    render: (row) =>
      h(
        NTag,
        { type: siteStatusTagType(row.status), size: 'small' },
        () => siteStatusLabel(row.status),
      ),
  },
  { title: '域名数', key: 'domainCount', width: 90 },
  {
    title: 'DB 端点',
    key: 'databaseEndpoints',
    minWidth: 200,
    render: (row) =>
      (row.databaseEndpoints || [])
        .map((e) => e.domain)
        .join(', ') || '-',
  },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    render: (row) =>
      h(NSpace, { size: 8 }, () => [
        h(
          NButton,
          { size: 'small', onClick: () => openEditSite(row) },
          () => '编辑',
        ),
        h(
          NButton,
          { size: 'small', onClick: () => openEndpoints(row) },
          () => '数据库',
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handlePublish(row),
          },
          () => '发布',
        ),
      ]),
  },
]);

const tableData = ref<SiteRecord[]>([]);

function resetSiteForm() {
  siteForm.siteCode = '';
  siteForm.displayName = '';
  siteForm.brandCode = '';
  siteForm.status = 'active';
}

function unwrapList<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) return resp;
  const data = (resp as { data?: unknown })?.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

async function loadSites() {
  loading.value = true;
  try {
    const resp = await listSitesApi();
    tableData.value = unwrapList<SiteRecord>(resp);
  } catch (error: any) {
    message.error(error?.message || '加载站点失败');
  } finally {
    loading.value = false;
  }
}

async function loadEndpointDomains() {
  try {
    const resp = await getSiteEndpointDomainsApi();
    endpointDomains.value = unwrapList<string>(resp);
  } catch {
    endpointDomains.value = [
      'auth',
      'user',
      'wallet',
      'payment',
      'game',
      'cms',
      'system',
      'billing',
    ];
  }
}

function openCreateSite() {
  editingSite.value = null;
  resetSiteForm();
  showSiteModal.value = true;
}

function openEditSite(row: SiteRecord) {
  editingSite.value = row;
  siteForm.siteCode = row.siteCode;
  siteForm.displayName = row.displayName;
  siteForm.brandCode = row.brandCode || '';
  siteForm.status = row.status;
  showSiteModal.value = true;
}

function openEndpoints(row: SiteRecord) {
  editingSite.value = row;
  const existing = new Map(
    (row.databaseEndpoints || []).map((e) => [e.domain, e.url]),
  );
  endpointRows.value = endpointDomains.value.map((domain) => ({
    domain,
    url: existing.get(domain) || '',
  }));
  showEndpointsModal.value = true;
}

async function saveSite() {
  if (!siteForm.siteCode.trim() || !siteForm.displayName.trim()) {
    message.error('站点代码和显示名称必填');
    return;
  }
  try {
    if (editingSite.value) {
      await updateSiteApi(editingSite.value.id, {
        displayName: siteForm.displayName.trim(),
        brandCode: siteForm.brandCode.trim() || undefined,
        status: siteForm.status,
      });
      message.success('站点已更新');
    } else {
      await createSiteApi({
        siteCode: siteForm.siteCode.trim(),
        displayName: siteForm.displayName.trim(),
        brandCode: siteForm.brandCode.trim() || undefined,
        status: siteForm.status,
      });
      message.success('站点已创建');
    }
    showSiteModal.value = false;
    await loadSites();
  } catch (error: any) {
    message.error(error?.message || '保存失败');
  }
}

async function saveEndpoints() {
  if (!editingSite.value) return;
  const endpoints = endpointRows.value
    .filter((row) => row.url.trim())
    .map((row) => ({
      domain: row.domain,
      url: row.url.trim(),
    }));
  try {
    await putSiteEndpointsApi(editingSite.value.id, endpoints);
    message.success('数据库端点已保存并发布');
    showEndpointsModal.value = false;
    await loadSites();
  } catch (error: any) {
    message.error(error?.message || '保存端点失败');
  }
}

async function handlePublish(row: SiteRecord) {
  try {
    await publishSiteApi(row.id);
    message.success(`已发布站点 ${row.siteCode} 的域名缓存`);
  } catch (error: any) {
    message.error(error?.message || '发布失败');
  }
}

onMounted(async () => {
  await loadEndpointDomains();
  await loadSites();
});
</script>

<template>
  <Page title="站点配置" description="">
    <template #extra>
      <NButton type="primary" @click="openCreateSite">新建站点</NButton>
    </template>
    <NCard>
      <NDataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :bordered="false"
        :scroll-x="960"
      />
    </NCard>

    <NModal
      v-model:show="showSiteModal"
      preset="card"
      :title="editingSite ? '编辑站点' : '新建站点'"
      style="width: 520px"
    >
      <NForm label-placement="left" label-width="100">
        <NFormItem label="站点代码" required>
          <NInput
            v-model:value="siteForm.siteCode"
            :disabled="!!editingSite"
            placeholder="例如 brand-a"
          />
        </NFormItem>
        <NFormItem label="显示名称" required>
          <NInput v-model:value="siteForm.displayName" />
        </NFormItem>
        <NFormItem label="品牌代码">
          <NInput v-model:value="siteForm.brandCode" placeholder="CMS skin code" />
        </NFormItem>
        <NFormItem label="状态">
          <NSelect v-model:value="siteForm.status" :options="statusOptions" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showSiteModal = false">取消</NButton>
          <NButton type="primary" @click="saveSite">保存</NButton>
        </NSpace>
      </template>
    </NModal>

    <NModal
      v-model:show="showEndpointsModal"
      preset="card"
      :title="`数据库端点 — ${editingSite?.displayName || ''}`"
      style="width: 720px"
    >
      <div class="space-y-3">
        <div
        v-for="(row, idx) in endpointRows"
        :key="row.domain"
        class="mb-3 flex gap-2"
      >
        <NInput :value="row.domain" disabled style="width: 140px" />
        <NInput
          v-model:value="endpointRows[idx]!.url"
          placeholder="postgresql://..."
          type="password"
          show-password-on="click"
        />
        </div>
      </div>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showEndpointsModal = false">取消</NButton>
          <NButton type="primary" @click="saveEndpoints">保存并发布</NButton>
        </NSpace>
      </template>
    </NModal>
  </Page>
</template>
