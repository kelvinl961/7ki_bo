import { requestClient } from '#/api/request';

// 交易记录接口
export interface TransactionRecord {
  id: string;
  transactionType: 'bet' | 'bonus' | 'deposit' | 'manual' | 'withdrawal';
  type?: string;
  subType?: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  // Deposit specific
  trxId?: string;
  paymentMethod?: string;
  paymentGateway?: string;
  merchantBank?: string;
  promoCode?: string;
  bonusAmount?: number;
  fees?: number;
  // Withdrawal specific
  memberBank?: string;
  memberBankAccount?: string;
  accountHolderName?: string;
  approvedBy?: string;
  rejectionReason?: string;
  // Manual transaction specific
  processedBy?: string;
  reason?: string;
  frontendNotes?: string;
  backendNotes?: string;
}

// 用户统计接口
export interface UserStats {
  userId: number;
  totalDeposits: number;
  totalDepositsCount: number;
  totalDepositFees: number;
  totalDepositBonuses: number;
  totalWithdrawals: number;
  totalWithdrawalsCount: number;
  totalWithdrawalFees: number;
  totalBetAmount: number;
  totalValidBetAmount: number;
  totalWinAmount: number;
  totalProfitLoss: number;
  todayBetAmount: number;
  todayValidBetAmount: number;
  todayProfitLoss: number;
  totalBonusReceived: number;
  totalCommissionEarned: number;
  totalRebateReceived: number;
  totalManualCredits: number;
  totalManualDebits: number;
  lastUpdated: string;
}

// 交易历史查询参数
export interface TransactionHistoryParams {
  type?: 'all' | 'bet' | 'bonus' | 'deposit' | 'manual' | 'withdrawal';
  page?: number;
  pageSize?: number;
}

// 交易历史响应
export interface TransactionHistoryResponse {
  list: TransactionRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

/**
 * 获取用户交易历史
 */
export async function getUserTransactionHistory(
  userId: number,
  params: TransactionHistoryParams = {},
): Promise<TransactionHistoryResponse> {
  const { type = 'all', page = 1, pageSize = 20 } = params;

  const response = await requestClient.get(
    `/transactions/users/${userId}/history`,
    {
      params: { type, page, pageSize },
    },
  );

  // ✅ The request client automatically unwraps the response.data
  // So response is already the data part of { code: 0, data: {...} }
  if (response && response.list) {
    return response;
  }

  // ❌ If not in expected format, throw
  throw new Error('Failed to fetch transaction history');
}

/**
 * 获取用户交易统计
 */
export async function getUserTransactionStats(
  userId: number,
): Promise<UserStats> {
  const response = await requestClient.get(
    `/transactions/users/${userId}/stats`,
  );
  return response;
}

/**
 * 获取用户余额
 */
export async function getUserBalance(userId: number): Promise<{
  balance: number;
  balanceFormatted: string;
  userId: number;
}> {
  const response = await requestClient.get(
    `/transactions/users/${userId}/balance`,
  );
  return response;
}

/**
 * 获取存款记录
 */
export async function getDepositHistory(
  userId: number,
  page: number = 1,
  pageSize: number = 20,
): Promise<TransactionHistoryResponse> {
  return getUserTransactionHistory(userId, { type: 'deposit', page, pageSize });
}

/**
 * 获取提款记录
 */
export async function getWithdrawalHistory(
  userId: number,
  page: number = 1,
  pageSize: number = 20,
): Promise<TransactionHistoryResponse> {
  return getUserTransactionHistory(userId, {
    type: 'withdrawal',
    page,
    pageSize,
  });
}

/**
 * 获取手动交易记录
 */
export async function getManualTransactionHistory(
  userId: number,
  page: number = 1,
  pageSize: number = 20,
): Promise<TransactionHistoryResponse> {
  return getUserTransactionHistory(userId, { type: 'manual', page, pageSize });
}

/**
 * 格式化交易类型显示
 */
export function formatTransactionType(record: TransactionRecord): string {
  switch (record.transactionType) {
    case 'bet': {
      return '投注';
    }
    case 'bonus': {
      return '奖金';
    }
    case 'deposit': {
      return '存款';
    }
    case 'manual': {
      return record.type === 'credit' ? '手动加款' : '手动扣款';
    }
    case 'withdrawal': {
      return '提款';
    }
    default: {
      return '未知';
    }
  }
}

/**
 * 格式化交易状态显示
 */
export function formatTransactionStatus(status: string): {
  text: string;
  type: 'error' | 'info' | 'success' | 'warning';
} {
  switch (status?.toLowerCase()) {
    case 'canceled':
    case 'cancelled': {
      return { text: '已取消', type: 'info' };
    }
    case 'completed':
    case 'success': {
      return { text: '成功', type: 'success' };
    }
    case 'failed':
    case 'rejected': {
      return { text: '失败', type: 'error' };
    }
    case 'pending':
    case 'processing': {
      return { text: '处理中', type: 'warning' };
    }
    default: {
      return { text: status || '未知', type: 'info' };
    }
  }
}
