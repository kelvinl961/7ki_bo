import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { defineStore } from 'pinia';

import { notification } from '#/adapter/naive';
import { getAccessCodesApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const response = await loginApi(params);
      
      // The request client automatically unwraps the response.data
      // So response is already the data part of { code: 0, data: {...} }
      const { accessToken, id, realName, roles, username, homePath } = response as any;

        // 如果成功获取到 token
      if (accessToken) {
        // 将 token 存储到 accessStore 中
        accessStore.setAccessToken(accessToken);

        // Use user info from login response instead of making separate API call
        userInfo = {
          id,
          realName,
          roles,
          username,
          homePath,
          desc: '',
          token: accessToken,
          avatar: '',
          userId: String(id)
        } as UserInfo;

        // ✅ FIX: Set user info immediately (don't wait for codes)
        userStore.setUserInfo(userInfo);

        // ✅ FIX: Load access codes in parallel (non-blocking) - don't wait for it
        // This allows login to complete immediately and redirect faster
        getAccessCodesApi()
          .then((accessCodesResponse) => {
            accessStore.setAccessCodes(accessCodesResponse);
          })
          .catch((error) => {
            console.warn('Failed to load access codes (non-critical):', error);
            // Set empty codes as fallback - user can still navigate
            accessStore.setAccessCodes([]);
          });

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          // ✅ REDIRECT: Automatically redirect to /home after successful login
          // No longer waiting for access codes - redirect immediately
          if (onSuccess) {
            await onSuccess?.();
          } else {
            // Redirect to /home page
            await router.replace('/home');
          }
        }

        if (userInfo?.realName) {
          notification.success({
            content: $t('authentication.loginSuccess'),
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo.realName}`,
            duration: 3000,
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    // If user info is already stored, return it
    if (userStore.userInfo) {
      return userStore.userInfo;
    }

    // If we have a token but no user info, fetch from backend
    // This handles cases like page refresh where store is cleared but token exists
    if (accessStore.accessToken) {
      try {
        console.log('📡 Fetching user info on page refresh...');
        const response = await getUserInfoApi();
        const { id, realName, roles, username, homePath } = response;
        
        const userInfo = {
          id,
          realName,
          roles,
          username,
          homePath: homePath || '/home',
          desc: '',
          token: accessStore.accessToken,
          avatar: '',
          userId: String(id)
        } as UserInfo;
        
        userStore.setUserInfo(userInfo);
        console.log('✅ User info restored after page refresh');
        return userInfo;
      } catch (error: any) {
        console.error('❌ Failed to fetch user info:', error);
        
        // 🔧 FIX: Better error handling - only clear token on 401/403 errors
        // For network errors or 5xx errors, retry instead of logging out
        const status = error?.response?.status;
        
        if (status === 401 || status === 403) {
          console.warn('🔒 Token invalid or expired - clearing token');
          accessStore.setAccessToken(null);
          return null;
        }
        
        // For other errors (network, 500, etc), try to retry once
        console.warn('⚠️ Non-auth error fetching user info, will retry once...');
        try {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          const retryResponse = await getUserInfoApi();
          const { id, realName, roles, username, homePath } = retryResponse;
          
          const userInfo = {
            id,
            realName,
            roles,
            username,
            homePath: homePath || '/home',
            desc: '',
            token: accessStore.accessToken,
            avatar: '',
            userId: String(id)
          } as UserInfo;
          
          userStore.setUserInfo(userInfo);
          console.log('✅ User info restored after retry');
          return userInfo;
        } catch (retryError: any) {
          console.error('❌ Retry failed:', retryError);
          const retryStatus = retryError?.response?.status;
          
          // Only clear token if retry also returns 401/403
          if (retryStatus === 401 || retryStatus === 403) {
            console.warn('🔒 Token invalid after retry - clearing token');
            accessStore.setAccessToken(null);
          }
          return null;
        }
      }
    }

    // No token, return null (user not logged in)
    return null;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
