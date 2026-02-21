import { requestClient } from '#/api/request';
import { requestQueue, REQUEST_PRIORITY } from '#/api/request-queue';

export interface GamePlatformItem {
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
  imageUrl: string | null;
  logoUrl: string | null;
  remark: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface GamePlatformListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  gameType?: string;
  currency?: string;
  isEnabled?: boolean;
  search?: string;
}

export interface GamePlatformListResponse {
  list: GamePlatformItem[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
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
  minEntryAmount?: number;
  imageUrl?: string;
  logoUrl?: string;
  remark?: string;
  sortOrder?: number;
}

export interface UpdateGamePlatformParams {
  platformName?: string;
  gameType?: string;
  currency?: string;
  isHot?: boolean;
  isFeatured?: boolean;
  showToStreamer?: boolean;
  isEnabled?: boolean;
  streamerVisible?: boolean;
  minEntryAmount?: number;
  imageUrl?: string;
  logoUrl?: string;
  remark?: string;
  sortOrder?: number;
}

export interface TogglePlatformParams {
  field: 'isHot' | 'isFeatured' | 'isEnabled' | 'showToStreamer' | 'streamerVisible';
  value: boolean;
}

/**
 * Get game platform list
 * ✅ PERFORMANCE: Uses request queue to prevent connection limit exhaustion
 */
export async function getGamePlatformListApi(params: GamePlatformListParams) {
  // Use request queue for non-critical requests to prevent queueing delays
  const priority = params.page === 1 && params.pageSize === 20 
    ? REQUEST_PRIORITY.HIGH  // Main table data = high priority
    : REQUEST_PRIORITY.NORMAL; // Other requests = normal priority
  
  return requestQueue.enqueue(
    () => requestClient.get<GamePlatformListResponse>('/game-platforms', { params }),
    priority,
    `game-platforms-${JSON.stringify(params)}` // Deduplicate identical requests
  );
}

/**
 * Create new game platform
 */
export async function createGamePlatformApi(data: CreateGamePlatformParams) {
  return requestClient.post<GamePlatformItem>('/game-platforms', data);
}

/**
 * Update game platform
 */
export async function updateGamePlatformApi(id: number, data: UpdateGamePlatformParams) {
  return requestClient.put<GamePlatformItem>(`/game-platforms/${id}`, data);
}

/**
 * Delete game platform
 */
export async function deleteGamePlatformApi(id: number) {
  return requestClient.delete(`/game-platforms/${id}`);
}

/**
 * Get game platform by ID
 */
export async function getGamePlatformByIdApi(id: number) {
  return requestClient.get<GamePlatformItem>(`/game-platforms/${id}`);
}

/**
 * Toggle platform status/settings
 */
export async function toggleGamePlatformApi(id: number, data: TogglePlatformParams) {
   //@ts-ignore
    return requestClient.put<GamePlatformItem>(`/game-platforms/${id}/toggle`, data);
}

/**
 * Set platform to top
 */
export async function setGamePlatformTopApi(id: number) {
  //@ts-ignore
    return requestClient.put<GamePlatformItem>(`/game-platforms/${id}/top`);
}

/**
 * Update platform remark
 */
export async function updateGamePlatformRemarkApi(id: number, remark: string) {
   //@ts-ignore
    return requestClient.put<GamePlatformItem>(`/game-platforms/${id}/remark`, { remark });
}

/**
 * Bulk delete platforms
 */
export async function bulkDeleteGamePlatformsApi(ids: number[]) {
  return requestClient.delete('/game-platforms/bulk', { data: { ids } });
}

/**
 * Upload platform image
 */
export async function uploadPlatformImageApi(platformId: number, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  
  return requestClient.post(`/game-platforms/${platformId}/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
} 