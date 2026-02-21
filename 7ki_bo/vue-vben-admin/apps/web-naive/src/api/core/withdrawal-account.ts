import { requestClient } from '#/api/request';

export interface WithdrawAccount {
  id: string;
  userId: number;
  currency: string;
  methodType: string; // PIX, BANK_TRANSFER, etc.
  accountType: string; // PHONE, CPF, EMAIL, etc.
  accountValue: string; // actual account identifier
  bankCode?: string;
  bankName?: string;
  bankHolderName?: string;
  bankRouting?: string;
  backendNote?: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateWithdrawAccountParams {
  userId: number;
  currency: string;
  methodType: string;
  accountType: string;
  accountValue: string;
  bankCode?: string;
  bankName?: string;
  bankHolderName?: string;
  bankRouting?: string;
  backendNote?: string;
}

export interface UpdateWithdrawAccountParams {
  methodType?: string;
  accountType?: string;
  accountValue?: string;
  bankCode?: string;
  bankName?: string;
  bankHolderName?: string;
  bankRouting?: string;
  backendNote?: string;
}

export interface WithdrawAccountListParams {
  userId: number;
  page?: number;
  pageSize?: number;
}

export interface WithdrawAccountListResponse {
  list: WithdrawAccount[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get withdrawal accounts by user ID
 */
export async function getWithdrawAccountsByUserIdApi(
  params: WithdrawAccountListParams,
): Promise<WithdrawAccountListResponse> {
  const queryParams = new URLSearchParams({
    page: (params.page || 1).toString(),
    pageSize: (params.pageSize || 20).toString(),
  });

  try {
    // Backend route is mounted at /api/withdrawal-accounts
    // List-by-user endpoint: GET /api/withdrawal-accounts/users/:userId
    const response = await requestClient.get(
      `/withdrawal-accounts/users/${params.userId}?${queryParams}`,
    );

    // ✅ FIX: Handle backend response structure correctly
    // Backend returns: { success: true, data: { list: [], pagination: {} } }
    if (response?.data?.success && response.data.data) {
      return response.data.data;
    }

    // Fallback: if response.data is already the data structure
    if (response?.data?.list && response.data.pagination) {
      return response.data;
    }

    // Fallback: if response is already the data structure
    if (response?.list && response.pagination) {
      return response;
    }

    // If no valid structure, return empty
    console.warn('Unexpected response structure:', response);
    return {
      list: [],
      pagination: {
        current: params.page || 1,
        pageSize: params.pageSize || 20,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error: any) {
    console.error('Failed to fetch withdrawal accounts:', error);

    // ✅ FIX: Better error handling - check if it's a network error or API error
    if (error?.response?.data) {
      const errorData = error.response.data;
      // If backend returned an error with messageKey, preserve it
      if (errorData.messageKey) {
        throw new Error(errorData.messageKey);
      }
      throw new Error(
        errorData.message || 'Failed to fetch withdrawal accounts',
      );
    }

    throw new Error(error?.message || 'Failed to fetch withdrawal accounts');
  }
}

/**
 * Create new withdrawal account
 */
export async function createWithdrawAccountApi(
  params: CreateWithdrawAccountParams,
): Promise<WithdrawAccount> {
  try {
    const response = await requestClient.post('/withdrawal-accounts', params);
    return response.data || response;
  } catch (error: any) {
    if (error?.success && error?.data) {
      return error.data;
    } else if (error?.response?.data?.success && error?.response?.data?.data) {
      return error.response.data.data;
    } else {
      console.error('Failed to create withdrawal account:', error);
      throw new Error('Failed to create withdrawal account');
    }
  }
}

/**
 * Update withdrawal account
 */
export async function updateWithdrawAccountApi(
  accountId: string,
  params: UpdateWithdrawAccountParams,
): Promise<WithdrawAccount> {
  try {
    const response = await requestClient.put(
      `/withdrawal-accounts/${accountId}`,
      params,
    );
    return response.data || response;
  } catch (error: any) {
    if (error?.success && error?.data) {
      return error.data;
    } else if (error?.response?.data?.success && error?.response?.data?.data) {
      return error.response.data.data;
    } else {
      console.error('Failed to update withdrawal account:', error);
      throw new Error('Failed to update withdrawal account');
    }
  }
}

/**
 * Toggle withdrawal account status
 */
export async function toggleWithdrawAccountStatusApi(
  accountId: string,
  status: 'ACTIVE' | 'DISABLED',
): Promise<WithdrawAccount> {
  try {
    const response = await requestClient.put(
      `/withdrawal-accounts/${accountId}/status`,
      { status },
    );
    return response.data || response;
  } catch (error: any) {
    if (error?.success && error?.data) {
      return error.data;
    } else if (error?.response?.data?.success && error?.response?.data?.data) {
      return error.response.data.data;
    } else {
      console.error('Failed to toggle withdrawal account status:', error);
      throw new Error('Failed to toggle withdrawal account status');
    }
  }
}

/**
 * Delete withdrawal account
 */
export async function deleteWithdrawAccountApi(
  accountId: string,
): Promise<void> {
  try {
    await requestClient.delete(`/withdrawal-accounts/${accountId}`);
  } catch (error: any) {
    console.error('Failed to delete withdrawal account:', error);
    throw new Error('Failed to delete withdrawal account');
  }
}
