import { requestClient } from '#/api/request';
import { getRechargeStatistics } from '#/api/finance/recharge-orders';
import { withdrawalApi } from '#/api/finance/withdrawal';
import { getTodayInTimezone } from '#/utils/timezoneUtils';

// ===================================
// INTERFACES
// ===================================

export interface DashboardStats {
  // Today's overview data
  todayNewAgents: number;
  todayNewVIP: number;
  todayRegistrations: number;
  todayActiveMembers: number;
  todayRecharge: number;
  todayWithdraw: number;
  todayProfit: number;
  todayPromotionBonus: number;
  totalMembers: number;
  todayValidBet: number;
}

export interface RankingData {
  rank: number;
  currency: string;
  memberId: string;
  memberAccount: string;
  uplineAgent: string;
  registrationSource: string;
  amount: number;
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  currency?: string;
}

// ===================================
// API FUNCTIONS
// ===================================

/**
 * Get today's dashboard statistics
 */
export async function getTodayDashboardStats(): Promise<DashboardStats> {
  try {
    // 🌍 Use UTC-3 timezone (America/Sao_Paulo) for date calculations
    const todayStr = getTodayInTimezone('America/Sao_Paulo'); // YYYY-MM-DD format
    
    // Get multiple statistics in parallel
    const [
      rechargeStats,
      withdrawalStats,
      memberStats,
      agentStats,
      vipStats
    ] = await Promise.allSettled([
      getRechargeStatistics({ startDate: todayStr, endDate: todayStr }),
      withdrawalApi.getStatistics({ startDate: todayStr, endDate: todayStr }),
      getMemberStatistics({ date: todayStr as string }),
      getAgentStatistics({ date: todayStr as string }),
      getVIPStatistics({ date: todayStr as string })
    ]);

    // Fetch today recharge/withdraw from unified endpoint for accuracy
    let todayRecharge = 0;
    let todayWithdraw = 0;
    try {
      const rw = await requestClient.get<{ todayRecharge: number; todayWithdraw: number }>(
        '/analytics/recharge-withdraw-summary',
        { params: { date: todayStr } }
      );
      // requestClient returns parsed data directly
      todayRecharge = (rw as any).todayRecharge || 0;
      todayWithdraw = (rw as any).todayWithdraw || 0;
      console.log('📊 Recharge/Withdraw summary:', { todayRecharge, todayWithdraw });
    } catch (e) {
      // fallback to previous approach if needed
      if (rechargeStats.status === 'fulfilled' && rechargeStats.value?.data) {
        const dailyStats = rechargeStats.value.data.dailyStats || [];
        todayRecharge = dailyStats.reduce((sum, stat) => sum + (stat.actualAmount || 0), 0);
      }
      if (withdrawalStats.status === 'fulfilled' && withdrawalStats.value?.data) {
        todayWithdraw = withdrawalStats.value.data.todayTotal || 0;
      }
    }

    // Process member data
    let todayRegistrations = 0;
    let todayActiveMembers = 0;
    let totalMembers = 0;
    if (memberStats.status === 'fulfilled' && memberStats.value) {
      todayRegistrations = memberStats.value.todayRegistrations || 0;
      todayActiveMembers = memberStats.value.todayActiveMembers || 0;
      totalMembers = memberStats.value.totalMembers || 0;
      console.log('📊 Member stats:', { todayRegistrations, todayActiveMembers, totalMembers });
    } else if (memberStats.status === 'rejected') {
      console.error('❌ Member stats failed:', memberStats.reason);
    }

    // Process agent data
    let todayNewAgents = 0;
    if (agentStats.status === 'fulfilled' && agentStats.value) {
      todayNewAgents = agentStats.value.todayNewAgents || 0;
      console.log('📊 Agent stats:', { todayNewAgents });
    } else if (agentStats.status === 'rejected') {
      console.error('❌ Agent stats failed:', agentStats.reason);
    }

    // Process VIP data
    let todayNewVIP = 0;
    if (vipStats.status === 'fulfilled' && vipStats.value) {
      todayNewVIP = vipStats.value.todayNewVIP || 0;
      console.log('📊 VIP stats:', { todayNewVIP });
    } else if (vipStats.status === 'rejected') {
      console.error('❌ VIP stats failed:', vipStats.reason);
    }

    // Calculate today's profit and valid bet (will be fetched from separate API)
    let todayProfit = 0;
    let todayValidBet = 0;
    try {
      const profitStats = await requestClient.get('/analytics/profit', { 
        params: { date: todayStr } 
      });
      todayProfit = profitStats.todayProfit || 0;
      todayValidBet = profitStats.todayValidBet || 0;
      console.log('📊 Profit stats:', { todayProfit, todayValidBet });
    } catch (error) {
      console.warn('Could not fetch profit stats:', error);
    }

    // Fetch today's promotion bonus
    let todayPromotionBonus = 0;
    try {
      const promotionStats = await getPromotionStats();
      todayPromotionBonus = promotionStats.todayBonus || 0;
      console.log('📊 Promotion bonus fetched:', todayPromotionBonus);
    } catch (error) {
      console.warn('Could not fetch promotion stats:', error);
    }

    const result = {
      todayNewAgents,
      todayNewVIP,
      todayRegistrations,
      todayActiveMembers,
      todayRecharge,
      todayWithdraw,
      todayProfit,
      todayPromotionBonus,
      totalMembers,
      todayValidBet
    };
    
    console.log('📊 Final dashboard stats result:', result);
    return result;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return fallback data on error
    return {
      todayNewAgents: 0,
      todayNewVIP: 0,
      todayRegistrations: 0,
      todayActiveMembers: 0,
      todayRecharge: 0,
      todayWithdraw: 0,
      todayProfit: 0,
      todayPromotionBonus: 0,
      totalMembers: 0,
      todayValidBet: 0
    };
  }
}

/**
 * Get member statistics
 */
async function getMemberStatistics(params: { date: string }) {
  return requestClient.get<{
    todayRegistrations: number;
    totalMembers: number;
    todayActiveMembers: number;
  }>('/analytics/members', { params });
}

/**
 * Get agent statistics
 */
async function getAgentStatistics(params: { date: string }) {
  return requestClient.get<{
    todayNewAgents: number;
    totalAgents: number;
    activeAgents: number;
  }>('/analytics/agents', { params });
}

/**
 * Get VIP statistics
 */
async function getVIPStatistics(params: { date: string }) {
  return requestClient.get<{
    todayNewVIP: number;
    totalVIP: number;
    vipDistribution: Record<string, number>;
  }>('/analytics/vip', { params });
}

/**
 * Get ranking data by type
 */
export async function getRankingData(type: 'recharge' | 'bet' | 'profit' | 'commission', limit = 10): Promise<RankingData[]> {
  try {
    // 🌍 Use UTC-3 timezone (America/Sao_Paulo) for date calculations
    const today = getTodayInTimezone('America/Sao_Paulo');
    
    const response = await requestClient.get<{
      data: Array<{
        userId: number;
        userAccount: string;
        currency: string;
        amount: number;
        uplineAgent?: string;
        registrationSource?: string;
      }>;
    }>(`/analytics/rankings/${type}`, {
      params: {
        date: today,
        limit
      }
    });

    return response.data.map((item, index) => ({
      rank: index + 1,
      currency: item.currency,
      memberId: item.userId ? item.userId.toString() : 'N/A',
      memberAccount: item.userAccount || 'N/A',
      uplineAgent: item.uplineAgent || '官网',
      registrationSource: item.registrationSource || '官网',
      amount: item.amount || 0
    }));
  } catch (error) {
    console.error(`Error fetching ${type} rankings:`, error);
    return [];
  }
}

/**
 * Get promotion bonus statistics
 */
export async function getPromotionStats(): Promise<{ todayBonus: number; totalBonus: number }> {
  try {
    // 🌍 Use UTC-3 timezone (America/Sao_Paulo) for date calculations
    const today = getTodayInTimezone('America/Sao_Paulo');
    
    const response = await requestClient.get<{
      todayBonus: number;
      totalBonus: number;
    }>('/analytics/promotions', {
      params: { date: today }
    });

    return response;
  } catch (error) {
    console.error('Error fetching promotion stats:', error);
    return { todayBonus: 0, totalBonus: 0 };
  }
}

/**
 * Get comprehensive analytics data for dashboard
 */
export async function getDashboardAnalytics(): Promise<{
  stats: DashboardStats;
  rankings: {
    recharge: RankingData[];
    bet: RankingData[];
    profit: RankingData[];
    commission: RankingData[];
  };
}> {
  try {
    const [stats, rechargeRankings, betRankings, profitRankings, commissionRankings] = 
      await Promise.allSettled([
        getTodayDashboardStats(),
        getRankingData('recharge'),
        getRankingData('bet'), 
        getRankingData('profit'),
        getRankingData('commission')
      ]);

    return {
      stats: stats.status === 'fulfilled' ? stats.value : {
        todayNewAgents: 0,
        todayNewVIP: 0,
        todayRegistrations: 0,
        todayActiveMembers: 0,
        todayRecharge: 0,
        todayWithdraw: 0,
        todayProfit: 0,
        todayPromotionBonus: 0,
        totalMembers: 0,
        todayValidBet: 0
      },
      rankings: {
        recharge: rechargeRankings.status === 'fulfilled' ? rechargeRankings.value : [],
        bet: betRankings.status === 'fulfilled' ? betRankings.value : [],
        profit: profitRankings.status === 'fulfilled' ? profitRankings.value : [],
        commission: commissionRankings.status === 'fulfilled' ? commissionRankings.value : []
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    throw error;
  }
} 

/**
 * Get today vs yesterday stats to compute percentage changes
 */
export async function getDashboardDiffApi() {
  // 🌍 Use UTC-3 timezone (America/Sao_Paulo) for date calculations
  const todayStr = getTodayInTimezone('America/Sao_Paulo');
  return requestClient.get<{ today: DashboardStats; yesterday: DashboardStats }>(
    '/analytics/dashboard-diff',
    { params: { date: todayStr } }
  );
}

// Real-time Dashboard SSE stream
export async function subscribeDashboardStream(onStats: (data: DashboardStats) => void) {
  try {
    const mod = await import('@vben/stores');
    const accessStore = mod.useAccessStore();
    const token: string | null = accessStore.accessToken;

    const base = (requestClient as any)?.instance?.defaults?.baseURL || '';
    const url = `${base}/analytics/dashboard-stream?token=${encodeURIComponent(token || '')}`;

    const es = new EventSource(url);

    es.addEventListener('stats', (evt: MessageEvent) => {
      try {
        const data = JSON.parse(evt.data);
        onStats({
          todayNewAgents: Number(data.todayNewAgents || 0),
          todayNewVIP: Number(data.todayNewVIP || 0),
          todayRegistrations: Number(data.todayRegistrations || 0),
          todayActiveMembers: Number(data.todayActiveMembers || 0),
          todayRecharge: Number(data.todayRecharge || 0),
          todayWithdraw: Number(data.todayWithdraw || 0),
          todayProfit: Number(data.todayProfit || 0),
          todayPromotionBonus: Number(data.todayPromotionBonus || 0),
          totalMembers: Number(data.totalMembers || 0),
          todayValidBet: Number(data.todayValidBet || 0),
        });
      } catch {}
    });

    return () => es.close();
  } catch (e) {
    console.warn('SSE not available', e);
    return () => {};
  }
}