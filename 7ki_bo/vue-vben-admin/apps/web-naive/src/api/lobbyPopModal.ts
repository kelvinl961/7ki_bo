import { requestClient } from './request';

// TypeScript interfaces
export interface LobbyPopModal {
  id: number;
  sortOrder: number;
  title: string;
  currency: string;
  language: string;
  imageUrl?: string; // Made optional
  content?: string; // Rich text content
  targetAudience: string;
  entryPoints: string[];
  jumpType: string;
  targetUrl?: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'draft' | 'expired' | 'inactive';
  isActive: boolean;
  maxDisplayTimes: number;
  displayInterval: number;
  remark?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  totalViews: number;
  totalClicks: number;
  clickRate: number;
  creatorId?: number;
  creator?: {
    id: number;
    username: string;
  };
}

export interface LobbyPopModalCreateRequest {
  sortOrder?: number;
  title: string;
  currency: string;
  language: string;
  imageUrl?: string; // Made optional
  content?: string; // Rich text content
  targetAudience: string;
  entryPoints?: string[];
  jumpType?: string;
  targetUrl?: string;
  startTime: string;
  endTime: string;
  status?: 'active' | 'draft' | 'expired' | 'inactive';
  isActive?: boolean;
  maxDisplayTimes?: number;
  displayInterval?: number;
  remark?: string;
}

export interface LobbyPopModalUpdateRequest
  extends Partial<LobbyPopModalCreateRequest> {
  id: number;
}

export interface LobbyPopModalFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  title?: string;
  language?: string;
  currency?: string;
  status?: string;
  jumpType?: string;
  targetAudience?: string;
  entryPoints?: string;
  updatedBy?: string;
  startTime?: string;
  endTime?: string;
}

export interface LobbyPopModalListResponse {
  list: LobbyPopModal[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface LobbyPopModalStats {
  total: number;
  active: number;
  expired: number;
  draft: number;
  inactive: number;
}

export interface BatchRequest {
  ids: number[];
}

export interface BatchStatusRequest extends BatchRequest {
  status: 'active' | 'draft' | 'expired' | 'inactive';
}

export interface SortOrderRequest {
  popModals: Array<{
    id: number;
    sortOrder: number;
  }>;
}

// API methods
export const getPopModalList = async (
  params?: LobbyPopModalFilters,
): Promise<LobbyPopModalListResponse> => {
  const response = await requestClient.get<LobbyPopModalListResponse>(
    '/pop-modals',
    { params },
  );
  return response;
};

export const createPopModal = async (
  data: LobbyPopModalCreateRequest,
): Promise<LobbyPopModal> => {
  const response = await requestClient.post<LobbyPopModal>('/pop-modals', data);
  return response;
};

export const updatePopModal = async (
  id: number,
  data: Partial<LobbyPopModalCreateRequest>,
): Promise<LobbyPopModal> => {
  const response = await requestClient.put<LobbyPopModal>(
    `/pop-modals/${id}`,
    data,
  );
  return response;
};

export const deletePopModal = async (id: number): Promise<void> => {
  await requestClient.delete(`/pop-modals/${id}`);
};

export const getPopModalById = async (id: number): Promise<LobbyPopModal> => {
  const response = await requestClient.get<LobbyPopModal>(`/pop-modals/${id}`);
  return response;
};

export const duplicatePopModal = async (id: number): Promise<LobbyPopModal> => {
  const response = await requestClient.post<LobbyPopModal>(
    `/pop-modals/${id}/duplicate`,
  );
  return response;
};

export const togglePopModalStatus = async (
  id: number,
  status: 'active' | 'draft' | 'expired' | 'inactive',
): Promise<LobbyPopModal> => {
  const response = await requestClient.put<LobbyPopModal>(
    `/pop-modals/${id}/status`,
    { status },
  );
  return response;
};

export const batchDeletePopModals = async (
  data: BatchRequest,
): Promise<void> => {
  await requestClient.delete('/pop-modals/batch/delete', { data });
};

export const batchToggleStatus = async (
  data: BatchStatusRequest,
): Promise<void> => {
  await requestClient.put('/pop-modals/batch/status', data);
};

export const updateSortOrder = async (
  data: SortOrderRequest,
): Promise<void> => {
  await requestClient.put('/pop-modals/batch/sort-order', data);
};

export const getPopModalStats = async (): Promise<LobbyPopModalStats> => {
  const response =
    await requestClient.get<LobbyPopModalStats>('/pop-modals/stats');
  return response;
};

// Helper functions
export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '生效中',
    expired: '已过期',
    draft: '草稿',
    inactive: '已停用',
  };
  return statusMap[status] || status;
};

export const getStatusType = (
  status: string,
): 'error' | 'info' | 'success' | 'warning' => {
  const typeMap: Record<string, 'error' | 'info' | 'success' | 'warning'> = {
    active: 'success',
    expired: 'error',
    draft: 'warning',
    inactive: 'info',
  };
  return typeMap[status] || 'error';
};

export const getJumpTypeText = (jumpType: string): string => {
  const typeMap: Record<string, string> = {
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
  return typeMap[jumpType] || jumpType;
};

export const getEntryPointText = (entryPoint: string): string => {
  const entryMap: Record<string, string> = {
    login: '登录后弹窗',
    homepage: '首页加载',
    deposit: '充值页面',
    game_lobby: '游戏大厅',
    promotion: '活动页面',
    manual: '手动触发',
  };
  return entryMap[entryPoint] || entryPoint;
};
