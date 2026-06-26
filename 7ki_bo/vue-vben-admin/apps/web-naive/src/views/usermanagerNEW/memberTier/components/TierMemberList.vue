<template>
  <div class="tier-member-list">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">
          {{ tierName }} - {{ $t('user.tierMemberList.memberList') }}
        </h3>
        <p class="text-sm text-gray-600">
          {{ $t('user.tierMemberList.memberCount', [paginationState.itemCount]) }}
        </p>
      </div>
      <n-button @click="handleRefresh">
        <template #icon>
          <n-icon><RefreshIcon /></n-icon>
        </template>
        {{ $t('common.refresh') }}
      </n-button>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <n-input
        v-model:value="searchKeyword"
        :placeholder="$t('user.tierMemberList.searchPlaceholder')"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <n-icon><SearchIcon /></n-icon>
        </template>
      </n-input>
    </div>

    <!-- Member Table -->
    <n-data-table
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :remote="true"
      size="small"
      striped
      style="height: 400px"
      flex-height
    />
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, onMounted, h } from 'vue';
import {
  NDataTable,
  NButton,
  NIcon,
  NInput,
  NTag,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
} from 'naive-ui';
import {
  RefreshOutline as RefreshIcon,
  SearchOutline as SearchIcon,
  PersonOutline as PersonIcon,
  CheckmarkCircleOutline as VerifiedIcon,
  CloseCircleOutline as BannedIcon,
} from '@vicons/ionicons5';
import {
  getTierMembersApi,
  type TierMember,
  type TierMembersParams,
} from '#/api/core/memberTier';

interface Props {
  tierId: number;
  tierName: string;
}

const props = defineProps<Props>();
const message = useMessage();

const loading = ref(false);
const tableData = ref<TierMember[]>([]);
const searchKeyword = ref('');

const paginationState = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
});

const pagination = computed<PaginationProps>(() => ({
  page: paginationState.page,
  pageSize: paginationState.pageSize,
  itemCount: paginationState.itemCount,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info) =>
    $t('user.tierMemberList.memberCount', [info.itemCount || 0]),
  onUpdatePage: (page: number) => {
    paginationState.page = page;
    loadData();
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationState.pageSize = pageSize;
    paginationState.page = 1;
    loadData();
  },
}));

const columns = computed<DataTableColumns<TierMember>>(() => [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center',
  },
  {
    title: $t('common.memberAccount'),
    key: 'account',
    width: 120,
    render: (row) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(NIcon, { size: 16, color: '#666' }, { default: () => h(PersonIcon) }),
        h('span', { class: 'font-medium' }, row.account),
      ]);
    },
  },
  {
    title: $t('user.tierMemberList.realName'),
    key: 'name',
    width: 100,
    render: (row) => row.name || h('span', { class: 'text-gray-400' }, '-'),
  },
  {
    title: $t('user.tierMemberList.email'),
    key: 'email',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: $t('user.tierMemberList.accountBalance'),
    key: 'balance',
    width: 120,
    align: 'right',
    render: (row) => {
      const balance = Number(row.balance) || 0;
      const color = balance > 0 ? 'text-green-600' : 'text-gray-600';
      return h(
        'span',
        { class: `font-mono font-semibold ${color}` },
        `R$ ${balance.toFixed(2)}`,
      );
    },
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      if (row.isBanned) {
        return h(
          NTag,
          { type: 'error', size: 'small' },
          {
            icon: () =>
              h(NIcon, { size: 14 }, { default: () => h(BannedIcon) }),
            default: () => $t('user.tierMemberList.banned'),
          },
        );
      }

      if (row.isVerified) {
        return h(
          NTag,
          { type: 'success', size: 'small' },
          {
            icon: () =>
              h(NIcon, { size: 14 }, { default: () => h(VerifiedIcon) }),
            default: () => $t('user.tierMemberList.verified'),
          },
        );
      }

      return h(
        NTag,
        { type: 'warning', size: 'small' },
        {
          default: () => $t('user.tierMemberList.unverified'),
        },
      );
    },
  },
  {
    title: $t('user.tierMemberList.registrationTime'),
    key: 'createdAt',
    width: 150,
    render: (row) => {
      const date = new Date(row.createdAt);
      return h('span', { class: 'text-sm' }, date.toLocaleDateString());
    },
  },
  {
    title: $t('user.tierMemberList.lastLogin'),
    key: 'lastLogin',
    width: 150,
    render: (row) => {
      if (!row.lastLogin) {
        return h(
          'span',
          { class: 'text-gray-400 text-sm' },
          $t('user.tierMemberList.neverLoggedIn'),
        );
      }
      const date = new Date(row.lastLogin);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
      );

      let color = 'text-gray-600';
      if (diffDays <= 1) color = 'text-green-600';
      else if (diffDays <= 7) color = 'text-blue-600';
      else if (diffDays <= 30) color = 'text-orange-600';
      else color = 'text-red-600';

      let relativeLabel: string;
      if (diffDays === 0) {
        relativeLabel = $t('user.tierMemberList.today');
      } else if (diffDays === 1) {
        relativeLabel = $t('user.tierMemberList.yesterday');
      } else {
        relativeLabel = $t('user.tierMemberList.daysAgo', [diffDays]);
      }

      return h('div', { class: 'text-sm' }, [
        h('div', { class: color }, date.toLocaleDateString()),
        h('div', { class: 'text-xs text-gray-500' }, relativeLabel),
      ]);
    },
  },
]);

const loadData = async () => {
  if (!props.tierId) return;

  loading.value = true;
  try {
    const params: TierMembersParams = {
      page: paginationState.page,
      pageSize: paginationState.pageSize,
      search: searchKeyword.value || undefined,
    };

    const response = await getTierMembersApi(props.tierId, params);

    tableData.value = response.list || [];
    paginationState.itemCount = response.pagination?.total || 0;
  } catch (error) {
    message.error($t('user.tierMemberList.loadFailed'));
    console.error('Error loading tier members:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  paginationState.page = 1;
  loadData();
};

const handleRefresh = () => {
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.tier-member-list {
  padding: 16px 0;
}

:deep(.n-data-table-th) {
  background: #fafafa;
  font-weight: 600;
}

:deep(.n-data-table-td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.n-data-table-tr:hover .n-data-table-td) {
  background: #f8f9fa;
}
</style>
