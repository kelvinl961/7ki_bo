<template>
  <div class="game-public-config-modal-wrapper">
    <n-modal
      :show="show"
      preset="card"
      :title="$t('game.publicConfig.title')"
      style="width: 900px"
      :mask-closable="false"
      @update:show="handleUpdateShow"
    >
      <n-tabs v-model:value="activeTab" type="line" animated>
        
        <n-tab-pane name="game-settings" :tab="$t('game.publicConfig.gameSettingsTab')">
          <n-space vertical :size="16" class="pt-4">
            
            <div class="setting-row">
              <div class="setting-label">{{ $t('game.publicConfig.backToLobby') }}</div>
              <n-radio-group
                v-model:value="config.lobby_return_mode"
                class="setting-control"
              >
                <n-space>
                  <n-radio value="confirm">{{ $t('game.publicConfig.backConfirm') }}</n-radio>
                  <n-radio value="direct">{{ $t('game.publicConfig.backDirect') }}</n-radio>
                </n-space>
              </n-radio-group>
            </div>

            
            <div class="setting-row">
              <div class="setting-label">
                {{ $t('game.publicConfig.firstDepositRequired') }}
              </div>
              <n-radio-group
                v-model:value="config.deposit_requirement"
                class="setting-control"
              >
                <n-space>
                  <n-radio value="disabled">{{ $t('game.publicConfig.noLimit') }}</n-radio>
                  <n-radio value="enabled">{{ $t('game.publicConfig.enabled') }}</n-radio>
                </n-space>
              </n-radio-group>
            </div>

            
            <div class="setting-row">
              <div class="setting-label">
                {{ $t('game.publicConfig.gameNameSingleLine') }}
              </div>
              <n-radio-group
                v-model:value="config.game_name_display"
                class="setting-control"
              >
                <n-space>
                  <n-radio value="multi_line">{{ $t('game.publicConfig.multiLine') }}</n-radio>
                  <n-radio value="single_line">{{ $t('game.publicConfig.singleLine') }}</n-radio>
                </n-space>
              </n-radio-group>
            </div>
          </n-space>
        </n-tab-pane>

        
        <n-tab-pane name="app-download" :tab="$t('game.publicConfig.appDownloadTab')">
          <n-space vertical :size="16" class="pt-4">
            <div class="setting-row">
              <div class="setting-label">{{ $t('game.publicConfig.forceDownload') }}</div>
              <n-switch
                v-model:value="config.force_download_enabled"
                class="setting-control"
              />
            </div>

            <div class="setting-row">
              <div class="setting-label">{{ $t('game.publicConfig.downloadLink') }}</div>
              <n-input
                v-model:value="config.download_url"
                :placeholder="$t('game.publicConfig.enterDownloadLink')"
                :disabled="!config.force_download_enabled"
                class="setting-control"
                style="max-width: 500px"
              />
            </div>
          </n-space>
        </n-tab-pane>

        
        <n-tab-pane name="wg-sports" :tab="$t('game.publicConfig.wgSportsTab')">
          <n-space vertical :size="16" class="pt-4">
            <div class="setting-row">
              <div class="setting-label">{{ $t('game.publicConfig.oddsMode') }}</div>
              <n-radio-group
                v-model:value="config.wg_sports_odds_mode"
                class="setting-control"
              >
                <n-space vertical>
                  <n-radio value="standard">{{ $t('game.publicConfig.standardOdds') }}</n-radio>
                  <n-radio value="custom">{{ $t('game.publicConfig.customOdds') }}</n-radio>
                </n-space>
              </n-radio-group>
            </div>

            <div
              v-if="config.wg_sports_odds_mode === 'custom'"
              class="setting-row"
            >
              <div class="setting-label">{{ $t('game.publicConfig.customOddsValue') }}</div>
              <n-input-number
                v-model:value="config.wg_sports_odds_value"
                :min="0"
                :max="100"
                :step="0.1"
                :placeholder="$t('game.publicConfig.enterOddsValue')"
                class="setting-control"
                style="width: 200px"
              />
            </div>
          </n-space>
        </n-tab-pane>
      </n-tabs>

      <template #footer>
        <div class="flex justify-end gap-3">
          <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="saving" @click="handleConfirm">{{ $t('game.virtualBonusPool.confirm') }}</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, watch } from 'vue';
import {
  NModal,
  NTabs,
  NTabPane,
  NSpace,
  NButton,
  NRadioGroup,
  NRadio,
  NSwitch,
  NInput,
  NInputNumber,
  useMessage,
} from 'naive-ui';
import type { GamePublicConfig } from '#/api/gamePublicConfig';
import {
  getGamePublicConfig,
  updateGamePublicConfig,
} from '#/api/gamePublicConfig';

const message = useMessage();

// Props and emits
const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
}>();

const activeTab = ref('game-settings');
const saving = ref(false);

const config = ref<GamePublicConfig>({
  lobby_return_mode: 'confirm',
  deposit_requirement: 'disabled',
  game_name_display: 'multi_line',
  force_download_enabled: false,
  download_url: '',
  wg_sports_odds_mode: 'standard',
  wg_sports_odds_value: 0,
});

// Handle modal visibility update
const handleUpdateShow = (value: boolean) => {
  emit('update:show', value);
};

// Load config when modal opens
watch(
  () => props.show,
  async (visible) => {
    if (visible) {
      await loadConfig();
    } else {
      // Reset to first tab when closed
      activeTab.value = 'game-settings';
    }
  },
);

const loadConfig = async () => {
  try {
    const response = await getGamePublicConfig();
    if (response) {
      // Handle wrapped response: { success: true, data: {...} }
      const actualConfig = (response as any).data || response;
      config.value = {
        lobby_return_mode: actualConfig.lobby_return_mode || 'confirm',
        deposit_requirement: actualConfig.deposit_requirement || 'disabled',
        game_name_display: actualConfig.game_name_display || 'multi_line',
        force_download_enabled: actualConfig.force_download_enabled || false,
        download_url: actualConfig.download_url || '',
        wg_sports_odds_mode: actualConfig.wg_sports_odds_mode || 'standard',
        wg_sports_odds_value: actualConfig.wg_sports_odds_value || 0,
      };
    }
  } catch (error: any) {
    message.error(error.message || $t('game.publicConfig.loadFailed'));
  }
};

const handleConfirm = async () => {
  saving.value = true;
  try {
    await updateGamePublicConfig(config.value);
    message.success($t('game.publicConfig.saveSuccess'));
    emit('update:show', false);
  } catch (error: any) {
    message.error(error.message || $t('game.publicConfig.saveFailed'));
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  emit('update:show', false);
};
</script>

<style scoped>
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-radius: 12px;
  min-height: 70px;
  color: black;
}

.setting-label {
  font-size: 15px;
  font-weight: 500;
  flex: 1;
  color: black;
}

.setting-control {
  flex-shrink: 0;
}

:deep(.n-radio) {
  color: black !important;
}

:deep(.n-radio__label) {
  color: black !important;
}

:deep(.n-radio .n-radio__dot) {
  border-color: rgba(255, 255, 255, 0.6);
  background-color: transparent;
}

:deep(.n-radio--checked .n-radio__dot) {
  border-color: black;
  background-color: black;
}

:deep(.n-radio .n-radio__dot::before) {
  background-color: #667eea;
}

:deep(.n-switch) {
  --n-rail-color: rgba(255, 255, 255, 0.3);
  --n-rail-color-active: black;
}
</style>
