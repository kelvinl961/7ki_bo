import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    token: string;
    user: {
      role: string;
      username: string;
    };
  }

  /** 注册接口参数 */
  export interface RegisterParams {
    account: string;
    password: string;
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
    referralCode?: string;
  }

  /** 注册接口返回值 */
  export interface RegisterResult {
    message: string;
    user?: {
      account: string;
      id: number;
      name?: string;
    };
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }

  export interface AccessCodesResponse extends Array<string> {}
}

/**
 * 登录 - Updated to use real backend
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/admin/login', data);
}

/**
 * 注册
 */
export async function registerApi(data: AuthApi.RegisterParams) {
  return requestClient.post<AuthApi.RegisterResult>('/auth/register', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>(
    '/auth/refresh',
    {},
    {
      withCredentials: true, // 🍪 CRITICAL: Send cookies with refresh request
    },
  );
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return requestClient.post(
    '/auth/logout',
    {},
    {
      withCredentials: true,
    },
  );
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<AuthApi.AccessCodesResponse>('/auth/codes');
}

/**
 * 获取当前登录用户信息 (Backoffice Admin)
 * 🔧 FIX: Changed from /users/info to /auth/userinfo
 * - /users/info is for regular users (players)
 * - /auth/userinfo is for backoffice admins
 */
export async function getUserInfoApi() {
  return requestClient.get<any>('/auth/userinfo');
}
