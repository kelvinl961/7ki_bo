<template>
  <div class="platform-game-selector">
    <!-- 🎮 Platform Selection UI -->
    <div v-if="showPlatformSelection" class="space-y-4">
      <!-- Loading State -->
      <n-spin :show="loading">
        <div v-if="loading" class="flex h-64 items-center justify-center">
          <div class="text-center">
            <n-spin size="large" />
            <p class="mt-2 text-gray-500">加载平台和游戏数据...</p>
          </div>
        </div>

        <!-- Platform List -->
        <div v-else class="space-y-3">
          <!-- Quick Actions -->
          <div class="mb-3 flex space-x-2">
            <n-button size="tiny" @click="selectAllPlatforms">全选</n-button>
            <n-button size="tiny" @click="clearSelection">清空</n-button>
            <n-button size="tiny" @click="expandAll">展开</n-button>
            <n-button size="tiny" @click="collapseAll">收起</n-button>
          </div>

          <!-- Category Tabs -->
          <div class="mb-3">
            <n-tabs type="segment" size="medium" animated>
              <n-tab-pane name="all" tab="全部">
                <!-- All Platforms in Grid -->
                <div class="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto">
                  <div
                    v-for="platform in filteredPlatforms"
                    :key="platform.platformId"
                    class="rounded-lg border p-3"
                    :class="{
                      'border-blue-200 bg-blue-50': isPlatformSelected(
                        platform.platformId,
                      ),
                      'border-gray-200 bg-gray-50': !isPlatformSelected(
                        platform.platformId,
                      ),
                    }"
                  >
                    <!-- Platform Header - Ultra Compact -->
                    <div class="mb-1 flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <n-checkbox
                          :checked="isPlatformSelected(platform.platformId)"
                          @update:checked="
                            (checked) => togglePlatform(platform, checked)
                          "
                          size="small"
                        />

                        <!-- Platform Info - Ultra Compact -->
                        <div class="flex items-center space-x-1">
                          <img
                            v-if="platform.logoUrl"
                            :src="platform.logoUrl"
                            :alt="platform.platformName"
                            class="h-8 w-8 rounded object-cover"
                          />
                          <div
                            v-else
                            class="flex h-8 w-8 items-center justify-center rounded bg-gray-200"
                          >
                            <n-icon
                              :component="GameControllerOutline"
                              size="16"
                            />
                          </div>

                          <div class="min-w-0 flex-1">
                            <h4 class="text-sm font-medium text-gray-900">
                              {{ platform.platformName }}
                            </h4>
                            <p class="text-xs text-gray-500">
                              {{ platform.gameType }} •
                              {{ platform.games.length }} 个游戏
                              <n-tag
                                v-if="platform.isFeatured"
                                size="small"
                                type="success"
                                class="ml-1"
                              >
                                精选
                              </n-tag>
                              <n-tag
                                v-if="platform.isHot"
                                size="small"
                                type="warning"
                                class="ml-1"
                              >
                                热门
                              </n-tag>
                            </p>
                          </div>
                        </div>
                      </div>

                      <!-- Expand/Collapse Button -->
                      <n-button
                        v-if="isPlatformSelected(platform.platformId)"
                        size="tiny"
                        quaternary
                        @click="togglePlatformExpansion(platform.platformId)"
                      >
                        <n-icon
                          :component="
                            expandedPlatforms.has(platform.platformId)
                              ? ChevronUpOutline
                              : ChevronDownOutline
                          "
                        />
                      </n-button>
                    </div>

                    <!-- Game Selection Options - Ultra Compact -->
                    <div
                      v-if="isPlatformSelected(platform.platformId)"
                      class="ml-7 space-y-1"
                    >
                      <!-- Game Selection Mode -->
                      <n-radio-group
                        :value="getGameSelectionMode(platform.platformId)"
                        @update:value="
                          (mode) =>
                            updateGameSelectionMode(platform.platformId, mode)
                        "
                        size="small"
                      >
                        <n-space size="small">
                          <n-radio value="all_games">全部</n-radio>
                          <n-radio value="specific_games">指定</n-radio>
                        </n-space>
                      </n-radio-group>

                      <!-- Specific Games Selection - Ultra Compact -->
                      <div
                        v-if="
                          getGameSelectionMode(platform.platformId) ===
                            'specific_games' &&
                          expandedPlatforms.has(platform.platformId)
                        "
                        class="mt-1"
                      >
                        <!-- Game Grid - Ultra Compact -->
                        <div class="max-h-32 overflow-y-auto">
                          <div class="grid grid-cols-2 gap-1">
                            <div
                              v-for="game in getFilteredGames(platform)"
                              :key="game.gameId"
                              class="flex items-center space-x-1 rounded border p-1"
                              :class="{
                                'border-blue-200 bg-blue-50': isGameSelected(
                                  platform.platformId,
                                  game.gameId,
                                ),
                                'border-gray-200 bg-white': !isGameSelected(
                                  platform.platformId,
                                  game.gameId,
                                ),
                              }"
                            >
                              <n-checkbox
                                :checked="
                                  isGameSelected(
                                    platform.platformId,
                                    game.gameId,
                                  )
                                "
                                @update:checked="
                                  (checked) =>
                                    toggleGame(
                                      platform.platformId,
                                      game,
                                      checked,
                                    )
                                "
                                size="small"
                              />

                              <div
                                class="flex min-w-0 flex-1 items-center space-x-1"
                              >
                                <img
                                  v-if="game.iconUrl"
                                  :src="game.iconUrl"
                                  :alt="game.gameName"
                                  class="h-4 w-4 flex-shrink-0 rounded object-cover"
                                />
                                <div class="min-w-0 flex-1">
                                  <p
                                    class="truncate text-xs font-medium text-gray-900"
                                  >
                                    {{ game.gameName }}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Game Selection Summary - Ultra Compact -->
                        <div class="mt-1 text-xs text-gray-500">
                          {{ getSelectedGamesCount(platform.platformId) }}/{{
                            platform.games.length
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </n-tab-pane>

              <n-tab-pane
                v-for="gameType in gameTypes"
                :key="gameType.value"
                :name="gameType.value"
                :tab="gameType.label"
              >
                <!-- Platforms by Category in Grid -->
                <div class="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto">
                  <div
                    v-for="platform in getPlatformsByType(gameType.value)"
                    :key="platform.platformId"
                    class="rounded border p-2 text-xs"
                    :class="{
                      'border-blue-200 bg-blue-50': isPlatformSelected(
                        platform.platformId,
                      ),
                      'border-gray-200 bg-gray-50': !isPlatformSelected(
                        platform.platformId,
                      ),
                    }"
                  >
                    <!-- Platform Header - Ultra Compact -->
                    <div class="mb-1 flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <n-checkbox
                          :checked="isPlatformSelected(platform.platformId)"
                          @update:checked="
                            (checked) => togglePlatform(platform, checked)
                          "
                          size="small"
                        />

                        <!-- Platform Info - Ultra Compact -->
                        <div class="flex items-center space-x-1">
                          <img
                            v-if="platform.logoUrl"
                            :src="platform.logoUrl"
                            :alt="platform.platformName"
                            class="h-8 w-8 rounded object-cover"
                          />
                          <div
                            v-else
                            class="flex h-8 w-8 items-center justify-center rounded bg-gray-200"
                          >
                            <n-icon
                              :component="GameControllerOutline"
                              size="16"
                            />
                          </div>

                          <div class="min-w-0 flex-1">
                            <h4 class="text-sm font-medium text-gray-900">
                              {{ platform.platformName }}
                            </h4>
                            <p class="text-xs text-gray-500">
                              {{ platform.gameType }} •
                              {{ platform.games.length }} 个游戏
                              <n-tag
                                v-if="platform.isFeatured"
                                size="small"
                                type="success"
                                class="ml-1"
                              >
                                精选
                              </n-tag>
                              <n-tag
                                v-if="platform.isHot"
                                size="small"
                                type="warning"
                                class="ml-1"
                              >
                                热门
                              </n-tag>
                            </p>
                          </div>
                        </div>
                      </div>

                      <!-- Expand/Collapse Button -->
                      <n-button
                        v-if="isPlatformSelected(platform.platformId)"
                        size="tiny"
                        quaternary
                        @click="togglePlatformExpansion(platform.platformId)"
                      >
                        <n-icon
                          :component="
                            expandedPlatforms.has(platform.platformId)
                              ? ChevronUpOutline
                              : ChevronDownOutline
                          "
                        />
                      </n-button>
                    </div>

                    <!-- Game Selection Options - Ultra Compact -->
                    <div
                      v-if="isPlatformSelected(platform.platformId)"
                      class="ml-7 space-y-1"
                    >
                      <!-- Game Selection Mode -->
                      <n-radio-group
                        :value="getGameSelectionMode(platform.platformId)"
                        @update:value="
                          (mode) =>
                            updateGameSelectionMode(platform.platformId, mode)
                        "
                        size="small"
                      >
                        <n-space size="small">
                          <n-radio value="all_games">全部</n-radio>
                          <n-radio value="specific_games">指定</n-radio>
                        </n-space>
                      </n-radio-group>

                      <!-- Specific Games Selection - Ultra Compact -->
                      <div
                        v-if="
                          getGameSelectionMode(platform.platformId) ===
                            'specific_games' &&
                          expandedPlatforms.has(platform.platformId)
                        "
                        class="mt-1"
                      >
                        <!-- Game Grid - Ultra Compact -->
                        <div class="max-h-32 overflow-y-auto">
                          <div class="grid grid-cols-2 gap-1">
                            <div
                              v-for="game in getFilteredGames(platform)"
                              :key="game.gameId"
                              class="flex items-center space-x-1 rounded border p-1"
                              :class="{
                                'border-blue-200 bg-blue-50': isGameSelected(
                                  platform.platformId,
                                  game.gameId,
                                ),
                                'border-gray-200 bg-white': !isGameSelected(
                                  platform.platformId,
                                  game.gameId,
                                ),
                              }"
                            >
                              <n-checkbox
                                :checked="
                                  isGameSelected(
                                    platform.platformId,
                                    game.gameId,
                                  )
                                "
                                @update:checked="
                                  (checked) =>
                                    toggleGame(
                                      platform.platformId,
                                      game,
                                      checked,
                                    )
                                "
                                size="small"
                              />

                              <div
                                class="flex min-w-0 flex-1 items-center space-x-1"
                              >
                                <img
                                  v-if="game.iconUrl"
                                  :src="game.iconUrl"
                                  :alt="game.gameName"
                                  class="h-4 w-4 flex-shrink-0 rounded object-cover"
                                />
                                <div class="min-w-0 flex-1">
                                  <p
                                    class="truncate text-xs font-medium text-gray-900"
                                  >
                                    {{ game.gameName }}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Game Selection Summary - Ultra Compact -->
                        <div class="mt-1 text-xs text-gray-500">
                          {{ getSelectedGamesCount(platform.platformId) }}/{{
                            platform.games.length
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </n-tab-pane>
            </n-tabs>
          </div>

          <!-- Selection Summary -->
          <div
            v-if="selectedPlatforms.length > 0"
            class="mt-3 rounded bg-blue-50 p-2 text-xs"
          >
            <div class="flex justify-between text-blue-800">
              <span>已选择 {{ selectedPlatforms.length }} 个平台</span>
              <span>{{ totalSelectedGames }} 个游戏</span>
            </div>
            <div v-if="validationErrors.length > 0" class="mt-1 text-red-600">
              <span v-for="error in validationErrors" :key="error">{{
                error
              }}</span>
            </div>
          </div>
        </div>
      </n-spin>
    </div>

    <!-- Platform Selection Disabled Message -->
    <div v-else class="py-4 text-center text-sm text-gray-400">
      <p>选择"指定平台"后可配置具体的游戏平台和游戏</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import {
  NButton,
  NSpin,
  NCheckbox,
  NIcon,
  NRadioGroup,
  NRadio,
  NSpace,
  NTag,
  NTabs,
  NTabPane,
  useMessage,
} from 'naive-ui';
import {
  GameControllerOutline,
  ChevronUpOutline,
  ChevronDownOutline,
} from '@vicons/ionicons5';
import {
  getPlatformsWithGames,
  validatePlatformSelection,
  type PlatformWithGames,
  type SelectedPlatform,
  type GameItem,
} from '#/api/activity/platformSelection';

// Props & Emits
interface Props {
  modelValue?: SelectedPlatform[];
  wageringPlatform?:
    | 'all_platforms'
    | 'specific_platforms'
    | 'exclude_platforms';
  disabled?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: SelectedPlatform[]): void;
  (e: 'validation-change', isValid: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  disabled: false,
});

const emit = defineEmits<Emits>();
const message = useMessage();

// Reactive Data
const loading = ref(false);
const platforms = ref<PlatformWithGames[]>([]);
const selectedPlatforms = ref<SelectedPlatform[]>([...props.modelValue]);
const expandedPlatforms = ref(new Set<number>());
const searchTerm = ref('');
const validationErrors = ref<string[]>([]);
const allPlatformsSelected = ref(false);

// Computed Properties
const showPlatformSelection = computed(() => {
  return props.wageringPlatform === 'specific_platforms' && !props.disabled;
});

const filteredPlatforms = computed(() => {
  if (!searchTerm.value) return platforms.value;

  const term = searchTerm.value.toLowerCase();
  return platforms.value.filter((platform) => {
    const platformMatch = platform.platformName.toLowerCase().includes(term);
    const gameMatch = platform.games.some((game) =>
      game.gameName.toLowerCase().includes(term),
    );
    return platformMatch || gameMatch;
  });
});

const totalSelectedGames = computed(() => {
  return selectedPlatforms.value.reduce((total, platform) => {
    if (platform.gameSelection === 'all_games') {
      const platformData = platforms.value.find(
        (p) => p.platformId === platform.platformId,
      );
      return total + (platformData?.games.length || 0);
    } else {
      return total + (platform.selectedGames?.length || 0);
    }
  }, 0);
});

const gameTypes = computed(() => {
  const types = new Set<string>();
  platforms.value.forEach((platform) => {
    types.add(platform.gameType);
  });

  return Array.from(types).map((type) => ({
    value: type,
    label: getGameTypeLabel(type),
  }));
});

// Helper function to get Chinese labels for game types
const getGameTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    SLOT: '电子', // SLOT games are 电子 (Electronic)
    HUNTING: '捕鱼', // Hunting games are 捕鱼 (Fishing)
    CHESS_CARDS: '棋牌', // Chess/Cards are 棋牌 (Chess & Cards)
    LIVE: '真人', // Live games are 真人 (Live Dealer)
    SPORTS: '体育', // Sports betting are 体育 (Sports)
    BLOCKCHAIN: '区块链', // Blockchain games are 区块链
    COCKFIGHT: '斗鸡', // Cockfight are 斗鸡
  };
  return labels[type] || type;
};

// Helper Functions
const isPlatformSelected = (platformId: number): boolean => {
  return selectedPlatforms.value.some((p) => p.platformId === platformId);
};

const getGameSelectionMode = (
  platformId: number,
): 'all_games' | 'specific_games' => {
  const platform = selectedPlatforms.value.find(
    (p) => p.platformId === platformId,
  );
  return platform?.gameSelection || 'all_games';
};

const isGameSelected = (platformId: number, gameId: string): boolean => {
  const platform = selectedPlatforms.value.find(
    (p) => p.platformId === platformId,
  );
  if (!platform || platform.gameSelection === 'all_games') return false;
  return platform.selectedGames?.some((g) => g.gameId === gameId) || false;
};

const getSelectedGamesCount = (platformId: number): number => {
  const platform = selectedPlatforms.value.find(
    (p) => p.platformId === platformId,
  );
  if (!platform) return 0;
  if (platform.gameSelection === 'all_games') {
    const platformData = platforms.value.find(
      (p) => p.platformId === platformId,
    );
    return platformData?.games.length || 0;
  }
  return platform.selectedGames?.length || 0;
};

const getFilteredGames = (platform: PlatformWithGames): GameItem[] => {
  const searchTerm = (platform as any).gameSearchTerm;
  if (!searchTerm) return platform.games;

  const term = searchTerm.toLowerCase();
  return platform.games.filter((game) =>
    game.gameName.toLowerCase().includes(term),
  );
};

// Platform Management
const togglePlatform = (platform: PlatformWithGames, checked: boolean) => {
  if (checked) {
    // Add platform
    selectedPlatforms.value.push({
      platformId: platform.platformId,
      platformName: platform.platformName,
      gameSelection: 'all_games',
    });
    expandedPlatforms.value.add(platform.platformId);
  } else {
    // Remove platform
    selectedPlatforms.value = selectedPlatforms.value.filter(
      (p) => p.platformId !== platform.platformId,
    );
    expandedPlatforms.value.delete(platform.platformId);
  }

  emitUpdate();
};

const updateGameSelectionMode = (
  platformId: number,
  mode: 'all_games' | 'specific_games',
) => {
  const platform = selectedPlatforms.value.find(
    (p) => p.platformId === platformId,
  );
  if (platform) {
    platform.gameSelection = mode;
    if (mode === 'specific_games') {
      platform.selectedGames = [];
      if (!expandedPlatforms.value.has(platformId)) {
        expandedPlatforms.value.add(platformId);
      }
    } else {
      delete platform.selectedGames;
    }
    emitUpdate();
  }
};

const toggleGame = (platformId: number, game: GameItem, checked: boolean) => {
  const platform = selectedPlatforms.value.find(
    (p) => p.platformId === platformId,
  );
  if (!platform) return;

  if (!platform.selectedGames) {
    platform.selectedGames = [];
  }

  if (checked) {
    platform.selectedGames.push({
      gameId: game.gameId,
      gameName: game.gameName,
    });
  } else {
    platform.selectedGames = platform.selectedGames.filter(
      (g) => g.gameId !== game.gameId,
    );
  }

  emitUpdate();
};

const togglePlatformExpansion = (platformId: number) => {
  if (expandedPlatforms.value.has(platformId)) {
    expandedPlatforms.value.delete(platformId);
  } else {
    expandedPlatforms.value.add(platformId);
  }
};

// Helper method to get platforms by game type
const getPlatformsByType = (gameType: string) => {
  return platforms.value.filter((p) => p.gameType === gameType && p.isEnabled);
};

// Quick Actions
const selectAllPlatforms = () => {
  selectedPlatforms.value = platforms.value
    .filter((p) => p.isEnabled)
    .map((p) => ({
      platformId: p.platformId,
      platformName: p.platformName,
      gameSelection: 'all_games' as const,
    }));
  emitUpdate();
};

const clearSelection = () => {
  selectedPlatforms.value = [];
  expandedPlatforms.value.clear();
  emitUpdate();
};

const expandAll = () => {
  selectedPlatforms.value.forEach((p) => {
    expandedPlatforms.value.add(p.platformId);
  });
};

const collapseAll = () => {
  expandedPlatforms.value.clear();
};

// Data Loading
const loadPlatformsWithGames = async () => {
  if (!showPlatformSelection.value) return;

  try {
    loading.value = true;
    const response = await getPlatformsWithGames();
    platforms.value = response.data;

    // Add reactive game search terms
    platforms.value.forEach((platform) => {
      (platform as any).gameSearchTerm = '';
    });
  } catch (error) {
    console.error('Failed to load platforms with games:', error);
    message.error('加载游戏平台数据失败');
  } finally {
    loading.value = false;
  }
};

// Validation
const validateSelection = async () => {
  if (selectedPlatforms.value.length === 0) {
    validationErrors.value = [];
    emit('validation-change', true);
    return;
  }

  try {
    const response = await validatePlatformSelection({
      wageringPlatformConfig: {
        selectedPlatforms: selectedPlatforms.value,
      },
    });

    validationErrors.value = response.validationResults
      .filter((r) => !r.valid)
      .map((r) => `${r.platformName}: ${r.error}`);

    emit('validation-change', response.allValid);
  } catch (error) {
    console.error('Validation failed:', error);
    validationErrors.value = ['验证失败'];
    emit('validation-change', false);
  }
};

// Emit Updates
const emitUpdate = () => {
  emit('update:modelValue', [...selectedPlatforms.value]);
  validateSelection();
};

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    selectedPlatforms.value = [...newValue];
  },
  { deep: true },
);

watch(
  () => props.wageringPlatform,
  () => {
    if (showPlatformSelection.value) {
      loadPlatformsWithGames();
    } else {
      clearSelection();
    }
  },
);

// Lifecycle
onMounted(() => {
  if (showPlatformSelection.value) {
    loadPlatformsWithGames();
  }
});
</script>

<style scoped>
.platform-game-selector {
  @apply w-full;
}

/* Custom scrollbar for game grid */
.max-h-64::-webkit-scrollbar {
  width: 6px;
}

.max-h-64::-webkit-scrollbar-track {
  @apply rounded bg-gray-100;
}

.max-h-64::-webkit-scrollbar-thumb {
  @apply rounded bg-gray-300;
}

.max-h-64::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}
</style>
