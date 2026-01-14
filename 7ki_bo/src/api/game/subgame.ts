import { requestClient } from '#/api/request';

export interface GameItem {
  id: number | string; // Allow both for third-party games
  platformId: number | null;
  platform?: {
    id: number | null;
    platformName: string;
    gameType: string;
  };
  gameId: string;
  gameDisplayId?: string; // Display ID for games
  gameName: string;
  gameNameEn?: string; // English name for imported games
  gameType?: string; // Game type for imported games
  gameTypeEnum?: 'VIDEO' | 'LIVE' | 'SLOT' | 'LOTTERY' | 'SPORTS' | 'ESPORTS' | 'HUNTING' | 'CHESS_CARDS' | 'TABLE' | 'ARCADE' | 'SIMULATION' | 'COCKFIGHT' | 'OTHER';
  currency: string;
  isHot1: boolean;
  isHot2: boolean;
  isRecommended: boolean;
  isEnabled: boolean;
  isUnderMaintenance: boolean;
  showToStreamer: boolean;
  iconUrl: string | null;
  brandLogoUrl: string | null;
  remark: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  thirdPartyData?: { vendor?: string } | null; // Vendor information from thirdPartyData
  isThirdParty?: boolean; // Flag for third-party games
  source?: 'LOCAL' | 'THIRD_PARTY'; // Track game origin
  thirdPartyId?: string; // Original third-party game ID
  lastSyncedAt?: string; // When it was last synced
}

export interface GameListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  platformId?: number;
  vendor?: string;
  currency?: string;
  isEnabled?: boolean;
  isHot1?: boolean;
  isHot2?: boolean;
  isRecommended?: boolean;
  search?: string;
}

export interface GameListResponse {
  list: GameItem[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateGameParams {
  platformId: number;
  gameId: string;
  gameDisplayId?: string;
  gameName: string;
  vendor: string;
  gameNameEn?: string;
  gameType?: string;
  gameTypeEnum?: 'VIDEO' | 'LIVE' | 'SLOT' | 'LOTTERY' | 'SPORTS' | 'ESPORTS' | 'HUNTING' | 'CHESS_CARDS' | 'TABLE' | 'ARCADE' | 'SIMULATION' | 'COCKFIGHT' | 'OTHER';
  currency?: string;
  isHot1?: boolean;
  isHot2?: boolean;
  isRecommended?: boolean;
  isEnabled?: boolean;
  isUnderMaintenance?: boolean;
  showToStreamer?: boolean;
  iconUrl?: string;
  brandLogoUrl?: string;
  remark?: string;
  sortOrder?: number;
}

export interface UpdateGameParams {
  gameDisplayId?: string;
  gameName?: string;
  gameNameEn?: string;
  gameType?: string;
  gameTypeEnum?: 'VIDEO' | 'LIVE' | 'SLOT' | 'LOTTERY' | 'SPORTS' | 'ESPORTS' | 'HUNTING' | 'CHESS_CARDS' | 'TABLE' | 'ARCADE' | 'SIMULATION' | 'COCKFIGHT' | 'OTHER';
  currency?: string;
  isHot1?: boolean;
  isHot2?: boolean;
  isRecommended?: boolean;
  isEnabled?: boolean;
  isUnderMaintenance?: boolean;
  showToStreamer?: boolean;
  iconUrl?: string;
  brandLogoUrl?: string;
  remark?: string;
  sortOrder?: number;
}

export interface ToggleGameParams {
  field: 'isHot1' | 'isHot2' | 'isRecommended' | 'isEnabled' | 'isUnderMaintenance' | 'showToStreamer';
  value: boolean;
}

export interface ImportGameParams {
  thirdPartyId: string;
  gameName: string;
  iconUrl?: string;
  platformId: number;
  currency?: string;
}

export interface BulkImportGameParams {
  games: ImportGameParams[];
  platformId: number;
}

export interface ImportResult {
  thirdPartyId: string;
  status: 'success' | 'skipped' | 'error';
  message: string;
  gameId?: number;
}

export interface BulkImportResponse {
  results: ImportResult[];
  summary: {
    total: number;
    success: number;
    skipped: number;
    error: number;
  };
}

// New interfaces for file import
export interface ImportGameData {
  no?: number;
  gameNameCn: string;
  gameNameEn: string;
  gameType: string;
  gameId: string;
  iconUrl?: string;
  platformId?: number;
  currency?: string;
  isEnabled?: boolean;
  sortOrder?: number;
  remark?: string;
}

export interface FileImportParams {
  games: ImportGameData[];
  platformId: number;
  currency?: string;
}

export interface FileImportResult {
  row: number;
  gameId: string;
  gameNameCn: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  id?: number;
}

export interface FileImportResponse {
  results: FileImportResult[];
  summary: {
    total: number;
    success: number;
    error: number;
    skipped: number;
  };
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

export interface ImportPreviewData {
  games: ImportGameData[];
  errors: ImportValidationError[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

/**
 * Get game list
 */
export async function getGameListApi(params: GameListParams) {
  return requestClient.get<GameListResponse>('/games', {
    params,
  });
}

/**
 * Create new game
 */
export async function createGameApi(data: CreateGameParams) {
  return requestClient.post<GameItem>('/games', data);
}

/**
 * Update game
 */
export async function updateGameApi(id: number, data: UpdateGameParams) {
  return requestClient.put<GameItem>(`/games/${id}`, data);
}

/**
 * Delete game
 */
export async function deleteGameApi(id: number) {
  return requestClient.delete(`/games/${id}`);
}

/**
 * Get game by ID
 */
export async function getGameByIdApi(id: number) {
  return requestClient.get<GameItem>(`/games/${id}`);
}

/**
 * Toggle game status/settings
 */
export async function toggleGameApi(id: number, data: ToggleGameParams) {
    return requestClient.put<GameItem>(`/games/${id}/toggle`, data);
}

/**
 * Set game to top
 */
export async function setGameTopApi(id: number) {
    return requestClient.put<GameItem>(`/games/${id}/top`, {});
}

/**
 * Update game remark
 */
export async function updateGameRemarkApi(id: number, remark: string) {
    return requestClient.put<GameItem>(`/games/${id}/remark`, { remark });
}

/**
 * Bulk delete games
 */
export async function bulkDeleteGamesApi(ids: number[]) {
  return requestClient.delete('/games/bulk-delete', { data: { ids } });
}

/**
 * Upload game icon
 */
export async function uploadGameIconApi(gameId: number, file: File) {
  const formData = new FormData();
  formData.append('icon', file);
  
  return requestClient.post(`/games/${gameId}/upload-icon`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Upload game brand logo
 */
export async function uploadGameBrandLogoApi(gameId: number, file: File) {
  const formData = new FormData();
  formData.append('brandLogo', file);
  
  return requestClient.post(`/games/${gameId}/upload-brand-logo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Upload both game icon and brand logo
 */
export async function uploadGameImagesApi(gameId: number, iconFile?: File, brandLogoFile?: File) {
  const formData = new FormData();
  
  if (iconFile) {
    formData.append('icon', iconFile);
  }
  
  if (brandLogoFile) {
    formData.append('brandLogo', brandLogoFile);
  }
  
  return requestClient.post(`/games/${gameId}/upload-images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Import a single third-party game
 */
export async function importThirdPartyGameApi(data: ImportGameParams) {
  return requestClient.post<GameItem>('/games/import', data);
}

/**
 * Bulk import multiple third-party games
 */
export async function bulkImportThirdPartyGamesApi(data: BulkImportGameParams) {
  return requestClient.post<BulkImportResponse>('/games/bulk-import', data);
}

/**
 * Sync imported third-party game with latest API data
 */
export async function syncThirdPartyGameApi(gameId: number) {
  return requestClient.post<GameItem>(`/games/${gameId}/sync`);
}

/**
 * Parse and validate imported file
 */
export async function parseImportFileApi(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  return requestClient.post<ImportPreviewData>('/games/parse-import-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Import games from file
 */
export async function importGamesFromFileApi(data: FileImportParams) {
  return requestClient.post<FileImportResponse>('/games/import-from-file', data, {
    timeout: 0, // No timeout for large file imports
  });
}

/**
 * Download import template
 */
export async function downloadImportTemplateApi() {
  return requestClient.get('/games/import-template', {
    responseType: 'blob',
  });
} 