import { requestClient } from './request';

export interface RewardHistoryParams {
  startDate?: string;
  endDate?: string;
  orderNo?: string;
  userId?: string;
  memberAccount?: string;
  benefitSource?: string[];
  activityName?: string;
  collectionMethod?: string;
  rewardType?: string[];
  page?: number;
  pageSize?: number;
}

/** 优惠明细单条记录 - 与接口返回字段一致 */
export interface RewardHistoryItem {
  acquisitionTime?: string;
  benefitName?: string;
  memberCurrency?: string;
  memberId?: number;
  memberAccount?: string;
  benefitSource?: string;
  sourceType?: string;
  collectionMethod?: string;
  rewardType?: string;
  grantedReward?: number;
  id?: string;
  orderNo?: string;
  createdAt?: string;
}

export interface RewardHistoryListResponse {
  success?: boolean;
  data?: RewardHistoryItem[];
  list?: RewardHistoryItem[];
  total?: number;
  message?: string;
}

/**
 * GET /api/admin/reward-history - 分页列表
 * 同时传 camelCase 与 snake_case，兼容不同后端
 */
export async function getRewardHistory(
  params: RewardHistoryParams,
): Promise<RewardHistoryListResponse> {
  const query: Record<string, unknown> = {
    ...params,
    start_date: params.startDate,
    end_date: params.endDate,
    order_no: params.orderNo,
    user_id: params.userId,
    member_account: params.memberAccount,
    activity_name: params.activityName,
    collection_method: params.collectionMethod,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    page_size: params.pageSize ?? 20,
  };
  if (params.benefitSource?.length) query.benefit_source = params.benefitSource;
  if (params.rewardType?.length) query.reward_type = params.rewardType;
  const response = await requestClient.get('/admin/reward-history', { params: query });
  return response as RewardHistoryListResponse;
}

/**
 * GET /api/admin/reward-history/:orderNo - 单条详情
 */
export async function getRewardHistoryByOrderNo(
  orderNo: string,
): Promise<RewardHistoryItem | RewardHistoryListResponse> {
  return requestClient.get(`/admin/reward-history/${encodeURIComponent(orderNo)}`);
}
