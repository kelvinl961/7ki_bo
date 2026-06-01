import { computed, ref } from 'vue';

import { getActiveMemberTiersApi } from '#/api/core/memberTier';
import {
  memberTiersToOptions,
  type MemberTierOption,
} from '#/utils/activityMemberTier';

let cachedTierOptions: MemberTierOption[] | null = null;
let loadPromise: Promise<MemberTierOption[]> | null = null;

export function useActiveMemberTiers() {
  const tierOptions = ref<MemberTierOption[]>(cachedTierOptions ?? []);
  const loading = ref(false);

  const labelById = computed(
    () => new Map(tierOptions.value.map((t) => [t.id, t.label])),
  );

  const allTierIds = computed(() => tierOptions.value.map((t) => t.id));

  async function load(force = false) {
    if (!force && cachedTierOptions) {
      tierOptions.value = cachedTierOptions;
      return tierOptions.value;
    }

    if (!force && loadPromise) {
      tierOptions.value = await loadPromise;
      return tierOptions.value;
    }

    loading.value = true;
    loadPromise = getActiveMemberTiersApi().then((tiers) =>
      memberTiersToOptions(tiers),
    );

    try {
      const options = await loadPromise;
      cachedTierOptions = options;
      tierOptions.value = options;
      return options;
    } catch (error) {
      console.error('Failed to load member tiers:', error);
      tierOptions.value = [];
      cachedTierOptions = [];
      return [];
    } finally {
      loading.value = false;
      loadPromise = null;
    }
  }

  return {
    tierOptions,
    labelById,
    allTierIds,
    loading,
    load,
  };
}
