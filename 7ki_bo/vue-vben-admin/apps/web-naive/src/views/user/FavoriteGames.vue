<template>
  <div class="favorite-games-page">
    <n-card title="我的收藏游戏" class="mb-4">
      <template #header-extra>
        <n-space>
          <n-tag :bordered="false" type="info">
            共 {{ favoriteGamesCount }} 个收藏
          </n-tag>
          <n-tag :bordered="false" :type="isOnline ? 'success' : 'warning'">
            {{ isOnline ? '在线' : '离线' }}
          </n-tag>
        </n-space>
      </template>

      <!-- Search and Actions -->
      <div class="mb-4">
        <n-space justify="space-between" align="center">
          <n-input
            v-model:value="searchKeyword"
            placeholder="搜索游戏名称..."
            style="width: 300px"
            clearable
          >
            <template #prefix>
              <n-icon><SearchOutline /></n-icon>
            </template>
          </n-input>

          <n-space>
            <n-button
              :disabled="selectedGames.length === 0"
              @click="handleBulkRemove"
            >
              批量移除 ({{ selectedGames.length }})
            </n-button>
            <n-button
              :disabled="favoriteGames.length === 0"
              @click="handleRefresh"
            >
              刷新
            </n-button>
          </n-space>
        </n-space>
      </div>

      <!-- Games Grid -->
      <n-grid :cols="24" :x-gap="16" :y-gap="16">
        <n-grid-item v-for="game in filteredGames" :key="game.id" :span="6">
          <n-card
            :class="{
              'favorite-game-card': true,
              selected: selectedGames.includes(game.gameId),
            }"
            hoverable
            @click="toggleSelection(game.gameId)"
          >
            <template #cover>
              <div class="game-image-container">
                <n-image
                  :src="game.iconUrl || '/uploads/games/default.png'"
                  :alt="game.gameName"
                  width="100%"
                  height="120"
                  object-fit="cover"
                  fallback-src="/uploads/games/default.png"
                />
                <div class="game-overlay">
                  <n-checkbox
                    :checked="selectedGames.includes(game.gameId)"
                    @update:checked="
                      (checked) => handleSelectionChange(game.gameId, checked)
                    "
                  />
                </div>
              </div>
            </template>

            <template #header>
              <div class="game-header">
                <n-text strong>{{ game.gameName }}</n-text>
                <n-button
                  size="small"
                  type="error"
                  ghost
                  @click.stop="handleRemoveFavorite(game.gameId)"
                >
                  移除
                </n-button>
              </div>
            </template>

            <div class="game-info">
              <n-space vertical size="small">
                <n-text depth="3" size="small">
                  {{ game.platformName }}
                </n-text>
                <n-text depth="3" size="small">
                  收藏时间: {{ formatDate(game.addedAt) }}
                </n-text>
                <n-tag
                  :type="game.isEnabled ? 'success' : 'error'"
                  size="small"
                >
                  {{ game.isEnabled ? '可用' : '维护中' }}
                </n-tag>
              </n-space>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- Empty State -->
      <n-empty
        v-if="filteredGames.length === 0 && !isLoading"
        description="暂无收藏游戏"
      >
        <template #extra>
          <n-button type="primary" @click="handleRefresh"> 刷新 </n-button>
        </template>
      </n-empty>

      <!-- Loading State -->
      <n-spin v-if="isLoading" size="large" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import { SearchOutline } from '@vicons/ionicons5';
import { useFavoriteGames } from '#/composables/useFavoriteGames';
import type { FavoriteGame } from '#/api/favoriteGames';

// Composables
const message = useMessage();
const dialog = useDialog();
const {
  favoriteGames,
  favoriteGamesCount,
  isLoading,
  isOnline,
  loadFavorites,
  removeFromFavorites,
  bulkRemoveFromFavorites,
} = useFavoriteGames();

// State
const searchKeyword = ref('');
const selectedGames = ref<number[]>([]);

// Computed
const filteredGames = computed(() => {
  if (!searchKeyword.value) {
    return favoriteGames.value;
  }

  return favoriteGames.value.filter(
    (game) =>
      game.gameName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      game.platformName
        .toLowerCase()
        .includes(searchKeyword.value.toLowerCase()),
  );
});

// Methods
const handleRefresh = async () => {
  await loadFavorites();
  message.success('刷新成功');
};

const handleRemoveFavorite = async (gameId: number) => {
  dialog.warning({
    title: '确认移除',
    content: '确定要从收藏中移除这个游戏吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const success = await removeFromFavorites(gameId);
      if (success) {
        // Remove from selection if it was selected
        selectedGames.value = selectedGames.value.filter((id) => id !== gameId);
      }
    },
  });
};

const handleBulkRemove = async () => {
  if (selectedGames.value.length === 0) return;

  dialog.warning({
    title: '批量移除',
    content: `确定要从收藏中移除 ${selectedGames.value.length} 个游戏吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const success = await bulkRemoveFromFavorites(selectedGames.value);
      if (success) {
        selectedGames.value = [];
      }
    },
  });
};

const toggleSelection = (gameId: number) => {
  const index = selectedGames.value.indexOf(gameId);
  if (index > -1) {
    selectedGames.value.splice(index, 1);
  } else {
    selectedGames.value.push(gameId);
  }
};

const handleSelectionChange = (gameId: number, checked: boolean) => {
  if (checked) {
    if (!selectedGames.value.includes(gameId)) {
      selectedGames.value.push(gameId);
    }
  } else {
    selectedGames.value = selectedGames.value.filter((id) => id !== gameId);
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Initialize
onMounted(() => {
  loadFavorites();
});
</script>

<style scoped>
.favorite-games-page {
  padding: 20px;
}

.favorite-game-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.favorite-game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.favorite-game-card.selected {
  border: 2px solid #18a058;
  background-color: #f0f9ff;
}

.game-image-container {
  position: relative;
}

.game-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  padding: 4px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.game-info {
  margin-top: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
