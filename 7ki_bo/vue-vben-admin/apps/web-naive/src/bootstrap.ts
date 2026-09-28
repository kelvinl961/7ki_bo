import { createApp, watchEffect } from 'vue';

import { registerAccessDirective } from '@vben/access';
import { registerLoadingDirective } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { initStores, useAccessStore } from '@vben/stores';
import '@vben/styles';
import '@vben/styles/naive';

import { useTitle } from '@vueuse/core';

import { $t, setupI18n } from '#/locales';

import { initComponentAdapter } from './adapter/component';
import { initSetupVbenForm } from './adapter/form';
import App from './app.vue';
import { router } from './router';

async function bootstrap(namespace: string) {
  // Parallelize independent adapters so first paint is not blocked sequentially
  await Promise.all([initComponentAdapter(), initSetupVbenForm()]);

  // // 设置弹窗的默认配置
  // setDefaultModalProps({
  //   fullscreenButton: false,
  // });
  // // 设置抽屉的默认配置
  // setDefaultDrawerProps({
  //   // zIndex: 2000,
  // });

  const app = createApp(App);

  // 注册v-loading指令
  registerLoadingDirective(app, {
    loading: 'loading', // 在这里可以自定义指令名称,也可以明确提供false表示不注册这个指令
    spinning: 'spinning',
  });

  // 国际化 i18n 配置
  await setupI18n(app);

  // 配置 pinia-tore
  await initStores(app, { namespace });

  // Track 1: never trust persisted JWTs — mint access token from httpOnly refresh cookie.
  try {
    const accessStore = useAccessStore();
    accessStore.setAccessToken(null);
    accessStore.setRefreshToken(null);
    const { refreshTokenApi } = await import('#/api/core/auth');
    const resp = await refreshTokenApi();
    const newToken =
      (resp as any)?.data?.data || (resp as any)?.data || (resp as any);
    if (typeof newToken === 'string' && newToken.length > 10) {
      accessStore.setAccessToken(newToken);
    }
  } catch {
    // No refresh cookie / expired — stay logged out (login page).
  }

  // 🔧 REMOVED: Don't set dev token in bootstrap - it caused a redirect loop:
  // In dev, use real login; no token = stay on login page.

  // 安装权限指令
  registerAccessDirective(app);

  // 配置路由及路由守卫
  app.use(router);

  // 动态更新标题
  watchEffect(() => {
    if (preferences.app.dynamicTitle) {
      const routeTitle = router.currentRoute.value.meta?.title;
      const pageTitle =
        (routeTitle ? `${$t(routeTitle)} - ` : '') + preferences.app.name;
      useTitle(pageTitle);
    }
  });

  app.mount('#app');

  // Non-critical plugins — defer so login page paints sooner
  void import('@vben/common-ui/es/tippy').then(({ initTippy }) => initTippy(app));
  void import('@vben/plugins/motion').then(({ MotionPlugin }) => app.use(MotionPlugin));
}

export { bootstrap };
