<template>
  <div class="tier-member-list">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">{{ tierName }} - 会员列表</h3>
        <p class="text-sm text-gray-600">
          共 {{ pagination.itemCount }} 名会员
        </p>
      </div>
      <n-button @click="handleRefresh">
        <template #icon>
          <n-icon><RefreshIcon /></n-icon>
        </template>
        刷新
      </n-button>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索会员账号、姓名或邮箱..."
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
import { ref, reactive, onMounted, h } from 'vue';
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

// Reactive data
const loading = ref(false);
const tableData = ref<TierMember[]>([]);
const searchKeyword = ref('');

const pagination: PaginationProps = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info) => `共 ${info.itemCount || 0} 名会员`,
  onUpdatePage: (page: number) => {
    pagination.page = page;
    loadData();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadData();
  },
});

// Table columns
const columns: DataTableColumns<TierMember> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center',
  },
  {
    title: '会员账号',
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
    title: '姓名',
    key: 'name',
    width: 100,
    render: (row) => row.name || h('span', { class: 'text-gray-400' }, '-'),
  },
  {
    title: '邮箱',
    key: 'email',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '账户余额',
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
    title: '状态',
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
            default: () => '已封禁',
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
            default: () => '已验证',
          },
        );
      }

      return h(
        NTag,
        { type: 'warning', size: 'small' },
        {
          default: () => '未验证',
        },
      );
    },
  },
  {
    title: '注册时间',
    key: 'createdAt',
    width: 150,
    render: (row) => {
      const date = new Date(row.createdAt);
      return h('span', { class: 'text-sm' }, date.toLocaleDateString('zh-CN'));
    },
  },
  {
    title: '最后登录',
    key: 'lastLogin',
    width: 150,
    render: (row) => {
      if (!row.lastLogin) {
        return h('span', { class: 'text-gray-400 text-sm' }, '从未登录');
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

      return h('div', { class: 'text-sm' }, [
        h('div', { class: color }, date.toLocaleDateString('zh-CN')),
        h(
          'div',
          { class: 'text-xs text-gray-500' },
          diffDays === 0 ? '今天' : diffDays === 1 ? '昨天' : `${diffDays}天前`,
        ),
      ]);
    },
  },
];

// Methods
const loadData = async () => {
  if (!props.tierId) return;

  loading.value = true;
  try {
    const params: TierMembersParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchKeyword.value || undefined,
    };

    console.log('🔍 Loading tier members with params:', params);
    const response = await getTierMembersApi(props.tierId, params);
    console.log('📦 Raw response:', response);
    console.log('📊 Response list length:', response.list?.length);
    console.log('📊 Response pagination:', response.pagination);

    tableData.value = response.list || [];
    pagination.itemCount = response.pagination?.total || 0;

    console.log('✅ Set itemCount to:', pagination.itemCount);
  } catch (error) {
    message.error('获取会员列表失败');
    console.error('Error loading tier members:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  loadData();
};

const handleRefresh = () => {
  loadData();
};

// Lifecycle
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
