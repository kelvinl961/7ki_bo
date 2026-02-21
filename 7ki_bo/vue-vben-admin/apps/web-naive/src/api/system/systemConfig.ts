import { requestClient } from '#/api/request';

export interface SystemConfigRequest {
  category: string;
  key: string;
  value: any;
  dataType?: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description?: string;
  scope?: string;
  scopeValue?: string;
}

export interface SystemConfigResponse {
  id: string;
  category: string;
  key: string;
  value: any;
  dataType: string;
  description?: string;
  scope: string;
  scopeValue?: string;
  version?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

/**
 * System Configuration API
 */
export const systemConfigApi = {
  /**
   * Get single system configuration
   */
  getConfig: async (category: string, key: string, scope = 'global', scopeValue?: string): Promise<ApiResponse<SystemConfigResponse>> => {
    const params = new URLSearchParams({ scope });
    if (scopeValue) params.append('scopeValue', scopeValue);
    
    const resp = await requestClient.get(`/system-config/${category}/${key}?${params.toString()}`);
    return resp; // Return full response with success flag
  },

  /**
   * Get all configurations by category
   */
  getConfigsByCategory: async (category: string, scope = 'global', scopeValue?: string): Promise<ApiResponse<Record<string, any>>> => {
    const params = new URLSearchParams({ scope });
    if (scopeValue) params.append('scopeValue', scopeValue);
    
    const resp = await requestClient.get(`/system-config/category/${category}?${params.toString()}`);
    return resp; // Return full response with success flag
  },

  /**
   * Save single system configuration
   */
  saveConfig: async (config: SystemConfigRequest): Promise<ApiResponse<SystemConfigResponse>> => {
    const resp = await requestClient.post('/system-config', config);
    return resp; // Return full response with success flag
  },

  /**
   * Batch save system configurations
   */
  batchSaveConfigs: async (configs: SystemConfigRequest[]): Promise<ApiResponse<SystemConfigResponse[]>> => {
    const resp = await requestClient.post('/system-config/batch', { configs });
    return resp; // Return full response with success flag
  },

  /**
   * Delete system configuration
   */
  deleteConfig: async (category: string, key: string, scope = 'global', scopeValue?: string): Promise<ApiResponse<SystemConfigResponse>> => {
    const params = new URLSearchParams({ scope });
    if (scopeValue) params.append('scopeValue', scopeValue);
    
    const resp = await requestClient.delete(`/system-config/${category}/${key}?${params.toString()}`);
    return resp; // Return full response with success flag
  }
};

/**
 * Withdrawal Settings specific configurations
 */
export const withdrawalConfigApi = {
  /**
   * Get withdrawal modal settings (comprehensive)
   */
  getModalSettings: async (): Promise<ApiResponse<any>> => {
    const resp = await systemConfigApi.getConfigsByCategory('withdrawal_settings');
    
    if (resp.success && resp.data) {
      // Extract basic switches and comprehensive risk control settings
      const data: any = {
        channelSwitch: resp.data.channel_switch?.value || 'enabled',
        autoApprovalSwitch: resp.data.auto_approval_switch?.value || 'disabled',
        riskControlSwitch: resp.data.risk_control_switch?.value || 'enabled'
      };
      
      // If comprehensive risk control settings exist, merge them
      if (resp.data.risk_control_settings?.value) {
        const riskControlSettings = typeof resp.data.risk_control_settings.value === 'string' 
          ? JSON.parse(resp.data.risk_control_settings.value)
          : resp.data.risk_control_settings.value;
        
        Object.assign(data, riskControlSettings);
      }
      
      return {
        success: true,
        data
      };
    }
    
    return resp as any;
  },

  /**
   * Save withdrawal modal settings (comprehensive)
   */
  saveModalSettings: async (settings: any): Promise<ApiResponse<any>> => {
    const configs: SystemConfigRequest[] = [];

    // Handle simple switches separately
    if (settings.channelSwitch !== undefined) {
      configs.push({
        category: 'withdrawal_settings',
        key: 'channel_switch',
        value: settings.channelSwitch,
        dataType: 'string',
        description: 'Withdrawal channel enable/disable switch'
      });
    }

    if (settings.autoApprovalSwitch !== undefined) {
      configs.push({
        category: 'withdrawal_settings',
        key: 'auto_approval_switch',
        value: settings.autoApprovalSwitch,
        dataType: 'string',
        description: 'Auto approval without manual review switch'
      });
    }

    // Check if this is a comprehensive risk control save (has more than just switches)
    const hasComprehensiveSettings = Object.keys(settings).some(key => 
      !['channelSwitch', 'autoApprovalSwitch', 'riskControlSwitch'].includes(key)
    );

    if (hasComprehensiveSettings) {
      // Save all risk control settings as a single JSON blob
      configs.push({
        category: 'withdrawal_settings',
        key: 'risk_control_settings',
        value: settings,
        dataType: 'json',
        description: 'Comprehensive risk control settings including all conditions, tiers, and game selections'
      });
    } else if (settings.riskControlSwitch !== undefined) {
      // Just saving the switch
      configs.push({
        category: 'withdrawal_settings',
        key: 'risk_control_switch',
        value: settings.riskControlSwitch,
        dataType: 'string',
        description: 'Risk control auto review switch'
      });
    }

    if (configs.length === 0) {
      return {
        success: false,
        message: 'No settings to save'
      };
    }

    return await systemConfigApi.batchSaveConfigs(configs);
  }
};
