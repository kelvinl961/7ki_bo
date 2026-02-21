# SmartAutoRefresh Component

A reusable auto-refresh component extracted from the RechargeOrderList.vue implementation. Provides automatic data refreshing with countdown timer, customizable intervals, and user interaction handling.

## ✨ Features

- 🔄 **Auto-refresh toggle** - Enable/disable automatic refreshing
- ⏱️ **Customizable intervals** - Choose from predefined refresh intervals
- ⏰ **Countdown timer** - Visual countdown showing time until next refresh
- 🎯 **Smart pausing** - Automatically pauses when user is interacting
- 📱 **Responsive design** - Works on mobile and desktop
- 🎨 **Multiple sizes** - Small, medium, large variants
- 🌐 **Custom labels** - Customize all display text
- 🔧 **Programmatic control** - Control via ref methods
- 📊 **Event handling** - Listen to toggle, interval, and refresh events
- ⚡ **Async support** - Handles async refresh functions with loading states

## 📦 Installation

```typescript
// Import the component
import { SmartAutoRefresh } from '@/components/smart';

// Or import directly
import SmartAutoRefresh from '@/components/smart/SmartAutoRefresh/index.vue';
```

## 🚀 Basic Usage

```vue
<template>
  <SmartAutoRefresh
    v-model="autoRefreshEnabled"
    :on-refresh="fetchData"
  />
</template>

<script setup>
import { ref } from 'vue';
import { SmartAutoRefresh } from '@/components/smart';

const autoRefreshEnabled = ref(false);

const fetchData = async () => {
  // Your data fetching logic
  console.log('Refreshing data...');
};
</script>
```

## 🎛️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | Whether auto-refresh is enabled |
| `intervals` | `number[]` | `[15, 30, 60, 120]` | Available refresh intervals (seconds) |
| `defaultInterval` | `number` | `30` | Default refresh interval (seconds) |
| `onRefresh` | `() => void \| Promise<void>` | **Required** | Function to call on refresh |
| `size` | `'small' \| 'medium' \| 'large'` | `'small'` | Component size |
| `labels` | `object` | See below | Custom labels for UI text |
| `showMessages` | `boolean` | `true` | Show success messages when toggling |
| `pauseOnInteraction` | `boolean` | `true` | Pause when user interacts with page |
| `class` | `string` | `''` | Additional CSS classes |

### Labels Object

```typescript
interface Labels {
  enabled?: string;     // Default: '自动更新'
  disabled?: string;    // Default: '不自动更新'
  placeholder?: string; // Default: '刷新间隔'
}
```

## 📡 Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Emitted when toggle state changes |
| `intervalChange` | `number` | Emitted when refresh interval changes |
| `refresh` | - | Emitted when refresh is triggered |

## 🔧 Methods (via ref)

```typescript
interface SmartAutoRefreshExpose {
  start(): void;              // Start auto-refresh
  stop(): void;               // Stop auto-refresh
  restart(): void;            // Restart with current settings
  getCountdown(): number;     // Get current countdown value
  getInterval(): number;      // Get current interval
  triggerRefresh(): void;     // Manually trigger refresh
}
```

### Using Methods

```vue
<template>
  <SmartAutoRefresh
    ref="autoRefreshRef"
    v-model="enabled"
    :on-refresh="fetchData"
  />
  <n-button @click="manualStart">Start</n-button>
  <n-button @click="manualStop">Stop</n-button>
</template>

<script setup>
import { ref } from 'vue';

const autoRefreshRef = ref();
const enabled = ref(false);

const manualStart = () => {
  autoRefreshRef.value?.start();
};

const manualStop = () => {
  autoRefreshRef.value?.stop();
};
</script>
```

## 🎨 Examples

### Custom Intervals

```vue
<SmartAutoRefresh
  v-model="enabled"
  :intervals="[10, 30, 60, 300, 600]"
  :default-interval="60"
  :on-refresh="fetchData"
/>
```

### Different Sizes

```vue
<!-- Small (default) -->
<SmartAutoRefresh v-model="enabled" size="small" :on-refresh="fetchData" />

<!-- Medium -->
<SmartAutoRefresh v-model="enabled" size="medium" :on-refresh="fetchData" />

<!-- Large -->
<SmartAutoRefresh v-model="enabled" size="large" :on-refresh="fetchData" />
```

### Custom Labels

```vue
<SmartAutoRefresh
  v-model="enabled"
  :labels="{
    enabled: '开启自动刷新',
    disabled: '关闭自动刷新',
    placeholder: '选择间隔'
  }"
  :on-refresh="fetchData"
/>
```

### Event Handling

```vue
<SmartAutoRefresh
  v-model="enabled"
  :on-refresh="fetchData"
  @update:model-value="handleToggle"
  @interval-change="handleIntervalChange"
  @refresh="handleRefresh"
/>

<script setup>
const handleToggle = (enabled: boolean) => {
  console.log('Auto-refresh toggled:', enabled);
};

const handleIntervalChange = (interval: number) => {
  console.log('Interval changed to:', interval);
  // Save user preference
  localStorage.setItem('refresh-interval', interval.toString());
};

const handleRefresh = () => {
  console.log('Refresh triggered');
};
</script>
```

### Async Refresh Function

```vue
<SmartAutoRefresh
  v-model="enabled"
  :on-refresh="asyncFetchData"
/>

<script setup>
const asyncFetchData = async () => {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    // Process data...
  } catch (error) {
    console.error('Refresh failed:', error);
  }
};
</script>
```

## 🔄 Migration from Old Implementation

### Before (Manual Implementation)

```vue
<!-- Old repetitive code -->
<template>
  <n-switch v-model:value="autoRefresh" @update:value="handleToggle">
    <template #checked>自动更新</template>
    <template #unchecked>不自动更新</template>
  </n-switch>
  
  <n-select
    v-if="autoRefresh"
    v-model:value="refreshInterval"
    :options="intervalOptions"
    @update:value="handleIntervalChange"
  />
  
  <n-tag v-if="autoRefresh && countdown > 0">{{ countdown }}s</n-tag>
</template>

<script setup>
// 50+ lines of timer management code
const autoRefresh = ref(false);
const refreshInterval = ref(30);
const countdown = ref(0);
let refreshTimer = null;
let countdownTimer = null;

// Manual timer management...
</script>
```

### After (SmartAutoRefresh)

```vue
<!-- New clean implementation -->
<template>
  <SmartAutoRefresh
    v-model="autoRefreshEnabled"
    :on-refresh="fetchData"
  />
</template>

<script setup>
// Just 2 lines!
const autoRefreshEnabled = ref(false);
const fetchData = () => { /* your logic */ };
</script>
```

## 🎯 Benefits

- **90% less code** - Reduces 50+ lines to just 2-3 lines
- **Consistent behavior** - Same auto-refresh logic across all pages
- **Better UX** - Smart pausing, loading states, error handling
- **Maintainable** - Fix bugs once, applies everywhere
- **Type-safe** - Full TypeScript support
- **Accessible** - Built-in accessibility features

## 🔧 Advanced Usage

### With Composable

You can also use the underlying `useAutoRefresh` composable directly:

```vue
<script setup>
import { useAutoRefresh } from '@/composables/useAutoRefresh';

const {
  isEnabled,
  currentInterval,
  countdown,
  start,
  stop,
  toggle
} = useAutoRefresh(fetchData, {
  defaultInterval: 30,
  intervals: [15, 30, 60],
  showMessages: true
});
</script>
```

## 🐛 Troubleshooting

### Auto-refresh not working
- Ensure `onRefresh` prop is provided
- Check if `modelValue` is properly bound with `v-model`
- Verify the refresh function doesn't throw errors

### Countdown not showing
- Make sure auto-refresh is enabled (`modelValue: true`)
- Check if component is not paused by user interaction
- Verify interval is greater than 0

### Performance issues
- Use `pauseOnInteraction: false` if you don't need smart pausing
- Ensure refresh function is optimized and doesn't block UI
- Consider debouncing rapid interval changes

## 📝 Contributing

When extending this component:

1. Keep the API simple and consistent
2. Maintain backward compatibility
3. Add proper TypeScript types
4. Update this documentation
5. Add tests for new features

## 🔗 Related

- [useAutoRefresh Composable](../../../composables/useAutoRefresh.ts)
- [SmartDataGrid Component](../SmartDataGrid/) (Coming soon)
- [Smart Components Architecture](../README.md)
