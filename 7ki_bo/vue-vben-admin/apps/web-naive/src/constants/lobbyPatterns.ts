/**
 * 大厅底纹（COS 静态资源）
 */
export const LOBBY_BLACK_PATTERN_CDN_BASE =
  'https://my-media-bucket-sp-1353364131.cos.sa-saopaulo.myqcloud.com/media/background/black/';

/** `bg_pattern_tile_0_1.avif` … `bg_pattern_tile_0_116.avif`（白色底纹） */
export const LOBBY_WHITE_PATTERN_CDN_BASE =
  'https://my-media-bucket-sp-1353364131.cos.sa-saopaulo.myqcloud.com/media/background/white/';

export function lobbyBlackPatternFileUrl(filename: string): string {
  return `${LOBBY_BLACK_PATTERN_CDN_BASE}${filename}`;
}

/** `bg_pattern_black_1.avif` … `bg_pattern_black_39.avif` */
export function blackLobbyPatternUrl(index: number): string {
  return lobbyBlackPatternFileUrl(`bg_pattern_black_${index}.avif`);
}

export function lobbyWhitePatternFileUrl(filename: string): string {
  return `${LOBBY_WHITE_PATTERN_CDN_BASE}${filename}`;
}

export function whiteLobbyPatternUrl(index: number): string {
  return lobbyWhitePatternFileUrl(`bg_pattern_tile_0_${index}.avif`);
}

export const LOBBY_ROLEX_GREEN_TILE_URL = lobbyBlackPatternFileUrl(
  'bg_rolex_green_pattern_tile.avif',
);

export type LobbyPatternTile = {
  /** 空字符串表示无底纹 */
  url: string;
  /** 可选：无障碍 / tooltip */
  title?: string;
};

/** 深色底纹选项：无底纹 + 39 张黑底纹 + Rolex 绿纹平铺 */
export const LOBBY_BLACK_PATTERN_TILES: LobbyPatternTile[] = [
  { url: '', title: '无底纹' },
  ...Array.from({ length: 39 }, (_, i) => ({
    url: blackLobbyPatternUrl(i + 1),
    title: `bg_pattern_black_${i + 1}.avif`,
  })),
  { url: LOBBY_ROLEX_GREEN_TILE_URL, title: 'bg_rolex_green_pattern_tile.avif' },
];

/** 白色底纹：无底纹 + 116 张 `bg_pattern_tile_0_*.avif` */
export const LOBBY_WHITE_PATTERN_TILES: LobbyPatternTile[] = [
  { url: '', title: '无底纹' },
  ...Array.from({ length: 116 }, (_, i) => ({
    url: whiteLobbyPatternUrl(i + 1),
    title: `bg_pattern_tile_0_${i + 1}.avif`,
  })),
];

/** 根据已保存的 URL 推断底纹 tab（避免白底纹 URL 仍落在「深色」tab） */
export function inferLobbyPatternTabFromUrl(
  url: string | null | undefined,
): 'light' | 'dark' | null {
  const u = url?.trim();
  if (!u) return null;
  if (u.includes('/media/background/white/')) return 'light';
  if (u.includes('/media/background/black/')) return 'dark';
  return null;
}

/** 从旧数据（lobbyPatternId）或新字段（lobbyPatternUrl）还原选中的 URL */
export function resolveLobbyPatternUrlFromRecord(row: {
  lobbyPatternUrl?: string | null;
  lobbyPatternId?: string | null;
}): string {
  const direct = row.lobbyPatternUrl?.trim();
  if (direct) return direct;
  const id = row.lobbyPatternId?.trim();
  if (!id || id === 'none') return '';
  const dark = /^dark_(\d+)$/.exec(id);
  if (dark) {
    const n = Number.parseInt(dark[1], 10);
    if (n >= 1 && n <= 39) return blackLobbyPatternUrl(n);
  }
  if (id === 'rolex_green_tile' || id.includes('rolex')) {
    return LOBBY_ROLEX_GREEN_TILE_URL;
  }
  const light = /^light_(\d+)$/.exec(id);
  if (light) {
    const n = Number.parseInt(light[1]!, 10);
    if (n >= 1 && n <= 116) return whiteLobbyPatternUrl(n);
  }
  return '';
}
