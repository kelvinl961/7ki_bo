<template>
  <n-card title="颜色主题演示" class="color-theme-demo">
    <template #header-extra>
      <n-select
        v-model:value="selectedSkinColor"
        placeholder="选择皮肤颜色"
        :options="skinColorOptions"
        style="width: 240px"
        @update:value="handleColorChange"
      >
        <template #render-label="{ option }">
          <div class="flex items-center gap-2">
            <div class="color-preview-mini">
              <div
                class="color-dot"
                :style="{ backgroundColor: getPrimaryColor(option.value) }"
              />
            </div>
            <span>{{ option.label }}</span>
          </div>
        </template>
      </n-select>
    </template>

    <div v-if="currentPalette" class="demo-content">
      <!-- Color Palette Display -->
      <div class="color-palette-section">
        <h4>自动生成的色彩搭配</h4>
        <div class="color-palette-grid">
          <div class="color-item primary">
            <div
              class="color-block"
              :style="{ backgroundColor: currentPalette.primary }"
            >
              <div class="color-overlay">
                <span class="color-type">主色</span>
                <span class="color-value">{{ currentPalette.primary }}</span>
              </div>
            </div>
          </div>
          <div class="color-item secondary">
            <div
              class="color-block"
              :style="{ backgroundColor: currentPalette.secondary }"
            >
              <div class="color-overlay">
                <span class="color-type">次色</span>
                <span class="color-value">{{ currentPalette.secondary }}</span>
              </div>
            </div>
          </div>
          <div class="color-item accent">
            <div
              class="color-block"
              :style="{ backgroundColor: currentPalette.accent }"
            >
              <div class="color-overlay">
                <span class="color-type">强调色</span>
                <span class="color-value">{{ currentPalette.accent }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Theme Application Demo -->
      <div class="theme-demo-section">
        <h4>主题应用演示</h4>
        <div class="demo-components">
          <!-- Button Demo -->
          <div class="demo-group">
            <label>按钮组件</label>
            <div class="button-demo">
              <button
                class="demo-button primary"
                :style="{
                  backgroundColor: currentPalette.primary,
                  borderColor: currentPalette.primary,
                }"
              >
                主要按钮
              </button>
              <button
                class="demo-button secondary"
                :style="{
                  backgroundColor: currentPalette.secondary,
                  borderColor: currentPalette.secondary,
                }"
              >
                次要按钮
              </button>
              <button
                class="demo-button accent"
                :style="{
                  backgroundColor: currentPalette.accent,
                  borderColor: currentPalette.accent,
                }"
              >
                强调按钮
              </button>
            </div>
          </div>

          <!-- Card Demo -->
          <div class="demo-group">
            <label>卡片组件</label>
            <div class="card-demo">
              <div
                class="demo-card"
                :style="{ borderTopColor: currentPalette.primary }"
              >
                <div
                  class="card-header"
                  :style="{ color: currentPalette.primary }"
                >
                  主要内容卡片
                </div>
                <div class="card-content">这是一个使用主题色的卡片组件示例</div>
              </div>
            </div>
          </div>

          <!-- Badge Demo -->
          <div class="demo-group">
            <label>标签组件</label>
            <div class="badge-demo">
              <span
                class="demo-badge primary"
                :style="{ backgroundColor: currentPalette.primary }"
              >
                主要标签
              </span>
              <span
                class="demo-badge secondary"
                :style="{ backgroundColor: currentPalette.secondary }"
              >
                次要标签
              </span>
              <span
                class="demo-badge accent"
                :style="{ backgroundColor: currentPalette.accent }"
              >
                强调标签
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- CSS Classes Demo -->
      <div class="css-classes-section">
        <h4>生成的CSS类名</h4>
        <div class="css-code">
          <pre><code>{{ generateCSSExample() }}</code></pre>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <n-empty description="选择一个皮肤颜色来查看主题演示" />
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NSelect, NEmpty } from 'naive-ui';
import {
  useColorTheme,
  useSkinColorOptions,
} from '../../../composables/useColorTheme';
import {
  getPrimaryColorById,
  getColorPaletteById,
} from '../../../utils/colorUtils';

const { getColorInfo } = useColorTheme();
const { skinColorOptions } = useSkinColorOptions();

const selectedSkinColor = ref<string>('');
const currentPalette = ref(null);

const getPrimaryColor = (skinColorId: string) => {
  return getPrimaryColorById(skinColorId);
};

const handleColorChange = (skinColorId: string) => {
  if (skinColorId) {
    currentPalette.value = getColorPaletteById(skinColorId);
  } else {
    currentPalette.value = null;
  }
};

const generateCSSExample = () => {
  if (!currentPalette.value) return '';

  return `/* 自动生成的主题色彩 */
bg-[${currentPalette.value.primary}]   /* 主色背景 */
bg-[${currentPalette.value.secondary}] /* 次色背景 */
bg-[${currentPalette.value.accent}]    /* 强调色背景 */

text-[${currentPalette.value.primary}]   /* 主色文字 */
text-[${currentPalette.value.secondary}] /* 次色文字 */
text-[${currentPalette.value.accent}]    /* 强调色文字 */

border-[${currentPalette.value.primary}]   /* 主色边框 */
border-[${currentPalette.value.secondary}] /* 次色边框 */
border-[${currentPalette.value.accent}]    /* 强调色边框 */`;
};
</script>

<style scoped>
.color-theme-demo {
  margin-bottom: 24px;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Color Palette Section */
.color-palette-section h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.color-palette-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.color-item {
  text-align: center;
}

.color-block {
  position: relative;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.color-type {
  font-weight: 600;
  font-size: 14px;
}

.color-value {
  font-family: monospace;
  font-size: 12px;
  opacity: 0.9;
}

/* Theme Demo Section */
.theme-demo-section h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.demo-components {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-group label {
  font-weight: 500;
  color: #666;
}

/* Button Demo */
.button-demo {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.demo-button {
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.demo-button:hover {
  opacity: 0.9;
}

/* Card Demo */
.demo-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  border-top-width: 3px;
  overflow: hidden;
}

.card-header {
  padding: 12px 16px;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.card-content {
  padding: 16px;
  color: #666;
}

/* Badge Demo */
.badge-demo {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.demo-badge {
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

/* CSS Classes Section */
.css-classes-section h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.css-code {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 16px;
}

.css-code pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #495057;
}

/* Select option styling */
.color-preview-mini {
  display: flex;
  align-items: center;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
}
</style>
