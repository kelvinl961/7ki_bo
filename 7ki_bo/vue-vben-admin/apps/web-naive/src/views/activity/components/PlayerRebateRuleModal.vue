<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="isEdit ? $t('activity.playerRebate.editRule') : $t('activity.playerRebate.addRule')"
    style="width: 960px; max-width: 98vw"
    :mask-closable="false"
    :bordered="false"
  >
    <n-spin :show="loading">
      <n-form
        :model="form"
        label-placement="left"
        :label-width="120"
        label-align="right"
      >
        <n-form-item :label="$t('activity.playerRebate.currency')" required>
          <n-select
            v-model:value="form.currency"
            :options="currencyOptions"
            style="width: 220px"
            :disabled="isEdit"
          />
        </n-form-item>

        <n-form-item :label="$t('activity.playerRebate.name')">
          <n-input v-model:value="form.name" clearable style="width: 320px" />
        </n-form-item>

        <n-form-item :label="$t('activity.playerRebate.memberTiers')" required>
          <n-spin :show="tiersLoading" size="small">
            <n-checkbox-group v-model:value="form.memberTierIds">
              <n-space>
                <n-checkbox
                  v-for="t in memberTierOptions"
                  :key="t.id"
                  :value="t.id"
                  :label="t.label"
                />
              </n-space>
            </n-checkbox-group>
          </n-spin>
        </n-form-item>

        <n-form-item :label="$t('activity.playerRebate.auditMultiplier')" required>
          <n-input-number
            v-model:value="form.auditMultiplier"
            :min="0"
            :precision="2"
            style="width: 160px"
          />
        </n-form-item>

        <n-form-item :label="$t('activity.playerRebate.auditPlatforms')">
          <n-space vertical style="width: 100%">
            <n-radio-group v-model:value="form.auditPlatformMode">
              <n-space>
                <n-radio value="unlimited">{{ $t('activity.playerRebate.auditUnlimited') }}</n-radio>
                <n-radio value="include">{{ $t('activity.playerRebate.auditInclude') }}</n-radio>
                <n-radio value="exclude">{{ $t('activity.playerRebate.auditExclude') }}</n-radio>
              </n-space>
            </n-radio-group>
            <n-select
              v-if="form.auditPlatformMode !== 'unlimited'"
              v-model:value="form.auditPlatforms"
              multiple
              filterable
              :options="platformOptions"
              style="width: 100%; max-width: 560px"
            />
          </n-space>
        </n-form-item>

        <n-form-item :label="$t('activity.playerRebate.rateMode')" required>
          <n-radio-group v-model:value="form.rateMode" @update:value="onRateModeChange">
            <n-space>
              <n-radio value="ladder">{{ $t('activity.playerRebate.rateLadder') }}</n-radio>
              <n-radio value="vip">{{ $t('activity.playerRebate.rateVip') }}</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item :label="$t('activity.playerRebate.platformRate')" required>
          <div class="pr-rate-table-wrap">
            <table class="pr-rate-table">
              <thead>
                <tr>
                  <th v-if="form.rateMode === 'ladder'">{{ $t('activity.playerRebate.thresholdMin') }}</th>
                  <th v-if="form.rateMode === 'ladder'">{{ $t('activity.playerRebate.thresholdMax') }}</th>
                  <th v-else>{{ $t('activity.playerRebate.vipLevel') }}</th>
                  <th v-for="p in platformColumns" :key="p.value">{{ p.label }}</th>
                  <th>{{ $t('activity.playerRebate.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in form.rateRows" :key="idx">
                  <td v-if="form.rateMode === 'ladder'">
                    <n-input-number
                      v-model:value="row.thresholdMin"
                      :min="0"
                      :show-button="false"
                      style="width: 100px"
                    />
                  </td>
                  <td v-if="form.rateMode === 'ladder'">
                    <n-input-number
                      v-model:value="row.thresholdMax"
                      :min="0"
                      :show-button="false"
                      style="width: 100px"
                    />
                  </td>
                  <td v-else>
                    <n-input-number
                      v-model:value="row.vipLevel"
                      :min="0"
                      :precision="0"
                      :show-button="false"
                      style="width: 80px"
                    />
                  </td>
                  <td v-for="p in platformColumns" :key="p.value">
                    <n-input-number
                      v-model:value="row.platformRates[p.value]"
                      :min="0"
                      :max="100"
                      :precision="4"
                      :show-button="false"
                      style="width: 90px"
                    />
                  </td>
                  <td>
                    <n-button
                      size="tiny"
                      quaternary
                      type="error"
                      :disabled="form.rateRows.length <= 1"
                      @click="removeRow(idx)"
                    >
                      {{ $t('activity.playerRebate.removeRow') }}
                    </n-button>
                  </td>
                </tr>
              </tbody>
            </table>
            <n-button class="mt-2" size="small" @click="addRow">
              {{ $t('activity.playerRebate.addRow') }}
            </n-button>
          </div>
        </n-form-item>
      </n-form>
    </n-spin>

    <template #footer>
      <n-space justify="end">
        <n-button @click="visible = false">{{ $t('activity.playerRebate.cancel') }}</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ $t('activity.playerRebate.save') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';
import { computed, reactive, ref, watch } from 'vue';
import {
  NModal,
  NForm,
  NFormItem,
  NSelect,
  NInput,
  NInputNumber,
  NCheckboxGroup,
  NCheckbox,
  NRadioGroup,
  NRadio,
  NSpace,
  NButton,
  NSpin,
  useMessage,
} from 'naive-ui';
import { getActiveMemberTiersApi } from '#/api/core/memberTier';
import { getEnabledGamePlatforms } from '#/api/game/gamePlatform';
import {
  playerRebateApi,
  type PlayerRebateRule,
  type PlayerRebateRateRow,
} from '#/api/playerRebate';

const props = defineProps<{
  show: boolean;
  editRule?: PlayerRebateRule | null;
}>();
const emit = defineEmits<{
  (e: 'update:show', v: boolean): void;
  (e: 'saved'): void;
}>();

const message = useMessage();
const loading = ref(false);
const submitting = ref(false);
const tiersLoading = ref(false);

const visible = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v),
});
const isEdit = computed(() => Boolean(props.editRule?.id));

const currencyOptions = [
  { label: '巴西(BRL)', value: 'BRL' },
  { label: '加纳(GHS)', value: 'GHS' },
  { label: 'XAF', value: 'XAF' },
  { label: '老挝(LAK)', value: 'LAK' },
  { label: '柬埔寨(KHR)', value: 'KHR' },
];

const memberTierOptions = ref<{ id: number; label: string }[]>([]);
const platformOptions = ref<{ label: string; value: string }[]>([]);
const platformColumns = computed(() => platformOptions.value);

type RateRowForm = {
  thresholdMin: number | null;
  thresholdMax: number | null;
  vipLevel: number | null;
  platformRates: Record<string, number>;
};

const form = reactive({
  currency: 'BRL',
  name: '' as string | null,
  memberTierIds: [] as number[],
  auditMultiplier: 1,
  auditPlatformMode: 'unlimited' as 'unlimited' | 'include' | 'exclude',
  auditPlatforms: [] as string[],
  rateMode: 'ladder' as 'ladder' | 'vip',
  rateRows: [] as RateRowForm[],
});

function emptyRates(): Record<string, number> {
  const rates: Record<string, number> = {};
  for (const p of platformColumns.value) rates[p.value] = 0;
  return rates;
}

function makeRow(partial?: Partial<PlayerRebateRateRow>): RateRowForm {
  return {
    thresholdMin: partial?.thresholdMin ?? 0,
    thresholdMax: partial?.thresholdMax ?? null,
    vipLevel: partial?.vipLevel ?? 0,
    platformRates: { ...emptyRates(), ...(partial?.platformRates ?? {}) },
  };
}

function addRow() {
  form.rateRows.push(makeRow());
}

function removeRow(idx: number) {
  if (form.rateRows.length <= 1) return;
  form.rateRows.splice(idx, 1);
}

function onRateModeChange() {
  if (!form.rateRows.length) form.rateRows = [makeRow()];
}

async function loadLookups() {
  tiersLoading.value = true;
  try {
    const [tiers, platforms] = await Promise.all([
      getActiveMemberTiersApi(),
      getEnabledGamePlatforms().catch(() => [] as Awaited<
        ReturnType<typeof getEnabledGamePlatforms>
      >),
    ]);
    memberTierOptions.value = (tiers || []).map((t) => ({
      id: Number(t.id),
      label: t.tierName || t.tierCode || String(t.id),
    }));
    const list = Array.isArray(platforms) ? platforms : [];
    platformOptions.value = list.map((p) => ({
      label: p.platformName || p.platformId,
      value: p.platformId || String(p.id),
    }));
    if (!platformOptions.value.length) {
      platformOptions.value = [
        { label: 'SPORT', value: 'SPORT' },
        { label: 'SLOT', value: 'SLOT' },
        { label: 'LIVE', value: 'LIVE' },
        { label: 'FISH', value: 'FISH' },
        { label: 'CHESS', value: 'CHESS' },
      ];
    }
  } catch (e: any) {
    message.error(e?.message || $t('activity.playerRebate.loadFailed'));
  } finally {
    tiersLoading.value = false;
  }
}

function resetForm() {
  const rule = props.editRule;
  if (rule) {
    form.currency = rule.currency;
    form.name = rule.name ?? '';
    form.memberTierIds = [...(rule.memberTierIds || [])];
    form.auditMultiplier = Number(rule.auditMultiplier ?? 1);
    form.auditPlatformMode = (rule.auditPlatformMode as any) || 'unlimited';
    form.auditPlatforms = [...(rule.auditPlatforms || [])];
    form.rateMode = (rule.rateMode as 'ladder' | 'vip') || 'ladder';
    form.rateRows = (rule.rateRows?.length ? rule.rateRows : [{}]).map((r) =>
      makeRow(r),
    );
  } else {
    form.currency = 'BRL';
    form.name = '';
    form.memberTierIds = memberTierOptions.value.map((t) => t.id);
    form.auditMultiplier = 1;
    form.auditPlatformMode = 'unlimited';
    form.auditPlatforms = [];
    form.rateMode = 'ladder';
    form.rateRows = [makeRow()];
  }
}

async function handleSubmit() {
  if (!form.memberTierIds.length) {
    message.warning($t('activity.playerRebate.tierRequired'));
    return;
  }
  if (!form.rateRows.length) {
    message.warning($t('activity.playerRebate.rateRequired'));
    return;
  }
  submitting.value = true;
  try {
    const body = {
      currency: form.currency,
      name: form.name || null,
      auditMultiplier: form.auditMultiplier,
      auditPlatformMode: form.auditPlatformMode,
      auditPlatforms: form.auditPlatforms,
      rateMode: form.rateMode,
      memberTierIds: form.memberTierIds,
      rateRows: form.rateRows.map((r, i) => ({
        sortOrder: i,
        thresholdMin: form.rateMode === 'ladder' ? r.thresholdMin : null,
        thresholdMax: form.rateMode === 'ladder' ? r.thresholdMax : null,
        vipLevel: form.rateMode === 'vip' ? r.vipLevel : null,
        platformRates: r.platformRates,
      })),
    };
    if (isEdit.value && props.editRule?.id) {
      await playerRebateApi.updateRule(props.editRule.id, body);
    } else {
      await playerRebateApi.createRule(body);
    }
    message.success($t('activity.playerRebate.saveSuccess'));
    visible.value = false;
    emit('saved');
  } catch (e: any) {
    message.error(
      e?.response?.data?.message ||
        e?.message ||
        $t('activity.playerRebate.saveFailed'),
    );
  } finally {
    submitting.value = false;
  }
}

watch(visible, async (v) => {
  if (!v) return;
  loading.value = true;
  try {
    await loadLookups();
    resetForm();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.pr-rate-table-wrap {
  width: 100%;
  overflow-x: auto;
}
.pr-rate-table {
  border-collapse: collapse;
  width: max-content;
  min-width: 100%;
  font-size: 13px;
}
.pr-rate-table th,
.pr-rate-table td {
  border: 1px solid var(--n-border-color);
  padding: 6px 8px;
  text-align: center;
  white-space: nowrap;
}
.pr-rate-table th {
  background: var(--n-color-embedded);
  font-weight: 600;
}
.mt-2 {
  margin-top: 8px;
}
</style>
