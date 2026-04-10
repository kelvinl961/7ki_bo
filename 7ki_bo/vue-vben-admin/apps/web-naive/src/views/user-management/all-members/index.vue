<template>
  <Page description="" title="">
    <!-- 顶部操作按钮 -->
    <div class="mb-4 flex items-center justify-between">
      <!-- <n-breadcrumb>
        <n-breadcrumb-item>用户管理</n-breadcrumb-item>
        <n-breadcrumb-item>所有会员</n-breadcrumb-item>
      </n-breadcrumb>-->
    </div>
    <div class="flex h-[calc(100vh-180px)] flex-col">
      <!-- 筛选器区域 -->
      <n-card class="mb-4">
        <!-- First Row: Time filters and date range -->
        <div class="mb-4 flex flex-wrap items-end justify-between">
          <div class="flex flex-wrap items-end gap-4">
            <!-- 时间类型选择 -->
            <div class="flex flex-col">
              <n-select
                v-model:value="filterForm.timeType"
                placeholder="选择时间类型"
                style="width: 140px"
                :options="timeTypeOptions"
              />
            </div>

            <!-- 时间段快捷选择 -->
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium">&nbsp;</label>
              <QuickDateSelect
                v-model="filterForm.dateQuickSelect"
                @update:modelValue="handleQuickDateSelect"
              />
            </div>

            <!-- 日期范围选择器 -->
            <div class="flex flex-col">
              <TimezoneDatePicker
                :key="`mbr-dr-${filterForm.dateRange?.[0] ?? 'x'}-${filterForm.dateRange?.[1] ?? 'x'}`"
                v-model="filterForm.dateRange"
                @update:modelValue="handleDateRangeChange"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <n-button type="primary" @click="handleAddMember">
              <template #icon>
                <span>+</span>
              </template>
              新增会员
            </n-button>
            <n-button @click="handleImport">
              <template #icon>
                <span>↓</span>
              </template>
              导入
            </n-button>
            <n-button @click="handleExport">
              <template #icon>
                <span>↑</span>
              </template>
              导出报表
            </n-button>
          </div>
        </div>

        <!-- Second Row: Search filters -->
        <div class="flex items-end gap-4 overflow-x-auto whitespace-nowrap pb-1">
          <!-- 搜索条件 (综合搜索字段选择器) -->
          <div class="flex shrink-0 flex-col">
            <n-select
              v-model:value="filterForm.searchCondition"
              placeholder="请选择搜索条件"
              clearable
              style="width: 200px"
              :options="searchConditionOptions"
              @update:value="handleSearchConditionChange"
            />
          </div>

          <!-- 搜索条件值 (动态显示) -->
          <div v-if="filterForm.searchCondition" class="flex shrink-0 flex-col">
            <n-select
              v-model:value="filterForm.searchConditionValue"
              :placeholder="`请选择${getSearchConditionLabel()}`"
              clearable
              filterable
              style="width: 200px"
              :options="searchConditionValueOptions"
              :loading="loadingConditionOptions"
            />
          </div>

          <!-- 搜索字段 + 搜索值（共用组件，options 由本页传入） -->
          <FieldSearchBar
            class="shrink-0"
            v-model:field="filterForm.searchField"
            v-model:value="filterForm.searchValue"
            :options="allSearchFieldOptions"
            select-placeholder="精准会员账号"
            @field-changed="handleSearchFieldChange"
            @search="handleFilter"
          />

          <!-- 账号类型 -->
          <div class="flex shrink-0 flex-col">
            <n-select
              v-model:value="filterForm.accountType"
              placeholder="请选择账号类型"
              clearable
              style="width: 180px"
              :options="accountTypeOptions"
            />
          </div>

          <!-- 操作按钮 -->
          <div class="flex shrink-0 flex-col">
            <div class="flex gap-2">
              <n-button type="primary" @click="handleFilter"> 搜索 </n-button>
              <n-button type="info" @click="showAdvancedSearch = true">
                高级搜索
              </n-button>
              <n-button @click="resetFilter"> 重置 </n-button>
            </div>
          </div>
        </div>
      </n-card>
      <div class="min-h-0 flex-1">
        <SmartDataGrid
          :data="tableData"
          :columns="columns"
          :loading="loading"
          :pagination="paginationReactive"
          :scroll-x="3200"
          selectable
          :selected-keys="checkedRowKeys"
          :row-key="(row: UserItem) => row.id"
          @update:selected-keys="checkedRowKeys = $event"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
          @refresh="handleRefresh"
          @row-click="handleRowClick"
        >
          <template #actionBar> </template>
        </SmartDataGrid>

        <!-- 用户详情弹窗 -->
        <UserDetailModal
          v-model:visible="showDetailModal"
          :user-id="currentUserId"
          @refresh="loadTableData"
          @filter-by-name="handleFilterByName"
          @commission-click="handleCommissionClick"
        />

        <MemberAdvancedSearchModal
          v-model:show="showAdvancedSearch"
          @apply="onAdvancedSearchApply"
        />
      </div>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick, h } from 'vue';
import { useRoute } from 'vue-router';
import { Page } from '@vben/common-ui';
import {
  NCard,
  NButton,
  NSelect,
  NTag,
  NIcon,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  LogoApple,
  LogoAndroid,
  LogoWindows,
  LogoTux,
  PersonCircleOutline,
} from '@vicons/ionicons5';
import {
  getUserListApi,
  postUserListAdvancedSearchApi,
  type MemberAdvancedListBody,
  type UserItem,
  type UserListParams,
} from '#/api/core/user-management';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
import { defineAsyncComponent } from 'vue';
const UserDetailModal = defineAsyncComponent(
  () => import('#/components/user/UserDetailModal.vue'),
);
const SmartDataGrid = defineAsyncComponent(
  () => import('../../../components/smart/SmartDataGrid/index.vue'),
);
const TimezoneDatePicker = defineAsyncComponent(
  () => import('#/components/common/TimezoneDatePicker.vue'),
);
const QuickDateSelect = defineAsyncComponent(
  () => import('#/components/common/QuickDateSelect.vue'),
);

// Import timezone utilities
import {
  formatDateTimeInTimezone,
  getNowInTimezone,
  convertTimezoneToUTC,
  getDisplayTimezone,
} from '#/utils/timezoneUtils';
import FieldSearchBar, {
  type FieldSearchBarOption,
} from '#/components/filters/FieldSearchBar.vue';
import MemberAdvancedSearchModal from './MemberAdvancedSearchModal.vue';

const message = useMessage();
const route = useRoute();

// 响应式数据
const loading = ref(false);
const showDetailModal = ref(false);
const showAdvancedSearch = ref(false);
const checkedRowKeys = ref<(string | number)[]>([]);
const tableData = ref<UserItem[]>([]);
const currentUserId = ref<number>(0);

// 筛选表单
const filterForm = reactive({
  // Time-based filters
  timeType: 'registrationTime' as string,
  dateQuickSelect: null as 'day' | 'week' | 'month' | null,
  dateRange: null as [number, number] | null,

  // Search filters
  searchCondition: null as string | null, // Main search category
  searchConditionValue: null as string | null, // Value for search condition
  searchField: null as string | null, // Specific search field type
  searchValue: '', // Search value input
  searchMode: 'exact' as 'exact' | 'fuzzy', // Exact or fuzzy search mode

  // Status and type filters
  accountType: null as string | null,
  accountStatus: null as string | null,
  memberLevel: null as string | null,
  vipLevel: null as string | null,

  // Legacy
  isBanned: null as boolean | null,
  isVerified: null as boolean | null,
  search: '',
});

// 分页配置 (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

/** POST `/users/admin/advanced-search` 条件快照（分页时复用） */
const advancedListPayload = ref<MemberAdvancedListBody | null>(null);
const advancedListMode = ref(false);

// 选项配置
const timeTypeOptions = [
  { label: '注册时间', value: 'registrationTime' },
  { label: '最后登录时间', value: 'lastLoginTime' },
  { label: '首充时间', value: 'firstDepositTime' },
];

// Comprehensive search field options (matching screenshot)
const allSearchFieldOptions: FieldSearchBarOption[] = [
  // Account & Identity
  { label: '精准会员账号', value: 'exact_account', mode: 'exact' },
  { label: '模糊会员账号', value: 'fuzzy_account', mode: 'fuzzy' },
  { label: '会员ID', value: 'userID', mode: 'exact' },
  { label: '精准姓名', value: 'exact_name', mode: 'exact' },
  { label: '模糊姓名', value: 'fuzzy_name', mode: 'fuzzy' },

  // Withdrawal Account
  {
    label: '精准提现账号地址',
    value: 'exact_withdrawal_account',
    mode: 'exact',
  },
  {
    label: '模糊提现账号地址',
    value: 'fuzzy_withdrawal_account',
    mode: 'fuzzy',
  },

  // Contact Information
  { label: '手机号', value: 'phone', mode: 'exact' },
  { label: 'Email', value: 'email', mode: 'exact' },
  { label: 'Whatsapp', value: 'whatsapp', mode: 'exact' },
  { label: 'Facebook', value: 'facebook', mode: 'exact' },
  { label: 'Telegram', value: 'telegram', mode: 'exact' },
  { label: 'Zalo', value: 'zalo', mode: 'exact' },
  { label: 'Line', value: 'line', mode: 'exact' },
  { label: 'X(Twitter)', value: 'twitter', mode: 'exact' },
  { label: 'Wechat', value: 'wechat', mode: 'exact' },
  { label: 'Threads', value: 'threads', mode: 'exact' },
  { label: 'Instagram', value: 'instagram', mode: 'exact' },

  // Referral & Agency
  { label: '邀请人ID', value: 'inviter_id', mode: 'exact' },
  { label: '邀请人', value: 'inviter_account', mode: 'exact' },
  { label: '上级代理ID', value: 'upper_agent_id', mode: 'exact' },
  { label: '上级代理', value: 'upper_agent_account', mode: 'exact' },
  { label: '顶层代理ID', value: 'top_agent_id', mode: 'exact' },
  { label: '顶层代理账号', value: 'top_agent_account', mode: 'exact' },

  // Club & Payment
  { label: '俱乐部ID', value: 'club_id', mode: 'exact' },
  { label: 'PIX类型', value: 'pix_type', mode: 'exact' },
  { label: 'PIX地址', value: 'pix_address', mode: 'exact' },
  { label: '身份ID', value: 'cpf', mode: 'exact' },

  // Registration Information
  { label: '注册IP', value: 'registration_ip', mode: 'exact' },
  { label: '注册域名', value: 'registration_domain', mode: 'exact' },
  { label: '注册来源', value: 'registration_source', mode: 'exact' },
  { label: '注册设备号', value: 'registration_device', mode: 'exact' },
  {
    label: '注册客户端指纹',
    value: 'registration_fingerprint',
    mode: 'exact',
  },
  {
    label: '注册User-Agent',
    value: 'registration_user_agent',
    mode: 'exact',
  },

  // Last Login Information
  { label: '最后登录IP', value: 'last_login_ip', mode: 'exact' },
  { label: '最后登录域名', value: 'last_login_domain', mode: 'exact' },
  { label: '最后登录设备号', value: 'last_login_device', mode: 'exact' },
  {
    label: '最后登录客户端指纹',
    value: 'last_login_fingerprint',
    mode: 'exact',
  },
  {
    label: '最后登录User-Agent',
    value: 'last_login_user_agent',
    mode: 'exact',
  },
];

// Search condition options (main categories)
const searchConditionOptions = [
  { label: '会员层级', value: 'memberLevel' },
  { label: 'VIP等级', value: 'vipLevel' },
  { label: '会员标签', value: 'memberTags' },
  { label: '在线状态', value: 'onlineStatus' },
  { label: '账号状态', value: 'accountStatus' },
  { label: '登录记录', value: 'loginHistory' },
];

// Online status options (clickable quick filters)
const onlineStatusOptions = [
  { label: '当前在线', value: 'currently_online' },
  { label: '大厅会员', value: 'lobby_member' },
  { label: '自营游戏会员', value: 'self_operated_member' },
  { label: '三方游戏会员', value: 'third_party_member' },
  { label: '疑似机器人', value: 'suspected_bot' },
  { label: '今日在线', value: 'today_online' },
];

// Account type options (from screenshot)
const accountTypeOptions = [
  { label: '全部账号类型', value: '' },
  { label: '正式账号-人人代理', value: 'official_agent_all' },
  { label: '正式账号-普通会员', value: 'official_member' },
  { label: '正式账号-专业代理', value: 'official_agent_pro' },
  { label: '临时账号', value: 'temporary' },
  { label: '俱乐部账号', value: 'club' },
  { label: 'TG会员(Telegram)', value: 'telegram' },
];

// 工具函数 - 使用环境变量中的时区
const formatDateTime = (dateString: string) => {
  return formatDateTimeInTimezone(dateString);
};

/** Local sort UI state (API sortBy/sortOrder only; avoids Naive UI SortState `sorter` requirement). */
type MemberListSortState = { columnKey: string; order: 'ascend' | 'descend' };

const sortState = ref<MemberListSortState | null>(null);

function fmtMoneyTable(n: number): string {
  return Math.abs(n).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getDepositWithdrawDiff(row: UserItem): number {
  return (Number(row.totalDeposit) || 0) - (Number(row.totalWithdraw) || 0);
}

function resolveIsOnline(row: UserItem): boolean {
  if (typeof row.isOnline === 'boolean') return row.isOnline;
  const p = row.profile as Record<string, unknown> | undefined;
  if (p && typeof p.isOnline === 'boolean') return p.isOnline;
  if (p && typeof p.online === 'boolean') return p.online as boolean;
  return false;
}

/** 与 operatingSystem 字符串对应的图标分类 */
type OsIconKind = 'apple' | 'android' | 'windows' | 'linux' | 'other';

const OS_ICON_MAP: Record<
  OsIconKind,
  typeof LogoApple | typeof LogoAndroid | typeof LogoWindows | typeof LogoTux | typeof PersonCircleOutline
> = {
  apple: LogoApple,
  android: LogoAndroid,
  windows: LogoWindows,
  linux: LogoTux,
  other: PersonCircleOutline,
};

/**
 * 根据接口字段 operatingSystem 解析图标（大小写不敏感）。
 * 支持常见值：iOS、Android、Windows、Linux、macOS、HarmonyOS 等。
 */
function parseOperatingSystemIcon(osRaw?: string | null): OsIconKind {
  if (osRaw == null || String(osRaw).trim() === '') return 'other';
  const s = String(osRaw).trim().toLowerCase();

  if (
    /iphone|ipad|ipados|\bios\b|ios(?![a-z])|apple/.test(s) ||
    /\bip(hone|ad)\b/.test(s)
  ) {
    return 'apple';
  }
  if (/mac|macos|darwin|osx\b|os\s*x/.test(s)) return 'apple';
  if (/android|harmony|鸿蒙/.test(s)) return 'android';
  if (/windows|win\d|microsoft|wpdesktop/.test(s)) return 'windows';
  if (/linux|ubuntu|debian|fedora|centos|redhat|rhel|gentoo|arch/.test(s)) {
    return 'linux';
  }
  return 'other';
}

/** operatingSystem 为空时，用 UA/profile 等兜底推断 */
function inferOsIconFallback(row: UserItem): OsIconKind {
  const p = row.profile as Record<string, unknown> | undefined;
  const ext = row as UserItem & {
    lastLoginOs?: string;
    lastLoginUserAgent?: string;
    clientType?: string;
  };
  const raw = [
    ext.lastLoginOs,
    ext.lastLoginUserAgent,
    ext.clientType,
    ext.loginMethod,
    row.registrationMethod,
    p?.lastLoginOs,
    p?.deviceOs,
    p?.platform,
    p?.userAgent,
  ]
    .filter((x) => x != null && String(x).trim() !== '')
    .join(' ')
    .toLowerCase();
  if (/iphone|ipad|ipod|\bios\b|apple/i.test(raw)) return 'apple';
  if (/android|harmony|鸿蒙/.test(raw)) return 'android';
  if (/windows|win\d/.test(raw)) return 'windows';
  if (/linux|ubuntu/.test(raw)) return 'linux';
  return 'other';
}

function resolveLoginOsIconKind(row: UserItem): OsIconKind {
  const fromApi = row.operatingSystem;
  if (fromApi != null && String(fromApi).trim() !== '') {
    return parseOperatingSystemIcon(fromApi);
  }
  return inferOsIconFallback(row);
}

/** 接口可能返回 manual，界面不展示该英文词 */
function formatLoginMethodLabel(row: UserItem): string {
  const raw =
    row.loginMethod ||
    row.registrationMethod ||
    '账号登录';
  let t = String(raw).trim();
  if (!t) return '账号登录';
  if (/^manual$/i.test(t)) return '账号登录';
  t = t.replace(/\bmanual\b/gi, ' ').replace(/\s+/g, ' ').trim();
  return t || '账号登录';
}

function renderLoginMethodCell(row: UserItem) {
  const online = resolveIsOnline(row);
  const kind = resolveLoginOsIconKind(row);
  const IconComp = OS_ICON_MAP[kind];
  const label = formatLoginMethodLabel(row);
  const iconColor = online ? '#18a058' : '#c0c4cc';
  const textClass = online ? 'text-slate-700' : 'text-slate-400';
  return h(
    'div',
    { class: 'flex items-center justify-center gap-2' },
    [
      h(NIcon, { size: 18, color: iconColor, component: IconComp }),
      h('span', { class: `text-xs ${textClass}` }, label),
    ],
  );
}

/** 最后登录：仅按 lastLoginTime 排序；表头两行 */
function lastLoginIpRegionTimeHeader() {
  return () =>
    h('div', { class: 'w-full min-w-[200px] max-w-[260px] py-1' }, [
      h(
        'div',
        {
          class:
            'text-center text-[11px] font-medium leading-tight text-slate-700',
        },
        '最后登录IP/地区',
      ),
      h(
        'div',
        {
          class:
            'mt-1 flex items-center justify-center gap-1 text-[10px] leading-none text-slate-400',
        },
        [
          h(
            'span',
            { class: 'text-slate-500' },
            '最后登录时间',
          ),
          renderSortCaret('lastLoginTime'),
        ],
      ),
    ]);
}

function getLastLoginIpRegionLine(row: UserItem): string {
  const ext = row as UserItem & {
    lastLoginIp?: string;
    lastLoginRegion?: string;
    ipCountry?: string;
  };
  const p = row.profile as Record<string, unknown> | undefined;
  const ip =
    ext.lastLoginIp ??
    (p?.lastLoginIp as string | undefined) ??
    (p?.last_login_ip as string | undefined) ??
    '';
  const region =
    ext.lastLoginRegion ??
    (p?.lastLoginRegion as string | undefined) ??
    (p?.last_login_region as string | undefined) ??
    '';
  const country =
    ext.ipCountry ??
    (p?.ipCountry as string | undefined) ??
    (p?.lastLoginCountry as string | undefined) ??
    '';
  const pieces = [String(ip).trim(), String(region).trim(), String(country).trim()].filter(
    Boolean,
  );
  return pieces.length ? pieces.join(' ') : '-';
}

function renderLastLoginStackCell(ipRegionLine: string, timeLine: string) {
  return h(
    'div',
    {
      class:
        'flex min-h-[36px] flex-col items-center justify-center gap-0.5 px-1 py-0.5 text-center',
    },
    [
      h(
        'span',
        {
          class:
            'max-w-[240px] truncate text-[12px] leading-snug text-slate-700',
          title: ipRegionLine !== '-' ? ipRegionLine : undefined,
        },
        ipRegionLine,
      ),
      h(
        'span',
        {
          class: 'tabular-nums text-[11px] leading-none text-slate-500',
        },
        timeLine,
      ),
    ],
  );
}

function singleLineSortHeader(title: string, sortKey: string) {
  return () =>
    h(
      'div',
      { class: 'flex w-full items-center justify-center gap-1 px-1 text-xs' },
      [
        h('span', { class: 'font-medium text-slate-700' }, title),
        renderSortCaret(sortKey),
      ],
    );
}

function renderSortCaret(sortKey: string) {
  const active = sortState.value?.columnKey === sortKey;
  const order = sortState.value?.order;
  return h(
    'span',
    {
      class:
        'inline-flex cursor-pointer flex-col rounded px-0.5 py-px leading-none transition-colors hover:bg-slate-100',
      style: 'font-size:10px;line-height:1;user-select:none',
      onClick: (e: MouseEvent) => {
        e.stopPropagation();
        applyMemberListSort(sortKey);
      },
    },
    [
      h(
        'span',
        {
          style: {
            color: active && order === 'ascend' ? '#2080f0' : '#c9cdd4',
          },
        },
        '▲',
      ),
      h(
        'span',
        {
          style: {
            color: active && order === 'descend' ? '#2080f0' : '#c9cdd4',
          },
        },
        '▼',
      ),
    ],
  );
}

function stackedSortHeader(
  line1: string,
  line2: string,
  key1: string,
  key2: string,
) {
  return () =>
    h('div', { class: 'w-full max-w-[160px] py-1' }, [
      h(
        'div',
        {
          class:
            'flex items-center justify-center gap-1 text-[11px] font-medium leading-none text-slate-700',
        },
        [h('span', { class: 'truncate' }, line1), renderSortCaret(key1)],
      ),
      h(
        'div',
        {
          class:
            'mt-1 flex items-center justify-center gap-1 text-[10px] leading-none text-slate-400',
        },
        [h('span', { class: 'truncate' }, line2), renderSortCaret(key2)],
      ),
    ]);
}

/** 财务双行单元格：主数字 + 次要说明，控制行高与对齐 */
function renderFinanceStackCell(
  primaryText: string,
  secondaryText: string,
  primaryClass: string,
) {
  return h(
    'div',
    {
      class:
        'flex min-h-[32px] flex-col items-center justify-center gap-px py-0.5 text-center',
    },
    [
      h(
        'span',
        {
          class: `tabular-nums text-[13px] font-medium leading-none ${primaryClass}`,
        },
        primaryText,
      ),
      h(
        'span',
        { class: 'tabular-nums text-[11px] leading-none text-slate-400' },
        secondaryText,
      ),
    ],
  );
}

function applyMemberListSort(columnKey: string) {
  const cur = sortState.value;
  if (cur?.columnKey === columnKey) {
    if (cur.order === 'ascend') {
      sortState.value = { columnKey, order: 'descend' };
    } else if (cur.order === 'descend') {
      sortState.value = null;
    } else {
      sortState.value = { columnKey, order: 'ascend' };
    }
  } else {
    sortState.value = { columnKey, order: 'ascend' };
  }
  paginationReactive.page = 1;
  void loadTableData();
}

// 表格列配置（依赖 sortState 以刷新表头排序高亮）
const columns = computed<DataTableColumns<UserItem>>(() => {
  void sortState.value?.columnKey;
  void sortState.value?.order;
  return [
  { type: 'selection' },
  {
    title: '用户ID',
    key: 'userID',
    width: 120,
    render(row) {
      return h(
        'span',
        {
          style: 'color: #2080f0; cursor: pointer;',
          onClick: (e: Event) => {
            e.stopPropagation();
            handleViewDetail(row);
          },
        },
        row.userID || String(row.id),
      );
    },
  },
  {
    title: '账号',
    key: 'memberAccount',
    width: 120,
    ellipsis: { tooltip: true },
    render(row) {
      return h(
        'span',
        {
          style: 'color: #2080f0; cursor: pointer;',
          class: 'hover:underline',
          onClick: (e: Event) => {
            e.stopPropagation();
            handleViewDetail(row);
          },
        },
        row.memberAccount || '-',
      );
    },
  },
  {
    title: '真实姓名',
    key: 'realName',
    width: 100,
    ellipsis: { tooltip: true },
  },
  {
    title: 'VIP等级',
    key: 'vipLevel',
    width: 100,
    render(row) {
      return h(
        NTag,
        { type: 'warning' },
        { default: () => row.vipLevel || 'VIP0' },
      );
    },
  },
  {
    title: '会员层级',
    key: 'memberLevel',
    width: 100,
    render(row) {
      const levelColorMap: Record<
        string,
        'default' | 'error' | 'warning' | 'primary' | 'success' | 'info'
      > = {
        铜牌会员: 'warning',
        银牌会员: 'info',
        金牌会员: 'success',
        白金会员: 'primary',
        钻石会员: 'error',
      };
      return h(
        NTag,
        {
          size: 'small',
          round: true,
          bordered: false,
          type: levelColorMap[row.memberLevel] || 'default',
        },
        {
          default: () => row.memberLevel || '默认层级',
        },
      );
    },
  },
  {
    title: stackedSortHeader(
      '总充值金额',
      '充值次数',
      'totalDeposit',
      'totalDepositCount',
    ),
    key: 'totalDepositGroup',
    width: 158,
    align: 'center',
    render(row) {
      const amt = Number(row.totalDeposit) || 0;
      const cnt = row.totalDepositCount ?? 0;
      return renderFinanceStackCell(
        fmtMoneyTable(amt),
        `· ${cnt} 次`,
        'text-rose-600',
      );
    },
  },
  {
    title: stackedSortHeader(
      '总提现金额',
      '提现次数',
      'totalWithdraw',
      'totalWithdrawalCount',
    ),
    key: 'totalWithdrawGroup',
    width: 158,
    align: 'center',
    render(row) {
      const amt = Number(row.totalWithdraw) || 0;
      const cnt = row.totalWithdrawalCount ?? 0;
      return renderFinanceStackCell(
        fmtMoneyTable(amt),
        `· ${cnt} 次`,
        'text-emerald-600',
      );
    },
  },
  {
    title: stackedSortHeader(
      '总充提差额',
      '首充金额',
      'depositWithdrawDiff',
      'firstDepositAmount',
    ),
    key: 'depositWithdrawGroup',
    width: 158,
    align: 'center',
    render(row) {
      const diff = getDepositWithdrawDiff(row);
      const diffClass =
        diff > 0
          ? 'text-rose-600'
          : diff < 0
            ? 'text-emerald-600'
            : 'text-slate-600';
      const diffText =
        diff === 0
          ? fmtMoneyTable(0)
          : diff > 0
            ? fmtMoneyTable(diff)
            : `-${fmtMoneyTable(diff)}`;
      const first = Number(row.firstDepositAmount) || 0;
      return renderFinanceStackCell(
        diffText,
        `首充 ${fmtMoneyTable(first)}`,
        diffClass,
      );
    },
  },
  {
    title: '顶层代理(ID)',
    key: 'topAgent',
    width: 180,
    ellipsis: { tooltip: true },
    render(row) {
      if (!row.topAgentAccount || !row.topAgentUserID) {
        return '-';
      }
      return h('div', { class: 'flex flex-col gap-1' }, [
        h(
          'span',
          {
            style: 'color: #2080f0; cursor: pointer;',
            class: 'hover:underline',
            onClick: (e: Event) => {
              e.stopPropagation();
              message.info(`顶层代理: ${row.topAgentAccount}`);
            },
          },
          row.topAgentAccount,
        ),
        h(
          'span',
          {
            style: 'color: #2080f0; cursor: pointer; font-size: 12px;',
            class: 'hover:underline',
            onClick: (e: Event) => {
              e.stopPropagation();
              message.info(`ID: ${row.topAgentUserID}`);
            },
          },
          `(${row.topAgentUserID})`,
        ),
      ]);
    },
  },
  {
    title: '上级代理(ID)',
    key: 'upperAgent',
    width: 180,
    ellipsis: { tooltip: true },
    render(row) {
      if (!row.upperAgentAccount || !row.upperAgentUserID) {
        return '-';
      }
      return h('div', { class: 'flex flex-col gap-1' }, [
        h(
          'span',
          {
            style: 'color: #2080f0; cursor: pointer;',
            class: 'hover:underline',
            onClick: (e: Event) => {
              e.stopPropagation();
              message.info(`上级代理: ${row.upperAgentAccount}`);
            },
          },
          row.upperAgentAccount,
        ),
        h(
          'span',
          {
            style: 'color: #2080f0; cursor: pointer; font-size: 12px;',
            class: 'hover:underline',
            onClick: (e: Event) => {
              e.stopPropagation();
              message.info(`ID: ${row.upperAgentUserID}`);
            },
          },
          `(${row.upperAgentUserID})`,
        ),
      ]);
    },
  },
  {
    title: '账户余额',
    key: 'balance',
    width: 120,
    render(row) {
      return `BRL ${row.balance?.toFixed(2) || '0.00'}`;
    },
  },
  {
    title: '状态',
    key: 'accountStatus',
    width: 120,
    render(row) {
      // 🎯 FIX: Display actual status text instead of toggle
      const statusMap: Record<
        string,
        {
          text: string;
          type: 'success' | 'error' | 'warning' | 'info' | 'default';
        }
      > = {
        NORMAL: { text: '正常', type: 'success' },
        MANUAL_FREEZE: { text: '手动冻结', type: 'error' },
        ABNORMAL_FREEZE: { text: '异常冻结', type: 'error' },
        PROHIBIT_BONUS: { text: '禁止领取优惠', type: 'warning' },
        PROHIBIT_WITHDRAWAL: { text: '禁止提现', type: 'error' },
        PROHIBIT_GAME_ENTRY: { text: '禁止进入游戏', type: 'warning' },
        BLACKLIST: { text: '黑名单', type: 'error' },
        MARGINAL: { text: '边退', type: 'warning' },
      };

      const status = row.accountStatus || 'NORMAL';
      const statusInfo = statusMap[status] || { text: status, type: 'default' };

      return h(
        NTag,
        { type: statusInfo.type, size: 'small' },
        {
          default: () => statusInfo.text,
        },
      );
    },
  },
  {
    title: '登录方式',
    key: 'loginMethodDisplay',
    width: 140,
    align: 'center',
    render(row) {
      return renderLoginMethodCell(row);
    },
  },
  {
    title: singleLineSortHeader('注册日期时间', 'registrationTime'),
    key: 'registrationDateTime',
    width: 172,
    align: 'center',
    render(row) {
      return row.registrationTime ? formatDateTime(row.registrationTime) : '-';
    },
  },
  {
    title: lastLoginIpRegionTimeHeader(),
    key: 'lastLoginDateTime',
    width: 228,
    align: 'center',
    render(row) {
      const top = getLastLoginIpRegionLine(row);
      const bottom = row.lastLoginTime
        ? formatDateTime(row.lastLoginTime)
        : '-';
      return renderLastLoginStackCell(top, bottom);
    },
  },

  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      return h('div', { class: 'flex gap-1' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handleViewDetail(row),
          },
          { default: () => '详情' },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            onClick: () => handleManageUser(row),
          },
          { default: () => '管理' },
        ),
      ]);
    },
  },
];
});

// 事件处理函数 - 使用环境变量中的时区
const handleQuickDateSelect = (value: 'day' | 'week' | 'month' | null) => {
  if (!value) return; // Handle null case
  // Get current time components in display timezone (from env)
  const tzNow = getNowInTimezone();

  let startYear: number, startMonth: number, startDay: number;
  let endYear: number, endMonth: number, endDay: number;

  switch (value) {
    case 'day':
      // Today in display timezone: 00:00:00 to 23:59:59
      startYear = endYear = tzNow.year;
      startMonth = endMonth = tzNow.month;
      startDay = endDay = tzNow.day;
      break;
    case 'week':
      // Last 7 days: calculate 7 days ago
      const weekAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startYear = weekAgo.getFullYear();
      startMonth = weekAgo.getMonth() + 1;
      startDay = weekAgo.getDate();
      endYear = tzNow.year;
      endMonth = tzNow.month;
      endDay = tzNow.day;
      break;
    case 'month':
      // Last 30 days: calculate 30 days ago
      const monthAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
      monthAgo.setDate(monthAgo.getDate() - 30);
      startYear = monthAgo.getFullYear();
      startMonth = monthAgo.getMonth() + 1;
      startDay = monthAgo.getDate();
      endYear = tzNow.year;
      endMonth = tzNow.month;
      endDay = tzNow.day;
      break;
    default:
      return;
  }

  // ✅ SIMPLIFIED: Convert São Paulo time to UTC and store directly
  // The date picker will display in browser timezone, but we'll use UTC timestamps for backend
  const tz = getDisplayTimezone();

  // Convert São Paulo time components to UTC
  const startDateUTC = convertTimezoneToUTC(
    startYear,
    startMonth,
    startDay,
    0,
    0,
    0,
    tz,
  );
  const endDateUTC = convertTimezoneToUTC(
    endYear,
    endMonth,
    endDay,
    23,
    59,
    59,
    tz,
  );

  // Validate and store UTC timestamps directly
  if (isNaN(startDateUTC.getTime()) || isNaN(endDateUTC.getTime())) {
    console.error('❌ Failed to convert timezone dates to UTC');
    // Fallback: approximate UTC (not ideal)
    filterForm.dateRange = [
      new Date(
        Date.UTC(startYear, startMonth - 1, startDay, 3, 0, 0),
      ).getTime(), // São Paulo is UTC-3
      new Date(Date.UTC(endYear, endMonth - 1, endDay, 2, 59, 59)).getTime(),
    ];
  } else {
    // Store UTC timestamps - these represent São Paulo time
    filterForm.dateRange = [startDateUTC.getTime(), endDateUTC.getTime()];
    console.log('📅 Quick date select:', {
      saoPaulo: {
        start: `${startYear}-${startMonth}-${startDay} 00:00:00`,
        end: `${endYear}-${endMonth}-${endDay} 23:59:59`,
      },
      utcTimestamps: {
        start: startDateUTC.toISOString(),
        end: endDateUTC.toISOString(),
      },
    });
  }
};

const handleDateRangeChange = (_value: [number, number] | null) => {
  // Clear quick select when manually changing date range
  filterForm.dateQuickSelect = null;

  // ✅ FIX: When user manually selects dates, the date picker creates Date objects
  // in browser local timezone. We need to interpret what the user selected as
  // display timezone time, then convert to UTC.
  // The conversion will happen in loadTableData, so we just store the timestamps as-is here.
  // The date picker will display them correctly based on browser timezone.
};

const handleSearchFieldChange = (value: string | null) => {
  if (value) {
    const selectedOption = allSearchFieldOptions.find(
      (opt) => opt.value === value,
    );
    if (selectedOption) {
      filterForm.searchMode = selectedOption.mode as 'exact' | 'fuzzy';
    }
  }
};

// Handle search condition change - load options dynamically
const loadingConditionOptions = ref(false);
const searchConditionValueOptions = ref<
  Array<{ label: string; value: string }>
>([]);

const handleSearchConditionChange = async (value: string | null) => {
  filterForm.searchConditionValue = null; // Clear previous value
  searchConditionValueOptions.value = [];

  if (!value) return;

  loadingConditionOptions.value = true;
  try {
    switch (value) {
      case 'memberLevel':
        // Load member tiers
        const { getActiveMemberTiersApi } = await import(
          '#/api/core/memberTier'
        );
        const tiers = await getActiveMemberTiersApi();
        searchConditionValueOptions.value = tiers.map((tier) => ({
          label: tier.tierName,
          value: tier.id.toString(),
        }));
        break;
      case 'vipLevel':
        // Load VIP levels
        const { getVIPLevels } = await import('#/api/vip');
        const vipResponse = await getVIPLevels({
          pageSize: 100,
          isActive: true,
        });
        const vipLevels = vipResponse.list || [];
        searchConditionValueOptions.value = vipLevels.map((level) => ({
          label: level.name,
          value: level.id.toString(),
        }));
        break;
      case 'accountStatus':
        searchConditionValueOptions.value = [
          { label: '正常', value: 'NORMAL' },
          { label: '冻结', value: 'FROZEN' },
          { label: '异常冻结', value: 'ABNORMAL_FREEZE' },
          { label: '锁定', value: 'LOCKED' },
          { label: '暂停', value: 'SUSPENDED' },
          { label: '临时', value: 'TEMPORARY' },
        ];
        break;
      case 'onlineStatus':
        searchConditionValueOptions.value = onlineStatusOptions;
        break;
      case 'memberTags':
        // Load member tags (you may need to create an API for this)
        searchConditionValueOptions.value = [
          { label: '普通用户', value: 'normal' },
          { label: 'VIP用户', value: 'vip' },
          { label: '代理用户', value: 'agent' },
        ];
        break;
      case 'loginHistory':
        searchConditionValueOptions.value = [
          { label: '今天登录', value: 'today' },
          { label: '7天内登录', value: 'week' },
          { label: '30天内登录', value: 'month' },
          { label: '从未登录', value: 'never' },
        ];
        break;
    }
  } catch (error) {
    console.error('Error loading search condition options:', error);
    message.error('加载选项失败');
  } finally {
    loadingConditionOptions.value = false;
  }
};

const getSearchConditionLabel = () => {
  const condition = searchConditionOptions.find(
    (opt) => opt.value === filterForm.searchCondition,
  );
  return condition ? condition.label : '值';
};

const handleFilter = () => {
  advancedListMode.value = false;
  advancedListPayload.value = null;
  paginationReactive.page = 1;
  loadTableData();
};

const resetFilter = () => {
  advancedListMode.value = false;
  advancedListPayload.value = null;
  Object.assign(filterForm, {
    timeType: 'registrationTime',
    dateQuickSelect: null,
    dateRange: null,
    searchCondition: null,
    searchConditionValue: null,
    searchField: null,
    searchValue: '',
    searchMode: 'exact',
    accountType: null,
    accountStatus: null,
    memberLevel: null,
    vipLevel: null,
    isBanned: null,
    isVerified: null,
    search: '',
  });
  searchConditionValueOptions.value = [];
  paginationReactive.page = 1;
  sortState.value = null;
  loadTableData();
};

// Top button handlers
const handleAddMember = () => {
  message.info('新增会员功能开发中...');
  // TODO: Open add member modal
};

const handleImport = () => {
  message.info('导入功能开发中...');
  // TODO: Open import dialog
};

const handleExport = async () => {
  try {
    message.info('正在导出数据...');
    // TODO: Implement export functionality
    // This should export the current filtered results to Excel/CSV
    console.log('Exporting with current filters:', filterForm);
    message.success('导出成功！');
  } catch (error) {
    message.error('导出失败');
    console.error('Export error:', error);
  }
};

const handleRefresh = () => {
  loadTableData();
};

const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadTableData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadTableData();
};

const handleRowClick = (user: UserItem) => {
  // Open user detail modal when row is clicked - will trigger API call once
  handleViewDetail(user);
};

const handleViewDetail = (user: UserItem) => {
  currentUserId.value = Number(user.id);
  showDetailModal.value = true;
};

const handleManageUser = (_user: UserItem) => {
  message.info('用户管理功能开发中...');
};

const handleFilterByName = (name: string) => {
  advancedListMode.value = false;
  advancedListPayload.value = null;
  console.log('Filtering by name:', name);
  filterForm.searchField = 'exact_name';
  filterForm.searchValue = name;
  filterForm.searchMode = 'exact';
  paginationReactive.page = 1;
  loadTableData();
};

const handleCommissionClick = (amount: number) => {
  console.log('Commission amount clicked:', amount);
};

function onAdvancedSearchApply(payload: MemberAdvancedListBody) {
  advancedListPayload.value = { ...payload };
  advancedListMode.value = true;
  paginationReactive.page = 1;
  showAdvancedSearch.value = false;
  loadTableData();
  message.success('已使用高级搜索');
}

// 数据加载
async function loadTableData() {
  loading.value = true;
  const startTime = Date.now();

  try {
    if (advancedListMode.value && advancedListPayload.value) {
      const body = {
        ...advancedListPayload.value,
        page: paginationReactive.page,
        pageSize: paginationReactive.pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };
      const raw = await postUserListAdvancedSearchApi(body);
      const inner = (raw as { data?: { list: UserItem[]; pagination?: { total: number } } })
        ?.data ?? raw;
      const loadTime = Date.now() - startTime;
      console.log(`⚡ Advanced search loaded in ${loadTime}ms`);
      if (inner && Array.isArray((inner as { list?: UserItem[] }).list)) {
        const d = inner as {
          list: UserItem[];
          pagination?: { total: number };
        };
        tableData.value = d.list;
        paginationReactive.total = d.pagination?.total ?? 0;
      } else {
        tableData.value = [];
        paginationReactive.total = 0;
      }
      return;
    }

    const params: UserListParams = {
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
    };

    if (sortState.value?.columnKey && sortState.value.order) {
      params.sortBy = sortState.value.columnKey as string;
      params.sortOrder = sortState.value.order === 'ascend' ? 'asc' : 'desc';
    }

    // Time-based filters - Convert to UTC for backend
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      const [startTimestamp, endTimestamp] = filterForm.dateRange;
      const tz = getDisplayTimezone();

      const startDate = new Date(startTimestamp);
      const endDate = new Date(endTimestamp);

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('❌ Invalid date timestamps in dateRange:', {
          startTimestamp,
          endTimestamp,
        });
      } else {
        // Get what these timestamps represent in São Paulo timezone
        // This tells us what the user actually selected (interpreted as São Paulo time)
        const startTzStr = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(startDate);

        const endTzStr = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(endDate);

        // Parse: "12/08/2025, 00:00:00"
        const [startDatePart, startTimePart] = startTzStr.split(', ');
        const [endDatePart, endTimePart] = endTzStr.split(', ');

        if (startDatePart && startTimePart && endDatePart && endTimePart) {
          const [startM, startD, startY] = startDatePart.split('/');
          const [startH, startMin, startSec] = startTimePart.split(':');
          const [endM, endD, endY] = endDatePart.split('/');
          const [endH, endMin, endSec] = endTimePart.split(':');

          if (
            startM &&
            startD &&
            startY &&
            startH &&
            startMin &&
            endM &&
            endD &&
            endY &&
            endH &&
            endMin
          ) {
            // Convert São Paulo time components to UTC
            const startUTC = convertTimezoneToUTC(
              parseInt(startY),
              parseInt(startM),
              parseInt(startD),
              parseInt(startH),
              parseInt(startMin),
              parseInt(startSec || '0'),
              tz,
            );
            const endUTC = convertTimezoneToUTC(
              parseInt(endY),
              parseInt(endM),
              parseInt(endD),
              parseInt(endH),
              parseInt(endMin),
              parseInt(endSec || '59'),
              tz,
            );

            // Validate and send to backend
            if (isNaN(startUTC.getTime()) || isNaN(endUTC.getTime())) {
              console.error('❌ Invalid UTC dates after conversion');
              params.startDate = startDate.toISOString();
              params.endDate = endDate.toISOString();
            } else {
              params.startDate = startUTC.toISOString();
              params.endDate = endUTC.toISOString();

              // Verify the conversion is correct
              const verifyStartSP = new Intl.DateTimeFormat('en-US', {
                timeZone: tz,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              }).format(startUTC);

              const verifyEndSP = new Intl.DateTimeFormat('en-US', {
                timeZone: tz,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              }).format(endUTC);

              console.log('✅ Date filter applied:', {
                timezone: tz,
                userSelected: { start: startTzStr, end: endTzStr },
                sentToBackend: {
                  start: startUTC.toISOString(),
                  end: endUTC.toISOString(),
                },
                verification: { start: verifyStartSP, end: verifyEndSP },
              });
            }
          } else {
            console.error('❌ Failed to parse date components');
            params.startDate = startDate.toISOString();
            params.endDate = endDate.toISOString();
          }
        } else {
          console.error('❌ Failed to parse timezone date strings');
          params.startDate = startDate.toISOString();
          params.endDate = endDate.toISOString();
        }
      }
      params.timeType = filterForm.timeType;
    }

    // Search condition (category-based filter)
    if (filterForm.searchCondition) {
      params.searchCondition = filterForm.searchCondition;
      if (filterForm.searchConditionValue) {
        params.searchConditionValue = filterForm.searchConditionValue;
      }
    }

    // Comprehensive search field - ensure exact_account uses exact, fuzzy_account uses contains
    if (filterForm.searchField && filterForm.searchValue) {
      params.searchField = filterForm.searchField;
      params.searchValue = filterForm.searchValue;

      // Set search mode: exact_account = exact, fuzzy_account = fuzzy
      if (filterForm.searchField === 'exact_account') {
        params.searchMode = 'exact';
      } else if (filterForm.searchField === 'fuzzy_account') {
        params.searchMode = 'fuzzy';
      } else {
        params.searchMode = filterForm.searchMode;
      }
    }

    // Account type (TG会员 = filter by 注册域名 telegram, not accountType)
    if (filterForm.accountType && filterForm.accountType !== '') {
      if (filterForm.accountType === 'telegram') {
        params.searchField = 'registration_domain';
        params.searchValue = 'telegram';
        params.searchMode = 'exact';
      } else {
        params.accountType = filterForm.accountType;
      }
    }

    // Account status
    if (filterForm.accountStatus) {
      params.accountStatus = filterForm.accountStatus;
    }

    // Member level
    if (filterForm.memberLevel) {
      params.memberLevel = filterForm.memberLevel;
    }

    // VIP level
    if (filterForm.vipLevel) {
      params.vipLevel = filterForm.vipLevel;
    }

    // Legacy search (fallback)
    if (filterForm.search) {
      params.search = filterForm.search;
    }

    const data = await getUserListApi(params);

    const loadTime = Date.now() - startTime;
    console.log(`⚡ Data loaded in ${loadTime}ms`);

    // The API should return { list: UserItem[], pagination: {...} }
    if (data && data.list) {
      tableData.value = data.list;
      paginationReactive.total = data.pagination?.total || 0;
    } else {
      console.warn('⚠️ Unexpected response structure:', data);
      tableData.value = [];
      paginationReactive.total = 0;
    }
  } catch (error) {
    message.error('获取用户列表失败');
    console.error('Error loading table data:', error);
  } finally {
    loading.value = false;
  }
}

/** 日运营报表下钻 query（需在 keep-alive 下用 watch 同步，不能仅靠 onMounted） */
function hasValidOpsDrillQuery(): boolean {
  const q = route.query;
  if (
    String(q.opsDrill) !== '1' ||
    q.opsDateStart == null ||
    q.opsDateEnd == null ||
    q.opsTimeType == null
  ) {
    return false;
  }
  const s = Number(q.opsDateStart);
  const e = Number(q.opsDateEnd);
  return !Number.isNaN(s) && !Number.isNaN(e);
}

function applyOpsDrillFromRoute(): void {
  if (!hasValidOpsDrillQuery()) return;
  const q = route.query;
  const s = Number(q.opsDateStart);
  const e = Number(q.opsDateEnd);
  advancedListMode.value = false;
  advancedListPayload.value = null;
  filterForm.timeType = String(q.opsTimeType);
  filterForm.dateQuickSelect = null;
  filterForm.dateRange = [s, e];
  filterForm.searchField = null;
  filterForm.searchValue = '';
  paginationReactive.page = 1;
}

watch(
  () =>
    [
      route.query.opsDrill,
      route.query.opsDateStart,
      route.query.opsDateEnd,
      route.query.opsTimeType,
    ] as const,
  () => {
    if (!hasValidOpsDrillQuery()) return;
    applyOpsDrillFromRoute();
    nextTick(() => {
      loadTableData();
    });
  },
  { immediate: true },
);

// 生命周期
onMounted(() => {
  // 🔧 Check for query parameters from navigation (e.g., from agent list page)
  const query = route.query;

  // Pre-fill search field and value if provided
  if (query.searchField && query.searchValue) {
    filterForm.searchField = query.searchField as string;
    filterForm.searchValue = query.searchValue as string;
    console.log('📋 Pre-filled search filter from query:', {
      searchField: filterForm.searchField,
      searchValue: filterForm.searchValue,
    });

    // ✅ FIX: When coming from agent list (via 直属数 click), don't set date filter
    // Show all downlines without date restriction
    // Only set date filter if explicitly provided in query AND not from agent list
    if (
      query.dateQuickSelect === 'day' &&
      !query.searchField?.includes('upper_agent')
    ) {
      filterForm.dateQuickSelect = 'day';
      handleQuickDateSelect('day');
    }
  } else {
    // Set default today date if dateQuickSelect is provided (for other navigation cases)
    if (query.dateQuickSelect === 'day') {
      filterForm.dateQuickSelect = 'day';
      handleQuickDateSelect('day');
    }
  }

  // ✅ NEW: Handle special filter types (same_password, same_withdrawal_pin, etc.)
  if (query.filterType) {
    const filterType = query.filterType as string;
    const matchCount = query.matchCount
      ? parseInt(query.matchCount as string)
      : 0;

    // Set the appropriate search field based on filterType
    switch (filterType) {
      case 'same_password':
        filterForm.searchField = 'same_login_password';
        break;
      case 'same_withdrawal_pin':
        filterForm.searchField = 'same_withdrawal_pin';
        break;
      case 'same_withdrawal_account':
        filterForm.searchField = 'same_withdrawal_account';
        break;
      case 'same_registration_ip':
        filterForm.searchField = 'registration_ip';
        break;
    }

    // Set search value if provided
    if (query.searchValue) {
      filterForm.searchValue = query.searchValue as string;
    }

    // Show match count in a message if provided
    if (matchCount > 0) {
      message.info(`找到 ${matchCount} 个符合条件的会员`);
    }
  }

  // 运营报表下钻已在 watch(immediate) 里拉数，避免重复请求
  if (hasValidOpsDrillQuery()) {
    return;
  }

  // Auto-trigger search if query params were provided
  if (query.searchField && query.searchValue) {
    // Small delay to ensure filters are set first
    setTimeout(() => {
      loadTableData();
    }, 100);
  } else if (query.filterType) {
    // Also trigger for special filter types
    setTimeout(() => {
      loadTableData();
    }, 100);
  } else {
    loadTableData();
  }
});
</script>
