import { requestClient } from '#/api/request';

/**
 * Set player RTP configuration
 */
export interface SetPlayerRtpParams {
  UserID: string;
  Rtp: number;
  GameId: string;
  RemoveRTP?: number;
  BuyRTP?: number;
  PersonWinMaxMult?: number;
  PersonWinMaxScore?: number;
}

export interface SetPlayerRtpResponse {
  code: number;
  error: string;
  data: {
    PidList: number[];
  };
}

export async function setPlayerRtpApi(params: SetPlayerRtpParams): Promise<SetPlayerRtpResponse> {
  return await requestClient.post('/v1/player/setRtp', params);
}

/**
 * Get player RTP history
 */
export interface GetPlayerRtpHistoryParams {
  page: number;
  pageSize: number;
  userId?: number;
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
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
}

export interface GetPlayerRtpHistoryResponse {
  data: PlayerRtpHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getPlayerRtpHistoryApi(params: GetPlayerRtpHistoryParams): Promise<GetPlayerRtpHistoryResponse> {
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
        limit: 10
      }
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
export async function searchGamesWithPagination(query: string, page: number): Promise<GameOption[]> {
  try {
    const response = await requestClient.get('/v1/player/search-games', {
      params: {
        search: query || '',
        page: page,
        limit: 20
      }
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

