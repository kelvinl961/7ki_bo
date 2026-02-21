import { requestClient } from '#/api/request';

export interface GamePublicConfig {
  // 游戏相关设置
  lobby_return_mode?: 'confirm' | 'direct';
  deposit_requirement?: 'disabled' | 'enabled';
  game_name_display?: 'multi_line' | 'single_line';
  
  // 强制下载APP设置
  force_download_enabled?: boolean;
  download_url?: string;
  
  // WG体育赔率设置
  wg_sports_odds_mode?: 'standard' | 'custom';
  wg_sports_odds_value?: number;
}

/**
 * Get game public configuration
 */
export async function getGamePublicConfig() {
  return requestClient.get<GamePublicConfig>('/game-public-config');
}

/**
 * Update game public configuration
 */
export async function updateGamePublicConfig(config: GamePublicConfig) {
  return requestClient.post<any>('/game-public-config', config);
}










