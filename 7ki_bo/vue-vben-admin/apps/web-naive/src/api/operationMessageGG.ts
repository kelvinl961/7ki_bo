import { requestClient } from '#/api/request';

// 系统公告消息类型定义
export interface GGMessage {
  id: number;
  sortOrder: number;
  language: string;
  currency: string;
  receiverType: string;
  title: string;
  content: string;
  popupEntry: boolean;
  startTime: Date | null;
  endTime: Date | null;
  videoPushEnabled: boolean;
  status: 'enabled' | 'disabled';
  remark: string;
  updatedAt: Date;
  createdAt: Date;
  
  // 显示设置
  displaySettings?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    position?: string;
  };
  
  // 高级设置
  priority?: string;
  clickAction?: string;
  redirectUrl?: string;
}

// 创建/更新 GG 消息的数据类型
export interface GGMessageInput {
  sortOrder: number;
  language: string;
  currency: string;
  receiverType: string;
  title: string;
  content: string;
  popupEntry: boolean;
  startTime: Date | null;
  endTime: Date | null;
  videoPushEnabled: boolean;
  status: 'enabled' | 'disabled';
  remark: string;
  
  // 显示设置
  displaySettings?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    position?: string;
  };
  
  // 高级设置
  priority?: string;
  clickAction?: string;
  redirectUrl?: string;
}

// 列表查询参数
export interface GGListParams {
  page?: number;
  pageSize?: number;
  language?: string;
  currency?: string;
  receiverType?: string;
  status?: string;
  popupEntry?: boolean;
  videoPushEnabled?: boolean;
  keyword?: string;
  timeRange?: [number, number] | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 列表返回数据类型
export interface GGListResponse {
  data: GGMessage[];
  total: number;
  page: number;
  pageSize: number;
}

// 批量操作参数
export interface GGBatchParams {
  ids: number[];
}

// 统计数据类型
export interface GGStats {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  todayCreated: number;
  monthlyCreated: number;
  statusDistribution: {
    enabled: number;
    disabled: number;
  };
  languageDistribution: {
    [key: string]: number;
  };
  currencyDistribution: {
    [key: string]: number;
  };
}

// 预览数据类型
export interface GGPreview {
  id: number;
  title: string;
  content: string;
  displaySettings: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    position: string;
  };
}

/**
 * 获取 GG 消息列表
 */
export async function getGGList(params: GGListParams = {}): Promise<GGListResponse> {
  const response = await requestClient.get<GGListResponse>('/system-announcements', {
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      language: params.language,
      currency: params.currency,
      receiverType: params.receiverType,
      status: params.status,
      popupEntry: params.popupEntry,
      videoPushEnabled: params.videoPushEnabled,
      keyword: params.keyword,
      startTime: params.timeRange?.[0] ? new Date(params.timeRange[0]).toISOString() : undefined,
      endTime: params.timeRange?.[1] ? new Date(params.timeRange[1]).toISOString() : undefined,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder
    }
  });
  return response;
}

/**
 * 获取单个 GG 消息详情
 */
export async function getGGById(id: number): Promise<GGMessage> {
  const response = await requestClient.get<GGMessage>(`/system-announcements/${id}`);
  return response;
}

/**
 * 创建 GG 消息
 */
export async function createGG(data: GGMessageInput): Promise<GGMessage> {
  const response = await requestClient.post<GGMessage>('/system-announcements', data);
  return response;
}

/**
 * 更新 GG 消息
 */
export async function updateGG(id: number, data: Partial<GGMessageInput>): Promise<GGMessage> {
  const response = await requestClient.put<GGMessage>(`/system-announcements/${id}`, data);
  return response;
}

/**
 * 删除 GG 消息
 */
export async function deleteGG(id: number): Promise<void> {
  await requestClient.delete(`/system-announcements/${id}`);
}

/**
 * 批量删除 GG 消息
 */
export async function batchDeleteGG(params: GGBatchParams): Promise<void> {
  await requestClient.delete('/system-announcements/batch/delete', {
    data: params
  });
}

/**
 * 切换 GG 消息状态
 */
export async function toggleGGStatus(id: number, enabled: boolean): Promise<GGMessage> {
  const response = await requestClient.put<GGMessage>(`/system-announcements/${id}/status`, {
    status: enabled ? 'enabled' : 'disabled'
  });
  return response;
}

/**
 * 批量切换 GG 消息状态
 */
export async function batchToggleGGStatus(params: GGBatchParams, enabled: boolean): Promise<void> {
  await requestClient.put('/system-announcements/batch/status', {
    ...params,
    status: enabled ? 'enabled' : 'disabled'
  });
}

/**
 * 复制 GG 消息
 */
export async function copyGG(id: number): Promise<GGMessage> {
  const response = await requestClient.post<GGMessage>(`/system-announcements/${id}/copy`);
  return response;
}

/**
 * 批量复制 GG 消息
 */
export async function batchCopyGG(params: GGBatchParams): Promise<GGMessage[]> {
  const response = await requestClient.post<GGMessage[]>('/system-announcements/batch/copy', params);
  return response;
}

/**
 * 获取 GG 消息统计数据
 */
export async function getGGStats(): Promise<GGStats> {
  const response = await requestClient.get<GGStats>('/system-announcements/stats/overview');
  return response;
}

/**
 * 预览 GG 消息
 */
export async function previewGG(id: number): Promise<GGPreview> {
  const response = await requestClient.get<GGPreview>(`/system-announcements/${id}/preview`);
  return response;
}

/**
 * 导出 GG 消息
 */
export async function exportGG(params: GGListParams = {}): Promise<Blob> {
  const response = await requestClient.get('/gg-messages/export', {
    params,
    responseType: 'blob'
  });
  return response;
}

/**
 * 导入 GG 消息
 */
export async function importGG(file: File): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await requestClient.post('/gg-messages/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response;
}

/**
 * 获取 GG 消息模板
 */
export async function getGGTemplates(): Promise<GGMessage[]> {
  const response = await requestClient.get<GGMessage[]>('/gg-messages/templates');
  return response;
}

/**
 * 保存为模板
 */
export async function saveGGAsTemplate(id: number, name: string): Promise<GGMessage> {
  const response = await requestClient.post<GGMessage>(`/gg-messages/${id}/template`, {
    name
  });
  return response;
}

/**
 * 从模板创建 GG 消息
 */
export async function createGGFromTemplate(templateId: number, data: Partial<GGMessageInput>): Promise<GGMessage> {
  const response = await requestClient.post<GGMessage>(`/gg-messages/templates/${templateId}/create`, data);
  return response;
}

/**
 * 测试 GG 消息显示
 */
export async function testGGDisplay(id: number): Promise<void> {
  await requestClient.post(`/system-announcements/${id}/test-display`);
}

/**
 * 获取 GG 消息显示日志
 */
export async function getGGDisplayLogs(id: number, params: {
  page?: number;
  pageSize?: number;
  startTime?: Date;
  endTime?: Date;
} = {}): Promise<{
  data: {
    id: number;
    userId: number;
    displayTime: Date;
    duration: number;
    clicked: boolean;
    userAgent: string;
    ip: string;
  }[];
  total: number;
}> {
  const response = await requestClient.get(`/gg-messages/${id}/logs`, {
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      startTime: params.startTime?.toISOString(),
      endTime: params.endTime?.toISOString()
    }
  });
  return response;
}

/**
 * 获取 GG 消息分析报告
 */
export async function getGGAnalytics(id: number, params: {
  startTime?: Date;
  endTime?: Date;
} = {}): Promise<{
  totalViews: number;
  totalClicks: number;
  clickRate: number;
  avgDisplayTime: number;
  viewsByHour: { hour: number; views: number }[];
  clicksByHour: { hour: number; clicks: number }[];
  userDistribution: {
    newUsers: number;
    returningUsers: number;
    vipUsers: number;
  };
}> {
  const response = await requestClient.get(`/gg-messages/${id}/analytics`, {
    params: {
      startTime: params.startTime?.toISOString(),
      endTime: params.endTime?.toISOString()
    }
  });
  return response;
}

/**
 * 更新 GG 消息排序
 */
export async function updateGGSort(items: { id: number; sortOrder: number }[]): Promise<void> {
  await requestClient.put('/system-announcements/batch/sort', { items });
} 