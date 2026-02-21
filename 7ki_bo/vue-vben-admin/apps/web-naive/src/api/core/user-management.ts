import { requestClient } from '#/api/request';

export interface UserItem {
  id: string;
  userID: string; // Add the 9-digit random userId field
  currency: string;
  memberId: string;
  memberAccount: string;
  accountType: string;
  accountStatus: string;
  upperAgentId: string;
  upperAgentUserID?: string;
  upperAgentAccount?: string;
  upperAgentName?: string;
  topAgentId: string;
  topAgentUserID?: string;
  topAgentAccount?: string;
  topAgentName?: string;
  registrationTime: string;
  vipLevel: string;
  memberLevel: number;
  registrationMethod: string;
  balance: number;
  lastLoginTime: string;
  totalDeposit: number;
  totalWithdraw: number;
  loginCount: number;
  deviceCount: number;
  realName: string;
  email: string;
  phone: string;
  cpf: string;
  createdAt: string;
  profile?: any;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Time-based filters
  timeType?: string; // 'registrationTime' | 'lastLoginTime' | 'firstDepositTime'
  startDate?: string;
  endDate?: string;
  
  // Search filters
  searchCondition?: string; // Search category (memberLevel, vipLevel, accountStatus, etc.)
  searchConditionValue?: string; // Value for search condition
  searchField?: string; // Comprehensive search field type
  searchValue?: string; // Search value
  searchMode?: 'exact' | 'fuzzy'; // Search mode
  search?: string; // Legacy general search
  
  // Status and type filters
  accountType?: string;
  accountStatus?: string;
  memberLevel?: string;
  vipLevel?: string;
  registrationMethod?: string;
  currency?: string;
  
  // Advanced filters
  minBalance?: number;
  maxBalance?: number;
  minDeposit?: number;
  maxDeposit?: number;
  minWithdraw?: number;
  maxWithdraw?: number;
  minLoginCount?: number;
  maxLoginCount?: number;
}

export interface UserListResponse {
  code: number;
  data: {
    list: UserItem[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

/**
 * Get user list for admin management
 */
export async function getUserListApi(params: UserListParams) {
  const response = await requestClient.get<any>('/users/', {
    params,
  });
  
  console.log('🔍 [getUserListApi] Raw response:', response);
  
  // Handle different response structures from requestClient
  // Backend returns: { code: 0, data: { list: [...], pagination: {...} } }
  // requestClient might return the full response or just the data part
  if (response.data) {
    // If response has a data property, return that
    return response.data;
  }
  
  // Otherwise return as-is
  return response;
}

/**
 * Update user status (ban/unban)
 */
export async function updateUserStatusApi(userId: string, isBanned: boolean) {
  return requestClient.put<ApiResponse<{ success: boolean }>>(`/users/${userId}/ban-status`, {
    isBanned,
  });
}

/**
 * Update user information
 */
export async function updateUserInfoApi(userId: string, data: Partial<UserItem>) {
  return requestClient.put<ApiResponse<UserItem>>(`/users/${userId}`, data);
}

/**
 * Get user by ID
 */
export async function getUserByIdApi(userId: string) {
  return requestClient.get<ApiResponse<UserItem>>(`/users/${userId}`);
}

/**
 * Delete user
 */
export async function deleteUserApi(userId: string) {
  return requestClient.delete<ApiResponse<{ success: boolean }>>(`/users/${userId}`);
}

/**
 * Search users for typeahead/autocomplete
 */
export interface UserSearchItem {
  value: string;
  label: string;
  account: string;
  name: string;
  email: string;
  cpf: string;
  balance: number;
  vipLevel: string;
}

export interface UserSearchParams {
  q: string;
  limit?: number;
}

export async function searchUsersApi(params: UserSearchParams) {
  console.log('🔍 searchUsersApi called with params:', params);
  try {
    const response = await requestClient.get<ApiResponse<UserSearchItem[]>>('/users/search', {
      params,
    });
    console.log('✅ searchUsersApi response:', response);
    return response;
  } catch (error) {
    console.error('❌ searchUsersApi error:', error);
    throw error;
  }
} 