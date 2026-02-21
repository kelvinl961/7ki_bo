import { requestClient } from '#/api/request';

// 跑马灯消息类型定义
export interface PMDMessage {
  id: number;
  sortOrder: number;
  language: string;
  currency: string;
  receiverType: string;
  displayStatus: string;
  startTime: Date | null;
  endTime: Date | null;
  displayDuration: number;
  content: string;
  status: 'disabled' | 'enabled';
  remark: string;
  updatedAt: Date;
  createdAt: Date;

  // 显示设置
  scrollSpeed?: string;
  textColor?: string;
  backgroundColor?: string;
  position?: string;

  // 高级设置
  userConditions?: string[];
  priority?: string;
  clickAction?: string;
  redirectUrl?: string;
}

// 创建/更新 PMD 消息的数据类型
export interface PMDMessageInput {
  sortOrder: number;
  language: string;
  currency: string;
  receiverType: string;
  displayStatus: string;
  startTime: Date | null;
  endTime: Date | null;
  displayDuration: number;
  content: string;
  status: 'disabled' | 'enabled';
  remark: string;

  // 显示设置
  scrollSpeed?: string;
  textColor?: string;
  backgroundColor?: string;
  position?: string;

  // 高级设置
  userConditions?: string[];
  priority?: string;
  clickAction?: string;
  redirectUrl?: string;
}

// 列表查询参数
export interface PMDListParams {
  page?: number;
  pageSize?: number;
  language?: string;
  currency?: string;
  receiverType?: string;
  status?: string;
  displayStatus?: string;
  keyword?: string;
  timeRange?: [number, number] | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 列表返回数据类型
export interface PMDListResponse {
  data: PMDMessage[];
  total: number;
  page: number;
  pageSize: number;
}

// 批量操作参数
export interface PMDBatchParams {
  ids: number[];
}

// 统计数据类型
export interface PMDStats {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  todayCreated: number;
  monthlyCreated: number;
  statusDistribution: {
    disabled: number;
    enabled: number;
  };
  languageDistribution: {
    [key: string]: number;
  };
  currencyDistribution: {
    [key: string]: number;
  };
}

// 预览数据类型
export interface PMDPreview {
  id: number;
  content: string;
  displaySettings: {
    backgroundColor: string;
    position: string;
    scrollSpeed: string;
    textColor: string;
  };
}

/**
 * 获取 PMD 消息列表
 */
export async function getPMDList(
  params: PMDListParams = {},
): Promise<PMDListResponse> {
  const response = await requestClient.get<PMDListResponse>('/pmd-messages', {
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      language: params.language,
      currency: params.currency,
      receiverType: params.receiverType,
      status: params.status,
      displayStatus: params.displayStatus,
      keyword: params.keyword,
      startTime: params.timeRange?.[0]
        ? new Date(params.timeRange[0]).toISOString()
        : undefined,
      endTime: params.timeRange?.[1]
        ? new Date(params.timeRange[1]).toISOString()
        : undefined,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
  });
  return response;
}

/**
 * 获取单个 PMD 消息详情
 */
export async function getPMDById(id: number): Promise<PMDMessage> {
  const response = await requestClient.get<PMDMessage>(`/pmd-messages/${id}`);
  return response;
}

/**
 * 创建 PMD 消息
 */
export async function createPMD(data: PMDMessageInput): Promise<PMDMessage> {
  const response = await requestClient.post<PMDMessage>('/pmd-messages', data);
  return response;
}

/**
 * 更新 PMD 消息
 */
export async function updatePMD(
  id: number,
  data: Partial<PMDMessageInput>,
): Promise<PMDMessage> {
  const response = await requestClient.put<PMDMessage>(
    `/pmd-messages/${id}`,
    data,
  );
  return response;
}

/**
 * 删除 PMD 消息
 */
export async function deletePMD(id: number): Promise<void> {
  await requestClient.delete(`/pmd-messages/${id}`);
}

/**
 * 批量删除 PMD 消息
 */
export async function batchDeletePMD(params: PMDBatchParams): Promise<void> {
  await requestClient.delete('/pmd-messages/batch', {
    data: params,
  });
}

/**
 * 切换 PMD 消息状态
 */
export async function togglePMDStatus(
  id: number,
  enabled: boolean,
): Promise<PMDMessage> {
  const response = await requestClient.put<PMDMessage>(
    `/pmd-messages/${id}/status`,
    {
      status: enabled ? 'enabled' : 'disabled',
    },
  );
  return response;
}

/**
 * 批量切换 PMD 消息状态
 */
export async function batchTogglePMDStatus(
  params: PMDBatchParams,
  enabled: boolean,
): Promise<void> {
  await requestClient.put('/pmd-messages/batch/status', {
    ...params,
    status: enabled ? 'enabled' : 'disabled',
  });
}

/**
 * 复制 PMD 消息
 */
export async function copyPMD(id: number): Promise<PMDMessage> {
  const response = await requestClient.post<PMDMessage>(
    `/pmd-messages/${id}/copy`,
  );
  return response;
}

/**
 * 批量复制 PMD 消息
 */
export async function batchCopyPMD(
  params: PMDBatchParams,
): Promise<PMDMessage[]> {
  const response = await requestClient.post<PMDMessage[]>(
    '/pmd-messages/batch/copy',
    params,
  );
  return response;
}

/**
 * 获取 PMD 消息统计数据
 */
export async function getPMDStats(): Promise<PMDStats> {
  const response = await requestClient.get<PMDStats>('/pmd-messages/stats');
  return response;
}

/**
 * 预览 PMD 消息
 */
export async function previewPMD(id: number): Promise<PMDPreview> {
  const response = await requestClient.get<PMDPreview>(
    `/pmd-messages/${id}/preview`,
  );
  return response;
}

/**
 * 导出 PMD 消息
 */
export async function exportPMD(params: PMDListParams = {}): Promise<Blob> {
  const response = await requestClient.get('/pmd-messages/export', {
    params,
    responseType: 'blob',
  });
  return response;
}

/**
 * 导入 PMD 消息
 */
export async function importPMD(file: File): Promise<{
  errors: string[];
  failed: number;
  success: number;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await requestClient.post('/pmd-messages/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
}

/**
 * 获取 PMD 消息模板
 */
export async function getPMDTemplates(): Promise<PMDMessage[]> {
  const response = await requestClient.get<PMDMessage[]>(
    '/pmd-messages/templates',
  );
  return response;
}

/**
 * 保存为模板
 */
export async function savePMDAsTemplate(
  id: number,
  name: string,
): Promise<PMDMessage> {
  const response = await requestClient.post<PMDMessage>(
    `/pmd-messages/${id}/template`,
    {
      name,
    },
  );
  return response;
}

/**
 * 从模板创建 PMD 消息
 */
export async function createPMDFromTemplate(
  templateId: number,
  data: Partial<PMDMessageInput>,
): Promise<PMDMessage> {
  const response = await requestClient.post<PMDMessage>(
    `/pmd-messages/templates/${templateId}/create`,
    data,
  );
  return response;
}

/**
 * 测试 PMD 消息显示
 */
export async function testPMDDisplay(id: number): Promise<void> {
  await requestClient.post(`/pmd-messages/${id}/test`);
}

/**
 * 获取 PMD 消息显示日志
 */
export async function getPMDDisplayLogs(
  id: number,
  params: {
    endTime?: Date;
    page?: number;
    pageSize?: number;
    startTime?: Date;
  } = {},
): Promise<{
  data: {
    clicked: boolean;
    displayTime: Date;
    duration: number;
    id: number;
    ip: string;
    userAgent: string;
    userId: number;
  }[];
  total: number;
}> {
  const response = await requestClient.get(`/pmd-messages/${id}/logs`, {
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      startTime: params.startTime?.toISOString(),
      endTime: params.endTime?.toISOString(),
    },
  });
  return response;
}

/**
 * 获取 PMD 消息分析报告
 */
export async function getPMDAnalytics(
  id: number,
  params: {
    endTime?: Date;
    startTime?: Date;
  } = {},
): Promise<{
  avgDisplayTime: number;
  clickRate: number;
  clicksByHour: { clicks: number; hour: number }[];
  totalClicks: number;
  totalViews: number;
  userDistribution: {
    newUsers: number;
    returningUsers: number;
    vipUsers: number;
  };
  viewsByHour: { hour: number; views: number }[];
}> {
  const response = await requestClient.get(`/pmd-messages/${id}/analytics`, {
    params: {
      startTime: params.startTime?.toISOString(),
      endTime: params.endTime?.toISOString(),
    },
  });
  return response;
}

/**
 * 更新 PMD 消息排序
 */
export async function updatePMDSort(
  items: { id: number; sortOrder: number }[],
): Promise<void> {
  await requestClient.put('/pmd-messages/sort', {
    items,
  });
}
