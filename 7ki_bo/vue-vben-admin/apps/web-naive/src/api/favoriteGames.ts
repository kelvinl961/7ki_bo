import { requestClient } from '#/api/request';

// Types
export interface FavoriteGame {
  id: number;
  gameId: string;
  gameName: string;
  gameNameEn?: string;
  gameType?: string;
  platformId: number;
  platformName: string;
  platformGameType: string;
  iconUrl?: string;
  brandLogoUrl?: string;
  isEnabled: boolean;
  isUnderMaintenance: boolean;
  addedAt: string;
}

export interface FavoriteGameResponse {
  success: boolean;
  data: FavoriteGame[];
  total: number;
}

export interface FavoriteGameSingleResponse {
  success: boolean;
  data: FavoriteGame;
  message?: string;
}

export interface FavoriteGameCheckResponse {
  success: boolean;
  data: {
    favoriteId: null | number;
    isFavorite: boolean;
  };
}

export interface FavoriteGameCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface BulkFavoriteResponse {
  success: boolean;
  data: {
    added?: number;
    removed?: number;
    total: number;
  };
  message: string;
}

// API Functions

/**
 * Get user's favorite games
 */
export function getFavoriteGames(userId: number) {
  return requestClient.get<FavoriteGameResponse>(`/favorite-games/${userId}`);
}

/**
 * Add a game to favorites
 */
export function addGameToFavorites(userId: number, gameId: string) {
  return requestClient.post<FavoriteGameSingleResponse>(
    `/favorite-games/${userId}`,
    {
      gameId,
    },
  );
}

/**
 * Remove a game from favorites
 */
export function removeGameFromFavorites(userId: number, gameId: string) {
  return requestClient.delete<{ message: string; success: boolean }>(
    `/favorite-games/${userId}/${gameId}`,
  );
}

/**
 * Bulk add games to favorites
 */
export function bulkAddGamesToFavorites(userId: number, gameIds: string[]) {
  return requestClient.post<BulkFavoriteResponse>(
    `/favorite-games/${userId}/bulk`,
    {
      gameIds,
    },
  );
}

/**
 * Bulk remove games from favorites
 */
export function bulkRemoveGamesFromFavorites(
  userId: number,
  gameIds: string[],
) {
  return requestClient.delete<BulkFavoriteResponse>(
    `/favorite-games/${userId}/bulk`,
    {
      data: { gameIds },
    },
  );
}

/**
 * Check if a game is in favorites
 */
export function checkGameInFavorites(userId: number, gameId: string) {
  return requestClient.get<FavoriteGameCheckResponse>(
    `/favorite-games/${userId}/check/${gameId}`,
  );
}

/**
 * Get user's favorite games count
 */
export function getFavoriteGamesCount(userId: number) {
  return requestClient.get<FavoriteGameCountResponse>(
    `/favorite-games/${userId}/count`,
  );
}
