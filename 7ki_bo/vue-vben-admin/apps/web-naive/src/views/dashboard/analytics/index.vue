<template>
  <div class="p-5">
    <!-- 今日数据概览 - Summary Cards -->
    <div class="mb-6">
      <h2 class="mb-4 text-lg font-semibold">
        {{ $t('page.dashboard.todayOverview') }}
      </h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <!-- 今日新增 -->
        <div class="rounded-lg bg-orange-500 p-4 text-white">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold">
                {{ dashboardData.todayNewAgents }}
              </div>
              <div class="text-sm opacity-90">
                {{ $t('page.dashboard.todayNew') }}
              </div>
              <div class="mt-1 text-xs">
                {{ $t('page.dashboard.newAgents') }}
                {{ dashboardData.todayNewAgents }} |
                {{ $t('page.dashboard.bigR') }} {{ dashboardData.todayNewVIP }}
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="text-xs text-red-200">
                {{ getChangePercentage('todayNewAgents') }}
              </div>
            </div>
          </div>
        </div>

        <!-- 会员注册 -->
        <div class="rounded-lg bg-blue-500 p-4 text-white">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold">
                {{ dashboardData.todayRegistrations }}
              </div>
              <div class="text-sm opacity-90">
                {{ $t('page.dashboard.memberRegistration') }}
              </div>
              <div class="mt-1 text-xs">
                {{
                  $t('page.dashboard.todayNewMembers', [
                    dashboardData.todayRegistrations,
                  ])
                }}
                |
                {{
                  $t('page.dashboard.agentPromotion', [
                    Math.floor(dashboardData.todayRegistrations * 0.8),
                  ])
                }}
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="text-xs text-green-200">
                {{ getChangePercentage('todayRegistrations') }}
              </div>
            </div>
          </div>
        </div>

        <!-- 充值提现 -->
        <div class="rounded-lg bg-pink-500 p-4 text-white">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold">
                R$
                {{
                  Number(
                    dashboardData.todayRecharge - dashboardData.todayWithdraw,
                  ).toFixed(2)
                }}
              </div>
              <div class="text-sm opacity-90">
                {{ $t('page.dashboard.rechargeWithdraw') }}
              </div>
              <div class="mt-1 text-xs">
                {{
                  $t('page.dashboard.todayRecharge', [
                    Number(dashboardData.todayRecharge || 0).toFixed(2),
                  ])
                }}
                |
                {{
                  $t('page.dashboard.todayWithdraw', [
                    Number(dashboardData.todayWithdraw || 0).toFixed(2),
                  ])
                }}
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="text-xs text-red-200">
                {{ getChangePercentage('netAmount') }}
              </div>
            </div>
          </div>
        </div>

        <!-- 今日损益 -->
        <div class="rounded-lg bg-green-500 p-4 text-white">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold">
                {{ Number(dashboardData.todayProfit || 0) >= 0 ? '+' : ''
                }}{{ Number(dashboardData.todayProfit || 0).toFixed(2) }}
              </div>
              <div class="text-sm opacity-90">
                {{ $t('page.dashboard.todayProfitLoss') }}
              </div>
              <div class="mt-1 text-xs">
                {{
                  $t('page.dashboard.validBet', [
                    Number(dashboardData.todayValidBet || 0).toLocaleString(),
                    Number(dashboardData.todayProfit || 0).toFixed(2),
                  ])
                }}
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="text-xs text-red-200">
                {{ getChangePercentage('todayProfit') }}
              </div>
            </div>
          </div>
        </div>

        <!-- 今日优惠 -->
        <div class="rounded-lg bg-purple-500 p-4 text-white">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold">
                {{ Number(dashboardData.todayPromotionBonus || 0).toFixed(2) }}
              </div>
              <div class="text-sm opacity-90">
                {{ $t('page.dashboard.todayPromotion') }}
              </div>
              <div class="mt-1 text-xs">
                {{
                  $t('page.dashboard.activityRebate', [
                    Number(dashboardData.todayPromotionBonus || 0).toFixed(2),
                  ])
                }}
                |
                {{
                  $t('page.dashboard.betRebate', [
                    Number(
                      (dashboardData.todayPromotionBonus || 0) * 0.7,
                    ).toFixed(2),
                  ])
                }}
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="text-xs text-red-200">
                {{ getChangePercentage('todayPromotionBonus') }}
              </div>
            </div>
          </div>
        </div>

        <!-- 会员总数 -->
        <div class="rounded-lg bg-cyan-500 p-4 text-white">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold">
                {{ dashboardData.totalMembers.toLocaleString() }}
              </div>
              <div class="text-sm opacity-90">
                {{ $t('page.dashboard.totalMembers') }}
              </div>
              <div class="mt-1 text-xs">
                {{
                  $t('page.dashboard.total', [
                    dashboardData.totalMembers.toLocaleString(),
                  ])
                }}
                |
                {{
                  $t('page.dashboard.active', [
                    dashboardData.todayActiveMembers.toLocaleString(),
                  ])
                }}
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="text-xs text-red-200">
                {{ getChangePercentage('totalMembers') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 今日排行榜 - Rankings Section -->
    <div>
      <h2 class="mb-4 text-lg font-semibold">
        {{ $t('page.dashboard.todayRankings') }}
      </h2>
      <div class="rounded-lg bg-white p-4 shadow">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              :class="[
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium',
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <div class="mt-4">
          <div v-if="loading" class="flex justify-center py-8">
            <div class="text-gray-500">{{ $t('page.dashboard.loading') }}</div>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {{ $t('page.dashboard.rank') }}
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {{ $t('page.dashboard.currency') }}
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {{ $t('page.dashboard.memberId') }}
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {{ $t('page.dashboard.memberAccount') }}
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {{ $t('page.dashboard.uplineAgent') }}
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {{ $t('page.dashboard.registrationSource') }}
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {{ $t('page.dashboard.amount') }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="item in currentRankings" :key="item.rank">
                  <td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <span :class="getRankColor(item.rank)">{{
                      item.rank
                    }}</span>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {{ item.currency }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {{ item.memberId }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {{ item.memberAccount }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {{ item.uplineAgent }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    <span
                      :class="
                        item.registrationSource === '推广注册' ||
                        item.registrationSource ===
                          $t('page.dashboard.promotionRegistration')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      "
                      class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                    >
                      {{
                        item.registrationSource === '推广注册'
                          ? $t('page.dashboard.promotionRegistration')
                          : item.registrationSource === '官网'
                            ? $t('page.dashboard.officialWebsite')
                            : item.registrationSource
                      }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    R$ {{ Number(item.amount || 0).toFixed(2) }}
                  </td>
                </tr>
                <tr v-if="currentRankings.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    {{ $t('page.dashboard.noData') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { $t } from '@vben/locales';
import {
  getDashboardAnalytics,
  getRankingData,
  getDashboardDiffApi,
  subscribeDashboardStream,
} from '#/api/analytics';
import { getTodayInTimezone } from '#/utils/timezoneUtils';

// 接口定义
interface DashboardData {
  todayNewAgents: number;
  todayNewVIP: number;
  todayRegistrations: number;
  todayRecharge: number;
  todayWithdraw: number;
  todayProfit: number;
  todayPromotionBonus: number;
  totalMembers: number;
  todayActiveMembers: number;
  todayValidBet: number;
}

interface RankingData {
  rank: number;
  currency: string;
  memberId: string;
  memberAccount: string;
  uplineAgent: string;
  registrationSource: string;
  amount: number;
}

// 响应式数据
const loading = ref(false);
const dashboardData = ref<DashboardData>({
  todayNewAgents: 0,
  todayNewVIP: 0,
  todayRegistrations: 0,
  todayRecharge: 0,
  todayWithdraw: 0,
  todayProfit: 0,
  todayPromotionBonus: 0,
  totalMembers: 0,
  todayActiveMembers: 0,
  todayValidBet: 0,
});

const activeTab = ref('recharge');
const rankings = ref<{
  recharge: RankingData[];
  bet: RankingData[];
  profit: RankingData[];
  commission: RankingData[];
}>({
  recharge: [],
  bet: [],
  profit: [],
  commission: [],
});

// 选项配置
const tabs = computed(() => [
  { key: 'recharge', name: $t('page.dashboard.rechargeRanking') },
  { key: 'bet', name: $t('page.dashboard.betRanking') },
  { key: 'profit', name: $t('page.dashboard.profitRanking') },
  { key: 'commission', name: $t('page.dashboard.commissionRanking') },
]);

// 计算属性
const currentRankings = computed(() => {
  return rankings.value[activeTab.value as keyof typeof rankings.value] || [];
});

// 方法
const getTodayString = () => {
  // 🌍 Use UTC-3 timezone (America/Sao_Paulo) for date calculations
  return getTodayInTimezone('America/Sao_Paulo');
};

const diffPercents = ref<Record<string, string>>({});

const getChangePercentage = (field: string) => {
  return diffPercents.value[field] || '0.00%';
};

const getRankColor = (rank: number) => {
  const colors = ['text-yellow-600', 'text-gray-600', 'text-purple-600'];
  return rank <= 3 ? colors[rank - 1] : 'text-gray-600';
};

// 加载今日统计数据与全部排行榜（统一分析接口）
const loadTodayStats = async () => {
  try {
    loading.value = true;
    const todayStr = getTodayString();
    console.log('🔄 Loading dashboard analytics for date:', todayStr);

    const { stats, rankings: allRankings } = await getDashboardAnalytics();

    console.log('📊 Raw stats received from API:', stats);
    console.log('📊 Today string used:', todayStr);

    dashboardData.value = {
      todayNewAgents: Number(stats.todayNewAgents || 0),
      todayNewVIP: Number(stats.todayNewVIP || 0),
      todayRegistrations: Number(stats.todayRegistrations || 0),
      todayRecharge: Number(stats.todayRecharge || 0),
      todayWithdraw: Number(stats.todayWithdraw || 0),
      todayProfit: Number(stats.todayProfit || 0),
      todayPromotionBonus: Number(stats.todayPromotionBonus || 0),
      totalMembers: Number(stats.totalMembers || 0),
      todayActiveMembers: Number(stats.todayActiveMembers || 0),
      todayValidBet: Number(stats.todayValidBet || 0),
    } as any;

    console.log('📊 Dashboard data after binding:', dashboardData.value);

    // 预加载所有排行榜
    rankings.value = {
      recharge: allRankings.recharge,
      bet: allRankings.bet,
      profit: allRankings.profit,
      commission: allRankings.commission,
    } as any;

    console.log('📊 Dashboard data updated and rankings preloaded');
    console.log('📊 Rankings data:', {
      recharge: allRankings.recharge?.length || 0,
      bet: allRankings.bet?.length || 0,
      profit: allRankings.profit?.length || 0,
      commission: allRankings.commission?.length || 0,
    });
  } catch (error) {
    console.error('💥 Error loading dashboard stats:', error);
  } finally {
    loading.value = false;
  }
};

// 加载排行榜数据
const loadRankingsData = async (type: string) => {
  try {
    // 若已通过统一接口预加载，则不再二次请求
    if (
      (rankings.value[type as keyof typeof rankings.value] || []).length > 0
    ) {
      return;
    }
    console.log(`🔄 Loading ${type} rankings...`);
    const data = await getRankingData(type, 10);
    rankings.value[type as keyof typeof rankings.value] = data;
    console.log(`✅ ${type} rankings loaded:`, data.length, 'items');
    if (data.length > 0) {
      console.log(`📊 Sample ${type} ranking item:`, data[0]);
    }
  } catch (error) {
    console.error(`💥 Error loading ${type} rankings:`, error);
    rankings.value[type as keyof typeof rankings.value] = [];
  }
};

// 监听tab变化，加载对应排行榜数据
watch(
  activeTab,
  (newTab) => {
    loadRankingsData(newTab);
  },
  { immediate: true },
);

// 初始化
onMounted(async () => {
  console.log('🚀 Analytics dashboard mounted');
  await loadTodayStats();
  await loadRankingsData(activeTab.value);
  // Load real percentage diffs
  try {
    const diff = await getDashboardDiffApi();
    if (!diff || !diff.today || !diff.yesterday) {
      console.warn('⚠️ Dashboard diff API returned invalid structure:', diff);
      return;
    }
    const t = diff.today as any;
    const y = diff.yesterday as any;
    const calc = (a: number, b: number) => {
      const base = b || 0;
      if (base === 0) return a === 0 ? '0.00%' : '100.00%';
      const v = ((a - base) / base) * 100;
      return `${v >= 0 ? '' : ''}${v.toFixed(2)}%`;
    };
    diffPercents.value = {
      todayNewAgents: calc(t.todayNewAgents || 0, y.todayNewAgents || 0),
      todayRegistrations: calc(
        t.todayRegistrations || 0,
        y.todayRegistrations || 0,
      ),
      todayProfit: (() => {
        const today = Number(t.todayProfit || 0);
        const yesterday = Number(y.todayProfit || 0);
        if (yesterday === 0) return today === 0 ? '0.00%' : '100.00%';
        // For profit percentage, use a more reasonable calculation
        const change = today - yesterday;
        const baseValue = Math.abs(yesterday) || 1; // Avoid division by zero
        const percentage = (change / baseValue) * 100;
        // Cap the percentage to reasonable values
        const cappedPercentage = Math.max(-1000, Math.min(1000, percentage));
        return `${cappedPercentage >= 0 ? '+' : ''}${cappedPercentage.toFixed(2)}%`;
      })(),
      todayPromotionBonus: calc(
        t.todayPromotionBonus || 0,
        y.todayPromotionBonus || 0,
      ),
      // 会员总数百分比：活跃会员 / 会员总数
      totalMembers: (() => {
        const total = Number(t.totalMembers || 0);
        const active = Number(t.todayActiveMembers || 0);
        if (!total) return '0.00%';
        return `${((active / total) * 100).toFixed(2)}%`;
      })(),
      // 充值提现百分比：使用“今日充值/今日提现”计算净比率 = (充值-提现)/充值
      netAmount: (() => {
        const dep = Number(t.todayRecharge || 0);
        const wd = Number(t.todayWithdraw || 0);
        if (!dep) return '0.00%';
        const v = ((dep - wd) / dep) * 100;
        return `${v.toFixed(2)}%`;
      })(),
    };
  } catch (e) {
    console.warn('Failed to fetch dashboard diffs', e);
  }
  // Subscribe to real-time dashboard stats via SSE
  try {
    const unsubscribe = await subscribeDashboardStream((data) => {
      dashboardData.value = {
        todayNewAgents: Number(data.todayNewAgents || 0),
        todayNewVIP: Number(data.todayNewVIP || 0),
        todayRegistrations: Number(data.todayRegistrations || 0),
        todayRecharge: Number(data.todayRecharge || 0),
        todayWithdraw: Number(data.todayWithdraw || 0),
        todayProfit: Number(data.todayProfit || 0),
        todayPromotionBonus: Number(data.todayPromotionBonus || 0),
        totalMembers: Number(data.totalMembers || 0),
        todayActiveMembers: Number(data.todayActiveMembers || 0),
        todayValidBet: Number(data.todayValidBet || 0),
      } as any;
    });
    // Optional: attach to window for manual stop if needed
    (window as any).__analyticsUnsub = unsubscribe;
  } catch (err) {
    console.warn('Realtime subscription failed', err);
  }
});
</script>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.gap-4 {
  gap: 1rem;
}

.bg-orange-500 {
  background-color: #f97316;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.bg-pink-500 {
  background-color: #ec4899;
}

.bg-green-500 {
  background-color: #10b981;
}

.bg-purple-500 {
  background-color: #8b5cf6;
}

.bg-cyan-500 {
  background-color: #06b6d4;
}

.text-white {
  color: white;
}

.text-2xl {
  font-size: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
}

.opacity-90 {
  opacity: 0.9;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-4 {
  margin-top: 1rem;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.items-end {
  align-items: flex-end;
}

.justify-between {
  justify-content: space-between;
}

.text-green-200 {
  color: #bbf7d0;
}

.text-red-200 {
  color: #fecaca;
}

.p-4 {
  padding: 1rem;
}

.p-5 {
  padding: 1.25rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.bg-white {
  background-color: white;
}

.shadow {
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.border-b {
  border-bottom-width: 1px;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.space-x-8 > :not([hidden]) ~ :not([hidden]) {
  margin-left: 2rem;
}

.border-blue-500 {
  border-color: #3b82f6;
}

.text-blue-600 {
  color: #2563eb;
}

.border-transparent {
  border-color: transparent;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-700 {
  color: #374151;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.hover\:text-gray-700:hover {
  color: #374151;
}

.hover\:border-gray-300:hover {
  border-color: #d1d5db;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.px-1 {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.border-b-2 {
  border-bottom-width: 2px;
}

.overflow-x-auto {
  overflow-x: auto;
}

.min-w-full {
  min-width: 100%;
}

.divide-y {
  border-top-width: 1px;
}

.divide-gray-200 > :not([hidden]) ~ :not([hidden]) {
  border-top-color: #e5e7eb;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.text-left {
  text-align: left;
}

.uppercase {
  text-transform: uppercase;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.text-gray-900 {
  color: #111827;
}

.bg-green-100 {
  background-color: #dcfce7;
}

.text-green-800 {
  color: #166534;
}

.bg-blue-100 {
  background-color: #dbeafe;
}

.text-blue-800 {
  color: #1e40af;
}

.inline-flex {
  display: inline-flex;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.rounded-full {
  border-radius: 9999px;
}

.text-yellow-600 {
  color: #d97706;
}

.text-gray-600 {
  color: #4b5563;
}

.text-purple-600 {
  color: #9333ea;
}
</style>
