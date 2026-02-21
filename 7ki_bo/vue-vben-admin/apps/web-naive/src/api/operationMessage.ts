import { requestClient } from '#/api/request';

export interface OperationMessage {
  id: number;
  language: string;
  currency: string;
  receiverType: string;
  title: string;
  content?: string;
  popupEntrance: boolean;
  startTime: string;
  endTime: string;
  readOrSent: boolean;
  videoPush: boolean;
  triggerCondition: string;
  status: string;
  priority?: string;
  icon?: string;
  targetUsers?: string[];
  maxSendCount?: number;
  sendInterval?: number;
  actionUrl?: string;
  sendImmediately?: boolean;
  remark: string;
  createdAt: string;
  updatedAt: string;
  creatorId?: number;
}

export interface OperationMessageFilters {
  page?: number;
  pageSize?: number;
  language?: string;
  currency?: string;
  receiverType?: string;
  title?: string;
  status?: string;
  triggerCondition?: string;
  popupEntrance?: boolean;
  videoPush?: boolean;
  search?: string;
}

export interface OperationMessageCreateRequest {
  language: string;
  currency: string;
  receiverType: string;
  title: string;
  content?: string;
  popupEntrance?: boolean;
  startTime?: string;
  endTime?: string;
  readOrSent?: boolean;
  videoPush?: boolean;
  triggerCondition: string;
  status: string;
  priority?: string;
  icon?: string;
  targetUsers?: string[];
  maxSendCount?: number;
  sendInterval?: number;
  actionUrl?: string;
  sendImmediately?: boolean;
  remark?: string;
}

export interface OperationMessageUpdateRequest
  extends OperationMessageCreateRequest {
  id: number;
}

export interface OperationMessageBatchSendRequest {
  ids: number[];
  sendImmediately?: boolean;
}

export interface OperationMessageBatchDeleteRequest {
  ids: number[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Get all operation messages with pagination and filtering
export async function getOperationMessages(filters?: OperationMessageFilters) {
  return requestClient.get<ApiResponse<OperationMessage[]>>(
    '/operation-messages',
    {
      params: filters,
    },
  );
}

// Get a specific operation message by ID
export async function getOperationMessageById(id: number) {
  return requestClient.get<ApiResponse<OperationMessage>>(
    `/operation-messages/${id}`,
  );
}

// Create a new operation message
export async function createOperationMessage(
  data: OperationMessageCreateRequest,
) {
  return requestClient.post<ApiResponse<OperationMessage>>(
    '/operation-messages',
    data,
  );
}

// Update an operation message
export async function updateOperationMessage(
  id: number,
  data: OperationMessageCreateRequest,
) {
  return requestClient.put<ApiResponse<OperationMessage>>(
    `/operation-messages/${id}`,
    data,
  );
}

// Delete an operation message
export async function deleteOperationMessage(id: number) {
  return requestClient.delete<ApiResponse<null>>(`/operation-messages/${id}`);
}

// Send an operation message
export async function sendOperationMessage(id: number) {
  return requestClient.post<ApiResponse<OperationMessage>>(
    `/operation-messages/${id}/send`,
  );
}

// Batch send operation messages
export async function batchSendOperationMessages(
  data: OperationMessageBatchSendRequest,
) {
  return requestClient.post<ApiResponse<{ failed: number; sent: number }>>(
    '/operation-messages/batch-send',
    data,
  );
}

// Batch delete operation messages
export async function batchDeleteOperationMessages(
  data: OperationMessageBatchDeleteRequest,
) {
  return requestClient.delete<ApiResponse<null>>(
    '/operation-messages/batch-delete',
    { data },
  );
}

// Toggle operation message status
export async function toggleOperationMessageStatus(id: number, status: string) {
  return requestClient.put<ApiResponse<OperationMessage>>(
    `/operation-messages/${id}/status`,
    { status },
  );
}

// Get operation message statistics
export async function getOperationMessageStats() {
  return requestClient.get<
    ApiResponse<{
      disabled: number;
      draft: number;
      enabled: number;
      pending: number;
      sent: number;
      total: number;
    }>
  >('/operation-messages/stats');
}

// Get operation message send history
export async function getOperationMessageSendHistory(
  id: number,
  filters?: { page?: number; pageSize?: number },
) {
  return requestClient.get<
    ApiResponse<
      {
        id: number;
        ipAddress?: string;
        messageId: number;
        readAt?: string;
        sentAt: string;
        status: string;
        userAgent?: string;
        userId: number;
      }[]
    >
  >(`/operation-messages/${id}/send-history`, {
    params: filters,
  });
}

// Preview operation message (for testing)
export async function previewOperationMessage(
  data: OperationMessageCreateRequest,
) {
  return requestClient.post<
    ApiResponse<{
      cost: number;
      estimatedReach: number;
      preview: string;
    }>
  >('/operation-messages/preview', data);
}

// Get available templates
export async function getOperationMessageTemplates() {
  return requestClient.get<
    ApiResponse<
      {
        category: string;
        content: string;
        createdAt: string;
        currency: string;
        icon?: string;
        id: number;
        language: string;
        name: string;
        popupEntrance: boolean;
        receiverType: string;
        title: string;
        triggerCondition: string;
        videoPush: boolean;
      }[]
    >
  >('/operation-messages/templates');
}

// Create template from message
export async function createOperationMessageTemplate(
  messageId: number,
  templateName: string,
) {
  return requestClient.post<ApiResponse<{ id: number; name: string }>>(
    `/operation-messages/${messageId}/create-template`,
    {
      name: templateName,
    },
  );
}

// Import messages from CSV/Excel
export async function importOperationMessages(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return requestClient.post<
    ApiResponse<{
      errors: string[];
      failed: number;
      imported: number;
    }>
  >('/operation-messages/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// Export messages to CSV/Excel
export async function exportOperationMessages(
  filters?: OperationMessageFilters,
) {
  return requestClient.get<Blob>('/operation-messages/export', {
    params: filters,
    responseType: 'blob',
  });
}

// Get message delivery report
export async function getOperationMessageDeliveryReport(id: number) {
  return requestClient.get<
    ApiResponse<{
      clickRate: number;
      completedAt?: string;
      deliveryRate: number;
      messageId: number;
      readRate: number;
      sentAt: string;
      status: string;
      totalClicked: number;
      totalDelivered: number;
      totalRead: number;
      totalSent: number;
    }>
  >(`/operation-messages/${id}/delivery-report`);
}

// Schedule message for later sending
export async function scheduleOperationMessage(
  id: number,
  scheduleTime: string,
) {
  return requestClient.post<ApiResponse<OperationMessage>>(
    `/operation-messages/${id}/schedule`,
    {
      scheduleTime,
    },
  );
}

// Cancel scheduled message
export async function cancelScheduledOperationMessage(id: number) {
  return requestClient.post<ApiResponse<OperationMessage>>(
    `/operation-messages/${id}/cancel-schedule`,
  );
}

// Test message sending (send to admin/test users only)
export async function testOperationMessage(id: number, testUserIds?: number[]) {
  return requestClient.post<
    ApiResponse<{
      failed: number;
      sent: number;
      testResults: Array<{
        error?: string;
        status: string;
        userId: number;
      }>;
    }>
  >(`/operation-messages/${id}/test`, {
    testUserIds,
  });
}

// Get message performance analytics
export async function getOperationMessageAnalytics(filters?: {
  currency?: string;
  endDate?: string;
  language?: string;
  receiverType?: string;
  startDate?: string;
}) {
  return requestClient.get<
    ApiResponse<{
      averageDeliveryTime: number;
      averageReadTime: number;
      performanceByCurrency: Record<
        string,
        {
          clicked: number;
          delivered: number;
          read: number;
          sent: number;
        }
      >;
      performanceByLanguage: Record<
        string,
        {
          clicked: number;
          delivered: number;
          read: number;
          sent: number;
        }
      >;
      performanceByReceiverType: Record<
        string,
        {
          clicked: number;
          delivered: number;
          read: number;
          sent: number;
        }
      >;
      topPerformingMessages: Array<{
        clickRate: number;
        id: number;
        readRate: number;
        title: string;
      }>;
      totalClicked: number;
      totalDelivered: number;
      totalMessages: number;
      totalRead: number;
      totalSent: number;
    }>
  >('/operation-messages/analytics', {
    params: filters,
  });
}
