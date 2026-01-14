import { requestClient } from '#/api/request';

// 🎮 Platform and Game Selection Interfaces
export interface GameItem {
  gameId: string;
  gameName: string;
  gameType?: string;
  isEnabled: boolean;
  isHot1: boolean;
  isHot2: boolean;
  isRecommended: boolean;
  iconUrl?: string;
}

export interface PlatformWithGames {
  platformId: number;
  platformName: string;
  gameType: string;
  isEnabled: boolean;
  isHot: boolean;
  isFeatured: boolean;
  logoUrl?: string;
  subGameCount: number;
  games: GameItem[];
}

export interface PlatformsWithGamesResponse {
  success: boolean;
  data: PlatformWithGames[];
  total: number;
  summary: {
    totalPlatforms: number;
    totalGames: number;
    enabledPlatforms: number;
    featuredPlatforms: number;
  };
}

export interface SelectedGame {
  gameId: string;
  gameName: string;
}

export interface SelectedPlatform {
  platformId: number;
  platformName: string;
  gameSelection: 'all_games' | 'specific_games';
  selectedGames?: SelectedGame[];
}

export interface WageringPlatformConfig {
  selectedPlatforms?: SelectedPlatform[];
  platformIds?: number[]; // Legacy support
}

export interface ValidationResult {
  platformId: number;
  platformName?: string;
  valid: boolean;
  error?: string;
  gameValidations?: Array<{
    gameId: string;
    valid: boolean;
    error?: string;
  }>;
}

export interface ValidationResponse {
  success: boolean;
  allValid: boolean;
  validationResults: ValidationResult[];
  summary: {
    totalPlatforms: number;
    validPlatforms: number;
    invalidPlatforms: number;
  };
}

/**
 * Get all platforms with their games for activity configuration
 */
export async function getPlatformsWithGames(params?: {
  includeDisabled?: boolean;
}): Promise<PlatformsWithGamesResponse> {
  return requestClient.get<PlatformsWithGamesResponse>('/platform-selection/platforms-with-games', {
    params
  });
}

/**
 * Get games for a specific platform (dynamic loading)
 */
export async function getGamesByPlatform(
  platformId: number,
  params?: {
    includeDisabled?: boolean;
    gameType?: string;
    search?: string;
  }
): Promise<{
  success: boolean;
  data: GameItem[];
  total: number;
  platformId: number;
}> {
  return requestClient.get<{
    success: boolean;
    data: GameItem[];
    total: number;
    platformId: number;
  }>(`/platform-selection/platform/${platformId}/games`, {
    params
  });
}

/**
 * Validate platform and game selection for activity configuration
 */
export async function validatePlatformSelection(config: {
  wageringPlatformConfig: WageringPlatformConfig;
}): Promise<ValidationResponse> {
  return requestClient.post<ValidationResponse>('/platform-selection/validate', config);
}
