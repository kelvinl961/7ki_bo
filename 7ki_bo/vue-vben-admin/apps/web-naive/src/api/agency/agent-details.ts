import { requestClient } from '#/api/request';

// Contact Information
export interface AgentContactInfo {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  realName?: string;
  idCard?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

// Profile Information
export interface AgentProfileInfo {
  id: number;
  username: string;
  referralCode: string;
  currency: string;
  level: number;
  isActive: boolean;
  commissionTotal: number;
  claimedCommission: number;
  unclaimedCommission: number;
  otherCount: number;
  hierarchyLevel: number;
  mode: string;
  registrationSource: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
  invitedByCode?: string;
  topAgentCode?: string;
  referralUrl?: string;
  commissionMode: string;
}

// Withdrawal Account
export interface AgentWithdrawalAccount {
  id: number;
  type: string;
  name: string;
  number: string;
  bank?: string;
  alipayAccount?: string;
  wechatAccount?: string;
  status: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction Record
export interface AgentTransactionRecord {
  id: number;
  type: string;
  amount: number;
  balance: number;
  status: string;
  description: string;
  transactionTime: string;
  referenceId?: string;
  category: string;
  operator?: string;
}

// Betting Statistics
export interface AgentBetRecord {
  id: number;
  gameType: string;
  gameName: string;
  betAmount: number;
  validAmount: number;
  winLoss: number;
  status: string;
  betTime: string;
  settlementTime?: string;
  platform: string;
  currency: string;
}

// Audit Trail
export interface AgentAuditRecord {
  id: number;
  actionType: string;
  actionName: string;
  description: string;
  status: string;
  operator: string;
  operatorRole: string;
  targetUser?: string;
  ipAddress: string;
  userAgent: string;
  actionTime: string;
  details?: any;
}

// Login Device
export interface AgentLoginDevice {
  id: number;
  name: string;
  type: string;
  os: string;
  browser: string;
  ipAddress: string;
  status: string;
  lastLoginTime: string;
  loginCount: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// Message
export interface AgentMessage {
  id: number;
  type: string;
  title: string;
  content: string;
  priority: string;
  status: string;
  sender: string;
  recipient: string;
  sendTime: string;
  readTime?: string;
  remark?: string;
}

// Association
export interface AgentAssociation {
  id: number;
  type: string;
  account: string;
  platform: string;
  reason: string;
  status: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// API Functions
export async function getAgentContactInfoApi(
  agentId: number,
): Promise<AgentContactInfo> {
  try {
    const response = await requestClient.get(`/agents/${agentId}/contact`);
    return response.data || response;
  } catch (error) {
    console.error('Failed to fetch agent contact info:', error);
    throw new Error('Failed to fetch agent contact info');
  }
}

export async function getAgentProfileInfoApi(
  agentId: number,
): Promise<AgentProfileInfo> {
  try {
    const response = await requestClient.get(`/agents/${agentId}/profile`);
    return response.data || response;
  } catch (error) {
    console.error('Failed to fetch agent profile info:', error);
    throw new Error('Failed to fetch agent profile info');
  }
}

export async function getAgentWithdrawalAccountsApi(
  agentId: number,
  params?: {
    page?: number;
    pageSize?: number;
  },
): Promise<{
  list: AgentWithdrawalAccount[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}> {
  try {
    const response = await requestClient.get(
      `/agents/${agentId}/withdrawal-accounts`,
      { params },
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to fetch agent withdrawal accounts:', error);
    throw new Error('Failed to fetch agent withdrawal accounts');
  }
}

export async function getAgentTransactionsApi(
  agentId: number,
  params?: {
    endDate?: string;
    page?: number;
    pageSize?: number;
    startDate?: string;
    status?: string;
    type?: string;
  },
): Promise<{
  list: AgentTransactionRecord[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}> {
  try {
    const response = await requestClient.get(
      `/agents/${agentId}/transactions`,
      { params },
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to fetch agent transactions:', error);
    throw new Error('Failed to fetch agent transactions');
  }
}

export async function getAgentBetStatisticsApi(
  agentId: number,
  params?: {
    endDate?: string;
    gameType?: string;
    page?: number;
    pageSize?: number;
    startDate?: string;
    status?: string;
  },
): Promise<{
  list: AgentBetRecord[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}> {
  try {
    const response = await requestClient.get(
      `/agents/${agentId}/bet-statistics`,
      { params },
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to fetch agent bet statistics:', error);
    throw new Error('Failed to fetch agent bet statistics');
  }
}

export async function getAgentAuditTrailApi(
  agentId: number,
  params?: {
    actionType?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
    startDate?: string;
    status?: string;
  },
): Promise<{
  list: AgentAuditRecord[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}> {
  try {
    const response = await requestClient.get(`/agents/${agentId}/audit-trail`, {
      params,
    });
    return response.data || response;
  } catch (error) {
    console.error('Failed to fetch agent audit trail:', error);
    throw new Error('Failed to fetch agent audit trail');
  }
}

export async function getAgentLoginDevicesApi(
  agentId: number,
  params?: {
    page?: number;
    pageSize?: number;
  },
): Promise<{
  list: AgentLoginDevice[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}> {
  try {
    const response = await requestClient.get(
      `/agents/${agentId}/login-devices`,
      { params },
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to fetch agent login devices:', error);
    throw new Error('Failed to fetch agent login devices');
  }
}

export async function getAgentMessagesApi(
  agentId: number,
  params?: {
    page?: number;
    pageSize?: number;
  },
): Promise<{
  list: AgentMessage[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}> {
  try {
    const response = await requestClient.get(`/agents/${agentId}/messages`, {
      params,
    });
    return response.data || response;
  } catch (error) {
    console.error('Failed to fetch agent messages:', error);
    throw new Error('Failed to fetch agent messages');
  }
}

export async function getAgentAssociationsApi(
  agentId: number,
  params?: {
    page?: number;
    pageSize?: number;
  },
): Promise<{
  list: AgentAssociation[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}> {
  try {
    const response = await requestClient.get(
      `/agents/${agentId}/associations`,
      { params },
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to fetch agent associations:', error);
    throw new Error('Failed to fetch agent associations');
  }
}

// CRUD Operations for Withdrawal Accounts
export async function createWithdrawalAccountApi(
  agentId: number,
  data: {
    alipayAccount?: string;
    bank?: string;
    name: string;
    number: string;
    remark?: string;
    status: string;
    type: string;
    wechatAccount?: string;
  },
): Promise<AgentWithdrawalAccount> {
  try {
    const response = await requestClient.post(
      `/agents/${agentId}/withdrawal-accounts`,
      data,
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to create withdrawal account:', error);
    throw new Error('Failed to create withdrawal account');
  }
}

export async function updateWithdrawalAccountApi(
  agentId: number,
  accountId: number,
  data: {
    alipayAccount?: string;
    bank?: string;
    name?: string;
    number?: string;
    remark?: string;
    status?: string;
    type?: string;
    wechatAccount?: string;
  },
): Promise<AgentWithdrawalAccount> {
  try {
    const response = await requestClient.put(
      `/agents/${agentId}/withdrawal-accounts/${accountId}`,
      data,
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to update withdrawal account:', error);
    throw new Error('Failed to update withdrawal account');
  }
}

export async function deleteWithdrawalAccountApi(
  agentId: number,
  accountId: number,
): Promise<void> {
  try {
    await requestClient.delete(
      `/agents/${agentId}/withdrawal-accounts/${accountId}`,
    );
  } catch (error) {
    console.error('Failed to delete withdrawal account:', error);
    throw new Error('Failed to delete withdrawal account');
  }
}

// CRUD Operations for Login Devices
export async function createLoginDeviceApi(
  agentId: number,
  data: {
    browser: string;
    ipAddress: string;
    name: string;
    os: string;
    remark?: string;
    status: string;
    type: string;
  },
): Promise<AgentLoginDevice> {
  try {
    const response = await requestClient.post(
      `/agents/${agentId}/login-devices`,
      data,
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to create login device:', error);
    throw new Error('Failed to create login device');
  }
}

export async function updateLoginDeviceApi(
  agentId: number,
  deviceId: number,
  data: {
    browser?: string;
    ipAddress?: string;
    name?: string;
    os?: string;
    remark?: string;
    status?: string;
    type?: string;
  },
): Promise<AgentLoginDevice> {
  try {
    const response = await requestClient.put(
      `/agents/${agentId}/login-devices/${deviceId}`,
      data,
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to update login device:', error);
    throw new Error('Failed to update login device');
  }
}

export async function deleteLoginDeviceApi(
  agentId: number,
  deviceId: number,
): Promise<void> {
  try {
    await requestClient.delete(`/agents/${agentId}/login-devices/${deviceId}`);
  } catch (error) {
    console.error('Failed to delete login device:', error);
    throw new Error('Failed to delete login device');
  }
}

// CRUD Operations for Associations
export async function createAssociationApi(
  agentId: number,
  data: {
    account: string;
    platform: string;
    reason: string;
    remark?: string;
    status: string;
    type: string;
  },
): Promise<AgentAssociation> {
  try {
    const response = await requestClient.post(
      `/agents/${agentId}/associations`,
      data,
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to create association:', error);
    throw new Error('Failed to create association');
  }
}

export async function updateAssociationApi(
  agentId: number,
  associationId: number,
  data: {
    account?: string;
    platform?: string;
    reason?: string;
    remark?: string;
    status?: string;
    type?: string;
  },
): Promise<AgentAssociation> {
  try {
    const response = await requestClient.put(
      `/agents/${agentId}/associations/${associationId}`,
      data,
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to update association:', error);
    throw new Error('Failed to update association');
  }
}

export async function deleteAssociationApi(
  agentId: number,
  associationId: number,
): Promise<void> {
  try {
    await requestClient.delete(
      `/agents/${agentId}/associations/${associationId}`,
    );
  } catch (error) {
    console.error('Failed to delete association:', error);
    throw new Error('Failed to delete association');
  }
}

// Message Operations
export async function createMessageApi(
  agentId: number,
  data: {
    content: string;
    priority: string;
    remark?: string;
    title: string;
    type: string;
  },
): Promise<AgentMessage> {
  try {
    const response = await requestClient.post(
      `/agents/${agentId}/messages`,
      data,
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to create message:', error);
    throw new Error('Failed to create message');
  }
}

export async function updateMessageStatusApi(
  agentId: number,
  messageId: number,
  status: string,
): Promise<AgentMessage> {
  try {
    const response = await requestClient.patch(
      `/agents/${agentId}/messages/${messageId}/status`,
      { status },
    );
    return response.data || response;
  } catch (error) {
    console.error('Failed to update message status:', error);
    throw new Error('Failed to update message status');
  }
}

export async function deleteMessageApi(
  agentId: number,
  messageId: number,
): Promise<void> {
  try {
    await requestClient.delete(`/agents/${agentId}/messages/${messageId}`);
  } catch (error) {
    console.error('Failed to delete message:', error);
    throw new Error('Failed to delete message');
  }
}
