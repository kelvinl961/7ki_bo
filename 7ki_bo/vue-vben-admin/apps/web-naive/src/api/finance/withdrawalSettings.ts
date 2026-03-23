import { requestClient } from '#/api/request';

export interface FirstWithdrawalRule {
  id?: number;
  memberLevel: string;
  minRecharge: string;
  maxWithdrawal: string;
}

export interface WithdrawalSettings {
  id?: number;

  // === BASIC SETTINGS ===
  dailyLimit: number;
  maintenanceWindow?: string;
  maxAmount: number;
  minAmount: number;
  processingTime: string;

  // Frontend Task Display
  frontendTaskDisplayEnabled: boolean;
  hideUnverifiedTasks?: boolean;

  // CPF Validation Settings
  cpfValidationMode: 'disabled' | 'format_only' | 'third_party';
  cpfFormatValidationEnabled?: boolean;
  cpfThirdPartyValidationEnabled?: boolean;

  // Member Concurrent Withdrawals
  memberConcurrentWithdrawals: number;

  // Withdrawal Page Sorting
  withdrawalQueueSortBy?: string;
  queueSortOrder?: string[];

  // === BUSINESS RULES ===
  // Payment Validity
  paymentValidityHours: number;

  // Withdrawal Fees
  feeMode?: 'ascending' | 'descending'; // Legacy field for compatibility
  feeRoundingMode: 'down' | 'up';
  feeExample: string;

  // Review Notifications
  reviewNotificationEnabled: boolean;

  // Limit Display
  showCompleteLimits: boolean;

  // Account Restrictions
  limitUnverifiedMembers: boolean;
  restrictFirstDepositAccount?: boolean;
  restrictFirstWithdrawalAccount?: boolean;
  restrictBankCardBinding?: boolean;
  limitWithdrawalAccountEnabled?: boolean;
  enableAccountLimits?: boolean;
  limitDigitalCurrencyWithdrawal?: boolean;
  /** 未充值用户累计可提现总额上限（成功提现之和，0=不启用） */
  noDepositMaxWithdrawAmount?: number;
  /** 未充值且超过累计可提额度时，会员端弹窗提示（可用 {{cap}} {{remaining}} {{withdrawn}}） */
  noDepositRequireDepositMessage?: string | null;
  /** 提现成功后再次提现时给用户的提示语（客户端展示） */
  afterSuccessfulWithdrawRetryMessage?: string;
  /** 成功充值后最多可绑定提现账号数（0=不启用本项） */
  maxWithdrawalAccountsAfterDeposit?: number;

  // === DIGITAL CURRENCY ===
  // Member Currency
  baseCurrency?: string;
  applyToAllCurrencies?: boolean;

  // Allowed Digital Currencies
  allowedDigitalCurrencies: {
    BTC: boolean;
    ETH: boolean;
    TRX: boolean;
    USDC: boolean;
    USDT_ERC20: boolean;
    USDT_TRC20: boolean;
  };

  // Precision Mode
  precisionMode?: string;

  // === MEMBER RESTRICTIONS ===
  // Blacklist Level
  blacklistLevel?: string;

  // First Withdrawal Rules
  firstWithdrawalRules: FirstWithdrawalRule[];

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface ValidationOptions {
  cpfValidationModes: Array<{ label: string; value: string }>;
  feeModes: Array<{ label: string; value: string }>;
  queueSortOptions: Array<{ label: string; value: string }>;
}

const withdrawalSettingsApi = {
  /**
   * Get withdrawal settings
   */
  getSettings: async (): Promise<ApiResponse<WithdrawalSettings>> => {
    // Bust browser/CDN caches so the modal always shows values just saved on the server
    const response = await requestClient.get('/wallet/withdrawal-settings', {
      params: { _t: Date.now() },
    });
    return response; // Don't unwrap - response interceptor already handles this
  },

  /**
   * Create or update withdrawal settings
   */
  saveSettings: async (
    data: WithdrawalSettings,
  ): Promise<ApiResponse<WithdrawalSettings>> => {
    const response = await requestClient.post(
      '/wallet/withdrawal-settings',
      data,
    );
    return response; // Don't unwrap - response interceptor already handles this
  },

  /**
   * Update withdrawal settings
   */
  updateSettings: async (
    data: WithdrawalSettings,
  ): Promise<ApiResponse<WithdrawalSettings>> => {
    const response = await requestClient.put(
      '/wallet/withdrawal-settings',
      data,
    );
    return response; // Don't unwrap - response interceptor already handles this
  },

  /**
   * Update specific setting field
   */
  updateField: async (field: string, value: any): Promise<ApiResponse> => {
    const response = await requestClient.put(
      '/wallet/withdrawal-settings/field',
      { field, value },
    );
    return response; // Don't unwrap - response interceptor already handles this
  },

  /**
   * Reset settings to defaults
   */
  resetToDefaults: async (): Promise<ApiResponse<WithdrawalSettings>> => {
    const response = await requestClient.post(
      '/wallet/withdrawal-settings/reset',
    );
    return response; // Don't unwrap - response interceptor already handles this
  },

  /**
   * Get validation options for form dropdowns
   */
  getValidationOptions: async (): Promise<ApiResponse<ValidationOptions>> => {
    const response = await requestClient.get(
      '/wallet/withdrawal-settings/validation-options',
    );
    return response; // Don't unwrap - response interceptor already handles this
  },

  /**
   * Get withdrawal channels (real API)
   */
  getWithdrawalChannels: async (): Promise<ApiResponse<any>> => {
    const resp = await requestClient.get('/third-party-channels');
    const raw = resp.data;

    // Normalize into { success, data: { channels, total } }
    let records: any[] = [];
    let total = 0;

    if (raw?.success && raw.data) {
      if (Array.isArray(raw.data)) {
        records = raw.data;
        total = raw.data.length;
      } else {
        records = raw.data.records || raw.data.list || [];
        total = raw.data.total || records.length || 0;
      }
    } else if (Array.isArray(raw)) {
      records = raw;
      total = raw.length;
    } else if (raw?.records) {
      records = raw.records;
      total = raw.total || records.length || 0;
    }

    const channels = (records || []).map((r: any) => ({
      id: r.id ?? r.channelId ?? String(r.id ?? ''),
      type: r.type ?? r.channelCategory ?? '未分类', // 提现大类
      name: r.name ?? r.channelName ?? r.platformName ?? '未命名', // 提现方式
      allowMemberUse: r.allowMemberUse ?? true,
      supportTransfer: r.supportTransfer ?? true,
      supportDigitalCurrency: r.supportDigitalCurrency ?? false,
      allowWithdrawal: r.allowWithdrawal ?? r.isActive ?? true,
      monitorCount: r.monitorCount ?? 4,
      currency: r.currency ?? 'BRL',
      singleLimit: r.singleLimit ?? '',
      fees: r.fees ?? '',
      workingHours: r.workingHours ?? null,
      dailyLimit: r.dailyLimit ?? 0,
      riskLevel: r.riskLevel ?? 'medium',
      priority: r.priority ?? 0,
      apiUrl: r.apiUrl ?? '',
      merchantId: r.merchantId ?? '',
      secretKey: r.secretKey ?? '',
      callbackUrl: r.callbackUrl ?? '',
      status: r.status ?? 'active',
      arrivalStatus: r.arrivalStatus ?? 'instant',
    }));

    return { success: true, data: { channels, total } } as ApiResponse<any>;
  },

  /**
   * Update channel setting (real API)
   */
  updateChannelSetting: async (
    channelId: string,
    data: Record<string, any>,
  ): Promise<ApiResponse> => {
    const response = await requestClient.put(
      `/third-party-channels/${channelId}`,
      data,
    );
    return response.data;
  },

  /**
   * Create or update withdrawal channel (real API)
   */
  saveWithdrawalChannel: async (
    channelData: any,
  ): Promise<ApiResponse<any>> => {
    if (channelData?.id) {
      const response = await requestClient.put(
        `/third-party-channels/${channelData.id}`,
        channelData,
      );
      return response.data;
    }
    const response = await requestClient.post(
      '/third-party-channels',
      channelData,
    );
    return response.data;
  },

  /**
   * Save withdrawal method configuration
   */
  saveWithdrawalMethodConfig: async (
    channelId: string,
    config: any,
  ): Promise<ApiResponse<any>> => {
    const resp = await requestClient.put(
      `/third-party-channels/${channelId}/withdrawal-config`,
      config,
    );
    return resp.data;
  },
};

export { withdrawalSettingsApi };
