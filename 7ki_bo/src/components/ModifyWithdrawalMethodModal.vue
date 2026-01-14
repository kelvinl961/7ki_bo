<template>
  
  <!-- Simple debug modal -->
  <div v-if="visible" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;">
    <div style="background: white; padding: 20px; border-radius: 8px; max-width: 800px; max-height: 90vh; overflow-y: auto;">
      <h3>🔧 DEBUG: 修改提现方式</h3>
      <p>Channel ID: {{ channelData?.id }}</p>
      <p>Channel Name: {{ channelData?.name }}</p>
      <p>Channel Type: {{ channelData?.type }}</p>
      <button @click="$emit('update:visible', false)" style="background: red; color: white; padding: 10px; border: none; border-radius: 4px;">
        Close Modal
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useMessage } from 'naive-ui';
import { withdrawalSettingsApi } from '#/api/finance/withdrawalSettings';

interface Props {
  visible: boolean;
  channelData?: any;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  channelData: null
});

const emit = defineEmits<Emits>();

const message = useMessage();
const saving = ref(false);

// Watch for visibility changes
watch(() => props.visible, (newVal, oldVal) => {
  console.log('🔧 Modal visibility changed:', { oldVal, newVal });
  console.log('🔧 Channel data:', props.channelData);
  if (newVal && props.channelData) {
    // Load channel data into form
    loadChannelData();
  }
});

// Methods (simplified for debug modal)
const loadChannelData = () => {
  console.log('🔧 Loading channel data:', props.channelData);
};
</script>

<style scoped>
.modify-withdrawal-method-container {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  padding: 0 4px;
}

.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.pix-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.pix-types-grid .n-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Color overrides for background buttons */
.bg-red-500 {
  background-color: #ef4444 !important;
}

.bg-green-500 {
  background-color: #10b981 !important;
}

.bg-blue-500 {
  background-color: #3b82f6 !important;
}

.bg-orange-500 {
  background-color: #f97316 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modify-withdrawal-method-container {
    padding: 0 2px;
  }
  
  .form-section {
    padding: 12px;
  }
  
  .pix-types-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }
  
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}
</style>
