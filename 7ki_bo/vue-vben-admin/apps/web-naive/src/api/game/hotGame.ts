export interface HotGameItem {
  id: number;
  platformId: number;
  platform?: {
    gameType: string;
    id: number;
    platformName: string;
  };
  gameId: string;
  gameName: string;
  currency: string;
  tagType: 'hot' | 'recycled'; // 热门/回收标识
  gameCategory: string; // 游戏类型 (电子, 体育, 真人, 彩票, 等)
  platformName: string; // 平台名称
  remark: null | string;
  sortOrder: number;
  operator: string; // 操作人
  createdAt: string;
  updatedAt: string;
  isEnabled: boolean;
}

export interface HotGameListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  platformName?: string; // 平台名称搜索
  gameName?: string; // 游戏名称搜索
  gameCategory?: string; // 游戏类型筛选
  tagType?: 'hot' | 'recycled'; // 热门/回收筛选
  currency?: string; // 币种筛选
  isEnabled?: boolean; // 是否启用筛选
  search?: string; // 关键词搜索 (平台名 + 游戏名)
}

export interface HotGameListResponse {
  list: HotGameItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateHotGameParams {
  platformId: number;
  gameId: string;
  gameName: string;
  currency: string;
  tagType: 'hot' | 'recycled';
  gameCategory: string;
  remark?: string;
  sortOrder?: number;
  isEnabled?: boolean;
}

export interface UpdateHotGameParams {
  gameName?: string;
  currency?: string;
  tagType?: 'hot' | 'recycled';
  gameCategory?: string;
  remark?: string;
  sortOrder?: number;
  isEnabled?: boolean;
}

export interface UpdateHotGameSortParams {
  id: number;
  sortOrder: number;
}

export interface BulkUpdateSortParams {
  updates: UpdateHotGameSortParams[];
}

// Mock data for demonstration
const mockHotGames: HotGameItem[] = [
  {
    id: 1,
    platformId: 1,
    platform: { id: 1, platformName: 'PG电子', gameType: '电子' },
    gameId: 'PG001',
    gameName: '财神到',
    currency: 'BRL',
    tagType: 'hot',
    gameCategory: '电子',
    platformName: 'PG电子',
    remark: '热门推荐游戏',
    sortOrder: 1,
    operator: '7ki',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isEnabled: true,
  },
  {
    id: 2,
    platformId: 2,
    platform: { id: 2, platformName: 'JILI电子', gameType: '电子' },
    gameId: 'JILI002',
    gameName: '黄金鱼',
    currency: 'BRL',
    tagType: 'hot',
    gameCategory: '电子',
    platformName: 'JILI电子',
    remark: '经典捕鱼游戏',
    sortOrder: 2,
    operator: '7ki',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isEnabled: true,
  },
  {
    id: 3,
    platformId: 3,
    platform: { id: 3, platformName: 'Evolution真人', gameType: '真人' },
    gameId: 'EVO003',
    gameName: '百家乐',
    currency: 'BRL',
    tagType: 'recycled',
    gameCategory: '真人',
    platformName: 'Evolution真人',
    remark: '经典真人百家乐',
    sortOrder: 3,
    operator: '7ki',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isEnabled: false,
  },
  {
    id: 4,
    platformId: 4,
    platform: { id: 4, platformName: 'SBO体育', gameType: '体育' },
    gameId: 'SBO004',
    gameName: '足球投注',
    currency: 'BRL',
    tagType: 'hot',
    gameCategory: '体育',
    platformName: 'SBO体育',
    remark: '世界杯热门',
    sortOrder: 4,
    operator: '7ki',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isEnabled: true,
  },
  {
    id: 5,
    platformId: 5,
    platform: { id: 5, platformName: 'TCG彩票', gameType: '彩票' },
    gameId: 'TCG005',
    gameName: '时时彩',
    currency: 'BRL',
    tagType: 'hot',
    gameCategory: '彩票',
    platformName: 'TCG彩票',
    remark: '高频彩票',
    sortOrder: 5,
    operator: '7ki',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isEnabled: true,
  },
];

/**
 * Get hot game list with pagination and filters
 */
export async function getHotGameListApi(
  params: HotGameListParams,
): Promise<HotGameListResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredGames = [...mockHotGames];

  // Apply filters
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredGames = filteredGames.filter(
      (game) =>
        game.gameName.toLowerCase().includes(searchLower) ||
        game.platformName.toLowerCase().includes(searchLower),
    );
  }

  if (params.gameCategory) {
    filteredGames = filteredGames.filter(
      (game) => game.gameCategory === params.gameCategory,
    );
  }

  if (params.tagType) {
    filteredGames = filteredGames.filter(
      (game) => game.tagType === params.tagType,
    );
  }

  if (params.currency) {
    filteredGames = filteredGames.filter(
      (game) => game.currency === params.currency,
    );
  }

  if (params.isEnabled !== undefined) {
    filteredGames = filteredGames.filter(
      (game) => game.isEnabled === params.isEnabled,
    );
  }

  // Apply sorting
  if (params.sortBy) {
    filteredGames.sort((a, b) => {
      const aValue = (a as any)[params.sortBy!];
      const bValue = (b as any)[params.sortBy!];

      if (params.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }

  // Apply pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 100;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedGames = filteredGames.slice(start, end);

  return {
    list: paginatedGames,
    pagination: {
      page,
      pageSize,
      total: filteredGames.length,
      totalPages: Math.ceil(filteredGames.length / pageSize),
    },
  };
}

/**
 * Create a new hot game
 */
export async function createHotGameApi(
  data: CreateHotGameParams,
): Promise<HotGameItem> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newGame: HotGameItem = {
    id: Date.now(),
    platformId: data.platformId,
    platform: {
      id: data.platformId,
      platformName: 'Mock Platform',
      gameType: data.gameCategory,
    },
    gameId: data.gameId,
    gameName: data.gameName,
    currency: data.currency,
    tagType: data.tagType,
    gameCategory: data.gameCategory,
    platformName: 'Mock Platform',
    remark: data.remark || null,
    sortOrder: data.sortOrder || 0,
    operator: '7ki',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEnabled: data.isEnabled === undefined ? true : data.isEnabled,
  };

  mockHotGames.push(newGame);
  return newGame;
}

/**
 * Update hot game
 */
export async function updateHotGameApi(
  id: number,
  data: UpdateHotGameParams,
): Promise<HotGameItem> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockHotGames.findIndex((game) => game.id === id);
  if (index === -1) {
    throw new Error('热门游戏不存在');
  }

  const game = mockHotGames[index];
  const updatedGame: HotGameItem = {
    ...game,
    gameName: data.gameName ?? game.gameName,
    currency: data.currency ?? game.currency,
    tagType: data.tagType ?? game.tagType,
    gameCategory: data.gameCategory ?? game.gameCategory,
    remark: data.remark === undefined ? game.remark : data.remark,
    sortOrder: data.sortOrder ?? game.sortOrder,
    isEnabled: data.isEnabled ?? game.isEnabled,
    updatedAt: new Date().toISOString(),
  };

  mockHotGames[index] = updatedGame;
  return updatedGame;
}

/**
 * Remove hot game
 */
export async function removeHotGameApi(id: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockHotGames.findIndex((game) => game.id === id);
  if (index === -1) {
    throw new Error('热门游戏不存在');
  }

  mockHotGames.splice(index, 1);
}

/**
 * Update hot game sort order
 */
export async function updateHotGameSortApi(
  id: number,
  sortOrder: number,
): Promise<HotGameItem> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockHotGames.findIndex((game) => game.id === id);
  if (index === -1) {
    throw new Error('热门游戏不存在');
  }

  const game = mockHotGames[index];
  if (game) {
    game.sortOrder = sortOrder;
    game.updatedAt = new Date().toISOString();
    return game;
  }

  throw new Error('热门游戏不存在');
}

/**
 * Bulk update hot game sort orders
 */
export async function bulkUpdateHotGameSortApi(
  data: BulkUpdateSortParams,
): Promise<HotGameItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const updatedGames: HotGameItem[] = [];

  for (const update of data.updates) {
    const index = mockHotGames.findIndex((game) => game.id === update.id);
    if (index !== -1) {
      const game = mockHotGames[index];
      if (game) {
        game.sortOrder = update.sortOrder;
        game.updatedAt = new Date().toISOString();
        updatedGames.push(game);
      }
    }
  }

  return updatedGames;
}

/**
 * Toggle hot game enabled status
 */
export async function toggleHotGameEnabledApi(
  id: number,
  isEnabled: boolean,
): Promise<HotGameItem> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockHotGames.findIndex((game) => game.id === id);
  if (index === -1) {
    throw new Error('热门游戏不存在');
  }

  const game = mockHotGames[index];
  if (game) {
    game.isEnabled = isEnabled;
    game.updatedAt = new Date().toISOString();
    return game;
  }

  throw new Error('热门游戏不存在');
}

/**
 * Get game categories for filter options
 */
export async function getGameCategoriesApi(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return ['电子', '真人', '体育', '彩票', '捕鱼', '棋牌'];
}

/**
 * Get available currencies for filter options
 */
export async function getCurrenciesApi(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return ['BRL', 'USD', 'EUR', 'CNY'];
}
