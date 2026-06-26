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
                :placeholder="$t('user.allMembers.selectTimeType')"
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
              {{ $t('user.allMembers.addMember') }}
            </n-button>
            <n-button @click="handleImport">
              <template #icon>
                <span>↓</span>
              </template>
              {{ $t('common.import') }}
            </n-button>
            <n-button :loading="exporting" @click="handleExport">
              <template #icon>
                <span>↑</span>
              </template>
              {{ $t('common.exportReport') }}
            </n-button>
          </div>
        </div>

        <!-- Second Row: Search filters -->
        <div class="flex items-end gap-4 overflow-x-auto whitespace-nowrap pb-1">
          <!-- 搜索条件 (综合搜索字段选择器) -->
          <div class="flex shrink-0 flex-col">
            <n-select
              v-model:value="filterForm.searchCondition"
              :placeholder="$t('common.selectSearchCondition')"
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
              :placeholder="$t('user.allMembers.pleaseSelectCondition', [getSearchConditionLabel()])"
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
            :select-placeholder="$t('user.allMembers.exactMemberAccount')"
            @field-changed="handleSearchFieldChange"
            @search="handleFilter"
          />

          <!-- 账号类型 -->
          <div class="flex shrink-0 flex-col">
            <n-select
              v-model:value="filterForm.accountType"
              :placeholder="$t('user.allMembers.selectAccountType')"
              clearable
              style="width: 180px"
              :options="accountTypeOptions"
            />
          </div>

          <!-- 操作按钮 -->
          <div class="flex shrink-0 flex-col">
            <div class="flex gap-2">
              <n-button type="primary" @click="handleFilter">
                {{ $t('common.search') }}
              </n-button>
              <n-button type="info" @click="showAdvancedSearch = true">
                {{ $t('common.advancedSearch') }}
              </n-button>
              <n-button @click="resetFilter"> {{ $t('common.reset') }} </n-button>
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
import { $t } from '@vben/locales';

import {
  ref,
  reactive,
  computed,
  onMounted,
  onActivated,
  watch,
  nextTick,
  h,
} from 'vue';
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
import { exportWithMapping } from '#/utils/exportUtils';

const message = useMessage();
const EXPORT_MAX_ROWS = 50_000;
const route = useRoute();

async function copyMemberCellToClipboard(text: string | number | null | undefined, okMsg: string) {
  const t = text === null || text === undefined ? '' : String(text).trim();
  if (!t) return;
  try {
    await navigator.clipboard.writeText(t);
    message.success(okMsg);
  } catch {
    message.error($t('user.allMembers.copyFailed'));
  }
}

// 响应式数据
const loading = ref(false);
const exporting = ref(false);
const showDetailModal = ref(false);
const showAdvancedSearch = ref(false);
const checkedRowKeys = ref<(string | number)[]>([]);
const tableData = ref<UserItem[]>([]);
const currentUserId = ref<number>(0);

const ALL_MEMBERS_TIME_FILTER_KEY = 'vben:all-members:time-filter';

type AllMembersTimeFilterSnapshot = {
  timeType: string;
  dateQuickSelect: 'day' | 'week' | 'month' | null;
  dateRange: [number, number] | null;
};

let skipTimeFilterPersist = false;

function loadSavedTimeFilter(): AllMembersTimeFilterSnapshot | null {
  try {
    const raw = sessionStorage.getItem(ALL_MEMBERS_TIME_FILTER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AllMembersTimeFilterSnapshot;
    if (
      parsed.dateRange &&
      Array.isArray(parsed.dateRange) &&
      parsed.dateRange.length === 2 &&
      typeof parsed.dateRange[0] === 'number' &&
      typeof parsed.dateRange[1] === 'number'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function persistTimeFilter(): void {
  if (skipTimeFilterPersist) return;
  try {
    sessionStorage.setItem(
      ALL_MEMBERS_TIME_FILTER_KEY,
      JSON.stringify({
        timeType: filterForm.timeType,
        dateQuickSelect: filterForm.dateQuickSelect,
        dateRange: filterForm.dateRange,
      } satisfies AllMembersTimeFilterSnapshot),
    );
  } catch {
    /* ignore quota errors */
  }
}

function runWithoutTimeFilterPersist(fn: () => void): void {
  skipTimeFilterPersist = true;
  try {
    fn();
  } finally {
    skipTimeFilterPersist = false;
  }
}

const savedTimeFilter = loadSavedTimeFilter();

// 筛选表单
const filterForm = reactive({
  // Time-based filters
  timeType: savedTimeFilter?.timeType ?? 'registrationTime',
  dateQuickSelect: savedTimeFilter?.dateQuickSelect ?? null,
  dateRange: savedTimeFilter?.dateRange ?? null,

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
const timeTypeOptions = computed(() => [
  { label: $t('user.allMembers.registrationTime'), value: 'registrationTime' },
  { label: $t('user.allMembers.lastLoginTime'), value: 'lastLoginTime' },
  { label: $t('user.allMembers.firstDepositTime'), value: 'firstDepositTime' },
]);

const allSearchFieldOptions = computed<FieldSearchBarOption[]>(() => [
  { label: $t('user.allMembers.exactAccount'), value: 'exact_account', mode: 'exact' },
  { label: $t('user.allMembers.fuzzyAccount'), value: 'fuzzy_account', mode: 'fuzzy' },
  { label: $t('user.allMembers.memberId'), value: 'userID', mode: 'exact' },
  { label: $t('user.allMembers.exactName'), value: 'exact_name', mode: 'exact' },
  { label: $t('user.allMembers.fuzzyName'), value: 'fuzzy_name', mode: 'fuzzy' },
  {
    label: $t('user.allMembers.exactWithdrawAddress'),
    value: 'exact_withdrawal_account',
    mode: 'exact',
  },
  {
    label: $t('user.allMembers.fuzzyWithdrawAddress'),
    value: 'fuzzy_withdrawal_account',
    mode: 'fuzzy',
  },
  { label: $t('user.allMembers.sameWithdrawAccount'), value: 'same_withdrawal_account', mode: 'exact' },
  { label: $t('user.allMembers.sameLoginPassword'), value: 'same_login_password', mode: 'exact' },
  { label: $t('user.allMembers.sameWithdrawPin'), value: 'same_withdrawal_pin', mode: 'exact' },
  { label: $t('user.allMembers.phone'), value: 'phone', mode: 'exact' },
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
  { label: $t('user.allMembers.inviterId'), value: 'inviter_id', mode: 'exact' },
  { label: $t('user.allMembers.inviter'), value: 'inviter_account', mode: 'exact' },
  { label: $t('user.allMembers.upperAgentId'), value: 'upper_agent_id', mode: 'exact' },
  { label: $t('user.allMembers.upperAgent'), value: 'upper_agent_account', mode: 'exact' },
  { label: $t('user.allMembers.topAgentId'), value: 'top_agent_id', mode: 'exact' },
  { label: $t('user.allMembers.topAgentAccount'), value: 'top_agent_account', mode: 'exact' },
  { label: $t('user.allMembers.clubId'), value: 'club_id', mode: 'exact' },
  { label: $t('user.allMembers.pixType'), value: 'pix_type', mode: 'exact' },
  { label: $t('user.allMembers.pixAddress'), value: 'pix_address', mode: 'exact' },
  { label: $t('user.allMembers.identityId'), value: 'cpf', mode: 'exact' },
  { label: $t('user.allMembers.registrationIp'), value: 'registration_ip', mode: 'exact' },
  { label: $t('user.allMembers.registrationDomain'), value: 'registration_domain', mode: 'exact' },
  { label: $t('user.allMembers.registrationSource'), value: 'registration_source', mode: 'exact' },
  { label: $t('user.allMembers.registrationDevice'), value: 'registration_device', mode: 'exact' },
  {
    label: $t('user.allMembers.registrationFingerprint'),
    value: 'registration_fingerprint',
    mode: 'exact',
  },
  {
    label: $t('user.allMembers.registrationUserAgent'),
    value: 'registration_user_agent',
    mode: 'exact',
  },
  { label: $t('user.allMembers.lastLoginIp'), value: 'last_login_ip', mode: 'exact' },
  { label: $t('user.allMembers.lastLoginDomain'), value: 'last_login_domain', mode: 'exact' },
  { label: $t('user.allMembers.lastLoginDevice'), value: 'last_login_device', mode: 'exact' },
  {
    label: $t('user.allMembers.lastLoginFingerprint'),
    value: 'last_login_fingerprint',
    mode: 'exact',
  },
  {
    label: $t('user.allMembers.lastLoginUserAgent'),
    value: 'last_login_user_agent',
    mode: 'exact',
  },
]);

const searchConditionOptions = computed(() => [
  { label: $t('user.allMembers.memberLevel'), value: 'memberLevel' },
  { label: $t('user.allMembers.vipLevel'), value: 'vipLevel' },
  { label: $t('user.allMembers.memberTags'), value: 'memberTags' },
  { label: $t('user.allMembers.onlineStatus'), value: 'onlineStatus' },
  { label: $t('user.allMembers.accountStatus'), value: 'accountStatus' },
  { label: $t('user.allMembers.loginHistory'), value: 'loginHistory' },
]);

const onlineStatusOptions = computed(() => [
  { label: $t('user.allMembers.currentlyOnline'), value: 'currently_online' },
  { label: $t('user.allMembers.lobbyMember'), value: 'lobby_member' },
  { label: $t('user.allMembers.selfOperatedMember'), value: 'self_operated_member' },
  { label: $t('user.allMembers.thirdPartyMember'), value: 'third_party_member' },
  { label: $t('user.allMembers.suspectedBot'), value: 'suspected_bot' },
  { label: $t('user.allMembers.todayOnline'), value: 'today_online' },
]);

const accountTypeOptions = computed(() => [
  { label: $t('user.allMembers.allAccountTypes'), value: '' },
  { label: $t('user.allMembers.officialAgentAll'), value: 'official_agent_all' },
  { label: $t('user.allMembers.officialMember'), value: 'official_member' },
  { label: $t('user.allMembers.officialAgentPro'), value: 'official_agent_pro' },
  { label: $t('user.allMembers.temporaryAccount'), value: 'temporary' },
  { label: $t('user.allMembers.clubAccount'), value: 'club' },
  { label: $t('user.allMembers.telegramMember'), value: 'telegram' },
]);

const accountStatusFilterOptions = computed(() => [
  { label: $t('user.allMembers.statusNormal'), value: 'NORMAL' },
  { label: $t('user.allMembers.statusFrozen'), value: 'FROZEN' },
  { label: $t('user.advancedSearch.abnormalFreeze'), value: 'ABNORMAL_FREEZE' },
  { label: $t('user.allMembers.statusLocked'), value: 'LOCKED' },
  { label: $t('user.allMembers.statusSuspended'), value: 'SUSPENDED' },
  { label: $t('user.allMembers.statusTemporary'), value: 'TEMPORARY' },
]);

const memberTagFilterOptions = computed(() => [
  { label: $t('user.allMembers.tagNormalUser'), value: 'normal' },
  { label: $t('user.allMembers.tagVipUser'), value: 'vip' },
  { label: $t('user.allMembers.tagAgentUser'), value: 'agent' },
]);

const loginHistoryFilterOptions = computed(() => [
  { label: $t('user.allMembers.loggedInToday'), value: 'today' },
  { label: $t('user.allMembers.loggedInWeek'), value: 'week' },
  { label: $t('user.allMembers.loggedInMonth'), value: 'month' },
  { label: $t('user.allMembers.neverLoggedIn'), value: 'never' },
]);

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
  const accountLogin = $t('user.allMembers.accountLogin');
  const raw =
    row.loginMethod ||
    row.registrationMethod ||
    accountLogin;
  let t = String(raw).trim();
  if (!t) return accountLogin;
  if (/^manual$/i.test(t)) return accountLogin;
  t = t.replace(/\bmanual\b/gi, ' ').replace(/\s+/g, ' ').trim();
  return t || accountLogin;
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
        $t('user.allMembers.lastLoginIpRegion'),
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
            $t('user.allMembers.lastLoginTime'),
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
    title: $t('user.allMembers.userId'),
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
    title: $t('user.allMembers.account'),
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
    title: $t('user.allMembers.realName'),
    key: 'realName',
    width: 100,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('user.allMembers.vipLevel'),
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
    title: $t('user.allMembers.memberLevel'),
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
          default: () => row.memberLevel || $t('user.allMembers.defaultLevel'),
        },
      );
    },
  },
  {
    title: stackedSortHeader(
      $t('user.allMembers.totalDepositAmount'),
      $t('user.allMembers.depositCountCol'),
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
        $t('user.allMembers.timesSuffix', [cnt]),
        'text-rose-600',
      );
    },
  },
  {
    title: stackedSortHeader(
      $t('user.allMembers.totalWithdrawAmount'),
      $t('user.allMembers.withdrawCountCol'),
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
        $t('user.allMembers.timesSuffix', [cnt]),
        'text-emerald-600',
      );
    },
  },
  {
    title: stackedSortHeader(
      $t('user.allMembers.netDepositWithdraw'),
      $t('user.allMembers.firstDepositAmountCol'),
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
        $t('user.allMembers.firstDepositLabel', [fmtMoneyTable(first)]),
        diffClass,
      );
    },
  },
  {
    title: $t('user.allMembers.topAgentWithId'),
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
            title: $t('user.allMembers.clickCopyTopAgentAccount'),
            onClick: (e: Event) => {
              e.stopPropagation();
              void copyMemberCellToClipboard(row.topAgentAccount, $t('user.allMembers.copiedTopAgentAccount'));
            },
          },
          row.topAgentAccount,
        ),
        h(
          'span',
          {
            style: 'color: #2080f0; cursor: pointer; font-size: 12px;',
            class: 'hover:underline',
            title: $t('user.allMembers.clickCopyTopAgentId'),
            onClick: (e: Event) => {
              e.stopPropagation();
              void copyMemberCellToClipboard(row.topAgentUserID, $t('user.allMembers.copiedTopAgentId'));
            },
          },
          `(${row.topAgentUserID})`,
        ),
      ]);
    },
  },
  {
    title: $t('user.allMembers.upperAgentWithId'),
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
            title: $t('user.allMembers.clickCopyUpperAgentAccount'),
            onClick: (e: Event) => {
              e.stopPropagation();
              void copyMemberCellToClipboard(row.upperAgentAccount, $t('user.allMembers.copiedUpperAgentAccount'));
            },
          },
          row.upperAgentAccount,
        ),
        h(
          'span',
          {
            style: 'color: #2080f0; cursor: pointer; font-size: 12px;',
            class: 'hover:underline',
            title: $t('user.allMembers.clickCopyUpperAgentId'),
            onClick: (e: Event) => {
              e.stopPropagation();
              void copyMemberCellToClipboard(row.upperAgentUserID, $t('user.allMembers.copiedUpperAgentId'));
            },
          },
          `(${row.upperAgentUserID})`,
        ),
      ]);
    },
  },
  {
    title: $t('user.allMembers.accountBalance'),
    key: 'balance',
    width: 120,
    render(row) {
      return `BRL ${row.balance?.toFixed(2) || '0.00'}`;
    },
  },
  {
    title: $t('common.status'),
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
        NORMAL: { text: $t('user.allMembers.statusNormal'), type: 'success' },
        MANUAL_FREEZE: { text: $t('user.advancedSearch.manualFreeze'), type: 'error' },
        ABNORMAL_FREEZE: { text: $t('user.advancedSearch.abnormalFreeze'), type: 'error' },
        PROHIBIT_BONUS: { text: $t('user.advancedSearch.prohibitBonus'), type: 'warning' },
        PROHIBIT_WITHDRAWAL: { text: $t('user.advancedSearch.prohibitWithdrawal'), type: 'error' },
        PROHIBIT_GAME_ENTRY: { text: $t('user.advancedSearch.prohibitGame'), type: 'warning' },
        BLACKLIST: { text: $t('user.advancedSearch.blacklist'), type: 'error' },
        MARGINAL: { text: $t('user.advancedSearch.marginal'), type: 'warning' },
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
    title: $t('user.allMembers.loginMethodCol'),
    key: 'loginMethodDisplay',
    width: 140,
    align: 'center',
    render(row) {
      return renderLoginMethodCell(row);
    },
  },
  {
    title: singleLineSortHeader($t('user.allMembers.registrationDateTime'), 'registrationTime'),
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
    title: $t('common.actions'),
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
          { default: () => $t('common.detail') },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'info',
            onClick: () => handleManageUser(row),
          },
          { default: () => $t('user.allMembers.manage') },
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
    persistTimeFilter();
  } else {
    // Store UTC timestamps - these represent São Paulo time
    filterForm.dateRange = [startDateUTC.getTime(), endDateUTC.getTime()];
    persistTimeFilter();
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

/** 默认选中「日」并填充今日日期范围（仅首次无历史设定时） */
function applyDefaultDayFilter(): void {
  filterForm.dateQuickSelect = 'day';
  handleQuickDateSelect('day');
  persistTimeFilter();
}

const handleDateRangeChange = (_value: [number, number] | null) => {
  // Clear quick select when manually changing date range
  filterForm.dateQuickSelect = null;
  persistTimeFilter();

  // ✅ FIX: When user manually selects dates, the date picker creates Date objects
  // in browser local timezone. We need to interpret what the user selected as
  // display timezone time, then convert to UTC.
  // The conversion will happen in loadTableData, so we just store the timestamps as-is here.
  // The date picker will display them correctly based on browser timezone.
};

const handleSearchFieldChange = (value: string | null) => {
  if (value) {
    const selectedOption = allSearchFieldOptions.value.find(
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
        searchConditionValueOptions.value = accountStatusFilterOptions.value;
        break;
      case 'onlineStatus':
        searchConditionValueOptions.value = onlineStatusOptions.value;
        break;
      case 'memberTags':
        searchConditionValueOptions.value = memberTagFilterOptions.value;
        break;
      case 'loginHistory':
        searchConditionValueOptions.value = loginHistoryFilterOptions.value;
        break;
    }
  } catch (error) {
    console.error('Error loading search condition options:', error);
    message.error($t('user.allMembers.loadOptionsFailed'));
  } finally {
    loadingConditionOptions.value = false;
  }
};

const getSearchConditionLabel = () => {
  const condition = searchConditionOptions.value.find(
    (opt) => opt.value === filterForm.searchCondition,
  );
  return condition ? condition.label : $t('user.allMembers.defaultValue');
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
    dateQuickSelect: 'day',
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
  applyDefaultDayFilter();
  loadTableData();
};

// Top button handlers
const handleAddMember = () => {
  message.info($t('user.allMembers.addMemberDeveloping'));
};

const handleImport = () => {
  message.info($t('user.allMembers.importDeveloping'));
};

const memberExportColumnMap = computed<Record<string, string>>(() => ({
  userID: $t('user.allMembers.userId'),
  memberAccount: $t('user.allMembers.account'),
  realName: $t('user.allMembers.realName'),
  vipLevel: $t('user.allMembers.vipLevel'),
  memberLevel: $t('user.allMembers.memberLevel'),
  totalDeposit: $t('user.allMembers.totalDepositAmount'),
  totalDepositCount: $t('user.allMembers.depositCountCol'),
  totalWithdraw: $t('user.allMembers.totalWithdrawAmount'),
  totalWithdrawalCount: $t('user.allMembers.withdrawCountCol'),
  depositWithdrawDiff: $t('user.allMembers.netDepositWithdraw'),
  firstDepositAmount: $t('user.allMembers.firstDepositAmountCol'),
  topAgentAccount: $t('user.allMembers.topAgentAccount'),
  topAgentUserID: $t('user.allMembers.topAgentId'),
  upperAgentAccount: $t('user.allMembers.upperAgent'),
  upperAgentUserID: $t('user.allMembers.upperAgentId'),
  balance: $t('user.allMembers.accountBalance'),
  accountStatus: $t('common.status'),
  registrationTime: $t('user.allMembers.registrationTime'),
  lastLoginIp: $t('user.allMembers.lastLoginIp'),
  lastLoginTime: $t('user.allMembers.lastLoginTime'),
}));

const accountStatusExportLabels = computed<Record<string, string>>(() => ({
  NORMAL: $t('user.allMembers.statusNormal'),
  MANUAL_FREEZE: $t('user.advancedSearch.manualFreeze'),
  ABNORMAL_FREEZE: $t('user.advancedSearch.abnormalFreeze'),
  PROHIBIT_BONUS: $t('user.advancedSearch.prohibitBonus'),
  PROHIBIT_WITHDRAWAL: $t('user.advancedSearch.prohibitWithdrawal'),
  PROHIBIT_GAME_ENTRY: $t('user.advancedSearch.prohibitGame'),
  BLACKLIST: $t('user.advancedSearch.blacklist'),
  MARGINAL: $t('user.advancedSearch.marginal'),
}));

function mapUserItemForExport(row: UserItem) {
  const diff = getDepositWithdrawDiff(row);
  return {
    userID: row.userID || String(row.id),
    memberAccount: row.memberAccount || '',
    realName: row.realName || '',
    vipLevel: row.vipLevel || 'VIP0',
    memberLevel: row.memberLevel || $t('user.allMembers.defaultLevel'),
    totalDeposit: Number(row.totalDeposit) || 0,
    totalDepositCount: row.totalDepositCount ?? 0,
    totalWithdraw: Number(row.totalWithdraw) || 0,
    totalWithdrawalCount: row.totalWithdrawalCount ?? 0,
    depositWithdrawDiff: diff,
    firstDepositAmount: Number(row.firstDepositAmount) || 0,
    topAgentAccount: row.topAgentAccount || '',
    topAgentUserID: row.topAgentUserID || '',
    upperAgentAccount: row.upperAgentAccount || '',
    upperAgentUserID: row.upperAgentUserID || '',
    balance: Number(row.balance) || 0,
    accountStatus:
      accountStatusExportLabels.value[row.accountStatus || 'NORMAL'] ||
      row.accountStatus ||
      '',
    registrationTime: row.registrationTime
      ? formatDateTime(row.registrationTime)
      : '',
    lastLoginIp: row.lastLoginIp || getLastLoginIpRegionLine(row).split(' ')[0] || '',
    lastLoginTime: row.lastLoginTime ? formatDateTime(row.lastLoginTime) : '',
  };
}

function applyFiltersToUserListParams(params: UserListParams) {
  if (sortState.value?.columnKey && sortState.value.order) {
    params.sortBy = sortState.value.columnKey as string;
    params.sortOrder = sortState.value.order === 'ascend' ? 'asc' : 'desc';
  }

  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const [startTimestamp, endTimestamp] = filterForm.dateRange;
    const tz = getDisplayTimezone();
    const startDate = new Date(startTimestamp);
    const endDate = new Date(endTimestamp);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
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

          if (!isNaN(startUTC.getTime()) && !isNaN(endUTC.getTime())) {
            params.startDate = startUTC.toISOString();
            params.endDate = endUTC.toISOString();
          } else {
            params.startDate = startDate.toISOString();
            params.endDate = endDate.toISOString();
          }
        } else {
          params.startDate = startDate.toISOString();
          params.endDate = endDate.toISOString();
        }
      } else {
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }
    }
    params.timeType = filterForm.timeType;
  }

  if (filterForm.searchCondition) {
    params.searchCondition = filterForm.searchCondition;
    if (filterForm.searchConditionValue) {
      params.searchConditionValue = filterForm.searchConditionValue;
    }
  }

  if (filterForm.searchField && filterForm.searchValue) {
    params.searchField = filterForm.searchField;
    params.searchValue = filterForm.searchValue;
    if (filterForm.searchField === 'exact_account') {
      params.searchMode = 'exact';
    } else if (filterForm.searchField === 'fuzzy_account') {
      params.searchMode = 'fuzzy';
    } else {
      params.searchMode = filterForm.searchMode;
    }
  }

  if (filterForm.accountType && filterForm.accountType !== '') {
    if (filterForm.accountType === 'telegram') {
      params.searchField = 'registration_domain';
      params.searchValue = 'telegram';
      params.searchMode = 'exact';
    } else {
      params.accountType = filterForm.accountType;
    }
  }

  if (filterForm.accountStatus) {
    params.accountStatus = filterForm.accountStatus;
  }
  if (filterForm.memberLevel) {
    params.memberLevel = filterForm.memberLevel;
  }
  if (filterForm.vipLevel) {
    params.vipLevel = filterForm.vipLevel;
  }
  if (filterForm.search) {
    params.search = filterForm.search;
  }
}

function buildUserListParams(
  overrides: Partial<UserListParams> = {},
): UserListParams {
  const params: UserListParams = {
    page: paginationReactive.page,
    pageSize: paginationReactive.pageSize,
    ...overrides,
  };
  applyFiltersToUserListParams(params);
  return params;
}

async function fetchUserListForExport(): Promise<UserItem[]> {
  const exportPageSize = Math.min(
    Math.max(paginationReactive.total, 1),
    EXPORT_MAX_ROWS,
  );

  if (advancedListMode.value && advancedListPayload.value) {
    const body = {
      ...advancedListPayload.value,
      page: 1,
      pageSize: exportPageSize,
      sortBy: sortState.value?.columnKey || 'createdAt',
      sortOrder: (sortState.value?.order === 'ascend' ? 'asc' : 'desc') as
        | 'asc'
        | 'desc',
    };
    const raw = await postUserListAdvancedSearchApi(body);
    const inner =
      (raw as { data?: { list: UserItem[] } })?.data ?? raw;
    return (inner as { list?: UserItem[] })?.list ?? [];
  }

  const data = await getUserListApi(
    buildUserListParams({ page: 1, pageSize: exportPageSize }),
  );
  return data?.list ?? [];
}

const handleExport = async () => {
  if (exporting.value) return;
  exporting.value = true;
  const loadingMsg = message.loading($t('user.allMembers.exportingData'), { duration: 0 });
  try {
    const list = await fetchUserListForExport();
    if (!list.length) {
      message.warning($t('user.allMembers.noExportData'));
      return;
    }
    const rows = list.map(mapUserItemForExport);
    const filename = $t('user.allMembers.exportFilename', [
      new Date().toISOString().slice(0, 10),
    ]);
    await exportWithMapping(rows, memberExportColumnMap.value, filename, {
      format: 'csv',
      message,
    });
  } catch (error) {
    message.error($t('user.allMembers.exportFailed'));
    console.error('Export error:', error);
  } finally {
    exporting.value = false;
    loadingMsg.destroy();
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
  message.info($t('user.allMembers.userManageDeveloping'));
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
  message.success($t('user.allMembers.advancedSearchApplied'));
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

    const data = await getUserListApi(buildUserListParams());

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
    message.error($t('user.allMembers.loadListFailed'));
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
  runWithoutTimeFilterPersist(() => {
    advancedListMode.value = false;
    advancedListPayload.value = null;
    filterForm.timeType = String(q.opsTimeType);
    filterForm.dateQuickSelect = null;
    filterForm.dateRange = [s, e];
    filterForm.searchField = null;
    filterForm.searchValue = '';
    paginationReactive.page = 1;
  });
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
  }

  // 直属会员下钻：不限制注册日期
  if (
    query.searchField &&
    String(query.searchField).includes('upper_agent')
  ) {
    runWithoutTimeFilterPersist(() => {
      filterForm.dateQuickSelect = null;
      filterForm.dateRange = null;
    });
  } else if (!hasValidOpsDrillQuery() && !filterForm.dateRange) {
    // 仅首次进入且无已保存/已修改的日期设定时，默认「日」
    applyDefaultDayFilter();
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
      message.info($t('user.allMembers.membersFoundCount', [matchCount]));
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

watch(() => filterForm.timeType, () => {
  persistTimeFilter();
});

/** keep-alive 返回时：若内存被路由下钻清空，从 session 恢复用户之前的日期设定 */
onActivated(() => {
  const query = route.query;
  if (hasValidOpsDrillQuery()) return;
  if (
    query.searchField &&
    String(query.searchField).includes('upper_agent')
  ) {
    return;
  }
  if (query.searchField && query.searchValue) return;
  if (query.filterType) return;
  if (filterForm.dateRange) return;

  const saved = loadSavedTimeFilter();
  if (!saved?.dateRange) return;

  runWithoutTimeFilterPersist(() => {
    filterForm.timeType = saved.timeType;
    filterForm.dateQuickSelect = saved.dateQuickSelect;
    filterForm.dateRange = saved.dateRange;
  });
});
</script>
