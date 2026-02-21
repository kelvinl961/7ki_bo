<template>
  <div class="quick-date-select">
    <n-radio-group :value="modelValue" @update:value="handleChange">
      <n-radio-button value="day">日</n-radio-button>
      <n-radio-button value="week">周</n-radio-button>
      <n-radio-button value="month">月</n-radio-button>
    </n-radio-group>
  </div>
</template>

<script setup lang="ts">
import { NRadioGroup, NRadioButton } from 'naive-ui';

interface Props {
  modelValue: 'day' | 'week' | 'month' | null;
}

defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: 'day' | 'week' | 'month' | null];
}>();

const handleChange = (value: 'day' | 'week' | 'month' | null) => {
  emit('update:modelValue', value);
};
</script>

<style scoped>
.quick-date-select {
  display: inline-block;
}
</style>
