<template>
  <n-button
    :type="isFavorite ? 'primary' : 'default'"
    :loading="isLoading"
    :disabled="disabled"
    size="small"
    @click="handleToggle"
  >
    <template #icon>
      <n-icon>
        <HeartIcon v-if="!isFavorite" />
        <HeartFilledIcon v-else />
      </n-icon>
    </template>
    {{ isFavorite ? '已收藏' : '收藏' }}
  </n-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NButton, NIcon } from 'naive-ui';
import { HeartIcon, HeartFilledIcon } from '@vicons/ionicons5';
import { useFavoriteGames } from '#/composables/useFavoriteGames';

interface Props {
  gameId: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const { isFavorite, toggleFavorite, isLoading } = useFavoriteGames();

const isGameFavorite = computed(() => isFavorite(props.gameId));

const handleToggle = async () => {
  if (props.disabled) return;

  await toggleFavorite(props.gameId);
};
</script>

<style scoped>
.n-button {
  transition: all 0.2s ease;
}

.n-button:hover {
  transform: scale(1.05);
}
</style>
