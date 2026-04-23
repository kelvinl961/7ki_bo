/** 更多领取限制 — 勾选类 id → settings.moreRestrictions */
export const MORE_RESTRICTION_TOGGLE_OPTIONS: { id: string; label: string }[] = [
  { id: 'sms_verified', label: '短信验证' },
  { id: 'email_bound', label: '邮箱绑定' },
  { id: 'birthday_set', label: '生日已设置' },
  { id: 'bank_card_bound', label: '银行卡绑定' },
  { id: 'crypto_bound', label: '虚拟币绑定' },
  { id: 'third_wallet_bound', label: '第三方钱包绑定' },
  { id: 'payout_method_bound', label: '代付方式绑定' },
  { id: 'real_name_filled', label: '真实姓名已填' },
  { id: 'biometric_bound', label: '生物识别绑定' },
  { id: 'kyc_done', label: 'KYC 认证' },
  { id: 'first_recharge_done', label: '已完成首充' },
];
