import { requestClient } from '#/api/request';

// ===================================
// TYPE DEFINITIONS
// ===================================

export interface Activity {
  id: number;
  type: string;
  category?: string;
  currency: string;
  status: 'active' | 'archived' | 'draft' | 'paused';
  startsAt?: string;
  endsAt?: string;
  displayFrom?: string;
  displayTo?: string;
  displayEnabled: boolean;
  homepageDisplay: boolean;
  floatingIconEnabled: boolean;
  floatingIconConfig?: any;
  config?: any;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  locales?: Array<{
    description?: string;
    locale: string;
    subtitle?: string;
    title?: string;
  }>;
  // Frontend display fields (computed from config)
  title?: string;
  memberScope?: string;
  claimLimit?: number;
  platforms?: string[];
  description?: string;
  rules?: string;
  imageUrl?: string;
  bannerUrl?: string;
  // Legacy fields for backward compatibility
  displayOrder?: number;
  isActive?: boolean;
  lastModifiedBy?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  progress?: number;
  timeRemaining?: number;
  isCurrentlyActive?: boolean;
  durationDays?: number;
}

export interface ActivityListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  category?: string;
  type?: string;
  status?: 'active' | 'archived' | 'draft' | 'paused';
  currency?: string;
  memberScope?: string;
  platforms?: string;
  startDate?: string;
  endDate?: string;
  displayEnabled?: boolean;
  homepageDisplay?: boolean;
  floatingIconEnabled?: boolean;
}

export interface ActivityListResponse {
  list: Activity[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalActivities: number;
    totalClaimLimit: number;
    totalMaxParticipants: number;
    totalParticipants: number;
  };
}

export interface CreateActivityInput {
  type: string;
  category?: string;
  currency: string;
  status?: 'active' | 'archived' | 'draft' | 'paused';
  startsAt?: Date;
  endsAt?: Date;
  displayFrom?: Date;
  displayTo?: Date;
  isVisible?: boolean;
  config?: any;
  createdBy: number;
  iconUrl?: string;
  // New fields for floating icon and display settings
  displayEnabled?: boolean;
  homepageDisplay?: boolean;
  floatingIconEnabled?: boolean;
  floatingIconConfig?: any;
  // Locales for multi-language support
  locales?: Array<{
    description?: string;
    locale: string;
    subtitle?: string;
    title?: string;
  }>;
}

export interface UpdateActivityInput {
  title?: string;
  category?: string;
  currencyScope?: string;
  type?: string;
  requirement?: string;
  memberScope?: string;
  claimLimit?: number;
  platforms?: string[];
  startAt?: string;
  endAt?: string;
  status?: 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'ENDED';
  displayOrder?: number;
  description?: string;
  rules?: string;
  imageUrl?: string;
  bannerUrl?: string;
  maxParticipants?: number;
  lastModifiedBy?: string;
}

export interface ActivitySummary {
  totalActivities: number;
  activeActivities: number;
  closedActivities: number;
  draftActivities: number;
  endedActivities: number;
  totalClaimLimit: number;
  totalParticipants: number;
  totalMaxParticipants: number;
  averageClaimLimit: number;
  averageParticipants: number;
  categoryDistribution: Array<{
    _count: { category: number };
    _sum: { claimLimit: number; currentParticipants: number };
    category: string;
  }>;
  typeDistribution: Array<{
    _count: { type: number };
    _sum: { claimLimit: number; currentParticipants: number };
    type: string;
  }>;
  topPerformingActivities: Array<{
    claimLimit: number;
    currentParticipants: number;
    id: number;
    maxParticipants: number;
    participationRate: number;
    title: string;
  }>;
}

export interface ActivityStatistics {
  totalActivities: number;
  totalParticipants: number;
  totalClaimAmount: number;
  statusDistribution: Array<{
    _count: { status: number };
    status: string;
  }>;
  dailyStats: Array<{
    _count: { createdAt: number };
    _sum: { claimLimit: number; currentParticipants: number };
    createdAt: string;
  }>;
}

export interface ActivityStatsQuery {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: string;
  currencyScope?: string;
}

export interface BulkDeleteActivityInput {
  ids: number[];
}

export interface UpdateActivityStatusInput {
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'ENDED';
  lastModifiedBy?: string;
}

export interface CloneActivityInput {
  title: string;
  startAt: string;
  endAt: string;
}

export interface BatchUpdateActivityInput {
  ids: number[];
  updates: {
    category?: string;
    displayOrder?: number;
    isActive?: boolean;
    lastModifiedBy?: string;
    status?: 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'ENDED';
  };
}

export interface ActivityRecord {
  id: number;
  activityId: number;
  userId: number;
  username: string;
  participatedAt: string;
  amount: number;
  status: string;
  note?: string;
}

export interface ActivityRecordResponse {
  activity: {
    category: string;
    id: number;
    status: string;
    title: string;
  };
  records: ActivityRecord[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ActivityRecordQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId?: number;
  startDate?: string;
  endDate?: string;
}

// ===================================
// API METHODS
// ===================================

/**
 * Get activity list with pagination and filtering
 */
export async function getActivityList(
  params: ActivityListParams = {},
): Promise<ActivityListResponse> {
  return requestClient.get('/activities', { params });
}

/**
 * Get activity by ID
 */
export async function getActivityById(id: number): Promise<Activity> {
  return requestClient.get(`/activities/${id}`);
}

/**
 * Create new activity
 */
export async function createActivity(
  data: CreateActivityInput,
): Promise<Activity> {
  return requestClient.post('/activities', data);
}

/**
 * Update activity
 */
export async function updateActivity(
  id: number,
  data: UpdateActivityInput,
): Promise<Activity> {
  return requestClient.put(`/activities/${id}`, data);
}

// V2 update to align with backend schema (type/category/currency/startsAt/endsAt/config...)
export async function updateActivityV2(
  id: number,
  data: any,
): Promise<Activity> {
  return requestClient.put(`/activities/${id}`, data);
}

/**
 * Delete activity
 */
export async function deleteActivity(id: number): Promise<{ message: string }> {
  return requestClient.delete(`/activities/${id}`);
}

/**
 * Bulk delete activities
 */
export async function bulkDeleteActivities(
  data: BulkDeleteActivityInput,
): Promise<{ deletedCount: number; message: string }> {
  return requestClient.post('/activities/bulk-delete', data);
}

/**
 * Batch update display order
 */
export async function batchUpdateDisplayOrder(
  updates: Array<{ displayOrder: number; id: number }>,
): Promise<{ data: { updatedCount: number }; message: string }> {
  return requestClient.post('/activities/batch-update-order', { updates });
}

/**
 * Update activity status
 */
export async function updateActivityStatus(
  id: number,
  data: UpdateActivityStatusInput,
): Promise<Activity> {
  return requestClient.put(`/activities/${id}/status`, data);
}

/**
 * Get activity summary statistics
 */
export async function getActivitySummary(): Promise<ActivitySummary> {
  return requestClient.get('/activities/summary');
}

/**
 * Get activity statistics
 */
export async function getActivityStatistics(
  params: ActivityStatsQuery = {},
): Promise<ActivityStatistics> {
  return requestClient.get('/activities/statistics', { params });
}

/**
 * Clone activity
 */
export async function cloneActivity(
  id: number,
  data: CloneActivityInput,
): Promise<Activity> {
  return requestClient.post(`/activities/${id}/clone`, data);
}

/**
 * Batch update activities
 */
export async function batchUpdateActivities(
  data: BatchUpdateActivityInput,
): Promise<{ message: string; updatedCount: number }> {
  return requestClient.post('/activities/batch-update', data);
}

/**
 * Get activity participation records
 */
export async function getActivityRecords(
  id: number,
  params: ActivityRecordQuery = {},
): Promise<ActivityRecordResponse> {
  return requestClient.get(`/activities/${id}/records`, { params });
}

/**
 * Get activity analytics overview
 */
export async function getActivityAnalyticsOverview(): Promise<ActivitySummary> {
  return requestClient.get('/activities/analytics/overview');
}

/**
 * Get activity performance data
 */
export async function getActivityPerformanceData(
  params: ActivityStatsQuery = {},
): Promise<ActivityStatistics> {
  return requestClient.get('/activities/analytics/performance', { params });
}

// ===================================
// CONSTANTS
// ===================================

export const ACTIVITY_STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '进行中', value: 'active' },
  { label: '暂停', value: 'paused' },
  { label: '已归档', value: 'archived' },
] as const;

export const ACTIVITY_CATEGORIES = [
  { label: '充值', value: '充值' },
  { label: '打码', value: '打码' },
  { label: '签到', value: '签到' },
  { label: '邀请', value: '邀请' },
  { label: '新人礼金', value: '新人礼金' },
  { label: '红包', value: '红包' },
  { label: '自定义', value: '自定义' },
] as const;

export const ACTIVITY_TYPES = [
  { label: '单笔充值', value: '单笔充值' },
  { label: '累计充值', value: '累计充值' },
  { label: '每日打码', value: '每日打码' },
  { label: '等级达成', value: '等级达成' },
  { label: '每日签到', value: '每日签到' },
  { label: '限时活动', value: '限时活动' },
] as const;

export const ACTIVITY_PLATFORMS = [
  { label: 'APP', value: 'APP' },
  { label: 'H5', value: 'H5' },
  { label: 'iOS', value: 'iOS' },
  { label: 'Android', value: 'Android' },
  { label: 'PC', value: 'PC' },
] as const;

export const CURRENCY_OPTIONS = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
] as const;

export const MEMBER_SCOPE_OPTIONS = [
  { label: '全部会员', value: '全部会员' },
  { label: 'VIP会员', value: 'VIP会员' },
  { label: '新用户', value: '新用户' },
  { label: '老用户', value: '老用户' },
] as const;
