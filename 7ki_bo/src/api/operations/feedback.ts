/**
 * Feedback Management API
 * 有奖反馈管理接口
 */
import { requestClient } from '../request';

// ==================== INTERFACES ====================

export interface Feedback {
  id: number;
  userId: number;
  user?: {
    id: number;
    account: string;
    userID: string;
    email?: string;
  };
  feedbackType: string;      // Feedback category/type
  content: string;            // Feedback content
  images: string[];           // Array of image URLs (COS URLs)
  status: FeedbackStatus;
  adminReply?: string;        // Admin response
  repliedAt?: string;
  repliedBy?: number;
  reward?: number;            // Reward amount if approved
  rewardGiven: boolean;
  rewardGivenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type FeedbackStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_REVIEW' | 'REPLIED';

export interface FeedbackListParams {
  page?: number;
  pageSize?: number;
  status?: FeedbackStatus | string;
  search?: string;           // Search by content, type, or username
  startDate?: string;
  endDate?: string;
}

export interface FeedbackListResponse {
  success: boolean;
  data: {
    feedbacks: Feedback[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface UpdateFeedbackStatusParams {
  status: FeedbackStatus;
  adminReply?: string;
  reward?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ==================== API CLIENT ====================

export const feedbackApi = {
  /**
   * Get all feedbacks (Admin)
   * 获取所有反馈（管理员）
   */
  getAll: async (params: FeedbackListParams = {}): Promise<FeedbackListResponse> => {
    const response = await requestClient.get('/feedback/admin/all', { params });
    return response;
  },

  /**
   * Get single feedback by ID (Admin)
   * 获取单个反馈详情（管理员）
   */
  getById: async (feedbackId: number): Promise<ApiResponse<Feedback>> => {
    const response = await requestClient.get(`/feedback/${feedbackId}`);
    return response.data || response;
  },

  /**
   * Update feedback status (Admin)
   * 更新反馈状态（管理员）
   */
  updateStatus: async (
    feedbackId: number,
    params: UpdateFeedbackStatusParams
  ): Promise<ApiResponse<Feedback>> => {
    const response = await requestClient.put(`/feedback/admin/${feedbackId}/status`, params);
    return response.data || response;
  },

  /**
   * Approve feedback with reward (Admin)
   * 采纳反馈并给予奖励（管理员）
   */
  approveFeedback: async (
    feedbackId: number,
    reward: number,
    adminReply?: string
  ): Promise<ApiResponse<Feedback>> => {
    return feedbackApi.updateStatus(feedbackId, {
      status: 'APPROVED',
      reward,
      adminReply,
    });
  },

  /**
   * Reject feedback (Admin)
   * 拒绝反馈（管理员）
   */
  rejectFeedback: async (
    feedbackId: number,
    adminReply?: string
  ): Promise<ApiResponse<Feedback>> => {
    return feedbackApi.updateStatus(feedbackId, {
      status: 'REJECTED',
      adminReply,
    });
  },

  /**
   * Reply to feedback (Admin)
   * 回复反馈（管理员）
   */
  replyFeedback: async (
    feedbackId: number,
    adminReply: string
  ): Promise<ApiResponse<Feedback>> => {
    return feedbackApi.updateStatus(feedbackId, {
      status: 'REPLIED',
      adminReply,
    });
  },

  /**
   * Set feedback to in-review status (Admin)
   * 设置反馈为审核中（管理员）
   */
  setInReview: async (feedbackId: number): Promise<ApiResponse<Feedback>> => {
    return feedbackApi.updateStatus(feedbackId, {
      status: 'IN_REVIEW',
    });
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get status label in Chinese
 * 获取状态的中文标签
 */
export function getStatusLabel(status: FeedbackStatus): string {
  const statusMap: Record<FeedbackStatus, string> = {
    PENDING: '待处理',
    IN_REVIEW: '审核中',
    REPLIED: '已回复',
    APPROVED: '已采纳',
    REJECTED: '已拒绝',
  };
  return statusMap[status] || status;
}

/**
 * Get status type for NaiveUI badge
 * 获取状态类型用于徽章显示
 */
export function getStatusType(status: FeedbackStatus): 'default' | 'info' | 'success' | 'warning' | 'error' {
  const typeMap: Record<FeedbackStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    PENDING: 'warning',
    IN_REVIEW: 'info',
    REPLIED: 'default',
    APPROVED: 'success',
    REJECTED: 'error',
  };
  return typeMap[status] || 'default';
}








