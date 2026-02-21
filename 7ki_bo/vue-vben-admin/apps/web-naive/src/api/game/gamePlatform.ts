import { requestClient } from '#/api/request';

export interface GamePlatformRecord {
  id: number;
  platformId: string;
  platformName: string;
  gameType: string;
  currency: string;
  isHot: boolean;
  isFeatured: boolean;
  showToStreamer: boolean;
  isEnabled: boolean;
  streamerVisible: boolean;
  subGameCount: number;
  minEntryAmount: number;
  imageUrl?: string;
  iosJumpType: string;
  androidJumpType: string;
  sortOrder: number;
  creator?: {
    id: number;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GamePlatformListParams {
  page?: number;
  pageSize?: number;
  gameType?: string;
  platformName?: string;
  streamerVisible?: string;
  isEnabled?: string;
}

export interface GamePlatformListResponse {
  list: GamePlatformRecord[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}

export interface CreateGamePlatformParams {
  platformId: string;
  platformName: string;
  gameType: string;
  currency?: string;
  isHot?: boolean;
  isFeatured?: boolean;
  showToStreamer?: boolean;
  isEnabled?: boolean;
  streamerVisible?: boolean;
  subGameCount?: number;
  minEntryAmount?: number;
  imageUrl?: string;
  iosJumpType?: string;
  androidJumpType?: string;
  sortOrder?: number;
}

export interface UpdateGamePlatformParams extends CreateGamePlatformParams {
  id: number;
}

export interface ToggleGamePlatformParams {
  field:
    | 'isEnabled'
    | 'isFeatured'
    | 'isHot'
    | 'showToStreamer'
    | 'streamerVisible';
  value: boolean;
}

/**
 * Get game platforms list with pagination and filters
 */
export async function getGamePlatformList(
  params?: GamePlatformListParams,
): Promise<GamePlatformListResponse> {
  return requestClient.get('/game-platforms', {
    params,
  });
}

/**
 * Get game platform by ID
 */
export async function getGamePlatformById(
  id: number,
): Promise<GamePlatformRecord> {
  return requestClient.get(`/game-platforms/${id}`);
}

/**
 * Create new game platform
 */
export async function createGamePlatform(
  data: CreateGamePlatformParams,
): Promise<GamePlatformRecord> {
  return requestClient.post('/game-platforms', data);
}

/**
 * Update game platform
 */
export async function updateGamePlatform(
  data: UpdateGamePlatformParams,
): Promise<GamePlatformRecord> {
  const { id, ...updateData } = data;
  return requestClient.put(`/game-platforms/${id}`, updateData);
}

/**
 * Toggle game platform status (hot, featured, enabled, etc.)
 */
export async function toggleGamePlatformStatus(
  id: number,
  data: ToggleGamePlatformParams,
): Promise<GamePlatformRecord> {
  // @ts-ignore
  return requestClient.patch(`/game-platforms/${id}/toggle`, data);
}

/**
 * Set game platform to top position
 */

export async function setGamePlatformTop(
  id: number,
): Promise<GamePlatformRecord> {
  // @ts-ignore
  return requestClient.patch(`/game-platforms/${id}/top`);
}

/**
 * Delete game platform
 */
export async function deleteGamePlatform(id: number): Promise<void> {
  return requestClient.delete(`/game-platforms/${id}`);
}

/**
 * Bulk delete game platforms
 */
export async function bulkDeleteGamePlatformsApi(ids: number[]): Promise<void> {
  return requestClient.delete('/game-platforms/bulk-delete', { data: { ids } });
}

/**
 * Get only enabled game platforms for frontend landing page
 * This API returns only platforms where isEnabled = true
 */
export async function getEnabledGamePlatforms(): Promise<GamePlatformRecord[]> {
  return requestClient.get('/game-platforms/enabled');
}
