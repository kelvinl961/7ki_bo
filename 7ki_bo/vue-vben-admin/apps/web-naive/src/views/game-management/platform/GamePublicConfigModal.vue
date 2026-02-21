<template>
  <div class="game-public-config-modal-wrapper">
    <n-modal
      :show="show"
      preset="card"
      title="游戏公共配置"
      style="width: 900px"
      :mask-closable="false"
      @update:show="handleUpdateShow"
    >
      <n-tabs v-model:value="activeTab" type="line" animated>
        <!-- Tab 1: 游戏相关设置 -->
        <n-tab-pane name="game-settings" tab="游戏相关设置">
          <n-space vertical :size="16" class="pt-4">
            <!-- 返回大厅按钮 -->
            <div class="setting-row">
              <div class="setting-label">返回大厅按钮</div>
              <n-radio-group v-model:value="config.lobby_return_mode" class="setting-control">
                <n-space>
                  <n-radio value="confirm">二次弹窗确认(默认)</n-radio>
                  <n-radio value="direct">直接返回</n-radio>
                </n-space>
              </n-radio-group>
            </div>

            <!-- 已首充才能进入游戏 -->
            <div class="setting-row">
              <div class="setting-label">已首充才能进入游戏(未充值无法进入)</div>
              <n-radio-group v-model:value="config.deposit_requirement" class="setting-control">
                <n-space>
                  <n-radio value="disabled">不限制(默认)</n-radio>
                  <n-radio value="enabled">开启</n-radio>
                </n-space>
              </n-radio-group>
            </div>

            <!-- 游戏名只显示一行 -->
            <div class="setting-row">
              <div class="setting-label">游戏名只显示一行, 超过使用省略号展示</div>
              <n-radio-group v-model:value="config.game_name_display" class="setting-control">
                <n-space>
                  <n-radio value="multi_line">关闭(默认)</n-radio>
                  <n-radio value="single_line">开启</n-radio>
                </n-space>
              </n-radio-group>
            </div>
          </n-space>
        </n-tab-pane>

        <!-- Tab 2: 强制下载APP设置 -->
        <n-tab-pane name="app-download" tab="强制下载APP设置">
          <n-space vertical :size="16" class="pt-4">
            <div class="setting-row">
              <div class="setting-label">启用强制下载</div>
              <n-switch v-model:value="config.force_download_enabled" class="setting-control" />
            </div>

            <div class="setting-row">
              <div class="setting-label">下载链接</div>
              <n-input
                v-model:value="config.download_url"
                placeholder="请输入APP下载链接"
                :disabled="!config.force_download_enabled"
                class="setting-control"
                style="max-width: 500px;"
              />
            </div>
          </n-space>
        </n-tab-pane>

        <!-- Tab 3: WG体育赔率设置 -->
        <n-tab-pane name="wg-sports" tab="WG体育赔率设置">
          <n-space vertical :size="16" class="pt-4">
            <div class="setting-row">
              <div class="setting-label">赔率模式</div>
              <n-radio-group v-model:value="config.wg_sports_odds_mode" class="setting-control">
                <n-space vertical>
                  <n-radio value="standard">标准赔率</n-radio>
                  <n-radio value="custom">自定义赔率</n-radio>
                </n-space>
              </n-radio-group>
            </div>

            <div v-if="config.wg_sports_odds_mode === 'custom'" class="setting-row">
              <div class="setting-label">自定义赔率值</div>
              <n-input-number
                v-model:value="config.wg_sports_odds_value"
                :min="0"
                :max="100"
                :step="0.1"
                placeholder="请输入赔率值"
                class="setting-control"
                style="width: 200px;"
              />
            </div>
          </n-space>
        </n-tab-pane>
      </n-tabs>

      <template #footer>
        <div class="flex justify-end gap-3">
          <n-button @click="handleCancel">取消</n-button>
          <n-button type="primary" :loading="saving" @click="handleConfirm">
            确认
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
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
  useMessage
} from 'naive-ui';
import type { GamePublicConfig } from '#/api/gamePublicConfig';
import { getGamePublicConfig, updateGamePublicConfig } from '#/api/gamePublicConfig';

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
watch(() => props.show, async (visible) => {
  if (visible) {
    await loadConfig();
  } else {
    // Reset to first tab when closed
    activeTab.value = 'game-settings';
  }
});

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
    message.error(error.message || '加载配置失败');
  }
};

const handleConfirm = async () => {
  saving.value = true;
  try {
    await updateGamePublicConfig(config.value);
    message.success('保存成功');
    emit('update:show', false);
  } catch (error: any) {
    message.error(error.message || '保存失败');
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
