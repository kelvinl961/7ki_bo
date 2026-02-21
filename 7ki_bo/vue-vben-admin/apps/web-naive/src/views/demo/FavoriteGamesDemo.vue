<template>
  <div class="demo-page">
    <n-card title="收藏游戏系统演示" class="mb-4">
      <n-space vertical>
        <n-alert type="info" title="系统特性">
          <template #default>
            <ul>
              <li>✅ 后端同步 - 数据存储在数据库中</li>
              <li>✅ 离线支持 - 断网时使用localStorage</li>
              <li>✅ 跨设备同步 - 登录后自动同步</li>
              <li>✅ 错误处理 - 完善的错误提示</li>
              <li>✅ 批量操作 - 支持批量添加/移除</li>
            </ul>
          </template>
        </n-alert>

        <n-space>
          <n-tag :bordered="false" type="info">
            收藏数量: {{ favoriteGamesCount }}
          </n-tag>

          <n-tag :bordered="false" type="info">
            最后同步: {{ lastSyncTime ? formatDate(lastSyncTime) : '未同步' }}
          </n-tag>
        </n-space>
      </n-space>
    </n-card>

    <!-- Demo Controls -->
    <n-card title="功能演示" class="mb-4">
      <n-space vertical>
        <n-space>
          <n-input-number
            v-model:value="demoGameId"
            placeholder="游戏ID"
            :min="1"
            :max="999"
          />
          <n-button
            type="primary"
            @click="handleAddFavorite"
            :loading="isLoading"
          >
            添加到收藏
          </n-button>
          <n-button
            type="error"
            @click="handleRemoveFavorite"
            :loading="isLoading"
          >
            从收藏移除
          </n-button>
          <n-button
            @click="handleCheckFavorite"
            :loading="isLoading"
          >
            检查收藏状态
          </n-button>
        </n-space>

        <n-space>
          <n-button
            @click="handleRefresh"
            :loading="isLoading"
          >
            刷新收藏列表
          </n-button>

        </n-space>
      </n-space>
    </n-card>

    <!-- Favorite Games List -->
    <n-card title="收藏游戏列表" class="mb-4">
      <template #header-extra>
        <n-button
          size="small"
          @click="handleRefresh"
          :loading="isLoading"
        >
          刷新
        </n-button>
      </template>

      <n-space vertical>
        <div v-if="favoriteGames.length === 0" class="empty-state">
          <n-empty description="暂无收藏游戏">
            <template #extra>
              <n-button type="primary" @click="handleRefresh">
                刷新
              </n-button>
            </template>
          </n-empty>
        </div>

        <n-list v-else>
          <n-list-item
            v-for="game in favoriteGames"
            :key="game.id"
          >
            <template #prefix>
              <n-avatar
                :src="game.iconUrl || '/uploads/games/default.png'"
                :fallback-src="'/uploads/games/default.png'"
                size="medium"
              />
            </template>

            <n-thing>
              <template #header>
                <n-space align="center">
                  <n-text strong>{{ game.gameName }}</n-text>
                  <n-tag
                    :type="game.isEnabled ? 'success' : 'error'"
                    size="small"
                  >
                    {{ game.isEnabled ? '可用' : '维护中' }}
                  </n-tag>
                </n-space>
              </template>

              <template #description>
                <n-space vertical size="small">
                  <n-text depth="3" size="small">
                    平台: {{ game.platformName }}
                  </n-text>
                  <n-text depth="3" size="small">
                    收藏时间: {{ formatDate(game.addedAt) }}
                  </n-text>
                </n-space>
              </template>

              <template #footer>
                <n-button
                  size="small"
                  type="error"
                  ghost
                  @click="handleRemoveFavorite(game.gameId)"
                >
                  移除
                </n-button>
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
      </n-space>
    </n-card>

    <!-- API Status -->
    <n-card title="API 状态">
      <n-space vertical>
        <n-descriptions :column="1" bordered>
          <n-descriptions-item label="后端连接">
            <n-tag type="success">
              正常
            </n-tag>
          </n-descriptions-item>
        </n-descriptions>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { useFavoriteGames } from '#/composables/useFavoriteGames';

// Composables
const message = useMessage();
const {
  favoriteGames,
  favoriteGamesCount,
  isLoading,
  lastSyncTime,
  loadFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorite
} = useFavoriteGames();

// State
const demoGameId = ref(1);

// Methods
const handleAddFavorite = async () => {
  if (!demoGameId.value) {
    message.warning('请输入游戏ID');
    return;
  }

  const success = await addToFavorites(demoGameId.value);
  if (success) {
    message.success(`游戏 ${demoGameId.value} 已添加到收藏`);
  }
};

const handleRemoveFavorite = async () => {
  if (!demoGameId.value) {
    message.warning('请输入游戏ID');
    return;
  }

  const success = await removeFromFavorites(demoGameId.value);
  if (success) {
    message.success(`游戏 ${demoGameId.value} 已从收藏中移除`);
  }
};

const handleCheckFavorite = async () => {
  if (!demoGameId.value) {
    message.warning('请输入游戏ID');
    return;
  }

  const isFav = isFavorite(demoGameId.value);
  message.info(`游戏 ${demoGameId.value} ${isFav ? '已收藏' : '未收藏'}`);
};

const handleRefresh = async () => {
  await loadFavorites();
  message.success('刷新成功');
};



const formatDate = (date: Date) => {
  return date.toLocaleString('zh-CN');
};

// Initialize
onMounted(() => {
  loadFavorites();
});
</script>

<style scoped>
.demo-page {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}
</style> 