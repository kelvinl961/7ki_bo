import { computed, onMounted, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { getSiteScopeOptionsApi } from '#/api/core/sites';
import { getSiteScope } from '#/utils/siteScope';

export function useSiteDomainBinding() {
  const userStore = useUserStore();

  const showSitePicker = computed(() => {
    const roles = (userStore.userInfo as any)?.roles || [];
    return String(roles?.[0] || '').toUpperCase() === 'SUPER_ADMIN';
  });

  const selectedSiteCode = ref(getSiteScope());
  const siteOptions = ref<
    Array<{ label: string; value: string; siteId: string }>
  >([]);

  async function loadSiteOptions() {
    if (!showSitePicker.value) return;
    try {
      const resp: any = await getSiteScopeOptionsApi();
      const items = resp?.data?.data ?? resp?.data ?? [];
      siteOptions.value = items.map((item: any) => ({
        label: item.label || `${item.displayName} (${item.siteCode})`,
        value: item.value || item.siteCode,
        siteId: item.siteId,
      }));
    } catch {
      siteOptions.value = [];
    }
  }

  function domainSitePayload(): { siteId?: string; siteCode?: string } {
    if (!showSitePicker.value) return {};
    const code = selectedSiteCode.value;
    if (!code || code === 'all') return {};
    const match = siteOptions.value.find((o) => o.value === code);
    return {
      siteCode: code,
      ...(match?.siteId ? { siteId: match.siteId } : {}),
    };
  }

  /** Global header scope is often `all`; domain create must bind to one site. */
  function prepareForDomainCreate() {
    if (!showSitePicker.value) return;
    if (selectedSiteCode.value === 'all') {
      selectedSiteCode.value =
        siteOptions.value.find((o) => o.value && o.value !== 'all')?.value ?? '';
    }
  }

  function validateSiteSelectedForCreate(): boolean {
    if (!showSitePicker.value) return true;
    if (!selectedSiteCode.value || selectedSiteCode.value === 'all') {
      return false;
    }
    return true;
  }

  const siteRequiredMessage =
    '请选择具体站点（不能使用顶部筛选的「全部站点」）';

  onMounted(loadSiteOptions);

  return {
    showSitePicker,
    selectedSiteCode,
    siteOptions,
    loadSiteOptions,
    domainSitePayload,
    prepareForDomainCreate,
    validateSiteSelectedForCreate,
    siteRequiredMessage,
  };
}
