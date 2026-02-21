<template>
  <div class="smart-auto-refresh-demo">
    <n-card title="SmartAutoRefresh 组件演示">
      <n-space vertical :size="16">
        <!-- Basic Usage -->
        <div>
          <h3>基础用法</h3>
          <p>最简单的自动刷新组件，使用默认配置</p>
          <SmartAutoRefresh
            v-model="basicEnabled"
            :on-refresh="handleBasicRefresh"
          />
          <n-text depth="3" style="margin-left: 16px">
            刷新次数: {{ basicRefreshCount }}
          </n-text>
        </div>

        <n-divider />

        <!-- Custom Intervals -->
        <div>
          <h3>自定义刷新间隔</h3>
          <p>可以自定义可选的刷新间隔选项</p>
          <SmartAutoRefresh
            v-model="customEnabled"
            :intervals="[10, 20, 30, 60, 300]"
            :default-interval="20"
            :on-refresh="handleCustomRefresh"
          />
          <n-text depth="3" style="margin-left: 16px">
            刷新次数: {{ customRefreshCount }}
          </n-text>
        </div>

        <n-divider />

        <!-- Different Sizes -->
        <div>
          <h3>不同尺寸</h3>
          <n-space vertical :size="8">
            <div>
              <n-text strong>Small (默认):</n-text>
              <SmartAutoRefresh
                v-model="smallEnabled"
                size="small"
                :on-refresh="handleSizeRefresh"
              />
            </div>
            <div>
              <n-text strong>Medium:</n-text>
              <SmartAutoRefresh
                v-model="mediumEnabled"
                size="medium"
                :on-refresh="handleSizeRefresh"
              />
            </div>
            <div>
              <n-text strong>Large:</n-text>
              <SmartAutoRefresh
                v-model="largeEnabled"
                size="large"
                :on-refresh="handleSizeRefresh"
              />
            </div>
          </n-space>
        </div>

        <n-divider />

        <!-- Custom Labels -->
        <div>
          <h3>自定义标签</h3>
          <p>可以自定义显示的文本标签</p>
          <SmartAutoRefresh
            v-model="labelEnabled"
            :labels="{
              enabled: '开启自动刷新',
              disabled: '关闭自动刷新',
              placeholder: '选择间隔',
            }"
            :on-refresh="handleLabelRefresh"
          />
        </div>

        <n-divider />

        <!-- Programmatic Control -->
        <div>
          <h3>编程控制</h3>
          <p>通过 ref 调用组件方法进行控制</p>
          <SmartAutoRefresh
            ref="programmaticRef"
            v-model="programmaticEnabled"
            :on-refresh="handleProgrammaticRefresh"
          />
          <n-space style="margin-top: 8px">
            <n-button @click="startProgrammatic">开始</n-button>
            <n-button @click="stopProgrammatic">停止</n-button>
            <n-button @click="restartProgrammatic">重启</n-button>
            <n-button @click="triggerManualRefresh">手动刷新</n-button>
            <n-button @click="showStatus">显示状态</n-button>
          </n-space>
        </div>

        <n-divider />

        <!-- Event Handling -->
        <div>
          <h3>事件处理</h3>
          <p>监听组件的各种事件</p>
          <SmartAutoRefresh
            v-model="eventEnabled"
            :on-refresh="handleEventRefresh"
            @update:model-value="handleToggleEvent"
            @interval-change="handleIntervalEvent"
            @refresh="handleRefreshEvent"
          />
          <n-card style="margin-top: 8px" size="small">
            <n-text depth="3">事件日志:</n-text>
            <div style="max-height: 100px; overflow-y: auto; margin-top: 4px">
              <div
                v-for="(log, index) in eventLogs"
                :key="index"
                style="font-size: 12px"
              >
                {{ log }}
              </div>
            </div>
          </n-card>
        </div>

        <!-- Async Refresh -->
        <n-divider />
        <div>
          <h3>异步刷新</h3>
          <p>支持异步刷新函数，显示加载状态</p>
          <SmartAutoRefresh
            v-model="asyncEnabled"
            :on-refresh="handleAsyncRefresh"
          />
          <n-text depth="3" style="margin-left: 16px">
            异步刷新次数: {{ asyncRefreshCount }}
          </n-text>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NSpace, NText, NDivider, NButton, useMessage } from 'naive-ui';
import SmartAutoRefresh from './index.vue';
import type { SmartAutoRefreshExpose } from './types';

const message = useMessage();

// Basic usage
const basicEnabled = ref(false);
const basicRefreshCount = ref(0);
const handleBasicRefresh = () => {
  basicRefreshCount.value++;
  console.log('Basic refresh triggered');
};

// Custom intervals
const customEnabled = ref(false);
const customRefreshCount = ref(0);
const handleCustomRefresh = () => {
  customRefreshCount.value++;
  console.log('Custom refresh triggered');
};

// Different sizes
const smallEnabled = ref(false);
const mediumEnabled = ref(false);
const largeEnabled = ref(false);
const handleSizeRefresh = () => {
  console.log('Size demo refresh triggered');
};

// Custom labels
const labelEnabled = ref(false);
const handleLabelRefresh = () => {
  console.log('Label demo refresh triggered');
};

// Programmatic control
const programmaticRef = ref<SmartAutoRefreshExpose>();
const programmaticEnabled = ref(false);
const handleProgrammaticRefresh = () => {
  console.log('Programmatic refresh triggered');
};

const startProgrammatic = () => {
  programmaticRef.value?.start();
};

const stopProgrammatic = () => {
  programmaticRef.value?.stop();
};

const restartProgrammatic = () => {
  programmaticRef.value?.restart();
};

const triggerManualRefresh = () => {
  programmaticRef.value?.triggerRefresh();
};

const showStatus = () => {
  const countdown = programmaticRef.value?.getCountdown();
  const interval = programmaticRef.value?.getInterval();
  message.info(`倒计时: ${countdown}s, 间隔: ${interval}s`);
};

// Event handling
const eventEnabled = ref(false);
const eventLogs = ref<string[]>([]);

const addEventLog = (event: string) => {
  const timestamp = new Date().toLocaleTimeString();
  eventLogs.value.unshift(`[${timestamp}] ${event}`);
  if (eventLogs.value.length > 10) {
    eventLogs.value.pop();
  }
};

const handleEventRefresh = () => {
  addEventLog('刷新函数被调用');
};

const handleToggleEvent = (enabled: boolean) => {
  addEventLog(`自动刷新${enabled ? '开启' : '关闭'}`);
};

const handleIntervalEvent = (interval: number) => {
  addEventLog(`刷新间隔改变为 ${interval}秒`);
};

const handleRefreshEvent = () => {
  addEventLog('刷新事件触发');
};

// Async refresh
const asyncEnabled = ref(false);
const asyncRefreshCount = ref(0);
const handleAsyncRefresh = async () => {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 1000));
  asyncRefreshCount.value++;
  console.log('Async refresh completed');
};
</script>

<style scoped>
.smart-auto-refresh-demo {
  padding: 16px;
}

.smart-auto-refresh-demo h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.smart-auto-refresh-demo p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}
</style>
