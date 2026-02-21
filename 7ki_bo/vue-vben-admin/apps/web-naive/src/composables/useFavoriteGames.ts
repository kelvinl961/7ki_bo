import { ref, computed, onMounted, readonly } from 'vue';
import { useMessage } from 'naive-ui';
import {
  getFavoriteGames,
  addGameToFavorites,
  removeGameFromFavorites,
  bulkAddGamesToFavorites,
  bulkRemoveGamesFromFavorites,
  checkGameInFavorites,
  getFavoriteGamesCount,
  type FavoriteGame,
  type FavoriteGameCheckResponse
} from '#/api/favoriteGames';

// State
const favoriteGames = ref<FavoriteGame[]>([]);
const favoriteGameIds = ref<Set<string>>(new Set());
const isLoading = ref(false);
const lastSyncTime = ref<Date | null>(null);
const currentUserId = ref<number>(5); // TODO: Get from auth context

// Message instance
const message = useMessage();

// Computed
const favoriteGamesCount = computed(() => favoriteGames.value.length);
const hasFavorites = computed(() => favoriteGames.value.length > 0);

// Load favorites from backend
const loadFavorites = async () => {
  try {
    isLoading.value = true;
    const response = await getFavoriteGames(currentUserId.value);
    
    if (response && response.success) {
      favoriteGames.value = response.data || [];
      favoriteGameIds.value = new Set((response.data || []).map(game => game.gameId));
      lastSyncTime.value = new Date();
    } else {
      console.warn('API returned unsuccessful response:', response);
      message.error('加载收藏失败');
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    message.error(`加载收藏失败: ${errorMessage}`);
  } finally {
    isLoading.value = false;
  }
};

// Add game to favorites
const addToFavorites = async (gameId: string) => {
  if (favoriteGameIds.value.has(gameId)) {
    message.warning('游戏已在收藏列表中');
    return false;
  }

  try {
    const response = await addGameToFavorites(currentUserId.value, gameId);
    if (response && response.success) {
      if (response.data) {
        favoriteGames.value.unshift(response.data);
      }
      favoriteGameIds.value.add(gameId);
      message.success('游戏已添加到收藏');
      return true;
    } else {
      console.warn('API returned unsuccessful response:', response);
      message.error('添加收藏失败');
      return false;
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    message.error(`添加收藏失败: ${errorMessage}`);
    return false;
  }
};

// Remove game from favorites
const removeFromFavorites = async (gameId: string) => {
  if (!favoriteGameIds.value.has(gameId)) {
    message.warning('游戏不在收藏列表中');
    return false;
  }

  try {
    const response = await removeGameFromFavorites(currentUserId.value, gameId);
    if (response && response.success) {
      favoriteGames.value = favoriteGames.value.filter(game => game.gameId !== gameId);
      favoriteGameIds.value.delete(gameId);
      message.success('游戏已从收藏中移除');
      return true;
    } else {
      console.warn('API returned unsuccessful response:', response);
      message.error('移除收藏失败');
      return false;
    }
  } catch (error) {
    console.error('Error removing from favorites:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    message.error(`移除收藏失败: ${errorMessage}`);
    return false;
  }
};

// Toggle favorite status
const toggleFavorite = async (gameId: string) => {
  if (favoriteGameIds.value.has(gameId)) {
    return await removeFromFavorites(gameId);
  } else {
    return await addToFavorites(gameId);
  }
};

// Check if game is in favorites
const isFavorite = (gameId: string): boolean => {
  return favoriteGameIds.value.has(gameId);
};

// Bulk operations
const bulkAddToFavorites = async (gameIds: string[]) => {
  try {
    const response = await bulkAddGamesToFavorites(currentUserId.value, gameIds);
    if (response && response.success) {
      // Reload favorites to get updated list
      await loadFavorites();
      message.success(response.message || '批量添加成功');
      return true;
    } else {
      console.warn('API returned unsuccessful response:', response);
      message.error('批量添加收藏失败');
      return false;
    }
  } catch (error) {
    console.error('Error bulk adding to favorites:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    message.error(`批量添加收藏失败: ${errorMessage}`);
    return false;
  }
};

const bulkRemoveFromFavorites = async (gameIds: string[]) => {
  try {
    const response = await bulkRemoveGamesFromFavorites(currentUserId.value, gameIds);
    if (response && response.success) {
      // Reload favorites to get updated list
      await loadFavorites();
      message.success(response.message || '批量移除成功');
      return true;
    } else {
      console.warn('API returned unsuccessful response:', response);
      message.error('批量移除收藏失败');
      return false;
    }
  } catch (error) {
    console.error('Error bulk removing from favorites:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    message.error(`批量移除收藏失败: ${errorMessage}`);
    return false;
  }
};

// Initialize
onMounted(() => {
  loadFavorites();
});

// Export composable
export function useFavoriteGames() {
  return {
    // State
    favoriteGames: readonly(favoriteGames),
    favoriteGameIds: readonly(favoriteGameIds),
    isLoading: readonly(isLoading),
    lastSyncTime: readonly(lastSyncTime),
    
    // Computed
    favoriteGamesCount,
    hasFavorites,
    
    // Methods
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    bulkAddToFavorites,
    bulkRemoveFromFavorites
  };
} 