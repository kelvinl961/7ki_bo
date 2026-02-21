import { requestClient } from './request';

// TypeScript interfaces
export interface LobbyBanner {
  id: number;
  sortOrder: number;
  bannerName: string;
  currency: string;
  language: string;
  targetUrl?: string;
  bannerImageUrl: string;
  displayDuration: number;
  startTime: string;
  endTime: string;
  jumpMode: string;
  status: 'active' | 'draft' | 'inactive';
  remark?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  creatorId?: number;
  creator?: {
    id: number;
    username: string;
  };
}

export interface LobbyBannerCreateRequest {
  sortOrder?: number;
  bannerName: string;
  currency: string;
  language: string;
  targetUrl?: string;
  bannerImageUrl: string;
  displayDuration?: number;
  startTime: string;
  endTime: string;
  jumpMode?: string;
  status?: 'active' | 'draft' | 'inactive';
  remark?: string;
}

export interface LobbyBannerUpdateRequest
  extends Partial<LobbyBannerCreateRequest> {
  id: number;
}

export interface LobbyBannerFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  bannerName?: string;
  language?: string;
  currency?: string;
  status?: string;
  jumpMode?: string;
  updatedBy?: string;
  startTime?: string;
  endTime?: string;
}

export interface LobbyBannerListResponse {
  success: boolean;
  data: {
    list: LobbyBanner[];
    pagination: {
      current: number;
      hasNext?: boolean;
      hasPrev?: boolean;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface LobbyBannerStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
}

export interface BatchRequest {
  ids: number[];
}

export interface BatchStatusRequest extends BatchRequest {
  status: 'active' | 'draft' | 'inactive';
}

export interface SortOrderRequest {
  banners: Array<{
    id: number;
    sortOrder: number;
  }>;
}

// API methods
export const getBannerList = async (
  params?: LobbyBannerFilters,
): Promise<LobbyBannerListResponse> => {
  const response = await requestClient.get<LobbyBannerListResponse>(
    '/banners',
    { params },
  );
  return response;
};

export const createBanner = async (
  data: LobbyBannerCreateRequest,
): Promise<LobbyBanner> => {
  const response = await requestClient.post<LobbyBanner>('/banners', data);
  return response;
};

export const updateBanner = async (
  id: number,
  data: Partial<LobbyBannerCreateRequest>,
): Promise<LobbyBanner> => {
  const response = await requestClient.put<LobbyBanner>(`/banners/${id}`, data);
  return response;
};

export const deleteBanner = async (id: number): Promise<void> => {
  await requestClient.delete(`/banners/${id}`);
};

export const getBannerById = async (id: number): Promise<LobbyBanner> => {
  const response = await requestClient.get<LobbyBanner>(`/banners/${id}`);
  return response;
};

export const duplicateBanner = async (id: number): Promise<LobbyBanner> => {
  const response = await requestClient.post<LobbyBanner>(
    `/banners/${id}/duplicate`,
  );
  return response;
};

export const toggleBannerStatus = async (
  id: number,
  status: 'active' | 'draft' | 'inactive',
): Promise<LobbyBanner> => {
  const response = await requestClient.put<LobbyBanner>(
    `/banners/${id}/status`,
    { status },
  );
  return response;
};

export const batchDeleteBanners = async (data: BatchRequest): Promise<void> => {
  await requestClient.delete('/banners/batch/delete', { data });
};

export const batchToggleStatus = async (
  data: BatchStatusRequest,
): Promise<void> => {
  await requestClient.put('/banners/batch/status', data);
};

export const updateSortOrder = async (
  data: SortOrderRequest,
): Promise<void> => {
  await requestClient.put('/banners/batch/sort-order', data);
};

export const getBannerStats = async (): Promise<LobbyBannerStats> => {
  const response = await requestClient.get<LobbyBannerStats>('/banners/stats');
  return response;
};

// Helper functions
export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '已发布',
    inactive: '已下架',
    draft: '草稿',
  };
  return statusMap[status] || status;
};

export const getStatusType = (
  status: string,
): 'error' | 'success' | 'warning' => {
  const typeMap: Record<string, 'error' | 'success' | 'warning'> = {
    active: 'success',
    inactive: 'error',
    draft: 'warning',
  };
  return typeMap[status] || 'error';
};

export const getJumpModeText = (jumpMode: string): string => {
  // 🔧 FIX: Convert to lowercase to handle both "ACTIVITY" and "activity"
  const normalizedMode = jumpMode?.toLowerCase() || '';

  const modeMap: Record<string, string> = {
    none: '无',
    external_link: '外部链接',
    activity: '活动',
    task: '任务',
    recharge: '充值',
    rebate: '返水',
    agent: '代理',
    vip: 'VIP',
    interest_treasure: '利息宝',
    public_fund: '公积金',
    game: '游戏',
    blind_box_lottery: '盲盒抽奖',
    club_application: '俱乐部申请（合作联营）',
  };
  return modeMap[normalizedMode] || jumpMode;
};
