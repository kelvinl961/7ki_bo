import { requestClient } from '#/api/request';

/**
 * Set player RTP configuration
 */
export interface SetPlayerRtpParams {
  userAccount?: string;
  UserID?: string;
  Rtp: number;
  GameId: string;
  rtpVendor?: string;
  /** HG /api/v1/player/setRtp — RTP 类型 1–5 */
  gamePattern?: number;
  /** HG — 游戏类型 0–4（与商户 V2 一致，厂商支持时生效） */
  gameType?: number;
  RemoveRTP?: number;
  BuyRTP?: number;
  PersonWinMaxMult?: number;
  PersonWinMaxScore?: number;
  /** HG — person_win_max_rtp，默认由后端填 1000 */
  PersonWinMaxRtp?: number;
}

export interface PlayerRtpVendorOption {
  id: string;
  label: string;
}

export async function getPlayerRtpVendorsApi(): Promise<PlayerRtpVendorOption[]> {
  const res = await requestClient.get<PlayerRtpVendorOption[]>(
    '/v1/player/rtp-vendors',
  );
  return Array.isArray(res) ? res : [];
}

export interface SetPlayerRtpResponse {
  code: number;
  error: string;
  data: {
    PidList: number[];
  };
}

export async function setPlayerRtpApi(
  params: SetPlayerRtpParams,
): Promise<SetPlayerRtpResponse> {
  return await requestClient.post('/v1/player/setRtp', params);
}

/** HG 取消个人 RTP — 对应厂商 POST /api/v2/player/cancelRtp（AG 仍用 setRtp + Rtp=0） */
export interface CancelHgPlayerRtpParams {
  userids: string | string[];
  gameid: string | string[];
}

export async function cancelHgPlayerRtpApi(
  params: CancelHgPlayerRtpParams,
): Promise<SetPlayerRtpResponse> {
  return await requestClient.post('/v2/player/cancelRtp', params);
}

/**
 * Get player RTP history
 */
export interface GetPlayerRtpHistoryParams {
  page: number;
  pageSize: number;
  userId?: number;
  userAccount?: string;
}

export interface PlayerRtpHistoryItem {
  id: number;
  userIds: string;
  rtp: number;
  gameId: string;
  removeRtp?: number;
  buyRtp?: number;
  personWinMaxMult?: number;
  personWinMaxScore?: number;
  operator?: string;
  status: 'failed' | 'pending' | 'success';
  createdAt: string;
}

export interface GetPlayerRtpHistoryResponse {
  data: PlayerRtpHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getPlayerRtpHistoryApi(
  params: GetPlayerRtpHistoryParams,
): Promise<GetPlayerRtpHistoryResponse> {
  return await requestClient.get('/v1/player/rtp-history', { params });
}

/**
 * Search games for RTP control
 */
export interface GameOption {
  id: number;
  gameId: string;
  gameName: string;
  gameType?: string;
  platformName?: string;
}

export async function searchGamesApi(query: string): Promise<GameOption[]> {
  try {
    const response = await requestClient.get('/v1/player/search-games', {
      params: {
        search: query || '',
        limit: 10,
      },
    });

    console.log('🎮 searchGamesApi response:', response);

    // Handle different response formats
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else if (response && response.data) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('❌ searchGamesApi error:', error);
    return [];
  }
}

/**
 * Search games with pagination
 */
export async function searchGamesWithPagination(
  query: string,
  page: number,
): Promise<GameOption[]> {
  try {
    const response = await requestClient.get('/v1/player/search-games', {
      params: {
        search: query || '',
        page,
        limit: 20,
      },
    });

    // Handle different response formats
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else if (response && response.data) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('❌ searchGamesWithPagination error:', error);
    return [];
  }
}

// =============================
// Conditional RTP config (demo)
// =============================
export type ConditionalPlayerDepositConditionType = 'NO_DEPOSIT' | 'GTE_AMOUNT';

export interface ConditionalPlayerRtpRuleConditions {
  registrationDaysMax?: number;
  depositCondition: ConditionalPlayerDepositConditionType;
  depositMinAmount?: number;
}

export interface ConditionalPlayerRtpRuleResult {
  rtp: number;
  games: string[];
  /** AG | HG — drives auto-apply transport when set (first vendor; use with applyVendors). */
  rtpVendor?: 'AG' | 'HG';
  /** 1–2 vendors: auto-apply hits each (AG setRtp / HG setRtp or cancelRtp). */
  applyVendors?: ('AG' | 'HG')[];
  /**
   * HG only: `cancelRtp` → auto-apply calls vendor /api/v2/player/cancelRtp（无需手动 BO）.
   * Omit or `setRtp` → HG /api/v1/player/setRtp。
   */
  hgPlayerAction?: 'setRtp' | 'cancelRtp';
  /** HG: 1–5 RTP 波动类型 */
  gamePattern?: number;
  /** HG: 0 拉霸/电子 1 Mini 2 视讯 3 捕鱼 4 彩票 */
  gameType?: number;
  /** 单局个人赢取最高倍数；空则后端/厂商默认 100 */
  maxMultiple?: number;
  /** 单局个人赢取最高钱数；空则默认 1000000 */
  maxWinPoints?: number;
}

export interface ConditionalPlayerRtpRule {
  id: string;
  enabled: boolean;
  priority: number;
  conditions: ConditionalPlayerRtpRuleConditions;
  result: ConditionalPlayerRtpRuleResult;
}

export interface ConditionalPlayerRtpConfigPayload {
  demoType: 'conditional_player_rtp';
  priority: 'first-match-wins';
  rules: ConditionalPlayerRtpRule[];
}

export interface ConditionalPlayerRtpConfigResponse {
  code: number;
  error: string;
  data: {
    demoType: 'conditional_player_rtp';
    priority: 'first-match-wins';
    rules: ConditionalPlayerRtpRule[];
  };
}

export async function setConditionalPlayerRtpConfigApi(
  params: ConditionalPlayerRtpConfigPayload,
): Promise<ConditionalPlayerRtpConfigResponse> {
  return await requestClient.post('/v1/player/conditional-rtp-config', params);
}

export async function getConditionalPlayerRtpConfigApi(): Promise<ConditionalPlayerRtpConfigResponse> {
  return await requestClient.get('/v1/player/conditional-rtp-config');
}

export async function clearConditionalPlayerRtpConfigApi(): Promise<ConditionalPlayerRtpConfigResponse> {
  return await requestClient.delete('/v1/player/conditional-rtp-config');
}
