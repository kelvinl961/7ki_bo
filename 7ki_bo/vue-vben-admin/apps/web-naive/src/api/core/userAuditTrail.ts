import { requestClient } from '#/api/request';

// ===================================
// INTERFACES
// ===================================

export interface UserAuditTrail {
  id: string;
  userId: number;
  userAccount: string;
  userName: string;
  operationTime: string;
  action: string;
  actionDescription: string;
  module: string;
  oldValue?: string;
  newValue?: string;
  result: 'success' | 'failed' | 'pending' | 'cancelled';
  source: 'frontend' | 'backend' | 'api' | 'mobile' | 'admin_panel' | 'system';
  operatorId?: string;
  operatorName?: string;
  operatorType: 'user' | 'admin' | 'system';
  ipAddress?: string;
  userAgent?: string;
  browserName?: string;
  browserVersion?: string;
  platform?: string;
  operatingSystem?: string;
  osVersion?: string;
  deviceBrand?: string;
  deviceModel?: string;
  sessionId?: string;
  referenceId?: string;
  errorMessage?: string;
  metadata?: any;
}

export interface AuditTrailListResponse {
  list: UserAuditTrail[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditTrailStats {
  totalCount: number;
  successCount: number;
  failedCount: number;
  successRate: string;
  actionStats: Array<{
    action: string;
    count: number;
  }>;
  resultStats: Array<{
    result: string;
    count: number;
  }>;
  sourceStats: Array<{
    source: string;
    count: number;
  }>;
  moduleStats: Array<{
    module: string;
    count: number;
  }>;
}

export interface AuditTrailFilters {
  userId: number;
  startDate?: string;
  endDate?: string;
  action?: string;
  module?: string;
  result?: string;
  source?: string;
  operatorType?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditTrailExportData {
  '操作时间': string;
  '用户账号': string;
  '用户姓名': string;
  '操作项目': string;
  '操作描述': string;
  '操作模块': string;
  '变更前': string;
  '变更后': string;
  '操作结果': string;
  '操作入口': string;
  '操作人': string;
  '操作人类型': string;
  'IP地址': string;
  '浏览器': string;
  '浏览器版本': string;
  '平台': string;
  '操作系统': string;
  '系统版本': string;
  '设备品牌': string;
  '设备型号': string;
  '错误信息': string;
}

// ===================================
// API METHODS
// ===================================

/**
 * 获取用户审计日志列表
 */
export function getUserAuditTrails(params: AuditTrailFilters) {
  return requestClient.get<AuditTrailListResponse>(`/user-audit-trails/users/${params.userId}`, {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      action: params.action,
      module: params.module,
      result: params.result,
      source: params.source,
      operatorType: params.operatorType,
      page: params.page || 1,
      pageSize: params.pageSize || 20
    }
  });
}

/**
 * 获取用户审计日志统计
 */
export function getAuditTrailStats(params: { userId: number; startDate?: string; endDate?: string }) {
  return requestClient.get<AuditTrailStats>(`/user-audit-trails/users/${params.userId}/stats`, {
    params: {
      startDate: params.startDate,
      endDate: params.endDate
    }
  });
}

/**
 * 获取审计日志详情
 */
export function getAuditTrailDetail(id: string) {
  return requestClient.get<UserAuditTrail>(`/user-audit-trails/${id}`);
}

/**
 * 导出用户审计日志
 */
export function exportUserAuditTrails(params: AuditTrailFilters) {
  return requestClient.get<AuditTrailExportData[]>(`/user-audit-trails/users/${params.userId}/export`, {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      action: params.action,
      module: params.module,
      result: params.result,
      source: params.source,
      operatorType: params.operatorType
    }
  });
}

// ===================================
// CONSTANTS
// ===================================

export const AUDIT_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  PROFILE_UPDATE: 'profile_update',
  PASSWORD_CHANGE: 'password_change',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  BET_PLACE: 'bet_place',
  BET_WIN: 'bet_win',
  BET_LOSE: 'bet_lose',
  BONUS_CLAIM: 'bonus_claim',
  DOCUMENT_UPLOAD: 'document_upload',
  VERIFICATION: 'verification',
  ACCOUNT_LOCK: 'account_lock',
  ACCOUNT_UNLOCK: 'account_unlock',
  BALANCE_ADJUSTMENT: 'balance_adjustment'
} as const;

export const AUDIT_MODULES = {
  ACCOUNT: 'account',
  FINANCE: 'finance',
  GAMING: 'gaming',
  PROFILE: 'profile',
  SECURITY: 'security',
  VERIFICATION: 'verification',
  PROMOTION: 'promotion',
  SUPPORT: 'support'
} as const;

export const AUDIT_RESULTS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
  CANCELLED: 'cancelled'
} as const;

export const AUDIT_SOURCES = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  API: 'api',
  MOBILE: 'mobile',
  ADMIN_PANEL: 'admin_panel',
  SYSTEM: 'system'
} as const;

export const AUDIT_OPERATOR_TYPES = {
  USER: 'user',
  ADMIN: 'admin',
  SYSTEM: 'system'
} as const;

// ===================================
// HELPER FUNCTIONS
// ===================================

/**
 * 格式化操作时间
 */
export function formatOperationTime(time: string | Date): string {
  try {
    const date = typeof time === 'string' ? new Date(time) : time;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', time);
      return '无效日期';
    }
    
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Shanghai'
    });
  } catch (error) {
    console.error('Error formatting date:', time, error);
    return '日期解析错误';
  }
}

/**
 * 获取操作结果标签
 */
export function getResultLabel(result: string): string {
  const labels = {
    success: '成功',
    failed: '失败',
    pending: '处理中',
    cancelled: '已取消'
  };
  return labels[result as keyof typeof labels] || result;
}

/**
 * 获取操作结果颜色类型
 */
export function getResultType(result: string): 'success' | 'error' | 'warning' | 'info' {
  const types: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
    success: 'success',
    failed: 'error',
    pending: 'warning',
    cancelled: 'info'
  };
  return types[result] || 'info';
}

/**
 * 获取操作来源标签
 */
export function getSourceLabel(source: string): string {
  const labels = {
    frontend: '前台',
    backend: '后台',
    api: 'API',
    mobile: '移动端',
    admin_panel: '管理后台',
    system: '系统'
  };
  return labels[source as keyof typeof labels] || source;
}

/**
 * 获取操作人类型标签
 */
export function getOperatorTypeLabel(operatorType: string): string {
  const labels = {
    user: '用户',
    admin: '管理员',
    system: '系统'
  };
  return labels[operatorType as keyof typeof labels] || operatorType;
}

/**
 * 获取操作模块标签
 */
export function getModuleLabel(module: string): string {
  const labels = {
    account: '账户管理',
    finance: '财务管理',
    gaming: '游戏管理',
    profile: '个人资料',
    security: '安全管理',
    verification: '身份验证',
    promotion: '优惠活动',
    support: '客服支持'
  };
  return labels[module as keyof typeof labels] || module;
}

/**
 * 获取友好的操作描述
 */
export function getFriendlyActionDescription(action: string, actionDescription?: string): string {
  // If we have a meaningful action description, use it
  if (actionDescription && 
      actionDescription !== '执行POST操作' && 
      actionDescription !== '执行GET操作' && 
      actionDescription !== '执行PUT操作' && 
      actionDescription !== '执行DELETE操作') {
    return actionDescription;
  }
  
  // Generate friendly description based on action
  const descriptions = {
    // 充值相关
    deposit_create: '用户提交充值申请',
    deposit_force_processed: '管理员强制处理充值订单',
    deposit_force_cancelled: '管理员强制取消充值订单',
    deposit_status_refresh: '系统刷新充值订单状态',
    deposit_remarks_updated: '管理员更新充值订单备注',
    
    // 提现相关
    withdrawal_create: '用户提交提现申请',
    withdrawal_approve: '管理员批准提现申请',
    withdrawal_reject: '管理员拒绝提现申请',
    withdrawal_cancel: '用户取消提现申请',
    view_withdrawals_for_review: '管理员查看待审核提现列表',
    
    // 基础操作
    login: '用户登录系统',
    logout: '用户退出系统',
    register: '用户注册账户',
    profile_update: '用户更新个人资料',
    password_change: '用户修改登录密码',
    
    // 投注相关
    bet_place: '用户下注',
    bet_win: '用户中奖',
    bet_lose: '用户投注失败',
    bet_cancel: '取消投注',
    bet_refund: '投注退款',
    
    // 奖金相关
    bonus_claim: '用户领取奖金',
    bonus_grant: '系统发放奖金',
    bonus_cancel: '取消奖金发放',
    
    // 账户管理
    account_lock: '账户被锁定',
    account_unlock: '账户被解锁',
    balance_adjustment: '余额调整操作',
    account_verify: '账户验证操作'
  };
  
  return descriptions[action as keyof typeof descriptions] || actionDescription || `执行 ${action} 操作`;
}

/**
 * 获取操作项目标签
 */
export function getActionLabel(action: string): string {
  const labels = {
    // 基础操作
    login: '登录',
    logout: '登出',
    register: '注册',
    profile_update: '更新资料',
    password_change: '修改密码',
    
    // 充值相关
    deposit: '充值',
    deposit_create: '创建充值订单',
    deposit_force_processed: '强制处理充值',
    deposit_force_cancelled: '强制取消充值',
    deposit_status_refresh: '刷新充值状态',
    deposit_remarks_updated: '更新充值备注',
    
    // 提现相关
    withdrawal: '提现',
    withdrawal_create: '创建提现申请',
    withdrawal_approve: '批准提现',
    withdrawal_reject: '拒绝提现',
    withdrawal_cancel: '取消提现',
    view_withdrawals_for_review: '查看待审核提现',
    
    // 投注相关
    bet_place: '下注',
    bet_win: '中奖',
    bet_lose: '输注',
    bet_cancel: '取消投注',
    bet_refund: '投注退款',
    
    // 奖金相关
    bonus_claim: '领取奖金',
    bonus_grant: '发放奖金',
    bonus_cancel: '取消奖金',
    
    // 账户管理
    account_lock: '账户锁定',
    account_unlock: '账户解锁',
    balance_adjustment: '余额调整',
    account_verify: '账户验证',
    
    // 安全相关
    document_upload: '上传证件',
    verification: '身份验证',
    security_update: '安全设置更新',
    
    // 系统操作
    system_maintenance: '系统维护',
    data_export: '数据导出',
    data_import: '数据导入'
  };
  return labels[action as keyof typeof labels] || action;
} 