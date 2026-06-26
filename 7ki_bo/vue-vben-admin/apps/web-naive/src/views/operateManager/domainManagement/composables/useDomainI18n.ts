import { computed } from 'vue';

import { $t } from '@vben/locales';

/** Shared i18n labels/options for domain management views */
export function useDomainI18n() {
  const cdnFilterOptions = computed(() => [
    { label: $t('operations.domain.status.all'), value: '' },
    { label: 'Cloudflare (CF)', value: 'CLOUDFLARE' },
    { label: 'AWS (A8)', value: 'AWS' },
    { label: '网宿 (Wangsu)', value: 'WANGSU' },
    { label: '火山云 (Volcengine)', value: 'VOLCENGINE' },
    { label: '阿里云 (Aliyun)', value: 'ALIYUN' },
    { label: '腾讯云 (Tencent)', value: 'TENCENT_CLOUD' },
    { label: '华为云 (Huawei)', value: 'HUAWEI_CLOUD' },
    { label: 'SuperEdge', value: 'SUPEREDGE' },
    { label: 'Funnull', value: 'FUNNULL' },
    { label: '云盾 (Yundun)', value: 'YUNDUN' },
  ]);

  const cdnOptions = computed(() =>
    cdnFilterOptions.value.filter((o) => o.value !== ''),
  );

  const domainStatusOptions = computed(() => [
    { label: $t('operations.domain.status.all'), value: '' },
    { label: $t('operations.domain.status.normal'), value: 'NORMAL' },
    { label: $t('operations.domain.status.expired'), value: 'EXPIRED' },
    { label: $t('operations.domain.status.expiringSoon'), value: 'EXPIRING_SOON' },
    { label: $t('operations.domain.status.verificationPending'), value: 'VERIFICATION_PENDING' },
    { label: $t('operations.domain.status.disabled'), value: 'DISABLED' },
  ]);

  const useTypeLabelMap = computed(
    (): Record<string, string> => ({
      WEB_HALL: $t('operations.domain.useType.webHall'),
      APP_HALL: $t('operations.domain.useType.appHall'),
      DOWNLOAD_SITE: $t('operations.domain.useType.downloadSite'),
      BACKEND_API: $t('operations.domain.useType.backendApi'),
      OSS_ACCELERATION: $t('operations.domain.useType.ossAcceleration'),
      TRANSFER_PAGE: $t('operations.domain.useType.transferPage'),
      APP_UPDATE: $t('operations.domain.useType.appUpdate'),
    }),
  );

  const verificationMethodMap = computed(
    (): Record<string, string> => ({
      DNS_VALIDATION: $t('operations.domain.verification.dns'),
      WHEN_DNS_COMPLETED: $t('operations.domain.verification.whenDnsCompleted'),
      HTTP_VALIDATION: $t('operations.domain.verification.http'),
      EMAIL_VALIDATION: $t('operations.domain.verification.email'),
    }),
  );

  const domainStatusMap = computed(
    (): Record<string, { type: string; text: string }> => ({
      NORMAL: { type: 'success', text: $t('operations.domain.status.normal') },
      VERIFICATION_PENDING: {
        type: 'warning',
        text: $t('operations.domain.status.verificationPending'),
      },
      DISABLED: { type: 'error', text: $t('operations.domain.status.disabled') },
      EXPIRED: { type: 'default', text: $t('operations.domain.status.expired') },
    }),
  );

  const entranceMap = computed(
    (): Record<string, string> => ({
      ALL: $t('operations.domain.entrance.all'),
      APP_ONLY: $t('operations.domain.entrance.appOnly'),
      H5_PWA: $t('operations.domain.entrance.h5Pwa'),
    }),
  );

  const deviceMap = computed(
    (): Record<string, string> => ({
      NONE: $t('operations.domain.device.none'),
      BLOCK_MOBILE: $t('operations.domain.device.blockMobile'),
      BLOCK_PC: $t('operations.domain.device.blockPc'),
    }),
  );

  return {
    cdnFilterOptions,
    cdnOptions,
    domainStatusOptions,
    useTypeLabelMap,
    verificationMethodMap,
    domainStatusMap,
    entranceMap,
    deviceMap,
  };
}
