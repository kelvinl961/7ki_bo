import { requestClient } from '#/api/request';

/** 与后台「注册支持方式」表单一致 */
export interface RegistrationSupportMethods {
  channels: {
    phone: boolean;
    email: boolean;
    memberAccount: boolean;
  };
  defaultChannel: 'phone' | 'email' | 'member_account';
  phone: {
    allowPasswordRegister: boolean;
    allowSmsCodeRegister: boolean;
    smsVerification: 'required' | 'new_number_skip';
    defaultRegisterInput: 'password' | 'sms_code';
    phoneFieldLayout: 'merged' | 'split_required';
    secondStepSetAccountModal: boolean;
  };
  email: {
    allowPasswordRegister: boolean;
    allowEmailCodeRegister: boolean;
    emailVerification: 'required' | 'new_email_skip';
    defaultRegisterInput: 'password' | 'email_code';
    emailFieldLayout: 'merged' | 'split_required';
    secondStepSetAccountModal: boolean;
  };
}

export interface RegistrationVerificationConfigPayload {
  registrationSupportMethods: RegistrationSupportMethods;
  publicPage: {
    guestAutoAccount: {
      enabled: boolean;
      allowAutoRegisterAfterReinstall: boolean;
      showFirstDepositVirtualBalanceForCurrency: boolean;
      upgradeFormalVerificationItems: string[];
    };
    registerSupport: {
      phone: boolean;
      email: boolean;
      memberAccount: boolean;
      defaultRegisterMethod: 'phone' | 'email' | 'member_account';
    };
    loginSupport: {
      phone: boolean;
      email: boolean;
      memberAccount: boolean;
    };
    mergedInputHint: string;
    phoneRegister: {
      smsMode: 'required' | 'new_number_skip';
      passwordRequiredWhenSmsAndPasswordLogin: boolean;
      independentPhoneFieldRequired: boolean;
      secondStepSetAccountModal: boolean;
      allowPasswordRegister: boolean;
      allowSmsCodeRegister: boolean;
      defaultRegisterInput: 'password' | 'sms_code';
    };
    phoneLogin: {
      allowPassword: boolean;
      allowSmsCode: boolean;
      defaultField: 'password' | 'sms_code';
    };
    emailRegister: {
      emailMode: 'required' | 'new_email_skip';
      passwordRequiredWhenEmailVerifyAndPasswordLogin: boolean;
      independentEmailFieldRequired: boolean;
      secondStepSetAccountModal: boolean;
      allowPasswordRegister: boolean;
      allowEmailCodeRegister: boolean;
      defaultRegisterInput: 'password' | 'email_code';
    };
    emailLogin: {
      allowPassword: boolean;
      allowEmailCode: boolean;
      defaultField: 'password' | 'email_code';
    };
    loginPasswordStrength: 'recommended' | 'no_limit';
    forceChangePasswordWhenNotSelfSet: boolean;
    showLoginRegisterModalOnAppOpen: boolean;
    showLoginRegisterModalOnH5Open: boolean;
    quickEntries: { freeTrial: boolean; customerService: boolean };
    thirdPartyLogin: {
      google: boolean;
      facebook: boolean;
      line: boolean;
      telegram: boolean;
      apple: boolean;
    };
  };
  registerFormFields: {
    passwordPlainNoConfirm: boolean;
    inviteCode: {
      show: boolean;
      required: boolean;
      lockWhenFromPromoLink: boolean;
    };
    realName: { show: boolean; required: boolean };
    sameRealNameRegisterLimit: null | number;
    realNameUppercaseOnly: boolean;
    realNameSpaceIntervalLetters: number;
    cpf: { show: boolean; required: boolean };
    telegram: { show: boolean; required: boolean };
    allowSameCpfMultipleAccounts: boolean;
    currencySelect: { show: boolean };
    birthday: { show: boolean; required: boolean };
    allowChangePromoChannelCurrency: boolean;
  };
  pageStyle: {
    displayMode: string;
    displayStyle: string;
    slogan: string;
  };
}

export interface RegistrationVerificationApiResponse {
  success: boolean;
  data?: {
    id: string | null;
    scope: string;
    scopeValue: string;
    version: number;
    updatedAt: string | null;
    updatedBy: string | null;
    config: RegistrationVerificationConfigPayload;
  };
  message?: string;
}

export async function fetchRegistrationVerificationConfig(params?: {
  scope?: string;
  scopeValue?: string;
}): Promise<NonNullable<RegistrationVerificationApiResponse['data']>> {
  const res = (await requestClient.get(
    '/user-management/registration-verification',
    { params },
  )) as RegistrationVerificationApiResponse;
  if (!res?.success || !res.data) {
    throw new Error(res?.message || '加载注册和验证配置失败');
  }
  return res.data;
}

export async function saveRegistrationVerificationConfigApi(body: {
  scope?: string;
  scopeValue?: string;
  config: Partial<RegistrationVerificationConfigPayload> &
    Record<string, unknown>;
}): Promise<NonNullable<RegistrationVerificationApiResponse['data']>> {
  const res = (await requestClient.put(
    '/user-management/registration-verification',
    body,
  )) as RegistrationVerificationApiResponse;
  if (!res?.success || !res.data) {
    throw new Error(res?.message || '保存失败');
  }
  return res.data;
}
