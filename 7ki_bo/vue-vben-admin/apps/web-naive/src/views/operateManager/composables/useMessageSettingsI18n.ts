import { computed } from 'vue';

import { $t } from '@vben/locales';

/** Shared i18n options for message settings (notifications, banner, pop, PMD, GG) */
export function useMessageSettingsI18n() {
  const languageOptions = computed(() => [
    { label: $t('operations.messageSettings.option.langZh'), value: 'zh-CN' },
    { label: $t('operations.messageSettings.option.langEn'), value: 'en' },
    { label: $t('operations.messageSettings.option.langPt'), value: 'pt' },
    { label: $t('operations.messageSettings.option.langEs'), value: 'es' },
    { label: $t('operations.messageSettings.option.langJa'), value: 'ja' },
  ]);

  const languageLabelMap = computed(
    (): Record<string, string> => ({
      'zh-CN': $t('operations.messageSettings.option.langZh'),
      en: $t('operations.messageSettings.option.langEn'),
      pt: $t('operations.messageSettings.option.langPt'),
      es: $t('operations.messageSettings.option.langEs'),
      ja: $t('operations.messageSettings.option.langJa'),
    }),
  );

  const currencyOptions = computed(() => [
    { label: 'BRL', value: 'BRL' },
    { label: 'CNY', value: 'CNY' },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'JPY', value: 'JPY' },
  ]);

  const receiverTypeOptions = computed(() => [
    { label: $t('operations.messageSettings.option.receiverAll'), value: 'all' },
    { label: $t('operations.messageSettings.option.receiverVip'), value: 'vip' },
    { label: $t('operations.messageSettings.option.receiverNew'), value: 'new' },
    { label: $t('operations.messageSettings.option.receiverActive'), value: 'active' },
    { label: $t('operations.messageSettings.option.receiverCustom'), value: 'custom' },
  ]);

  const receiverLabelMap = computed(
    (): Record<string, string> => ({
      all: $t('operations.messageSettings.option.receiverAll'),
      vip: $t('operations.messageSettings.option.receiverVip'),
      new: $t('operations.messageSettings.option.receiverNew'),
      active: $t('operations.messageSettings.option.receiverActive'),
      custom: $t('operations.messageSettings.option.receiverCustom'),
    }),
  );

  const messageStatusOptions = computed(() => [
    { label: $t('operations.messageSettings.option.statusEnabled'), value: 'enabled' },
    { label: $t('operations.messageSettings.option.statusDisabled'), value: 'disabled' },
    { label: $t('operations.messageSettings.option.statusDraft'), value: 'draft' },
  ]);

  const bannerStatusOptions = computed(() => [
    { label: $t('operations.messageSettings.option.statusPublished'), value: 'active' },
    { label: $t('operations.messageSettings.option.statusUnpublished'), value: 'inactive' },
    { label: $t('operations.messageSettings.option.statusDraft'), value: 'draft' },
  ]);

  const triggerOptions = computed(() => [
    { label: $t('operations.messageSettings.option.triggerLogin'), value: 'login_success' },
    { label: $t('operations.messageSettings.option.triggerDeposit'), value: 'deposit_success' },
    { label: $t('operations.messageSettings.option.triggerFirstDeposit'), value: 'first_deposit' },
    { label: $t('operations.messageSettings.option.triggerBet'), value: 'bet_success' },
    { label: $t('operations.messageSettings.option.triggerScheduled'), value: 'scheduled' },
    { label: $t('operations.messageSettings.option.triggerManual'), value: 'manual' },
  ]);

  const triggerLabelMap = computed(
    (): Record<string, string> => ({
      login_success: $t('operations.messageSettings.option.triggerLogin'),
      deposit_success: $t('operations.messageSettings.option.triggerDeposit'),
      first_deposit: $t('operations.messageSettings.option.triggerFirstDeposit'),
      bet_success: $t('operations.messageSettings.option.triggerBet'),
      scheduled: $t('operations.messageSettings.option.triggerScheduled'),
      manual: $t('operations.messageSettings.option.triggerManual'),
    }),
  );

  const jumpModeOptions = computed(() => [
    { label: $t('operations.messageSettings.option.jumpNone'), value: 'none' },
    { label: $t('operations.messageSettings.option.jumpExternal'), value: 'external_link' },
    { label: $t('operations.messageSettings.option.jumpActivity'), value: 'activity' },
    { label: $t('operations.messageSettings.option.jumpTask'), value: 'task' },
    { label: $t('operations.messageSettings.option.jumpRecharge'), value: 'recharge' },
    { label: $t('operations.messageSettings.option.jumpRebate'), value: 'rebate' },
    { label: $t('operations.messageSettings.option.jumpAgent'), value: 'agent' },
    { label: $t('operations.messageSettings.option.jumpVip'), value: 'vip' },
    { label: $t('operations.messageSettings.option.jumpInterest'), value: 'interest_treasure' },
    { label: $t('operations.messageSettings.option.jumpPublicFund'), value: 'public_fund' },
    { label: $t('operations.messageSettings.option.jumpGame'), value: 'game' },
    { label: $t('operations.messageSettings.option.jumpBlindBox'), value: 'blind_box_lottery' },
    { label: $t('operations.messageSettings.option.jumpClub'), value: 'club_application' },
  ]);

  const getLanguageText = (language: string) =>
    languageLabelMap.value[language] || language;

  return {
    languageOptions,
    languageLabelMap,
    currencyOptions,
    receiverTypeOptions,
    receiverLabelMap,
    messageStatusOptions,
    bannerStatusOptions,
    triggerOptions,
    triggerLabelMap,
    jumpModeOptions,
    getLanguageText,
  };
}
