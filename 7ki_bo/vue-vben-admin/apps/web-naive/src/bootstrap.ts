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

  // Hydrate access token from httpOnly admin refresh cookie.
  // Never keep a player JWT in BO (causes 403 "current: none" / "Admin access required").
  const accessStore = useAccessStore();
  accessStore.setRefreshToken(null);

  const { isBoAdminAccessToken, isAccessTokenExpired } = await import(
    '#/utils/boAccessToken'
  );

  if (accessStore.accessToken && !isBoAdminAccessToken(accessStore.accessToken)) {
    console.warn(
      '[bootstrap] Clearing non-admin access token (player JWT leaked into BO)',
    );
    accessStore.setAccessToken(null);
  }

  try {
    const { refreshTokenApi } = await import('#/api/core/auth');
    const resp = await refreshTokenApi();
    // baseRequestClient returns raw AxiosResponse: resp.data = { code, data: token }
    const body = (resp as any)?.data ?? resp;
    const newToken =
      (typeof body === 'string' && body.length > 10 ? body : null) ||
      (typeof body?.data === 'string' ? body.data : null) ||
      (typeof body?.token === 'string' ? body.token : null);
    if (isBoAdminAccessToken(newToken)) {
      accessStore.setAccessToken(newToken);
    } else if (newToken) {
      console.warn(
        '[bootstrap] Refresh returned non-admin token — clearing BO session',
      );
      accessStore.setAccessToken(null);
    }
  } catch (e) {
    const kept = accessStore.accessToken;
    if (
      !kept ||
      !isBoAdminAccessToken(kept) ||
      isAccessTokenExpired(kept)
    ) {
      accessStore.setAccessToken(null);
      console.warn(
        '[bootstrap] refresh hydrate failed; no valid admin token — login required',
        e,
      );
    } else {
      console.warn(
        '[bootstrap] refresh hydrate failed; keeping unexpired admin access token',
        e,
      );
    }
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
