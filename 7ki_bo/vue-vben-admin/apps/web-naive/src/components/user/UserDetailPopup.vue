<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :style="{ width: '1200px' }"
    :title="$t('user.userDetail.userDetailTitle')"
  >
    <n-tabs v-model:value="activeTab" type="card" animated>
      <!-- 会员概览 -->
      <n-tab-pane name="overview" :tab="$t('user.userDetail.overview')">
        <div class="grid grid-cols-2 gap-6">
          <!-- Section A: Basic Account Info -->
          <div class="space-y-4">
            <n-card :title="$t('user.userDetail.basicAccountInfo')" size="small">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.accountStatus') }}:</span>
                  <div class="flex items-center gap-2">
                    <n-tag
                      :type="isNormalAccountStatus(userDetail.status) ? 'success' : 'error'"
                      size="small"
                    >
                      {{ userDetail.status }}
                    </n-tag>
                    <n-button text type="primary" size="tiny"
                      >{{ $t('user.userDetail.modifyStatus') }}</n-button
                    >
                  </div>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.accountType') }}:</span>
                  <span>{{ userDetail.accountType }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.selfExclusion') }}:</span>
                  <span>{{ userDetail.selfExclusionStatus || '--' }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.upperAgent') }}:</span>
                  <span>{{ userDetail.referrer }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.agentCommission') }}:</span>
                  <span>{{ formatCurrency(userDetail.agentCommission) }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.realName') }}:</span>
                  <div class="flex items-center gap-2">
                    <span>{{ userDetail.realName }}</span>
                    <n-button text type="primary" size="tiny">{{ $t('user.userDetail.record') }}</n-button>
                  </div>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('common.currency') }}:</span>
                  <span>{{ userDetail.currency }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.rewardWallet') }}:</span>
                  <!-- <span>{{ formatCurrency(userDetail.rewardWallet) }}</span> -->
                  <span>{{ 0 }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.interestTreasure') }}:</span>
                  <span>{{ formatCurrency(userDetail.savingsWallet) }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.vipLevel') }}:</span>
                  <div class="flex items-center gap-2">
                    <span>{{ userDetail.vipLevel }}</span>
                    <n-button text type="primary" size="tiny">{{ $t('common.modify') }}</n-button>
                  </div>
                </div>
              </div>

              <template #action>
                <div class="flex gap-2">
                  <n-button size="small" type="primary">{{ $t('user.userDetail.moreAssociations') }}</n-button>
                  <n-button size="small">{{ $t('user.userDetail.record') }}</n-button>
                  <n-button size="small">{{ $t('common.refresh') }}</n-button>
                </div>
              </template>
            </n-card>
          </div>

          <!-- Section B: Financial/Betting Behavior -->
          <div class="space-y-4">
            <n-card :title="$t('user.userDetail.fundBetBehavior')" size="small">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.accountBalance') }}:</span>
                  <div class="flex items-center gap-3">
                    <span
                      >{{ $t('user.userDetail.available') }}: {{ formatCurrency(userDetail.balance) }} | {{ $t('user.userDetail.frozen') }}:
                      {{ formatCurrency(userDetail.frozenBalance) }}</span
                    >
                    <div class="flex gap-1">
                      <n-button
                        size="tiny"
                        type="primary"
                        @click="handleRefreshBalance"
                        >{{ $t('common.refresh') }}</n-button
                      >
                      <n-button
                        size="tiny"
                        type="warning"
                        @click="handleManualPullback"
                        >{{ $t('user.userDetail.manualRecall') }}</n-button
                      >
                      <n-button
                        size="tiny"
                        type="info"
                        @click="handleAccountRecords"
                        >{{ $t('user.userDetail.transactionRecords') }}</n-button
                      >
                      <n-button
                        size="tiny"
                        type="success"
                        @click="handleManualCredit"
                        >{{ $t('user.userDetail.manualCredit') }}</n-button
                      >
                      <n-button
                        size="tiny"
                        type="error"
                        @click="handleManualDebit"
                        >{{ $t('user.userDetail.manualDebit') }}</n-button
                      >
                    </div>
                  </div>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.totalDeposit') }}:</span>
                  <span
                    >{{ userDetail.rechargeCount }}{{ $t('user.userDetail.times') }} |
                    {{ formatCurrency(userDetail.rechargeAmount) }}</span
                  >
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.totalWithdraw') }}:</span>
                  <span
                    >{{ userDetail.withdrawCount }}{{ $t('user.userDetail.times') }} |
                    {{ formatCurrency(userDetail.withdrawAmount) }}</span
                  >
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.todayBet') }}:</span>
                  <span
                    >{{ $t('user.userDetail.validBet') }}: {{ formatCurrency(userDetail.todayValidBet) }} |
                    {{ $t('user.userDetail.totalBet') }}:
                    {{ formatCurrency(userDetail.todayBetAmount) }}</span
                  >
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.todayPnl') }}:</span>
                  <span
                    :class="
                      userDetail.todayProfit >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    "
                  >
                    {{ formatCurrency(userDetail.todayProfit) }}
                  </span>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.promotions') }}:</span>
                  <span
                    >{{ $t('user.userDetail.task') }}:
                    {{ formatCurrency(userDetail.promotionStats.task) }} | {{ $t('user.userDetail.deposit') }}:
                    {{
                      formatCurrency(userDetail.promotionStats.rechargeReward)
                    }}</span
                  >
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.memberTier') }}:</span>
                  <div class="flex items-center gap-2">
                    <span>{{ userDetail.level }}</span>
                    <n-button text type="primary" size="tiny">{{ $t('common.modify') }}</n-button>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.memberTags') }}:</span>
                  <div class="flex items-center gap-2">
                    <n-tag size="small">{{ userDetail.tag }}</n-tag>
                    <n-button text type="primary" size="tiny">{{ $t('common.modify') }}</n-button>
                  </div>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.loginPassword') }}:</span>
                  <span
                    >****** ({{ $t('user.userDetail.samePasswordCount') }}:
                    {{ userDetail.passwordMatchCount }})</span
                  >
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.withdrawPassword') }}:</span>
                  <span
                    >****** ({{ $t('user.userDetail.samePasswordCount') }}:
                    {{ userDetail.sameWithdrawalPinCount || 0 }})</span
                  >
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ $t('user.userDetail.withdrawAccounts') }}:</span>
                  <span
                    >{{ userDetail.withdrawAccountCount }}{{ $t('user.userDetail.units') }} ({{ $t('user.userDetail.sameAccountCount') }}:
                    {{ userDetail.sameAccountCount }})</span
                  >
                </div>
              </div>

              <template #action>
                <div class="flex gap-2">
                  <n-button size="small" type="primary">{{ $t('user.userDetail.moreAssociations') }}</n-button>
                  <n-button size="small">{{ $t('user.userDetail.record') }}</n-button>
                  <n-button size="small">{{ $t('common.refresh') }}</n-button>
                </div>
              </template>
            </n-card>
          </div>

          <!-- Section C: Login/Registration Device/IP Data -->
          <div class="col-span-2">
            <n-card :title="$t('user.userDetail.loginRegisterDevice')" size="small">
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-3">
                  <h4 class="font-medium text-gray-800">{{ $t('user.userDetail.registerInfo') }}</h4>
                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ $t('user.userDetail.registerIp') }}:</span>
                    <span
                      >{{ userDetail.registrationIp }} ({{ $t('user.userDetail.sameIpCount') }}:
                      {{ userDetail.sameRegIpCount }})</span
                    >
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ $t('user.userDetail.registerTime') }}:</span>
                    <span>{{
                      formatDateTime(userDetail.registrationTime)
                    }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ $t('user.userDetail.registerDomain') }}:</span>
                    <span>{{ userDetail.registrationDomain }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ $t('user.userDetail.registerDeviceId') }}:</span>
                    <span>{{ userDetail.registrationDeviceId }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ $t('user.userDetail.registerFingerprint') }}:</span>
                    <span class="truncate">{{
                      userDetail.registrationFingerprint
                    }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ $t('user.allMembers.registrationSource') }}:</span>
                    <n-tag
                      :type="
                        userDetail.registrationSource === '官网' ||
                        isOfficialRegistrationSource(userDetail.registrationSource)
                          ? 'info'
                          : 'success'
                      "
                      size="small"
                    >
                      {{ userDetail.registrationSource }}
                    </n-tag>
                  </div>
                </div>

                <div class="space-y-3">
                  <h4 class="font-medium text-gray-800">{{ $t('user.userDetail.lastLoginInfo') }}</h4>
                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ $t('user.userDetail.lastLoginIp') }}:</span>
                    <span>{{ userDetail.lastLoginIp }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ $t('user.userDetail.location') }}:</span>
                    <span>{{ userDetail.lastLoginLocation }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ $t('user.userDetail.lastLoginTime') }}:</span>
                    <span>{{ formatDateTime(userDetail.lastLoginTime) }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ $t('user.userDetail.lastLoginDomain') }}:</span>
                    <span>{{ userDetail.lastLoginDomain }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ $t('user.userDetail.lastLoginDeviceId') }}:</span>
                    <span>{{ userDetail.lastLoginDeviceId }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ $t('user.userDetail.lastLoginFingerprint') }}:</span>
                    <span class="truncate">{{
                      userDetail.lastLoginFingerprint
                    }}</span>
                  </div>
                </div>
              </div>

              <template #action>
                <div class="flex gap-2">
                  <n-button size="small" type="primary">{{ $t('user.userDetail.moreAssociations') }}</n-button>
                  <n-button size="small">{{ $t('user.userDetail.record') }}</n-button>
                  <n-button size="small">{{ $t('common.refresh') }}</n-button>
                </div>
              </template>
            </n-card>
          </div>
        </div>
      </n-tab-pane>

      <!-- 联系方式 -->
      <n-tab-pane name="contact" :tab="$t('user.userDetail.contact')">
        <n-result
          status="info"
          :title="$t('user.userDetail.securityPasswordRequired')"
          :description="$t('user.userDetail.enterSecurityPassword')"
        >
          <template #footer>
            <n-space>
              <n-input type="password" :placeholder="$t('user.userDetail.enterSecurityPasswordPlaceholder')" />
              <n-button type="primary">{{ $t('user.userDetail.decryptView') }}</n-button>
            </n-space>
          </template>
        </n-result>
      </n-tab-pane>

      <!-- 个人资料 -->
      <n-tab-pane name="profile" :tab="$t('user.userDetail.profile')">
        <div class="py-12 text-center text-gray-500">{{ $t('user.userDetail.profileDeveloping') }}</div>
      </n-tab-pane>

      <!-- 提现账号 -->
      <n-tab-pane name="withdraw" :tab="$t('user.userDetail.withdrawTab')">
        <div class="py-12 text-center text-gray-500">{{ $t('user.userDetail.withdrawDeveloping') }}</div>
      </n-tab-pane>

      <!-- 账户交易 -->
      <n-tab-pane name="transactions" :tab="$t('user.userDetail.transactions')">
        <div class="transactions-content">
          <!-- 筛选器区域 -->
          <div class="mb-4">
            <n-card size="small">
              <n-form inline :show-label="false">
                <n-form-item>
                  <n-button-group>
                    <n-button
                      :type="dateFilter === 'today' ? 'primary' : 'default'"
                      @click="setDateFilter('today')"
                      size="small"
                    >
                      {{ $t('user.userDetail.dayFilter') }}
                    </n-button>
                    <n-button
                      :type="dateFilter === 'week' ? 'primary' : 'default'"
                      @click="setDateFilter('week')"
                      size="small"
                    >
                      {{ $t('user.userDetail.weekFilter') }}
                    </n-button>
                    <n-button
                      :type="dateFilter === 'month' ? 'primary' : 'default'"
                      @click="setDateFilter('month')"
                      size="small"
                    >
                      {{ $t('user.userDetail.monthFilter') }}
                    </n-button>
                  </n-button-group>
                </n-form-item>

                <n-form-item>
                  <n-date-picker
                    v-model:value="dateRange"
                    type="datetimerange"
                    :start-placeholder="$t('common.startTime')"
                    :end-placeholder="$t('common.endTime')"
                    style="width: 360px"
                    @update:value="handleDateRangeChange"
                  />
                </n-form-item>

                <n-form-item>
                  <n-select
                    v-model:value="transactionTypeFilter"
                    :placeholder="$t('user.userDetail.transactionCategory')"
                    style="width: 120px"
                    @update:value="handleTransactionTypeFilter"
                  >
                    <n-option value="" :label="$t('common.all')" />
                    <n-option value="deposit" :label="$t('user.userDetail.deposit')" />
                    <n-option value="withdrawal" :label="$t('user.userDetail.withdrawal')" />
                    <n-option value="manual" :label="$t('user.userDetail.manual')" />
                    <n-option value="bet" :label="$t('user.userDetail.bet')" />
                    <n-option value="bonus" :label="$t('user.userDetail.bonus')" />
                  </n-select>
                </n-form-item>

                <n-form-item>
                  <n-input
                    v-model:value="transactionNumberFilter"
                    :placeholder="$t('user.userDetail.enterOrderNo')"
                    style="width: 120px"
                    clearable
                  />
                </n-form-item>

                <n-form-item>
                  <n-button type="primary" @click="handleSearchTransactions">
                    {{ $t('common.search') }}
                  </n-button>
                  <n-button
                    style="margin-left: 8px"
                    @click="handleResetFilters"
                  >
                    {{ $t('common.reset') }}
                  </n-button>
                </n-form-item>
              </n-form>
            </n-card>
          </div>

          <!-- 交易记录表格 -->
          <n-data-table
            :loading="transactionLoading"
            :columns="transactionFullColumns"
            :data="allTransactions"
            :pagination="transactionPaginationConfig"
            :scroll-x="1800"
            :row-key="(row: TransactionRecord) => row.id"
            remote
            @update:page="handleTransactionPageChange"
            @update:page-size="handleTransactionPageSizeChange"
          />
        </div>
      </n-tab-pane>

      <!-- 投注统计 -->
      <n-tab-pane name="betting" :tab="$t('user.userDetail.betting')">
        <div class="py-12 text-center text-gray-500">{{ $t('user.userDetail.bettingDeveloping') }}</div>
      </n-tab-pane>

      <!-- 会员消息 -->
      <n-tab-pane name="messages" :tab="$t('user.userDetail.messages')">
        <div class="py-12 text-center text-gray-500">{{ $t('user.userDetail.messagesDeveloping') }}</div>
      </n-tab-pane>

      <!-- 会员日志 -->
      <n-tab-pane name="logs" :tab="$t('user.userDetail.logs')">
        <div class="py-12 text-center text-gray-500">{{ $t('user.userDetail.logsDeveloping') }}</div>
      </n-tab-pane>

      <!-- 登录设备 -->
      <n-tab-pane name="devices" :tab="$t('user.userDetail.devices')">
        <div class="py-12 text-center text-gray-500">{{ $t('user.userDetail.devicesDeveloping') }}</div>
      </n-tab-pane>

      <!-- 账号同关联 -->
      <n-tab-pane name="associations" :tab="$t('user.userDetail.associations')">
        <div class="py-12 text-center text-gray-500">
          {{ $t('user.userDetail.associationsDeveloping') }}
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- Manual Credit Modal -->
    <ManualCreditModal
      ref="manualCreditModalRef"
      :user="props.user"
      @success="handleTransactionSuccess"
    />

    <!-- Manual Debit Modal -->
    <ManualDebitModal
      ref="manualDebitModalRef"
      :user="props.user"
      @success="handleTransactionSuccess"
    />

    <ManualPullbackModal
      ref="manualPullbackModalRef"
      :user-id="props.user?.id"
      :account="props.user?.account"
      @success="handleTransactionSuccess"
    />
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

function isNormalAccountStatus(status: string | undefined) {
  return ['NORMAL', 'ACTIVE', '正常'].includes(status || '');
}

function isOfficialRegistrationSource(source: string | undefined) {
  return ['官网', 'official', 'OFFICIAL'].includes(source || '');
}

import { ref, computed, h, watch } from 'vue';
import {
  NModal,
  NTabs,
  NTabPane,
  NCard,
  NTag,
  NButton,
  NButtonGroup,
  NResult,
  NSpace,
  NInput,
  NStatistic,
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NSelect,
} from 'naive-ui';
import { useAccessStore } from '@vben/stores';
import { getUserByIdApi } from '#/api/core/user-management';
import {
  getSameWithdrawalAccountCountApi,
  getUserSecurityStatsApi,
  type UserSecurityStats,
} from '#/api/core/user-detail';
import {
  getUserTransactionHistory,
  formatTransactionType,
  formatTransactionStatus,
  type TransactionRecord,
  getUserTransactionStats,
} from '#/api/core/transaction';
import ManualCreditModal from './ManualCreditModal.vue';
import ManualDebitModal from './ManualDebitModal.vue';
import ManualPullbackModal from './ManualPullbackModal.vue';
import { notification } from '#/adapter/naive';

// Define interfaces
interface PromotionStats {
  bonus: number;
  task: number;
  rechargeReward: number;
  abandonedReward: number;
}

interface UserDetail {
  id: number;
  account: string;
  realName: string;
  referrer: string;
  vipLevel: string;
  currency: string;
  status: string;
  accountType: string;
  selfExclusionStatus?: string;
  agentCommission: number;
  rewardWallet: number;
  savingsWallet: number;
  balance: number;
  frozenBalance: number;
  rechargeCount: number;
  rechargeAmount: number;
  withdrawCount: number;
  withdrawAmount: number;
  todayBetAmount: number;
  todayValidBet: number;
  todayProfit: number;
  promotionStats: PromotionStats;
  tag: string;
  level: string;
  passwordMatchCount: number;
  sameWithdrawalPinCount: number;
  withdrawAccountCount: number;
  sameAccountCount: number;
  registrationIp: string;
  registrationDomain: string;
  registrationTime: string;
  registrationDeviceId: string;
  registrationFingerprint: string;
  registrationSource: string;
  sameRegIpCount: number;
  lastLoginIp: string;
  lastLoginLocation: string;
  lastLoginDeviceId: string;
  lastLoginTime: string;
  lastLoginDomain: string;
  lastLoginFingerprint: string;
}

interface UserStats {
  totalDepositsCount: number;
  totalDeposits: number;
  totalWithdrawalsCount: number;
  totalWithdrawals: number;
  todayBetAmount: number;
  todayValidBetAmount: number;
  todayProfitLoss: number;
  totalBonusReceived: number;
}

// Props
const props = defineProps<{
  user?: any;
}>();

// Emits
const emit = defineEmits<{
  userUpdated: [user: any];
}>();

// State
const visible = ref(false);
const activeTab = ref('overview');
const manualCreditModalRef = ref();
const manualDebitModalRef = ref();
const manualPullbackModalRef = ref();
const currentUserData = ref<any>(null);
const accessStore = useAccessStore();

// Transaction-related state
const recentTransactions = ref<TransactionRecord[]>([]);
const allTransactions = ref<TransactionRecord[]>([]);
const transactionLoading = ref(false);
const dateFilter = ref(''); // Changed from 'today' to '' to show all transactions
const dateRange = ref<[number, number] | null>(null);
const transactionTypeFilter = ref('manual'); // 🎯 Default to manual transactions only
const transactionNumberFilter = ref('');

// Add a ref to hold user stats
const userStats = ref<UserStats | null>(null);

// Add a ref to hold bonus stats
const bonusStats = ref({ task: 0, rechargeReward: 0, abandonedReward: 0 });

// Transaction pagination
const transactionPagination = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
});

// Transaction pagination config
const transactionPaginationConfig = computed(() => ({
  page: transactionPagination.value.page,
  pageSize: transactionPagination.value.pageSize,
  itemCount: transactionPagination.value.itemCount,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
}));

// Transaction preview table columns
const transactionPreviewColumns = computed(() => [
  {
    title: $t('common.type'),
    key: 'transactionType',
    width: 80,
    render(row: TransactionRecord) {
      return h(
        NTag,
        {
          type: getTransactionTypeColor(row),
          size: 'small',
        },
        { default: () => getTransactionCategoryText(row) },
      );
    },
  },
  {
    title: $t('common.amount'),
    key: 'amount',
    width: 100,
    render(row: TransactionRecord) {
      return h(
        'span',
        {
          class: row.amount >= 0 ? 'text-green-600' : 'text-red-600',
        },
        formatCurrency(row.amount),
      );
    },
  },
  {
    title: $t('common.status'),
    key: 'status',
    width: 80,
    render(row: TransactionRecord) {
      const status = formatTransactionStatus(row.status);
      return h(
        NTag,
        {
          type: status.type,
          size: 'small',
        },
        { default: () => status.text },
      );
    },
  },
  {
    title: $t('common.time'),
    key: 'createdAt',
    width: 140,
    render(row: TransactionRecord) {
      return formatDateTime(row.createdAt);
    },
  },
  {
    title: $t('common.description'),
    key: 'description',
    ellipsis: { tooltip: true },
  },
]);

// Full transaction table columns (matching screenshot)
const transactionFullColumns = computed(() => [
  {
    title: $t('user.userDetail.orderNo'),
    key: 'id',
    width: 160,
    ellipsis: { tooltip: true },
  },
  {
    title: $t('user.transactionRecords.transactionTime'),
    key: 'createdAt',
    width: 160,
    render(row: TransactionRecord) {
      return row.createdAt ? formatDateTime(row.createdAt) : '-';
    },
  },
  {
    title: $t('user.userDetail.changeWalletCol'),
    key: 'wallet',
    width: 80,
    render() {
      return $t('user.userDetail.walletBalance');
    },
  },
  {
    title: $t('user.userDetail.transactionCategory'),
    key: 'transactionType',
    width: 100,
    render(row: TransactionRecord) {
      const type = row.transactionType;
      const color = getTransactionTypeColor(row);
      const text = getTransactionCategoryText(row);

      return h(
        NTag,
        {
          type: color,
          size: 'small',
        },
        { default: () => text },
      );
    },
  },
  {
    title: $t('user.userDetail.subCategory'),
    key: 'subType',
    width: 120,
    render(row: TransactionRecord) {
      return getTransactionSubTypeText(row);
    },
  },
  {
    title: $t('user.userDetail.balanceBefore'),
    key: 'balanceBefore',
    width: 120,
    render(row: TransactionRecord) {
      return typeof row.balanceBefore === 'number' && !isNaN(row.balanceBefore)
        ? formatCurrency(row.balanceBefore)
        : '-';
    },
  },
  {
    title: $t('user.userDetail.changeAmount'),
    key: 'amount',
    width: 120,
    render(row: TransactionRecord) {
      if (typeof row.amount !== 'number' || isNaN(row.amount)) {
        return '-';
      }

      // Determine if this should be red (debit/withdrawal) or green (credit/deposit)
      let shouldBeRed = false;

      // Real withdrawals from Withdrawal table
      if (row.transactionType === 'withdrawal') {
        shouldBeRed = true;
      }

      // Manual debits from ManualTransaction table
      if (row.transactionType === 'manual' && row.type === 'debit') {
        shouldBeRed = true;
      }

      // For other transaction types, use the sign of the amount
      if (!shouldBeRed) {
        shouldBeRed = row.amount < 0;
      }

      return h(
        'span',
        {
          class: shouldBeRed ? 'text-red-600' : 'text-green-600',
        },
        formatCurrency(Math.abs(row.amount)),
      );
    },
  },
  {
    title: $t('user.userDetail.balanceAfter'),
    key: 'balanceAfter',
    width: 120,
    render(row: TransactionRecord) {
      return typeof row.balanceAfter === 'number' && !isNaN(row.balanceAfter)
        ? formatCurrency(row.balanceAfter)
        : '-';
    },
  },
  {
    title: $t('user.userDetail.frontendNote'),
    key: 'frontendNotes',
    width: 150,
    ellipsis: { tooltip: true },
    render(row: TransactionRecord) {
      return row.frontendNotes || row.description || '-';
    },
  },
  {
    title: $t('user.userDetail.lastOperator'),
    key: 'operator',
    width: 120,
    render(row: TransactionRecord) {
      return row.processedBy || 'system';
    },
  },
  {
    title: $t('user.userDetail.backendNote'),
    key: 'backendNotes',
    width: 150,
    ellipsis: { tooltip: true },
    render(row: TransactionRecord) {
      return row.backendNotes || '-';
    },
  },
]);

// Mock user detail data
const userDetail = computed<UserDetail>(() => {
  const userData = currentUserData.value || props.user;
  const stats = userStats.value;
  const bonus = bonusStats.value;

  if (!userData) {
    return {
      id: 0,
      account: '',
      realName: '',
      referrer: '',
      vipLevel: '',
      currency: '',
      status: '',
      accountType: '',
      agentCommission: 0,
      rewardWallet: 0,
      savingsWallet: 0,
      balance: 0,
      frozenBalance: 0,
      rechargeCount: 0,
      rechargeAmount: 0,
      withdrawCount: 0,
      withdrawAmount: 0,
      todayBetAmount: 0,
      todayValidBet: 0,
      todayProfit: 0,
      promotionStats: {
        bonus: 0,
        task: 0,
        rechargeReward: 0,
        abandonedReward: 0,
      },
      tag: '',
      level: '',
      passwordMatchCount: 0,
      sameWithdrawalPinCount: 0,
      withdrawAccountCount: 0,
      sameAccountCount: 0,
      registrationIp: '',
      registrationDomain: '',
      registrationTime: '',
      registrationDeviceId: '',
      registrationFingerprint: '',
      registrationSource: '',
      sameRegIpCount: 0,
      lastLoginIp: '',
      lastLoginLocation: '',
      lastLoginDeviceId: '',
      lastLoginTime: '',
      lastLoginDomain: '',
      lastLoginFingerprint: '',
    };
  }

  // Use real data when available, fallback to mock data
  return {
    id: userData.id,
    account: userData.account,
    realName: userData.realName || userData.name || '--',
    referrer: userData.invitedBy || '--',
    vipLevel: userData.vipLevel || 'VIP0',
    currency: userData.currency || 'BRL',
    status:
      userData.status ||
      (userData.isBanned ? 'MANUAL_FREEZE' : 'NORMAL'),
    accountType: userData.accountType || $t('user.allMembers.officialMember'),
    selfExclusionStatus: undefined,
    agentCommission: 1250.0,
    // Use real balance data from API
    rewardWallet: Number(userData.rewardWallet) || 0,
    savingsWallet: Number(userData.savingsWallet) || 0,
    balance: Number(userData.balance) || 0,
    frozenBalance: Number(userData.frozenBalance) || 0,
    rechargeCount: stats?.totalDepositsCount ?? 0,
    rechargeAmount: stats?.totalDeposits ?? 0,
    withdrawCount: stats?.totalWithdrawalsCount ?? 0,
    withdrawAmount: stats?.totalWithdrawals ?? 0,
    todayBetAmount: stats?.todayBetAmount ?? 0,
    todayValidBet: stats?.todayValidBetAmount ?? 0,
    todayProfit: stats?.todayProfitLoss ?? 0,
    promotionStats: {
      bonus: stats?.totalBonusReceived ?? 0,
      task: bonus.task,
      rechargeReward: bonus.rechargeReward,
      abandonedReward: bonus.abandonedReward,
    },
    tag: userData.tag || $t('user.allMembers.defaultTag'),
    level: userData.memberLevel || $t('user.userDetail.defaultTier'),
    passwordMatchCount: 0, // Will be fetched from API
    sameWithdrawalPinCount: 0, // Will be fetched from API
    withdrawAccountCount: 0, // Will be fetched from API
    sameAccountCount: 0, // Will be fetched from API
    registrationIp: userData.registrationIp || '192.168.1.100',
    registrationDomain: userData.registrationDomain || 'www.example.com',
    registrationTime:
      userData.registrationTime || userData.createdAt || '2024-01-15 14:30:25',
    registrationDeviceId: 'DEV_123456789',
    registrationFingerprint: 'FP_abcdef123456',
    registrationSource:
      userData.registrationSource || $t('user.userDetail.officialSite'),
    sameRegIpCount: 0, // Will be fetched from API
    lastLoginIp: userData.lastLoginIp || '192.168.1.105',
    lastLoginLocation: userData.lastLoginLocation || '--',
    lastLoginDeviceId: 'DEV_987654321',
    lastLoginTime: userData.lastLoginTime || '2024-01-30 15:45:12',
    lastLoginDomain: 'www.example.com',
    lastLoginFingerprint: 'FP_xyz789abc456',
  };
});

// Watch for tab changes to load transactions automatically
watch(activeTab, (newTab) => {
  if (newTab === 'transactions' && props.user?.id) {
    console.log('🔄 Auto-loading transactions for tab switch');
    fetchAllTransactions();
  }
});

// Methods
// Helper functions for transaction display
const getTransactionCategoryText = (transaction: any): string => {
  // Handle real withdrawals from Withdrawal table
  if (transaction.transactionType === 'withdrawal') {
    return $t('user.userDetail.withdrawal');
  }

  // Handle manual transactions from ManualTransaction table
  if (transaction.transactionType === 'manual') {
    if (transaction.type === 'debit') {
      return $t('user.userDetail.manualDeduct');
    } else if (transaction.type === 'credit') {
      return $t('user.userDetail.manualCreditOp');
    }
    return $t('user.userDetail.manual');
  }

  // Handle other transaction types
  switch (transaction.transactionType) {
    case 'deposit':
      return $t('user.userDetail.deposit');
    case 'bet':
      return $t('user.userDetail.bet');
    case 'bonus':
      return $t('user.userDetail.bonus');
    default:
      return $t('user.userDetail.other');
  }
};

const getTransactionSubTypeText = (transaction: any): string => {
  // Handle real withdrawals from Withdrawal table
  if (transaction.transactionType === 'withdrawal') {
    return transaction.paymentMethod || $t('user.userDetail.withdrawal');
  }

  // Handle manual transactions from ManualTransaction table
  if (transaction.transactionType === 'manual') {
    if (transaction.type === 'debit') {
      return transaction.subType === 'manual_deduct' ? $t('user.userDetail.manualDeduct') : $t('user.userDetail.deduct');
    } else if (transaction.type === 'credit') {
      return transaction.subType === 'manual_credit' ? $t('user.userDetail.manualCreditOp') : $t('user.userDetail.credit');
    }
    return transaction.description || $t('user.userDetail.manual');
  }

  // Handle other transaction types
  switch (transaction.transactionType) {
    case 'deposit':
      return transaction.paymentMethod || $t('user.userDetail.deposit');
    case 'bet':
      return $t('user.userDetail.bet');
    case 'bonus':
      return $t('user.userDetail.bonus');
    default:
      return transaction.description || $t('user.userDetail.other');
  }
};

const getTransactionTypeColor = (transaction: any) => {
  // Handle real withdrawals and manual debits with red color
  if (transaction.transactionType === 'withdrawal') {
    return 'error'; // Red for real withdrawals
  }

  if (
    transaction.transactionType === 'manual' &&
    transaction.type === 'debit'
  ) {
    return 'error'; // Red for manual debits
  }

  // Handle other transaction types
  switch (transaction.transactionType) {
    case 'deposit':
      return 'success';
    case 'manual':
      return transaction.type === 'credit' ? 'success' : 'error';
    case 'bet':
      return 'info';
    case 'bonus':
      return 'warning';
    default:
      return 'default';
  }
};

// Helper function to format transaction status
const formatTransactionStatus = (status: string) => {
  switch (status) {
    case 'completed':
    case 'success':
      return { type: 'success', text: $t('common.success') };
    case 'pending':
      return { type: 'warning', text: $t('user.userDetail.processing') };
    case 'failed':
    case 'rejected':
      return { type: 'error', text: $t('common.failed') };
    default:
      return { type: 'default', text: status || $t('user.userDetail.unknown') };
  }
};

// Helper function to format transaction type for display
const formatTransactionType = (transaction: any): string => {
  return getTransactionCategoryText(transaction);
};

// Date filter handlers
const setDateFilter = (type: 'today' | 'week' | 'month') => {
  dateFilter.value = type;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (type) {
    case 'today':
      dateRange.value = [today.getTime(), now.getTime()];
      break;
    case 'week':
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateRange.value = [weekAgo.getTime(), now.getTime()];
      break;
    case 'month':
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateRange.value = [monthAgo.getTime(), now.getTime()];
      break;
  }
  handleSearchTransactions();
};

const handleDateRangeChange = () => {
  dateFilter.value = '';
  handleSearchTransactions();
};

const handleTransactionTypeFilter = () => {
  handleSearchTransactions();
};

const handleSearchTransactions = () => {
  transactionPagination.value.page = 1;
  fetchAllTransactions();
};

const handleResetFilters = () => {
  dateFilter.value = '';
  dateRange.value = null;
  transactionTypeFilter.value = '';
  transactionNumberFilter.value = '';
  // Don't set date filter to 'today' - show all transactions
  handleSearchTransactions();
};

// Transaction pagination handlers
const handleTransactionPageChange = (page: number) => {
  transactionPagination.value.page = page;
  fetchAllTransactions();
};

const handleTransactionPageSizeChange = (pageSize: number) => {
  transactionPagination.value.pageSize = pageSize;
  transactionPagination.value.page = 1;
  fetchAllTransactions();
};

// Fetch recent transactions for preview
const fetchRecentTransactions = async () => {
  if (!props.user?.id) return;

  transactionLoading.value = true;
  try {
    const response = await getUserTransactionHistory(props.user.id, {
      type: 'all',
      page: 1,
      pageSize: 5, // Only get the 5 most recent for preview
    });
    // Process transactions - handle string values from API
    recentTransactions.value = response.list.map((transaction) => ({
      ...transaction,
      amount:
        typeof transaction.amount === 'string'
          ? parseFloat(transaction.amount)
          : transaction.amount,
      balanceBefore:
        typeof transaction.balanceBefore === 'string'
          ? parseFloat(transaction.balanceBefore)
          : transaction.balanceBefore,
      balanceAfter:
        typeof transaction.balanceAfter === 'string'
          ? parseFloat(transaction.balanceAfter)
          : transaction.balanceAfter,
    }));
  } catch (error) {
    console.error('获取最近交易记录失败:', error);
    notification.error({
      content: $t('user.userDetail.loadRecentTxFailed'),
      duration: 3000,
    });
    recentTransactions.value = [];
  } finally {
    transactionLoading.value = false;
  }
};

// Fetch all transactions for the full table
const fetchAllTransactions = async () => {
  if (!props.user?.id) return;

  transactionLoading.value = true;
  try {
    const response = await getUserTransactionHistory(props.user.id, {
      type: transactionTypeFilter.value || 'all',
      page: transactionPagination.value.page,
      pageSize: transactionPagination.value.pageSize,
      startTime: dateRange.value?.[0],
      endTime: dateRange.value?.[1],
      orderNumber: transactionNumberFilter.value || '',
    });
    // Process transactions - handle string values from API
    const processedTransactions = response.list.map((transaction) => ({
      ...transaction,
      amount:
        typeof transaction.amount === 'string'
          ? parseFloat(transaction.amount)
          : transaction.amount,
      balanceBefore:
        typeof transaction.balanceBefore === 'string'
          ? parseFloat(transaction.balanceBefore)
          : transaction.balanceBefore,
      balanceAfter:
        typeof transaction.balanceAfter === 'string'
          ? parseFloat(transaction.balanceAfter)
          : transaction.balanceAfter,
    }));
    allTransactions.value = processedTransactions;
    transactionPagination.value.itemCount =
      response.pagination?.total || processedTransactions.length;
    console.log('✅ Transaction list loaded:', allTransactions.value);
    console.log('📊 Raw response:', response);
    console.log('📊 Processed transactions:', processedTransactions);
  } catch (error) {
    console.error('❌ 获取交易记录失败:', error);
    notification.error({
      content: $t('user.userDetail.loadTxFailed'),
      duration: 3000,
    });
    allTransactions.value = [];
  } finally {
    transactionLoading.value = false;
  }
};

// Fetch user stats from backend
const fetchUserStats = async () => {
  if (!props.user?.id) return;
  try {
    userStats.value = await getUserTransactionStats(props.user.id);
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    userStats.value = null;
  }
};

// Fetch all bonus transactions and compute sums by subType
const fetchBonusStats = async () => {
  if (!props.user?.id) return;
  try {
    // Fetch all bonus transactions (large pageSize for now)
    const response = await getUserTransactionHistory(props.user.id, {
      type: 'bonus',
      page: 1,
      pageSize: 1000,
    });
    const list = response.list || [];
    bonusStats.value = list.reduce(
      (acc, tx) => {
        if (tx.subType === 'task') acc.task += Number(tx.amount) || 0;
        if (tx.subType === 'recharge_reward')
          acc.rechargeReward += Number(tx.amount) || 0;
        if (tx.subType === 'abandoned_reward')
          acc.abandonedReward += Number(tx.amount) || 0;
        return acc;
      },
      { task: 0, rechargeReward: 0, abandonedReward: 0 },
    );
  } catch (error) {
    console.error('Failed to fetch bonus stats:', error);
    bonusStats.value = { task: 0, rechargeReward: 0, abandonedReward: 0 };
  }
};

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR');
};

// Balance action handlers
const handleRefreshBalance = async () => {
  console.log('刷新账户余额');
  await refreshUserData();
};

const handleManualPullback = () => {
  manualPullbackModalRef.value?.open();
};

const handleAccountRecords = () => {
  console.log('切换到账户交易标签页');
  // Switch to transactions tab and load data
  activeTab.value = 'transactions';
  // Immediately load transactions when switching to the tab
  fetchAllTransactions();
};

const handleManualCredit = () => {
  console.log('手动加款');
  manualCreditModalRef.value?.open();
};

const handleManualDebit = () => {
  console.log('手动扣除');
  manualDebitModalRef.value?.open();
};

const handleTransactionSuccess = async (transactionData?: any) => {
  console.log('Transaction completed successfully', transactionData);

  // Add a small delay to ensure backend has processed the transaction
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Always refresh user data from API to get the latest balance
  // This ensures we show real database values, not calculated ones
  await refreshUserData();

  console.log('User data refreshed after transaction');
  console.log('Updated user data emitted to parent component');
};

// Refresh user data from API
const refreshUserData = async () => {
  try {
    if (!props.user?.id) {
      console.warn('No user ID available for refresh');
      return;
    }

    console.log('🔄 Refreshing user data for ID:', props.user.id);

    let response;
    try {
      response = await getUserByIdApi(props.user.id.toString());
      console.log('📡 API Response received successfully:', response);
    } catch (apiError) {
      console.error('🚨 API call failed:', apiError);
      throw apiError;
    }

    console.log('📡 API Response:', response);

    // Handle different possible response structures
    let userData;
    if (response?.data?.data) {
      // Nested structure: {data: {data: {...}}}
      userData = response.data.data;
      console.log('📊 Using nested structure: response.data.data');
    } else if (response?.data) {
      // Direct structure: {data: {...}}
      userData = response.data;
      console.log('📊 Using direct structure: response.data');
    } else {
      // Direct response
      userData = response;
      console.log('📊 Using response directly');
    }

    console.log('🎯 Extracted user data:', userData);

    // Validate the extracted user data
    if (!userData || typeof userData !== 'object') {
      console.error('❌ Invalid userData type:', typeof userData, userData);
      throw new Error('Invalid user data format');
    }

    if (!userData.id) {
      console.error('❌ Missing user ID in response:', userData);
      throw new Error('Missing user ID in response');
    }

    console.log('✅ Validation passed, updating user data');

    // ✅ Preserve reactivity - ensure currentUserData is initialized
    if (!currentUserData.value) {
      currentUserData.value = {};
    }
    Object.assign(currentUserData.value, userData);

    console.log('💾 Updated currentUserData:', currentUserData.value);

    // ✅ OPTIMIZATION: Fetch security statistics in background (non-blocking)
    // Don't await - let it load in background while popup is already visible
    Promise.all([
      getUserSecurityStatsApi(props.user.id),
      getSameWithdrawalAccountCountApi(props.user.id),
    ])
      .then(([securityStats, sameWithdrawalAccountCount]) => {
        console.log('📊 Security stats received:', securityStats);

        // Update user detail with real security stats
        if (userDetail.value) {
          userDetail.value.passwordMatchCount =
            securityStats.passwordMatchCount;
          userDetail.value.sameWithdrawalPinCount =
            securityStats.sameWithdrawalPinCount;
          userDetail.value.withdrawAccountCount =
            securityStats.withdrawAccountCount;
          userDetail.value.sameAccountCount =
            sameWithdrawalAccountCount ||
            securityStats.sameWithdrawalAccountCount ||
            securityStats.sameAccountCount;
          userDetail.value.sameRegIpCount = securityStats.sameRegIpCount;
          console.log('✅ Security stats updated in userDetail');
        }
      })
      .catch((securityError) => {
        console.error('❌ Failed to fetch security stats:', securityError);
        // Don't fail the whole operation if security stats fail
      });

    // Emit the updated user data to parent component
    emit('userUpdated', userData);
    console.log('📤 Emitted userUpdated event');
  } catch (error: any) {
    console.error('❌ Failed to refresh user data:');
    console.error('Error message:', error?.message);
    console.error('Error object:', error);
    console.error('Error type:', typeof error);
    console.error('User ID was:', props.user?.id);

    // Check if this is actually a successful response being thrown as an error
    if (
      error &&
      typeof error === 'object' &&
      error.success === true &&
      error.data
    ) {
      console.log(
        '🔧 Detected successful response in error - attempting to extract data',
      );
      try {
        const userData = error.data;
        if (userData && userData.id) {
          console.log('✅ Successfully extracted user data from error object');
          if (!currentUserData.value) {
            currentUserData.value = {};
          }
          Object.assign(currentUserData.value, userData);
          emit('userUpdated', userData);
          console.log('💾 Recovery successful, user data updated');
          return; // Success!
        }
      } catch (recoveryError) {
        console.error('Failed to recover from error:', recoveryError);
      }
    }

    // Don't throw the error, just log it to prevent UI disruption
  }
};

// Transaction history methods
const handleViewAllTransactions = () => {
  if (props.user?.id) {
    // This function is no longer needed as TransactionRecordsModal is removed
    // The logic to fetch and display transactions directly in the transactions tab
    // or a new modal would need to be re-evaluated based on the new UI structure.
    // For now, we'll just log a message.
    console.log('View all transactions for user ID:', props.user.id);
    // Example: If you want to fetch and display in the current tab, you'd call a function here
    // that fetches transactions and updates the recentTransactions ref.
  }
};

const open = () => {
  visible.value = true;
  activeTab.value = 'overview';
  currentUserData.value = props.user ? { ...props.user } : null;
  fetchUserStats();
  fetchBonusStats();
  if (props.user?.id) {
    // ✅ FIX: Only call refreshUserData once - it will fetch all user data
    // Removed duplicate calls to prevent double API requests
    refreshUserData();
    fetchRecentTransactions();
    fetchAllTransactions();
  }
};

const close = () => {
  visible.value = false;
  currentUserData.value = null;
};

// Expose methods
defineExpose({
  open,
  close,
});
</script>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.col-span-2 {
  grid-column: span 2 / span 2;
}

.gap-6 {
  gap: 1.5rem;
}

.space-y-3 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 0.75rem;
}

.space-y-4 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 1rem;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-800 {
  color: #1f2937;
}

.text-green-600 {
  color: #059669;
}

.text-red-600 {
  color: #dc2626;
}

.font-medium {
  font-weight: 500;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-1 {
  gap: 0.25rem;
}

.gap-3 {
  gap: 0.75rem;
}
</style>
