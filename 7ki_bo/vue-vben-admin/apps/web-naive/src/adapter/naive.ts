import { computed } from 'vue';

import { preferences } from '@vben/preferences';
import '@vben/styles';

import { createDiscreteApi, darkTheme, lightTheme } from 'naive-ui';

const themeOverridesProviderProps = computed(() => ({
  themeOverrides: preferences.theme.mode === 'light' ? lightTheme : darkTheme,
}));

const themeProviderProps = computed(() => ({
  theme: preferences.theme.mode === 'light' ? lightTheme : darkTheme,
}));

export const { dialog, loadingBar, message, modal, notification } =
  createDiscreteApi(
    ['message', 'dialog', 'notification', 'loadingBar', 'modal'],
    {
      configProviderProps: themeProviderProps,
      loadingBarProviderProps: themeOverridesProviderProps,
      messageProviderProps: computed(() => ({
        ...themeOverridesProviderProps.value,
        placement: 'top' as const,
      })),
      // 顶部水平居中（相对整屏），避免提示挤在右上角
      notificationProviderProps: computed(() => ({
        ...themeOverridesProviderProps.value,
        placement: 'top' as const,
      })),
    },
  );
