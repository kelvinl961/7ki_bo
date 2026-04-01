<template>
  <div class="field-search-bar">
    <div class="flex flex-col">
      <n-select
        :value="field"
        :placeholder="selectPlaceholder"
        clearable
        filterable
        :style="{ width: selectWidth }"
        :options="selectOptions"
        @update:value="onFieldUpdate"
      />
    </div>
    <div class="flex flex-col">
      <n-input
        :value="value"
        :placeholder="inputPlaceholderComputed"
        clearable
        :style="{ width: inputWidth }"
        @update:value="onValueUpdate"
        @keyup.enter="emit('search')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NSelect, NInput } from 'naive-ui';
import type { SelectOption } from 'naive-ui';

export type FieldSearchBarOption = {
  label: string;
  value: string;
  /** 供父级同步 searchMode 等逻辑 */
  mode?: 'exact' | 'fuzzy';
};

const props = withDefaults(
  defineProps<{
    options: FieldSearchBarOption[];
    field: string | null;
    value: string;
    selectPlaceholder?: string;
    selectWidth?: string;
    inputWidth?: string;
    valuePlaceholderFallback?: string;
  }>(),
  {
    selectPlaceholder: '请选择',
    selectWidth: '200px',
    inputWidth: '240px',
    valuePlaceholderFallback: '搜索值',
  },
);

const emit = defineEmits<{
  'update:field': [v: string | null];
  'update:value': [v: string];
  'field-changed': [v: string | null];
  search: [];
}>();

const selectOptions = computed<SelectOption[]>(() =>
  props.options.map(({ label, value }) => ({ label, value })),
);

const inputPlaceholderComputed = computed(() => {
  if (!props.field) return `请输入${props.valuePlaceholderFallback}`;
  const opt = props.options.find((o) => o.value === props.field);
  return opt ? `请输入${opt.label}` : `请输入${props.valuePlaceholderFallback}`;
});

function onFieldUpdate(newField: string | null) {
  if (props.field !== newField) {
    emit('update:value', '');
  }
  emit('update:field', newField);
  emit('field-changed', newField);
}

function onValueUpdate(v: string) {
  emit('update:value', v);
}
</script>

<style scoped>
.field-search-bar {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: 16px;
}

.field-search-bar > div {
  flex-shrink: 0;
}

.field-search-bar.contents {
  display: contents;
}
</style>
